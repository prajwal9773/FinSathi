import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Calendar, TrendingUp, PieChart, BarChart3 } from 'lucide-react';
import { getChartData } from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Charts = () => {
  const [activeChart, setActiveChart] = useState('category');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchChartData();
  }, [activeChart, dateRange, selectedYear]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching chart data with params:', { activeChart, dateRange, selectedYear });
      
      let params = { type: activeChart };
      
      if (activeChart === 'category') {
        const endDate = new Date();
        const startDate = new Date();
        
        if (dateRange === 'week') {
          startDate.setDate(endDate.getDate() - 7);
        } else if (dateRange === 'month') {
          startDate.setMonth(endDate.getMonth() - 1);
        } else if (dateRange === 'year') {
          startDate.setFullYear(endDate.getFullYear() - 1);
        }
        
        params.startDate = startDate.toISOString().split('T')[0];
        params.endDate = endDate.toISOString().split('T')[0];
      } else if (activeChart === 'monthly') {
        params.year = selectedYear;
      }

      console.log('API params:', params);

      const response = await getChartData(params);
      console.log('API response:', response);

      let fetchedData = null;
      if (response?.data?.data?.chartData) {
        fetchedData = response.data.data.chartData;
      } else if (response?.data?.chartData) {
        fetchedData = response.data.chartData;
      } else if (Array.isArray(response?.data?.data)) {
        fetchedData = response.data.data;
      } else if (Array.isArray(response?.data)) {
        fetchedData = response.data;
      } else if (response?.data) {
        // Try to use the response data directly if it's an object or array
        fetchedData = response.data;
      }



      if (fetchedData?.message) {
        console.log('Data contains message, setting to null');
        fetchedData = null;
      }

      setChartData(fetchedData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setError(error.message || 'Failed to fetch chart data');
    } finally {
      setLoading(false);
    }
  };

 

  const generateColors = (count) => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
    ];
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getCategoryChartData = () => {
    if (!chartData || chartData.length === 0) {
      console.log('No chart data for category chart:', chartData);
      return null;
    }

    console.log('Processing category chart data:', chartData);

    // Group transactions by category and sum amounts
    const categoryTotals = {};
    chartData.forEach(transaction => {
      const category = transaction.category || 'Uncategorized';
      const amount = transaction.amount || 0;
      
      if (categoryTotals[category]) {
        categoryTotals[category] += amount;
      } else {
        categoryTotals[category] = amount;
      }
    });

    const labels = Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);
    const colors = generateColors(labels.length);

    console.log('Category chart - labels:', labels, 'amounts:', amounts);

    return {
      labels,
      datasets: [
        {
          label: 'Amount',
          data: amounts,
          backgroundColor: colors.map(color => color + '80'),
          borderColor: colors,
          borderWidth: 2,
        },
      ],
    };
  };

  const getMonthlyChartData = () => {
    if (!chartData || chartData.length === 0) {
      console.log('No chart data for monthly chart:', chartData);
      return null;
    }

    console.log('Processing monthly chart data:', chartData);

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const incomeData = new Array(12).fill(0);
    const expenseData = new Array(12).fill(0);

    chartData.forEach(transaction => {
      const date = new Date(transaction.date || transaction.createdAt);
      const monthIndex = date.getMonth(); // 0-11
      const amount = transaction.amount || 0;
      const type = transaction.type;
      
      if (monthIndex >= 0 && monthIndex < 12) {
        if (type === 'income') {
          incomeData[monthIndex] += amount;
        } else if (type === 'expense') {
          expenseData[monthIndex] += amount;
        }
      }
    });

    console.log('Monthly chart - income:', incomeData, 'expenses:', expenseData);

    return {
      labels: months,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          backgroundColor: '#10B98180',
          borderColor: '#10B981',
          borderWidth: 2,
          fill: false,
        },
        {
          label: 'Expenses',
          data: expenseData,
          backgroundColor: '#EF444480',
          borderColor: '#EF4444',
          borderWidth: 2,
          fill: false,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${formatCurrency(context.parsed.y || context.parsed)}`;
          }
        }
      }
    },
    scales: activeChart !== 'category' ? {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    } : undefined
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
          }
        }
      }
    }
  };

  const renderChart = () => {
    // if (loading) {
    //   return (
    //     <div className="flex items-center justify-center h-64">
    //       <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
    //       <div className="ml-4">
    //         <p>Loading chart data...</p>
    //         <button 
    //           onClick={debugFetch}
    //           className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
    //         >
    //           Debug Fetch
    //         </button>
    //       </div>
    //     </div>
    //   );
    // }

    // if (error) {
    //   return (
    //     <div className="flex items-center justify-center h-64 text-red-500">
    //       <div className="text-center">
    //         <p className="mb-4">Error: {error}</p>
    //         <button 
    //           onClick={debugFetch}
    //           className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    //         >
    //           Retry
    //         </button>
    //       </div>
    //     </div>
    //   );
    // }

    // if (!chartData || chartData.length === 0) {
    //   return (
    //     <div className="flex items-center justify-center h-64 text-gray-500">
    //       <div className="text-center">
    //         <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
    //         <p>No data available for the selected period</p>
    //         <p className="text-sm mt-2">Chart data: {JSON.stringify(chartData)}</p>
    //         <button 
    //           onClick={debugFetch}
    //           className="mt-2 px-3 py-1 bg-gray-500 text-white rounded text-sm"
    //         >
    //           Refresh Data
    //         </button>
    //       </div>
    //     </div>
    //   );
    // }

    const data = activeChart === 'category' ? getCategoryChartData() : getMonthlyChartData();
    
    if (!data) {
      return (
        <div className="text-center text-red-500">
          <p>Failed to process chart data</p>
          <p className="text-sm">Raw data: {JSON.stringify(chartData)}</p>
        </div>
      );
    }

    switch (activeChart) {
      case 'category':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Bar Chart</h3>
              <Bar data={data} options={chartOptions} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pie Chart</h3>
              <Pie data={data} options={pieOptions} />
            </div>
          </div>
        );
      case 'monthly':
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trends</h3>
            <Line data={data} options={chartOptions} />
          </div>
        );
      default:
        return null;
    }
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i);
    }
    return years;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Financial Charts</h1>
        <p className="mt-2 text-sm text-gray-600">
          Visualize your spending patterns and financial trends
        </p>
        
       
      </div>

      {/* Chart Type Selection */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveChart('category')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeChart === 'category'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <PieChart className="h-4 w-4 mr-2" />
                Expenses by Category
              </div>
            </button>
            <button
              onClick={() => setActiveChart('monthly')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeChart === 'monthly'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Monthly Trends
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        {activeChart === 'category' && (
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <label className="text-sm font-medium text-gray-700">Time Period:</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        )}

        {activeChart === 'monthly' && (
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <label className="text-sm font-medium text-gray-700">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {getYearOptions().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div className="bg-white shadow rounded-lg p-6">
        {renderChart()}
      </div>

      {/* Summary Stats */}
      {chartData && chartData.length > 0 && (
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeChart === 'category' ? (
              <>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {chartData.length}
                  </div>
                  <div className="text-sm text-gray-500">Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(chartData.reduce((sum, transaction) => sum + (transaction.amount || 0), 0))}
                  </div>
                  <div className="text-sm text-gray-500">Total Expenses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {formatCurrency(Math.max(...chartData.map(transaction => transaction.amount || 0)))}
                  </div>
                  <div className="text-sm text-gray-500">Highest Transaction</div>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(
                      chartData
                        .filter(transaction => transaction.type === 'income')
                        .reduce((sum, transaction) => sum + (transaction.amount || 0), 0)
                    )}
                  </div>
                  <div className="text-sm text-gray-500">Total Income</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(
                      chartData
                        .filter(transaction => transaction.type === 'expense')
                        .reduce((sum, transaction) => sum + (transaction.amount || 0), 0)
                    )}
                  </div>
                  <div className="text-sm text-gray-500">Total Expenses</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    chartData
                      .filter(transaction => transaction.type === 'income')
                      .reduce((sum, transaction) => sum + (transaction.amount || 0), 0) -
                    chartData
                      .filter(transaction => transaction.type === 'expense')
                      .reduce((sum, transaction) => sum + (transaction.amount || 0), 0) >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {formatCurrency(
                      chartData
                        .filter(transaction => transaction.type === 'income')
                        .reduce((sum, transaction) => sum + (transaction.amount || 0), 0) -
                      chartData
                        .filter(transaction => transaction.type === 'expense')
                        .reduce((sum, transaction) => sum + (transaction.amount || 0), 0)
                    )}
                  </div>
                  <div className="text-sm text-gray-500">Net Income</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Charts;