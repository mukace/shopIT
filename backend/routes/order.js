const express = require('express');
const router = express.Router();

const { 
    createOrder, 
    getSingleOrder, 
    allOrders, 
    getAllOrders, 
    manageOrder, 
    deleteOrder
} = require('../controllers/orderController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.route('/createOrder').post(isAuthenticatedUser, createOrder);
router.route('/order/:id').get(isAuthenticatedUser, getSingleOrder);
router.route('/orders/me').get(isAuthenticatedUser, allOrders);
router.route('/admin/orders').get(isAuthenticatedUser, authorizeRoles('admin'), getAllOrders);
router.route('/admin/manageOrder/:id')
        .put(isAuthenticatedUser, authorizeRoles('admin'), manageOrder);
router.route('/admin/deleteOrder/:id')
        .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);

module.exports = router;