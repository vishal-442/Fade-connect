const express = require('express');
const { listUsers } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, authorize('admin'), listUsers);

module.exports = router;
