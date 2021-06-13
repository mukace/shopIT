const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const { 
    getUserProfile, 
    updatePassword, 
    updateProfile, 
    allUsers,
    getUserDetails,
    updateUser,
    deleteUser
} = require('../controllers/userController');

router.route('/me').get(isAuthenticatedUser, getUserProfile);
router.route('/updatePassword').put(isAuthenticatedUser, updatePassword);
router.route('/me/update').put(isAuthenticatedUser, updateProfile);
router.route('/admin/users').get(isAuthenticatedUser, authorizeRoles('admin'), allUsers);
router.route('/admin/user/:id').get(isAuthenticatedUser, authorizeRoles('admin'), getUserDetails);
router.route('/admin/updateUser/:id').put(isAuthenticatedUser, authorizeRoles('admin'), updateUser);
router.route('/admin/delete/:id').delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUser)

module.exports = router;