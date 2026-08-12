const express = require('express');
const { body } = require('express-validator');
const {
  createWorker,
  listWorkers,
  updateWorker,
  deleteWorker
} = require('../controllers/workerController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.get('/', listWorkers);

router.post(
  '/',
  protect,
  authorize('owner', 'admin'),
  [
    body('salon').isMongoId(),
    body('name').trim().notEmpty(),
    body('specialization').trim().notEmpty(),
    body('availableSlots').optional().isArray()
  ],
  validateRequest,
  createWorker
);

router.put('/:id', protect, authorize('owner', 'admin'), updateWorker);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteWorker);

module.exports = router;
