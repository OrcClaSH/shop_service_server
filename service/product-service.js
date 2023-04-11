const ProductModel = require('../models/product-model');
const { escapeStringRegexp } = require('../utils');

class ProductService {
    async getProductsByParams(params) {
        let lookingFor
        let products;
        let count;
        if (!Object.keys(params).length) {
            count = await ProductModel.countDocuments();
            products = await ProductModel.find();
            return { products, count };
        }
        let { category, title_like, _sort, _limit, _page } = params;
        _page = _page || 1;
        _limit = _limit || 4;
        _sort = _sort || 'rating';
        const offset = _page * _limit - _limit;

        if (category) {
            lookingFor = { category }
            count = await ProductModel.countDocuments(lookingFor)
            products = await ProductModel
                .find({ category })
                .skip(offset)
                .limit(_limit)
                .sort([[_sort, 1]])
        };
        if (title_like) {
            title_like = escapeStringRegexp(title_like);
            lookingFor = { title: { $regex: title_like, $options: 'i' } }
            count = await ProductModel.countDocuments(lookingFor)
            products = await ProductModel
                .find(lookingFor)
                .skip(offset)
                .limit(_limit)
                .sort([[_sort, 1]])
            return { products, count };
        };
        if (!products || !count) {
            count = await ProductModel.countDocuments()
            products = await ProductModel
                .find()
                .skip(offset)
                .limit(_limit)
                .sort([[_sort, 1]])
        };

        return { products, count };
    };

    async getProductById(id) {
        const product = await ProductModel.findOne({ id });
        return product;
    }
};

module.exports = new ProductService();
