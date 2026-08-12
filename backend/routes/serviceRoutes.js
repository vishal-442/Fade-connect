const express = require('express');
const { body } = require('express-validator');
const {
  createService,
  listServices,
  updateService,
  deleteService
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.get('/', listServices);

router.post(
  '/',
  protect,
  authorize('owner', 'admin'),
  [
    body('salon').isMongoId(),
    body('name').trim().notEmpty(),
    body('durationMinutes').isInt({ min: 5 }),
    body('price').isFloat({ min: 0 })
  ],
  validateRequest,
  createService
);

router.put('/:id', protect, authorize('owner', 'admin'), updateService);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteService);

module.exports = router;
