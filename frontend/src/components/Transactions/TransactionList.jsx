import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Calendar, Filter, Loader2, Edit2 } from 'lucide-react';
import { getTransactions } from '../../services/api';

const ListTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchTransactions();
  }, [filterType, currentPage]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        type: filterType !== 'all' ? filterType : undefined,
        page: currentPage,
        limit: pageSize,
        sort: '-date',
        keyword:'ice' // Show newest transactions first
      };
      const response = await getTransactions(params);
      setTransactions(response.data.data.transactions);
      setTotalPages(response.data.data.totalPages || 1);
    } catch (err) {
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Transactions</h1>
        <Link
          to="/add-transaction"
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 flex items-center space-x-1"
        >
          <span>Add New</span>
        </Link>
      </div>

      <div className="flex items-center space-x-3 mb-6">
        <Filter className="h-5 w-5 text-gray-500" />
        {['all', 'income', 'expense'].map((type) => (
          <button
            key={type}
            onClick={() => {
              setFilterType(type);
              setCurrentPage(1);
            }}
            className={`px-3 py-1 text-sm rounded-md ${
              filterType === type ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : transactions.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          No transactions found.
          <div className="mt-2">
            <Link to="/add-transaction" className="text-indigo-600 hover:underline">
              Add your first transaction
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white shadow rounded-lg divide-y divide-gray-200 overflow-hidden">
            {transactions.map((tx) => (
              <div 
                key={tx._id} 
                className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 group"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div
                    className={`h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full ${
                      tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    {tx.type === 'income' ? (
                      <ArrowUpRight className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">{tx.description}</div>
                    <div className="text-xs text-gray-500 flex items-center space-x-1">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span>{formatDate(tx.date)}</span>
                      <span>•</span>
                      <span className="truncate">{tx.category}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 ml-4">
                  <div
                    className={`text-sm font-semibold whitespace-nowrap ${
                      tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                   
                    {formatCurrency(tx.amount)}
                  </div>
                  <Link
                    to={`/edit-transaction/${tx._id}`}
                    className="p-1 text-gray-400 hover:text-indigo-600 rounded-full transition-colors"
                    title="Edit transaction"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ListTransactions;
