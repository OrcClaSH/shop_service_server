const uuid = require('uuid');
const bcrypt = require('bcrypt');

const UserDto = require('../dtos/user-dto');
const UserModel = require('../models/user-model');
const ApiError = require('../exceptions/api-error');
const tokenService = require('../service/token-service');
const mailService = require('../service/mail-service');

class UserService {
    static async updateToken(user) {
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return { ...tokens, user: userDto };
    };

    async registration(email, password) {
        const candidate = await UserModel.findOne({ email });
        if (candidate) {
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`);
        };

        const salt = bcrypt.genSaltSync(3)
        const hashPassword = bcrypt.hashSync(password, salt);
        const activationLink = uuid.v4();

        const user = await UserModel.create({ email, password: hashPassword, activationLink });
        // if (email === process.env.EMAIL_MOCK) { // TODO
            await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`)
        // };

        const userData = await UserService.updateToken(user);
        return userData;
    };

    async login(email, password) {
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw ApiError.BadRequest(`Пользователь с таким email "${email}" не найден`);
        };
        const isPassEquals = await bcrypt.compare(password, user.password);
        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль');
        };

        const userData = await UserService.updateToken(user);
        return userData;
    };

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async activate(activationLink) {
        const user = await UserModel.findOne({ activationLink });
        if (!user) {
            throw ApiError.BadRequest('Некорректная ссылка активации');
        };
        user.isActivated = true;
        await user.save();
    };

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        };

        const userValidateData = tokenService.validateToken(refreshToken, 'refresh');
        const tokenFromDb = await tokenService.findToken(refreshToken);
        if (!userValidateData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        };

        const user = await UserModel.findById(userValidateData.id);
        const userData = await UserService.updateToken(user);
        return userData;
    };
};

module.exports = new UserService();
