import mongoose from "mongoose";


const transactionSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: {
        values: ['income', 'expense'],
        message: 'Type must be either income or expense'
      }
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.1, 'Amount must be greater than 0.1'],
      validate: {
        validator: function(value) {
          return Number.isFinite(value) && value > 0;
        },
        message: 'Amount must be a positive number'
      }
    },
    category: {
      type: String,
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters'],
      enum: {
        values: [
          'Food', 'Food & Dining',  // <-- added here
          'Transportation', 'Entertainment', 'Shopping', 'Healthcare', 
          'Education', 'Utilities', 'Rent', 'Insurance', 'Travel', 'Other Expenses',
          'Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other Income'
        ],
        message: 'Please select a valid category'
      }
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters']
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      validate: {
        validator: function(value) {
          return value <= new Date();
        },
        message: 'Date cannot be in the future'
      }
    },
    receiptUrl: {
      type: String,
      default: null
    },
    extractedFromReceipt: {
      type: Boolean,
      default: false
    }
  }, {
    timestamps: true,
  });

  //compound indexing for better query performance when this combination is used
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1, date: -1 });


// Static method to get user's transaction summary
transactionSchema.statics.getUserSummary = async function(userId, startDate, endDate) {
    const matchConditions = { userId: new mongoose.Types.ObjectId(userId) };
    
    if (startDate && endDate) {
      matchConditions.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
  
    const summary = await this.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
  
    const result = {
      totalIncome: 0,
      totalExpenses: 0,
      incomeCount: 0,
      expenseCount: 0,
      balance: 0
    };
  
    summary.forEach(item => {
      if (item._id === 'income') {
        result.totalIncome = item.total;
        result.incomeCount = item.count;
      } else if (item._id === 'expense') {
        result.totalExpenses = item.total;
        result.expenseCount = item.count;
      }
    });
  
    result.balance = result.totalIncome - result.totalExpenses;
    return result;
  };



// Static method to get expenses by category
transactionSchema.statics.getExpensesByCategory = async function(userId, startDate, endDate) {
    const matchConditions = { 
      userId: new mongoose.Types.ObjectId(userId),
      type: 'expense'
    };
    
    if (startDate && endDate) {
      matchConditions.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
  
    return await this.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);
  };


  transactionSchema.statics.getMonthlyTrends = async function(userId, year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);
  
    return await this.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lt: endDate }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.month': 1 } }
    ]);
  };
  

export default mongoose.model("Transaction", transactionSchema);

