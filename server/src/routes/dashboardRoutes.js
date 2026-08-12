const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getOwnerDashboard } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/owner', protect, authorize('owner'), getOwnerDashboard);

module.exports = router;
