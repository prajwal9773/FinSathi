import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Plus,
  Upload,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { getTransactionSummary, getTransactions } from '../../services/api';
import SpendingInsights from '../Insights/SpendingInsights';

const Dashboard = ({ refreshTrigger = 0 }) => {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    incomeCount: 0,
    expenseCount: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    console.log('Dashboard: useEffect triggered, refreshTrigger:', refreshTrigger);
    fetchDashboardData();
  }, [dateRange, refreshTrigger]);

  const fetchDashboardData = async () => {
    try {
      console.log('Dashboard: Fetching data...');
      setLoading(true);
  
      const endDate = new Date();
      const startDate = new Date();
      if (dateRange === 'week') {
        startDate.setDate(endDate.getDate() - 7);
      } else if (dateRange === 'month') {
        startDate.setMonth(endDate.getMonth() - 1);
      } else if (dateRange === 'year') {
        startDate.setFullYear(endDate.getFullYear() - 1);
      }
  
      const params = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };
  
      const [summaryResponse, transactionsResponse] = await Promise.all([
        getTransactionSummary(params),
        getTransactions({ ...params, limit: 5, sortBy: 'date', sortOrder: 'desc' })
      ]);

      console.log('Dashboard: Raw API responses:', { summaryResponse, transactionsResponse });
  
      // Extract summary data - your API returns { data: { message: '...', data: { ... } } }
      let summaryData = null;
      if (summaryResponse?.data?.data) {
        summaryData = summaryResponse.data.data;
       
      } else if (summaryResponse?.data) {
        summaryData = summaryResponse.data;
        
      }
      
      // Extract transactions data
      let transactions = null;
      if (transactionsResponse?.data?.data?.transactions) {
        transactions = transactionsResponse.data.data.transactions;
      } else if (transactionsResponse?.data?.transactions) {
        transactions = transactionsResponse.data.transactions;
      } else if (Array.isArray(transactionsResponse?.data?.data)) {
        transactions = transactionsResponse.data.data;
      } else if (Array.isArray(transactionsResponse?.data)) {
        transactions = transactionsResponse.data;
      }
  
      console.log("Extracted summaryData:", summaryData);
      console.log("Extracted transactions:", transactions);
  
      if (summaryData) {
        console.log('Dashboard: Setting summary data:', summaryData);
        setSummary({
          totalIncome: summaryData.totalIncome || 0,
          totalExpenses: summaryData.totalExpenses || 0,
          balance: summaryData.balance || 0,
          incomeCount: summaryData.incomeCount || 0,
          expenseCount: summaryData.expenseCount || 0
        });
      } else {
        console.warn('Dashboard: No summary data received');
        setSummary({
          totalIncome: 0,
          totalExpenses: 0,
          balance: 0,
          incomeCount: 0,
          expenseCount: 0
        });
      }
  
      if (transactions) {
       
        setRecentTransactions(Array.isArray(transactions) ? transactions : []);
      } else {
       
        setRecentTransactions([]);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setSummary({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        incomeCount: 0,
        expenseCount: 0
      });
      setRecentTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDateRangeText = () => {
    switch (dateRange) {
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return 'This Month';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Your financial overview for {getDateRangeText().toLowerCase()}
        </p>
      </div>

      {/* Date Range Filter */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {['week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                dateRange === range
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Balance */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5 flex items-center">
            <Wallet className="h-6 w-6 text-gray-400" />
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500 truncate">Balance</dt>
              <dd className={`text-lg font-medium ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary.balance)}
              </dd>
            </div>
          </div>
        </div>

        {/* Income */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5 flex items-center">
            <TrendingUp className="h-6 w-6 text-green-400" />
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500 truncate">Income</dt>
              <dd className="text-lg font-medium text-green-600">{formatCurrency(summary.totalIncome)}</dd>
              <dd className="text-xs text-gray-500">{summary.incomeCount} transactions</dd>
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5 flex items-center">
            <TrendingDown className="h-6 w-6 text-red-400" />
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500 truncate">Expenses</dt>
              <dd className="text-lg font-medium text-red-600">{formatCurrency(summary.totalExpenses)}</dd>
              <dd className="text-xs text-gray-500">{summary.expenseCount} transactions</dd>
            </div>
          </div>
        </div>

        {/* Transactions Count */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5 flex items-center">
            <DollarSign className="h-6 w-6 text-indigo-400" />
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500 truncate">Transactions</dt>
              <dd className="text-lg font-medium text-gray-900">
                {summary.incomeCount + summary.expenseCount}
              </dd>
              <dd className="text-xs text-gray-500">Total entries</dd>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/add-transaction" className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <Plus className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <div className="font-medium text-gray-900">Add Transaction</div>
              <div className="text-sm text-gray-500">Record income or expense</div>
            </div>
          </Link>
          <Link to="/upload-receipt" className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <Upload className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <div className="font-medium text-gray-900">Upload Receipt</div>
              <div className="text-sm text-gray-500">Scan receipt automatically</div>
            </div>
          </Link>
          <Link to="/charts" className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <div className="font-medium text-gray-900">View Charts</div>
              <div className="text-sm text-gray-500">Analyze spending patterns</div>
            </div>
          </Link>
          <Link to="/transactions" className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <Calendar className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <div className="font-medium text-gray-900">All Transactions</div>
              <div className="text-sm text-gray-500">View complete history</div>
            </div>
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          {/* Recent Transactions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
              <Link to="/transactions" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                View all
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {recentTransactions.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-gray-500">No transactions found for this period.</p>
                  <Link to="/add-transaction" className="mt-2 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500">
                    Add your first transaction
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              ) : (
                recentTransactions.map((transaction) => (
                  <div key={transaction._id || transaction.id} className="px-6 py-4 hover:bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="h-5 w-5 text-green-600" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{transaction.description || 'No description'}</div>
                        <div className="text-sm text-gray-500">
                          {transaction.category || 'Uncategorized'} • {formatDate(transaction.date)}
                        </div>
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Spending Insights */}
        <div className="space-y-6">
          <SpendingInsights />
          {/* <Link to="/charts" className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <div className="font-medium text-gray-900">View Charts</div>
              <div className="text-sm text-gray-500">Analyze spending patterns</div>
            </div>
          </Link> */}
          {/* <Link to="/transactions" className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <Calendar className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <div className="font-medium text-gray-900">All Transactions</div>
              <div className="text-sm text-gray-500">View complete history</div>
            </div>
          </Link> */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;