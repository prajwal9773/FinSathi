import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a goal name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  targetAmount: {
    type: Number,
    required: [true, 'Please add a target amount'],
    min: [1, 'Target amount must be at least 1']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Current amount cannot be negative']
  },
  targetDate: {
    type: Date,
    required: [true, 'Please add a target date'],
    validate: {
      validator: function(value) {
        return value > Date.now();
      },
      message: 'Target date must be in the future'
    }
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'vacation',
      'emergency',
      'retirement',
      'home',
      'car',
      'education',
      'other'
    ]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate progress percentage
GoalSchema.virtual('progress').get(function() {
  return Math.min(Math.round((this.currentAmount / this.targetAmount) * 100), 100);
});

// Calculate remaining amount
GoalSchema.virtual('remaining').get(function() {
  return Math.max(0, this.targetAmount - this.currentAmount);
});

// Calculate days remaining
GoalSchema.virtual('daysRemaining').get(function() {
  const days = Math.ceil((new Date(this.targetDate) - Date.now()) / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
});

// Calculate daily saving needed
GoalSchema.virtual('dailySavingNeeded').get(function() {
  const days = Math.ceil((new Date(this.targetDate) - Date.now()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return 0;
  return Math.max(0, (this.targetAmount - this.currentAmount) / days);
});

export default mongoose.model('Goal', GoalSchema);
