const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const authMiddleware = require('../middleware/authMiddleware');
const { registerValidation, loginValidation } = require('../validations/authValidation');
const validate = require('../middleware/validate');

// @route   POST api/auth/register
// @desc    Register a new user
router.post('/register', authLimiter, registerValidation, validate, authController.register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', authLimiter, loginValidation, validate, authController.login);

// @route   POST api/auth/logout
// @desc    Clear auth cookie
router.post('/logout', authController.logout);

// @route   POST api/auth/forgot-password
// @desc    Request password reset link
router.post('/forgot-password', authLimiter, authController.forgotPassword);

// @route   POST api/auth/reset-password/:token
// @desc    Reset password using token
router.post('/reset-password/:token', authLimiter, authController.resetPassword);

// @route   GET api/auth/check-auth
// @desc    Verify if user is logged in
router.get('/check-auth', authController.checkAuth);

module.exports = router;
