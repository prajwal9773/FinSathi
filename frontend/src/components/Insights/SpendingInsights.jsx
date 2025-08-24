import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { getInsights } from '../../services/api';

const SpendingInsights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching insights...');
      const response = await getInsights();
      console.log('Insights response:', response);
      if (response && response.data && Array.isArray(response.data.data)) {
        setInsights(response.data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching insights:', err);
      setError('Failed to load spending insights. Please try again.');
      setInsights([
        "We're having trouble analyzing your spending right now.",
        "Please try refreshing the page or check back later."
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleRefresh = () => {
    fetchInsights();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          <span className="text-gray-600 dark:text-gray-300">Analyzing your spending patterns...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Spending Insights</h2>
        </div>
        <button 
          onClick={handleRefresh}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Refresh insights"
        >
          <RefreshCw className="h-4 w-4 text-gray-500" />
        </button>
      </div>
      
      <div className="overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {error ? (
          <div className="p-4 text-center text-red-500">
            <AlertCircle className="h-5 w-5 mx-auto mb-2" />
            {error}
          </div>
        ) : insights.length > 0 ? (
          insights.map((insight, index) => (
            <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{insight}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No insights available. Add more transactions to get personalized spending analysis.
          </div>
        )}
      </div>
    </div>
  );
};

export default SpendingInsights;
