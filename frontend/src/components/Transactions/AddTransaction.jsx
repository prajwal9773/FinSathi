import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IndianRupee, Calendar, Tag, FileText, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { createTransaction, getCategories, getTransactionById, updateTransaction, deleteTransaction } from '../../services/api';

const AddTransaction = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [categories, setCategories] = useState({ expense: [], income: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchTransaction();
    }
  }, [isEditMode]);

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      const response = await getTransactionById(id);
      const { type, amount, category, description, date } = response.data.data.transaction;
      setFormData({
        type,
        amount: amount.toString(),
        category,
        description,
        date: new Date(date).toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error fetching transaction:', error);
      setError('Failed to load transaction data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      
      let categoriesData = null;
      
      if (response?.data?.data) {
        categoriesData = response.data.data;
      } else if (response?.data?.categories) {
        categoriesData = response.data.categories;
      } else if (response?.data) {
        categoriesData = response.data;
      }
      
      if (categoriesData) {
        let processedCategories = { expense: [], income: [] };
        
        if (categoriesData.expense && categoriesData.income) {
          processedCategories = {
            expense: Array.isArray(categoriesData.expense) ? categoriesData.expense : [],
            income: Array.isArray(categoriesData.income) ? categoriesData.income : []
          };
        }
        else if (Array.isArray(categoriesData)) {
          categoriesData.forEach(category => {
            if (category.type === 'expense') {
              processedCategories.expense.push(category.name || category);
            } else if (category.type === 'income') {
              processedCategories.income.push(category.name || category);
            }
          });
        }
        
        setCategories(processedCategories);
        
        // Only set default category if not in edit mode
        if (!isEditMode) {
          if (formData.type === 'expense' && processedCategories.expense.length > 0) {
            setFormData(prev => ({ 
              ...prev, 
              category: processedCategories.expense[0].name || processedCategories.expense[0] 
            }));
          } else if (formData.type === 'income' && processedCategories.income.length > 0) {
            setFormData(prev => ({ 
              ...prev, 
              category: processedCategories.income[0].name || processedCategories.income[0] 
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories({
        expense: ['Food', 'Transportation', 'Entertainment', 'Utilities', 'Other'],
        income: ['Salary', 'Freelance', 'Investment', 'Other']
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'type') {
      const availableCategories = categories[value] || [];
      setFormData(prev => ({
        ...prev,
        category: availableCategories.length > 0 ? 
          (availableCategories[0].name || availableCategories[0]) : ''
      }));
    }
    
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('AddTransaction: Submitting form data:', formData);
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString()
      };

      if (isEditMode) {
        console.log('AddTransaction: Updating transaction with ID:', id);
        await updateTransaction(id, transactionData);
        setSuccess('Transaction updated successfully!');
        console.log('AddTransaction: Update successful');
      } else {
        console.log('AddTransaction: Creating new transaction');
        await createTransaction(transactionData);
        setSuccess('Transaction added successfully!');
        console.log('AddTransaction: Create successful');
      }
      
      // Reset form if not in edit mode
      if (!isEditMode) {
        console.log('AddTransaction: Resetting form');
        setFormData({
          type: 'expense',
          amount: '',
          category: '',
          description: '',
          date: new Date().toISOString().split('T')[0]
        });
      }
      
      // Trigger refresh in parent component
      console.log('AddTransaction: Calling onSuccess callback');
      if (onSuccess) {
        onSuccess();
      } else {
        console.warn('AddTransaction: onSuccess callback is not defined');
      }
      
    } catch (err) {
      console.error('AddTransaction: Error saving transaction:', err);
      setError(err.response?.data?.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        setLoading(true);
        await deleteTransaction(id);
        setSuccess('Transaction deleted successfully!');
        
        // Navigate back after a short delay
        setTimeout(() => {
          navigate('/transactions');
          // Trigger refresh in parent component
          if (onSuccess) {
            onSuccess();
          }
        }, 1000);
        
      } catch (err) {
        console.error('Error deleting transaction:', err);
        setError(err.response?.data?.message || 'Failed to delete transaction');
      } finally {
        setLoading(false);
      }
    }
  };

  const currentCategories = categories[formData.type] || [];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Transaction' : 'Add Transaction'}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {isEditMode ? 'Update your transaction details' : 'Record a new income or expense transaction'}
            </p>
          </div>
          {isEditMode && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Delete Transaction"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  disabled={loading}
                />
                <span className="ml-2 text-sm text-gray-900">Expense</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  disabled={loading}
                />
                <span className="ml-2 text-sm text-gray-900">Income</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              <IndianRupee className="inline h-4 w-4 mr-1" />
              Amount *
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="inline h-4 w-4 mr-1" />
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
              disabled={loading || currentCategories.length === 0}
            >
              {currentCategories.length === 0 ? (
                <option value="">No categories available</option>
              ) : (
                currentCategories.map((category, index) => (
                  <option key={index} value={category.name || category}>
                    {category.name || category}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Description *
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter transaction description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/transactions')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading 
                ? (isEditMode ? 'Updating...' : 'Adding...') 
                : (isEditMode ? 'Update Transaction' : 'Add Transaction')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransaction;