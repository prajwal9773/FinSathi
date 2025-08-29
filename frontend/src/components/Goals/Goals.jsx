import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPiggyBank, FaBullseye, FaChartLine, FaPlus, FaTrash } from 'react-icons/fa';
import { format, addMonths, differenceInMonths } from 'date-fns';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    targetDate: '',
    category: 'vacation',
  });

  const categories = [
    { value: 'vacation', label: 'Vacation', icon: '🏖️' },
    { value: 'emergency', label: 'Emergency Fund', icon: '🆘' },
    { value: 'retirement', label: 'Retirement', icon: '👵' },
    { value: 'home', label: 'Home Down Payment', icon: '🏠' },
    { value: 'car', label: 'New Car', icon: '🚗' },
    { value: 'education', label: 'Education', icon: '🎓' },
    { value: 'other', label: 'Other', icon: '🎯' },
  ];

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/goals');
      // const data = await response.json();
      // setGoals(data);
      
      // Mock data for now
      setGoals([
        {
          id: '1',
          name: 'Europe Trip',
          targetAmount: 200000,
          currentAmount: 50000,
          targetDate: '2024-12-31',
          category: 'vacation',
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setError('Failed to fetch goals');
      console.error('Error fetching goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.targetAmount || !formData.targetDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const newGoal = {
        ...formData,
        id: Date.now().toString(),
        currentAmount: parseFloat(formData.currentAmount) || 0,
        targetAmount: parseFloat(formData.targetAmount),
        createdAt: new Date().toISOString(),
      };

      // TODO: Replace with actual API call
      // await fetch('/api/goals', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newGoal),
      // });

      setGoals(prev => [...prev, newGoal]);
      setFormData({
        name: '',
        targetAmount: '',
        currentAmount: '0',
        targetDate: '',
        category: 'vacation',
      });
      setError('');
    } catch (err) {
      setError('Failed to create goal');
      console.error('Error creating goal:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/goals/${id}`, { method: 'DELETE' });
      setGoals(prev => prev.filter(goal => goal.id !== id));
    } catch (err) {
      setError('Failed to delete goal');
      console.error('Error deleting goal:', err);
    }
  };

  const calculateProgress = (goal) => {
    return Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
  };

  const getForecast = (goal) => {
    const now = new Date();
    const targetDate = new Date(goal.targetDate);
    const monthsRemaining = differenceInMonths(targetDate, now);
    
    if (monthsRemaining <= 0) {
      return 'Target date has passed';
    }
    
    const monthlySavingNeeded = (goal.targetAmount - goal.currentAmount) / monthsRemaining;
    
    // Calculate based on current saving rate (simplified)
    const currentSavingRate = goal.currentAmount / 
      (differenceInMonths(now, new Date(goal.createdAt)) || 1);
    
    if (currentSavingRate <= 0) {
      return 'Start saving to see forecast';
    }
    
    const monthsAtCurrentRate = Math.ceil(
      (goal.targetAmount - goal.currentAmount) / currentSavingRate
    );
    
    const forecastDate = addMonths(now, monthsAtCurrentRate);
    
    if (monthsAtCurrentRate > 120) { // More than 10 years
      return 'At current rate, it will take more than 10 years to reach your goal';
    }
    
    return `At current rate, you'll reach ₹${goal.targetAmount.toLocaleString()} by ${format(forecastDate, 'MMM yyyy')} (in ~${monthsAtCurrentRate} months)`;
  };

  const getCategoryIcon = (category) => {
    const found = categories.find(c => c.value === category);
    return found ? found.icon : '🎯';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Goals</h1>
        <p className="text-gray-600">Set, track, and achieve your financial dreams</p>
      </div>

      {/* Add Goal Card */}
      <motion.div 
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <FaPlus className="mr-2 text-indigo-600" />
            Create New Goal
          </h2>
        </div>
        
        <div className="p-6">
          {error && (
            <motion.div 
              className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 py-2.5 text-sm"
                  placeholder="e.g., Europe Trip, New Car"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 py-2.5 text-sm"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Amount (₹) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">₹</span>
                  </div>
                  <input
                    type="number"
                    id="targetAmount"
                    name="targetAmount"
                    value={formData.targetAmount}
                    onChange={handleInputChange}
                    min="0"
                    step="10"
                    className="pl-8 w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 py-2.5 text-sm"
                    placeholder="50000"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="currentAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Saved (₹)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">₹</span>
                  </div>
                  <input
                    type="number"
                    id="currentAmount"
                    name="currentAmount"
                    value={formData.currentAmount}
                    onChange={handleInputChange}
                    min="0"
                    step="100"
                    className="pl-8 w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 py-2.5 text-sm"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Date *
                </label>
                <input
                  type="date"
                  id="targetDate"
                  name="targetDate"
                  value={formData.targetDate}
                  onChange={handleInputChange}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 py-2.5 text-sm"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <motion.button
                type="submit"
                className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaPlus className="mr-2 h-4 w-4" />
                Create Goal
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Goals List */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">My Goals</h2>
          <div className="text-sm text-gray-500">
            {goals.length} {goals.length === 1 ? 'goal' : 'goals'}
          </div>
        </div>

        <AnimatePresence>
          {goals.length === 0 ? (
            <motion.div 
              className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <FaBullseye className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No goals yet</h3>
              <p className="mt-1 text-sm text-gray-500">Create your first financial goal to get started</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal) => {
                const progress = calculateProgress(goal);
                const forecast = getForecast(goal);
                const category = categories.find(c => c.value === goal.category) || {};
                
                return (
                  <motion.div
                    key={goal.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    layout
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">{getCategoryIcon(goal.category)}</span>
                            <h3 className="text-lg font-semibold text-gray-900">{goal.name}</h3>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{category.label}</p>
                        </div>
                        <button
                          onClick={() => handleDelete(goal.id)}
                          className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                          aria-label="Delete goal"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="mt-6">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                              progress >= 100 ? 'bg-green-500' : 
                              progress > 50 ? 'bg-blue-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-gray-500">Saved</p>
                            <p className="text-lg font-semibold">
                              ₹{goal.currentAmount?.toLocaleString() || '0'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Target</p>
                            <p className="text-lg font-semibold">
                              ₹{goal.targetAmount?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-start">
                            <FaChartLine className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                            <p className="text-xs text-blue-700">{forecast}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-xs text-gray-500">Target Date</p>
                          <p className="text-sm font-medium">
                            {format(new Date(goal.targetDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Goals;
