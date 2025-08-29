import Goal from '../models/Goal.js';
import { validationResult } from 'express-validator';

// @desc    Get all goals for a user
// @route   GET /api/goals
// @access  Private
export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ targetDate: 1 });
    res.json(goals);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Add new goal
// @route   POST /api/goals
// @access  Private
export const addGoal = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, targetAmount, currentAmount, targetDate, category } = req.body;

  try {
    const newGoal = new Goal({
      user: req.user.id,
      name,
      targetAmount,
      currentAmount: currentAmount || 0,
      targetDate,
      category,
    });

    const goal = await newGoal.save();
    res.json(goal);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
export const updateGoal = async (req, res) => {
  const { name, targetAmount, currentAmount, targetDate, category } = req.body;

  // Build goal object
  const goalFields = {};
  if (name) goalFields.name = name;
  if (targetAmount) goalFields.targetAmount = targetAmount;
  if (currentAmount !== undefined) goalFields.currentAmount = currentAmount;
  if (targetDate) goalFields.targetDate = targetDate;
  if (category) goalFields.category = category;

  try {
    let goal = await Goal.findById(req.params.id);

    if (!goal) return res.status(404).json({ msg: 'Goal not found' });

    // Make sure user owns goal
    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    goal = await Goal.findByIdAndUpdate(
      req.params.id,
      { $set: goalFields },
      { new: true }
    );

    res.json(goal);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) return res.status(404).json({ msg: 'Goal not found' });

    // Make sure user owns goal
    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Goal.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Goal removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get goal forecast
// @route   GET /api/goals/forecast/:id
// @access  Private
export const getGoalForecast = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) return res.status(404).json({ msg: 'Goal not found' });

    // Make sure user owns goal
    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const now = new Date();
    const targetDate = new Date(goal.targetDate);
    const monthsRemaining = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24 * 30));
    
    if (monthsRemaining <= 0) {
      return res.json({ forecast: 'Target date has passed' });
    }

    // Calculate monthly saving needed
    const amountRemaining = goal.targetAmount - (goal.currentAmount || 0);
    const monthlySavingNeeded = amountRemaining / monthsRemaining;

    // Calculate based on current saving rate (simplified)
    const monthsSinceCreation = Math.max(1, Math.ceil((now - new Date(goal.createdAt)) / (1000 * 60 * 60 * 24 * 30)));
    const currentSavingRate = (goal.currentAmount || 0) / monthsSinceCreation;

    let forecast = {
      monthlySavingNeeded,
      currentSavingRate,
      monthsAtCurrentRate: Math.ceil(amountRemaining / currentSavingRate),
      canBeAchieved: currentSavingRate >= monthlySavingNeeded,
    };

    res.json(forecast);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

