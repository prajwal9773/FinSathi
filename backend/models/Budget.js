import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: [
      'Food', 'Food & Dining', 'Transportation', 'Entertainment', 'Shopping', 
      'Healthcare', 'Education', 'Utilities', 'Rent', 'Insurance', 'Travel', 
      'Other Expenses', 'Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other Income'
    ],
    message: 'Please select a valid category'
  },
  amount: {
    type: Number,
    required: [true, 'Budget amount is required'],
    min: [0, 'Budget amount cannot be negative']
  },
  month: {
    type: Number,
    required: [true, 'Month is required'],
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: 2000,
    max: 2100
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure one budget per category per month per user
budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

// Static method to get user's budget summary for a specific month
budgetSchema.statics.getUserBudgetSummary = async function(userId, month, year) {
  const budgets = await this.find({ userId, month, year });
  
  // Calculate total budget
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  
  return {
    totalBudget,
    categoryBudgets: budgets
  };
};

export default mongoose.model("Budget", budgetSchema);
