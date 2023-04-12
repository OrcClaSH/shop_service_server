const { validationResult } = require('express-validator');

const userService = require('../service/user-service');
const ApiError = require('../exceptions/api-error');

const MAX_AGE = 30 * 24 * 60 * 60 * 1000;
const COOKIE_NAME_RT = 'refreshToken'
const COOKIE_OPTIONS = {
    maxAge: MAX_AGE,
    httpOnly: true,
    sameSite: 'none',
    secure: true
}

class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()));
            };
            const { email, password } = req.body;
            const userData = await userService.registration(email, password);
            res.cookie(COOKIE_NAME_RT, userData.refreshToken, COOKIE_OPTIONS);
            return res.json(userData);
        } catch (e) {
            next(e);
        };
    };

    async login(req, res, next) {
        try {
            const {email, password} = req.body;
            const userData = await userService.login(email, password);
            res.cookie(COOKIE_NAME_RT, userData.refreshToken, COOKIE_OPTIONS);
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    };

    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie(COOKIE_NAME_RT);
            return res.json(token);
        } catch (e) {
            next(e);
        }
    };

    async activate(req, res, next) {
        try {
            const activationLink = req.params.link;
            await userService.activate(activationLink);
            return res.redirect(process.env.CLIENT_URL);
        } catch (e) {
            next(e);
        };
    };

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie(COOKIE_NAME_RT, userData.refreshToken, COOKIE_OPTIONS);
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    };
};

module.exports = new UserController();
