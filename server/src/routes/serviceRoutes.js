const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  addService,
  updateService,
  uploadServiceImage,
  deleteService,
  getServicesBySalon,
  getMyServices,
} = require('../controllers/serviceController');

const router = express.Router();

router.get('/salon/:salonId', getServicesBySalon);
router.get('/mine', protect, authorize('owner'), getMyServices);
router.post('/', protect, authorize('owner'), addService);
router.put('/:id', protect, authorize('owner'), updateService);
router.put('/:id/image', protect, authorize('owner'), upload.single('image'), uploadServiceImage);
router.delete('/:id', protect, authorize('owner'), deleteService);

module.exports = router;
