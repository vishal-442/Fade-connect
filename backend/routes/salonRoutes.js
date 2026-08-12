const express = require('express');
const { body } = require('express-validator');
const {
  createSalon,
  listSalons,
  getSalonById,
  updateSalon,
  deleteSalon
} = require('../controllers/salonController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.get('/', listSalons);
router.get('/:id', getSalonById);

router.post(
  '/',
  protect,
  authorize('owner', 'admin'),
  [
    body('name').trim().notEmpty(),
    body('address.line1').trim().notEmpty(),
    body('address.city').trim().notEmpty(),
    body('phone').optional().trim().notEmpty(),
    body('rating').optional().isFloat({ min: 0, max: 5 })
  ],
  validateRequest,
  createSalon
);

router.put('/:id', protect, authorize('owner', 'admin'), updateSalon);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteSalon);

module.exports = router;
