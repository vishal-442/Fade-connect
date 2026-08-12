const jwt = require('jsonwebtoken');

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const setTokenCookie = (res, token) => {
  const days = Number(process.env.JWT_COOKIE_EXPIRES_DAYS || 7);
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
  });
};

module.exports = { generateToken, setTokenCookie };
