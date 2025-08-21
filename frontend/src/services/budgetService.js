import axios from 'axios';

// Use environment variable for the API URL or default to localhost:3000
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const BUDGETS_ENDPOINT = `${API_URL}/budgets`;

// Get budgets for a specific month and year
export const getBudgets = async (month, year, token) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',  
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.get(`${BUDGETS_ENDPOINT}/${month}/${year}`, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching budgets:', error);
    throw error.response?.data?.message || 'Error fetching budgets';
  }
};

// Create or update a budget
export const saveBudget = async (budgetData, token) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.post(BUDGETS_ENDPOINT, budgetData, config);
    return response.data;
  } catch (error) {
    console.error('Error saving budget:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      throw error.response.data?.message || `Error: ${error.response.status} - ${error.response.statusText}`;
    } else if (error.request) {
      console.error('No response received:', error.request);
      throw 'No response received from server. Please check your connection.';
    } else {
      console.error('Error:', error.message);
      throw error.message || 'Error saving budget';
    }
  }
};

// Delete a budget
export const deleteBudget = async (budgetId, token) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',  
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    await axios.delete(`${BUDGETS_ENDPOINT}/${budgetId}`, config);
  } catch (error) {
    console.error('Error deleting budget:', error);
    throw error.response?.data?.message || 'Error deleting budget';
  }
};
