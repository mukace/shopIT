const express = require('express');
const router = express.Router();

const { 
    registerUser, 
    login, 
    logout, 
    forgotPassword, 
    resetPassword 
} = require('./../controllers/authController');

router.route('/register').post(registerUser);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword/:token').put(resetPassword);

module.exports = router;