import express from 'express';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getChartData,
  getCategories,
  getTransactionById
} from '../controllers/transactionController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(auth);

// GET /api/transactions/summary
// Get financial summary
// Private
router.get('/summary', getSummary);

// GET /api/transactions/charts
// Get chart data
// Private
router.get('/charts', getChartData);

// GET /api/transactions/categories
// Get available categories
// Private
router.get('/categories', getCategories);

// POST /api/transactions
// Create new transaction
// Private
router.post('/', createTransaction);

// Middleware to validate transaction ID
const validateTransactionId = (req, res, next) => {
  const { id } = req.params;
  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(400).json({ message: 'Invalid transaction ID' });
  }
  next();
};

// Routes with ID parameter
router.route('/:id')
  // GET /api/transactions/:id
  // Get single transaction by ID
  // Private
  .get(validateTransactionId, getTransactionById)
  
  // PUT /api/transactions/:id
  // Update transaction
  // Private
  .put(validateTransactionId, updateTransaction)
  
  // DELETE /api/transactions/:id
  // Delete transaction
  // Private
  .delete(validateTransactionId, deleteTransaction);

// GET /api/transactions
// Get all transactions with pagination and filters
// Private
router.get('/', getTransactions);

export default router;