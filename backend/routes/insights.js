import express from 'express';
import auth from '../middleware/auth.js';
import Transaction from '../models/Transaction.js';
import { generateSpendingInsights } from '../config/gemini.js';

const router = express.Router();

// @desc    Get AI-powered spending insights
// @route   GET /api/insights
// @access  Private
router.get('/', auth, async (req, res) => {
  // Prevent caching of this endpoint
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');

  console.log('Insights endpoint called');
  try {
    console.log('Fetching transactions for user:', req.user.id);
    // Get transactions for the authenticated user
    const transactions = await Transaction.find({ userId: req.user.id })
      .sort({ date: -1 }) // Most recent first
      .limit(100); // Limit to last 100 transactions for analysis

    console.log(`Found ${transactions.length} transactions`);

    if (transactions.length === 0) {
      console.log('No transactions found for user');
      return res.status(200).json({
        success: true,
        data: ["Not enough transaction data available to generate insights."]
      });
    }

    // Group transactions by month and category for analysis
    const transactionsByMonth = {};
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Initialize data structure
    for (let i = 0; i < 3; i++) { // Last 3 months
      const month = (currentMonth - i + 12) % 12;
      const year = currentYear - Math.floor((currentMonth - i) / 12);
      const monthYear = `${year}-${String(month + 1).padStart(2, '0')}`;
      transactionsByMonth[monthYear] = {};
    }

    // Process transactions
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const month = date.getMonth();
      const year = date.getFullYear();
      const monthYear = `${year}-${String(month + 1).padStart(2, '0')}`;
      
      if (!transactionsByMonth[monthYear]) return;
      
      const category = transaction.category || 'Uncategorized';
      
      if (!transactionsByMonth[monthYear][category]) {
        transactionsByMonth[monthYear][category] = 0;
      }
      
      transactionsByMonth[monthYear][category] += transaction.amount;
    });

    // Prepare data for AI analysis
    const analysisData = {
      transactionsByMonth,
      totalTransactions: transactions.length,
      timeRange: {
        start: transactions[transactions.length - 1].date,
        end: transactions[0].date
      },
      spendingByCategory: {}
    };

    console.log('Analysis data prepared:', JSON.stringify(analysisData, null, 2));

    // Calculate category totals across all months
    Object.values(transactionsByMonth).forEach(monthData => {
      Object.entries(monthData).forEach(([category, amount]) => {
        if (!analysisData.spendingByCategory[category]) {
          analysisData.spendingByCategory[category] = 0;
        }
        analysisData.spendingByCategory[category] += amount;
      });
    });

    console.log('Analysis data with category totals:', JSON.stringify(analysisData, null, 2));

    // Generate insights using Gemini AI
    let insights = [];
    try {
      insights = await generateSpendingInsights(analysisData);
      console.log('Generated insights:', JSON.stringify(insights, null, 2));
    } catch (error) {
      console.error('Error in generateSpendingInsights:', error);
      // Return a friendly message if insights generation fails
      insights = [
        "We're having trouble analyzing your spending right now. Please try again later.",
        "In the meantime, you can check your transactions and budgets manually."
      ];
    }

    // Ensure we always return an array of strings
    if (!Array.isArray(insights) || insights.length === 0) {
      console.warn('No valid insights generated, using fallback');
      insights = [
        "We've analyzed your spending, but don't have enough data to provide personalized insights yet.",
        "As you add more transactions, we'll be able to provide more detailed analysis."
      ];
    }

    res.status(200).json({
      success: true,
      data: insights,
      analysisPeriod: {
        start: analysisData.timeRange.start,
        end: analysisData.timeRange.end
      }
    });

  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate spending insights',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
