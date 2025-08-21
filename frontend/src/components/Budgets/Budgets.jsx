import { useState, useEffect } from 'react';
import { getBudgets, saveBudget, deleteBudget } from '../../services/budgetService';
import { format } from 'date-fns';
import { FaPlus, FaTrash, FaArrowRight, FaArrowLeft, FaSpinner } from 'react-icons/fa';

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

  const getProgressBarColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
        <p className="mt-1 text-sm text-gray-500">Set and track your monthly spending limits</p>
      </div>

      {/* Add Budget Form */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Add New Budget</h2>
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

      {/* Budget Overview */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            Budget Overview - {months[formData.month - 1]} {formData.year}
          </h2>
          <div className="flex space-x-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">Budget</p>
              <p className="font-medium">₹{totals.budget?.toLocaleString() || '0'}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Spent</p>
              <p className="font-medium">₹{totals.spent?.toLocaleString() || '0'}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">
                {totals.remaining < 0 ? 'Overspent' : 'Remaining'}
              </p>
              <p className={`font-medium ${totals.remaining < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                ₹{Math.abs(totals.remaining || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {budgets.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No budgets set for this period.</p>
              <p className="text-sm text-gray-400 mt-1">Add a budget to get started</p>
            </div>
          ) : (
            <div className="space-y-6">
              {budgets.map((budget) => (
                <div key={budget._id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-900">{budget.category}</h3>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        ₹{budget.spent.toLocaleString()} of ₹{budget.amount.toLocaleString()}
                      </span>
                      <span className={`text-sm font-medium ${
                        budget.remaining < 0 ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {budget.remaining < 0 ? (
                          <>Overspent: ₹{Math.abs(budget.remaining).toLocaleString()}</>
                        ) : (
                          <>Remaining: ₹{budget.remaining.toLocaleString()}</>
                        )}
                      </span>
                      <button
                        onClick={() => handleDelete(budget._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete budget"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${getProgressBarColor(budget.percentageUsed)}`}
                      style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">0%</span>
                    <span className="text-xs font-medium">{Math.round(budget.percentageUsed)}%</span>
                    <span className="text-xs text-gray-500">100%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Budgets;
