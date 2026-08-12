const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  uploadAvatar,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['customer', 'owner']).withMessage('Invalid role'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.post('/forgot-password', body('email').isEmail(), validate, forgotPassword);
router.put(
  '/reset-password/:token',
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
  resetPassword
);

module.exports = router;
