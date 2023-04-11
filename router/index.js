const Router = require('express').Router;
const { body } = require('express-validator');

const productController = require('../controllers/product-controller');
const userController = require('../controllers/user-controller');

const router = new Router();

router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById)
router.post(
    '/registration',
    body('email').isEmail(),
    body('password').isLength({min: 3, max: 32}),
    userController.registration
);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);

module.exports = router;
