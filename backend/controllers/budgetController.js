import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";
import { validationResult } from "express-validator";

// @desc    Create or update a budget
// @route   POST /api/budgets
// @access  Private
export const createOrUpdateBudget = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { category, amount, month, year } = req.body;
  const userId = req.user.id;

  try {
    // Check if budget already exists for this category and month
    let budget = await Budget.findOne({
      userId,
      category,
      month,
      year
    });

    if (budget) {
      // Update existing budget
      budget.amount = amount;
      await budget.save();
    } else {
      // Create new budget
      budget = new Budget({
        userId,
        category,
        amount,
        month,
        year
      });
      await budget.save();
    }

    res.status(200).json(budget);
  } catch (error) {
    console.error('Error saving budget:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's budgets for a specific month
// @route   GET /api/budgets/:month/:year
// @access  Private
export const getBudgets = async (req, res) => {
  const { month, year } = req.params;
  const userId = req.user.id;

  try {
    // Get all budgets for the user for the specified month and year
    const budgets = await Budget.find({ userId, month: parseInt(month), year: parseInt(year) });
    
    // Get all transactions for the user for the specified month and year
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const transactions = await Transaction.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
      type: 'expense' // Only consider expenses for budget tracking
    });

    // Calculate spent amount per category
    const categorySpending = {};
    transactions.forEach(transaction => {
      if (!categorySpending[transaction.category]) {
        categorySpending[transaction.category] = 0;
      }
      categorySpending[transaction.category] += transaction.amount;
    });

    // Merge budgets with spending data
    const budgetsWithSpending = budgets.map(budget => ({
      ...budget.toObject(),
      spent: categorySpending[budget.category] || 0,
      remaining: budget.amount - (categorySpending[budget.category] || 0),
      percentageUsed: Math.min(
        Math.round(((categorySpending[budget.category] || 0) / budget.amount) * 100),
        100
      )
    }));

    // Calculate totals
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const totalSpent = Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0);

    res.status(200).json({
      budgets: budgetsWithSpending,
      totals: {
        budget: totalBudget,
        spent: totalSpent,
        remaining: totalBudget - totalSpent,
        percentageUsed: totalBudget > 0 
          ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100)
          : 0
      }
    });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Check if the budget belongs to the user
    if (budget.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await budget.deleteOne();
    res.status(200).json({ message: 'Budget removed' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
