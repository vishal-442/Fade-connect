const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createSalon,
  getMySalon,
  updateSalon,
  uploadSalonImages,
  toggleBlockedDate,
  listSalons,
  getSalonById,
  toggleFavorite,
  getMyFavorites,
} = require('../controllers/salonController');

const router = express.Router();

// Customer (defined before "/:id" so they aren't swallowed by the param route)
router.get('/mine/favorites', protect, authorize('customer'), getMyFavorites);
router.put('/:id/favorite', protect, authorize('customer'), toggleFavorite);

// Owner
router.post('/', protect, authorize('owner'), createSalon);
router.get('/mine/profile', protect, authorize('owner'), getMySalon);
router.put('/mine/profile', protect, authorize('owner'), updateSalon);
router.post('/mine/images', protect, authorize('owner'), upload.array('images', 10), uploadSalonImages);
router.put('/mine/blocked-dates', protect, authorize('owner'), toggleBlockedDate);

// Public
router.get('/', listSalons);
router.get('/:id', getSalonById);

module.exports = router;
