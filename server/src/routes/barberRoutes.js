const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  addBarber,
  updateBarber,
  uploadBarberPhoto,
  deleteBarber,
  getBarbersBySalon,
  getMyBarbers,
} = require('../controllers/barberController');

const router = express.Router();

router.get('/salon/:salonId', getBarbersBySalon);
router.get('/mine', protect, authorize('owner'), getMyBarbers);
router.post('/', protect, authorize('owner'), addBarber);
router.put('/:id', protect, authorize('owner'), updateBarber);
router.put('/:id/photo', protect, authorize('owner'), upload.single('photo'), uploadBarberPhoto);
router.delete('/:id', protect, authorize('owner'), deleteBarber);

module.exports = router;
