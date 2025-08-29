import { useState, useEffect } from 'react';
import { getBudgets, saveBudget, deleteBudget } from '../../services/budgetService';
import { format } from 'date-fns';
import { FaPlus, FaTrash, FaArrowRight, FaArrowLeft, FaSpinner, FaChartPie, FaWallet, FaBullseye } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [totals, setTotals] = useState({
    budget: 0,
    spent: 0,
    remaining: 0,
    percentageUsed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const categories = [
    'Food', 'Food & Dining', 'Transportation', 'Entertainment', 
    'Shopping', 'Healthcare', 'Education', 'Utilities', 
    'Rent', 'Insurance', 'Travel', 'Other Expenses'
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i - 5);

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!getToken();
  };

  useEffect(() => {
    if (isAuthenticated()) {
      fetchBudgets();
    } else {
      window.location.href = '/login';
    }
  }, [formData.month, formData.year]);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        window.location.href = '/login';
        return;
      }
      const data = await getBudgets(formData.month, formData.year, token);
      setBudgets(data.budgets || []);
      setTotals(data.totals || {});
      setError('');
    } catch (err) {
      console.error('Error fetching budgets:', err);
      setError(err.message || 'Failed to load budgets. Please try again.');
      
      if (err.response?.status === 401) {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.amount) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        window.location.href = '/login';
        return;
      }
      await saveBudget(formData, token);
      fetchBudgets();
      setFormData(prev => ({ ...prev, category: '', amount: '' }));
    } catch (err) {
      console.error('Error saving budget:', err);
      setError(err.message || 'Failed to save budget. Please try again.');
      
      if (err.response?.status === 401) {
        window.location.href = '/login';
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        const token = getToken();
        if (!token) {
          window.location.href = '/login';
          return;
        }
        await deleteBudget(id, token);
        fetchBudgets();
      } catch (err) {
        console.error('Error deleting budget:', err);
        setError(err.message || 'Failed to delete budget. Please try again.');
        
        if (err.response?.status === 401) {
          window.location.href = '/login';
        }
      }
    }
  };

  // Add this helper function to determine progress bar color based on percentage
  const getProgressBarColor = (percentage) => {
    if (percentage > 100) return 'bg-red-500';
    if (percentage > 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading && budgets.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <FaSpinner className="animate-spin h-8 w-8 text-indigo-600 mb-2" />
          <p className="text-gray-600">Loading budgets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Budget Management
        </h1>
        <p className="mt-2 text-gray-600">Track and manage your monthly spending limits</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div 
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
              <FaWallet className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Budget</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{totals.budget?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-50 text-red-600">
              <FaChartPie className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{totals.spent?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-50 text-green-600">
              <FaWallet className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Remaining Budget</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{Math.abs(totals.remaining || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Add Budget Form */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Add New Budget</h2>
          <Link 
            to="/goals" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FaBullseye className="mr-2" />
            View Goals
          </Link>
        </div>
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <select
                  id="month"
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {months.map((month, index) => (
                    <option key={month} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaPlus className="mr-2 h-4 w-4" />
                Add Budget
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Budget List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Budgets for {months[formData.month - 1]} {formData.year}
            </h2>
            <div className="flex items-center mt-2 sm:mt-0">
              <button
                onClick={() => {
                  const prevMonth = formData.month === 1 ? 12 : formData.month - 1;
                  const prevYear = formData.month === 1 ? formData.year - 1 : formData.year;
                  setFormData(prev => ({ ...prev, month: prevMonth, year: prevYear }));
                }}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <FaArrowLeft className="h-4 w-4 text-gray-500" />
              </button>
              <span className="mx-4 text-sm text-gray-600">
                {months[formData.month - 1].substring(0, 3)} {formData.year}
              </span>
              <button
                onClick={() => {
                  const nextMonth = formData.month === 12 ? 1 : formData.month + 1;
                  const nextYear = formData.month === 12 ? formData.year + 1 : formData.year;
                  setFormData(prev => ({ ...prev, month: nextMonth, year: nextYear }));
                }}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <FaArrowRight className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <FaSpinner className="animate-spin h-8 w-8 text-indigo-600" />
            </div>
          ) : budgets.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">No budgets yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new budget.</p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-4">
                {budgets.map((budget) => {
                  const percentage = Math.min(Math.round((budget.spent / budget.amount) * 100), 100);
                  const isOverBudget = budget.spent > budget.amount;
                  
                  return (
                    <motion.div 
                      key={budget._id}
                      className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      layout
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{budget.category}</h3>
                          <p className="text-sm text-gray-500">
                            {budget.spent > budget.amount ? 'Overspent by ' : 'Remaining '}
                            ₹{Math.abs(budget.amount - budget.spent).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(budget._id)}
                          className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                          aria-label="Delete budget"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">
                            ₹{budget.spent?.toLocaleString() || '0'}
                            <span className="text-gray-500 font-normal"> of ₹{budget.amount?.toLocaleString()}</span>
                          </span>
                          <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
                            {percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${getProgressBarColor(percentage)}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Spent</span>
                        <span>Budget</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default Budgets;
