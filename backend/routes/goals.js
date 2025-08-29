import express from 'express';
const router = express.Router();
import { check } from 'express-validator';
import auth from '../middleware/auth.js';
import {
  getGoals,
  addGoal,
  updateGoal,
  deleteGoal,
  getGoalForecast
} from '../controllers/goalController.js';

// @route   GET /api/goals
// @desc    Get all user's goals
// @access  Private
router.get('/', auth, getGoals);

// @route   POST /api/goals
// @desc    Add a new goal
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('targetAmount', 'Please include a valid target amount').isNumeric().isFloat({ min: 1 }),
      check('targetDate', 'Please include a valid future date').isISO8601().toDate()
        .custom(value => value > new Date())
        .withMessage('Target date must be in the future'),
      check('category', 'Please select a valid category').isIn([
        'vacation', 'emergency', 'retirement', 'home', 'car', 'education', 'other'
      ])
    ]
  ],
  addGoal
);

// @route   PUT /api/goals/:id
// @desc    Update a goal
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      check('name', 'Name is required').optional().not().isEmpty(),
      check('targetAmount', 'Please include a valid target amount').optional().isNumeric().isFloat({ min: 1 }),
      check('currentAmount', 'Current amount cannot be negative').optional().isFloat({ min: 0 }),
      check('targetDate', 'Please include a valid future date').optional().isISO8601().toDate()
        .custom(value => value > new Date())
        .withMessage('Target date must be in the future'),
      check('category', 'Please select a valid category').optional().isIn([
        'vacation', 'emergency', 'retirement', 'home', 'car', 'education', 'other'
      ])
    ]
  ],
  updateGoal
);

// @route   DELETE /api/goals/:id
// @desc    Delete a goal
// @access  Private
router.delete('/:id', auth, deleteGoal);

// @route   GET /api/goals/forecast/:id
// @desc    Get forecast for a goal
// @access  Private
router.get('/forecast/:id', auth, getGoalForecast);

export default router;
