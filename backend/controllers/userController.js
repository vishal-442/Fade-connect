const User = require('../models/User');

const listUsers = async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  return res.json(users);
};

module.exports = { listUsers };
