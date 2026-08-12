const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/** Verifies the JWT (from Authorization header or cookie) and attaches req.user */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401);
      throw new Error('Not authorized, user no longer exists');
    }
    if (user.isBlocked) {
      res.status(403);
      throw new Error('Your account has been blocked. Contact support.');
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401);
    throw new Error('Not authorized, token invalid or expired');
  }
});

/** Restricts access to the given roles, e.g. authorize('owner', 'admin') */
const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Role '${req.user?.role || 'unknown'}' is not permitted to access this resource`);
    }
    next();
  };

module.exports = { protect, authorize };
