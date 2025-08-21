import express from 'express';
import { body } from 'express-validator';
import auth from '../middleware/auth.js';
import {
  createOrUpdateBudget,
  getBudgets,
  deleteBudget
} from '../controllers/budgetController.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// @route   POST /api/budgets
// @desc    Create or update a budget
// @access  Private
router.post(
  '/',
  [
    body('category', 'Please select a valid category').isString().trim().notEmpty(),
    body('amount', 'Amount must be a positive number').isFloat({ min: 0 }),
    body('month', 'Month must be between 1 and 12').isInt({ min: 1, max: 12 }),
    body('year', 'Please enter a valid year').isInt({ min: 2000, max: 2100 })
  ],
  createOrUpdateBudget
);

// @route   GET /api/budgets/:month/:year
// @desc    Get user's budgets for a specific month and year
// @access  Private
router.get('/:month/:year', getBudgets);

// @route   DELETE /api/budgets/:id
// @desc    Delete a budget
// @access  Private
router.delete('/:id', deleteBudget);

export default router;
