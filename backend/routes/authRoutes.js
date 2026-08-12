const express = require('express');
const { body } = require('express-validator');
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty(),
    body('email').isString().isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 6 }),
    body('role').optional().isIn(['user', 'owner'])
  ],
  validateRequest,
  register
);

router.post(
  '/login',
  [body('email').isString().isEmail().normalizeEmail(), body('password').isString().notEmpty()],
  validateRequest,
  login
);
router.get('/me', protect, getProfile);
router.put('/me', protect, [body('name').optional().trim().notEmpty()], validateRequest, updateProfile);

module.exports = router;
