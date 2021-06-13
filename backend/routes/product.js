const express = require('express');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
const router = express.Router();

const { 
    getProducts, 
    postProduct, 
    getSingleProduct, 
    updateProduct, 
    deleteProducts, 
    productReview,
    deleteReview
} = require('./../controllers/productController');

router.route('/products').get(getProducts);
router.route('/product/:id').get(getSingleProduct);

// Protected routes
router.route('/admin/product/create')
    .post(isAuthenticatedUser, authorizeRoles('admin'), postProduct);
    
router.route('/admin/product/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProducts);

router.route('/review').put(isAuthenticatedUser, productReview);
router.route('/deleteReview').delete(isAuthenticatedUser, deleteReview);

module.exports = router;