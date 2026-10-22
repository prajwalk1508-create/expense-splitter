import axios from 'axios';

// Base URL — local development
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== GROUPS =====

export const createGroup = async (data) => {
  const res = await api.post('/groups', data);
  return res.data;
};

export const listGroups = async () => {
  const res = await api.get('/groups');
  return res.data;
};

export const getGroup = async (id) => {
  const res = await api.get(`/groups/${id}`);
  return res.data;
};

export const deleteGroup = async (id) => {
  const res = await api.delete(`/groups/${id}`);
  return res.data;
};

// ===== EXPENSES =====

export const createExpense = async (data) => {
  const res = await api.post('/expenses', data);
  return res.data;
};

export const listExpenses = async (groupId) => {
  const res = await api.get(`/groups/${groupId}/expenses`);
  return res.data;
};

export const deleteExpense = async (id) => {
  const res = await api.delete(`/expenses/${id}`);
  return res.data;
};

// ===== ERROR HANDLING HELPER =====

export const getErrorMessage = (error) => {
  if (error.response) {
    return error.response.data?.error || 'Something went wrong';
  }
  if (error.request) {
    return 'Cannot reach the server. Is the backend running?';
  }
  return error.message || 'Unknown error';
};