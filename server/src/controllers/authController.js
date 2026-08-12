const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { generateToken, setTokenCookie } = require('../utils/generateToken');
const { uploadImage } = require('../config/cloudinary');
const sendEmail = require('../utils/sendEmail');

// @desc    Register a new user (customer or owner)
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  const allowedRoles = ['customer', 'owner'];
  const finalRole = allowedRoles.includes(role) ? role : 'customer';

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({ name, email, password, phone, role: finalRole });
  const token = generateToken(user._id, user.role);
  setTokenCookie(res, token);

  sendEmail({
    to: user.email,
    subject: 'Welcome to Fade Connect',
    text: `Hi ${user.name}, your account has been created successfully as a ${finalRole}.`,
  }).catch(() => {});

  res.status(201).json({ success: true, token, user: user.toSafeObject() });
});

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  if (user.isBlocked) {
    res.status(403);
    throw new Error('Your account has been blocked. Contact support.');
  }

  const token = generateToken(user._id, user.role);
  setTokenCookie(res, token);
  res.json({ success: true, token, user: user.toSafeObject() });
});

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (phone) user.phone = phone;
  await user.save();
  res.json({ success: true, user: user.toSafeObject() });
});

// @desc    Upload / change profile photo
// @route   PUT /api/auth/avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image file provided');
  }
  const result = await uploadImage(req.file.path, 'fade-connect/avatars');
  const user = await User.findById(req.user._id);
  user.avatar = { url: result.url, publicId: result.publicId || '' };
  await user.save();
  res.json({ success: true, user: user.toSafeObject() });
});

// @desc    Request a password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  // Always respond the same way to avoid leaking which emails are registered
  const genericResponse = {
    success: true,
    message: 'If an account exists for that email, a reset link has been sent.',
  };
  if (!user) return res.json(genericResponse);

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Fade Connect - Password Reset',
    text: `You requested a password reset. Use this link (valid 30 minutes): ${resetUrl}`,
  }).catch(() => {});

  res.json(genericResponse);
});

// @desc    Reset password using token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Reset token is invalid or has expired');
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const token = generateToken(user._id, user.role);
  setTokenCookie(res, token);
  res.json({ success: true, token, message: 'Password reset successful' });
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  uploadAvatar,
  forgotPassword,
  resetPassword,
};
