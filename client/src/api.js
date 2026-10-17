import axios from 'axios';

// Base URL of the backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== GROUPS =====

// Create a new group
export const createGroup = async (data) => {
  const res = await api.post('/groups', data);
  return res.data;
};

// List all groups
export const listGroups = async () => {
  const res = await api.get('/groups');
  return res.data;
};

// Get one group by ID
export const getGroup = async (id) => {
  const res = await api.get(`/groups/${id}`);
  return res.data;
};

// Delete a group (and its expenses)
export const deleteGroup = async (id) => {
  const res = await api.delete(`/groups/${id}`);
  return res.data;
};

// ===== EXPENSES =====

// Create a new expense
export const createExpense = async (data) => {
  const res = await api.post('/expenses', data);
  return res.data;
};

// Get all expenses for a group
export const listExpenses = async (groupId) => {
  const res = await api.get(`/groups/${groupId}/expenses`);
  return res.data;
};

// Delete a single expense
export const deleteExpense = async (id) => {
  const res = await api.delete(`/expenses/${id}`);
  return res.data;
};

// ===== ERROR HANDLING HELPER =====

export const getErrorMessage = (error) => {
  if (error.response) {
    // Server responded with an error
    return error.response.data?.error || 'Something went wrong';
  }
  if (error.request) {
    // Request made but no response
    return 'Cannot reach the server. Is the backend running?';
  }
  return error.message || 'Unknown error';
};