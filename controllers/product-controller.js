const productService = require('../service/product-service');

class ProductController {
    async getProducts(req, res, next) {
        try {
            const productsData = await productService.getProductsByParams(req.query);
            return res.json(productsData);
        } catch (e) {
            console.log(e);
            next(e);
        }
    };

    async getProductById(req, res, next) {
        const id = req.params.id
        try {
            const product = await productService.getProductById(id);
            return res.json(product);
        } catch (e) {
            console.log(e);
            next(e);
        }
    };
};

module.exports = new ProductController();
