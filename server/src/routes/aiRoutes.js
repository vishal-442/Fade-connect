const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { recommendHairstyle } = require('../controllers/aiController');

const router = express.Router();

router.post('/hairstyle', protect, authorize('customer'), upload.single('selfie'), recommendHairstyle);

module.exports = router;
