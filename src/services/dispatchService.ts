import axios from 'axios';
import { getToken } from './authService';

// Base API URL
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Add token interceptors for authentication - updated to use cookies
api.interceptors.request.use(
  (config) => {
    const token = getToken(); // Use getToken() from authService instead of localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Fetch all dispatches
export const getAllDispatches = async () => {
  try {
    const response = await api.get('/user/admin/dispatch_logs/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching dispatches:', error);
    throw error.response?.data || error.message;
  }
};

// Start a new alley
export const startAlley = async (data) => {
  try {
    const response = await api.post('/user/admin/dispatch_logs/alley/start', data);
    return response.data;
  } catch (error) {
    console.error('Error starting alley:', error);
    throw error.response?.data || error.message;
  }
};

// Start a new dispatch
export const startDispatch = async (data) => {
  try {
    const response = await api.post('/user/admin/dispatch_logs/dispatch/start', data);
    return response.data;
  } catch (error) {
    console.error('Error starting dispatch:', error);
    throw error.response?.data || error.message;
  }
};

// Get a specific dispatch by ID
export const getDispatchById = async (id) => {
  try {
    const response = await api.get(`/user/admin/dispatch_logs/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dispatch by ID:', error);
    throw error.response?.data || error.message;
  }
};

// End a specific alley by ID
export const endAlley = async (id) => {
  try {
    const response = await api.patch(`/user/admin/dispatch_logs/alley/end/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error ending alley:', error);
    throw error.response?.data || error.message;
  }
};

// End a specific dispatch by ID
export const endDispatch = async (id) => {
  try {
    const response = await api.patch(`/user/admin/dispatch_logs/dispatch/end/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error ending dispatch:', error);
    throw error.response?.data || error.message;
  }
};

// Delete specific dispatch records by their IDs
export const deleteRecords = async (ids) => {
  try {
    const response = await api.delete('/user/admin/dispatch_logs/delete', {
      data: { ids },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting dispatch records:', error);
    throw error.response?.data || error.message;
  }
};

// Get all on-alley dispatches
export const getAllOnAlley = async () => {
  try {
    const response = await api.get('/user/admin/dispatch_logs/alley');
    return response.data;
  } catch (error) {
    console.error('Error fetching on-alley dispatches:', error);
    throw error.response?.data || error.message;
  }
};

// Get all on-road dispatches
export const getAllOnRoad = async () => {
  try {
    const response = await api.get('/user/admin/dispatch_logs/road');
    return response.data;
  } catch (error) {
    console.error('Error fetching on-road dispatches:', error);
    throw error.response?.data || error.message;
  }
};

// Delete dispatch records by date
export const deleteDispatchLogsByDate = async (date) => {
  try {
    const response = await api.delete(`/user/admin/dispatch_logs/delete-by-date/${date}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting dispatch logs by date:', error);
    throw error.response?.data || error.message;
  }
};

// Delete a specific dispatch record by its ID
export const deleteRecord = async (id) => {
  try {
    // Ensure the id is provided
    if (!id) {
      throw new Error('No ID provided for deletion.');
    }

    // Send the delete request with the ID
    const response = await api.delete(`/user/admin/dispatch_logs/delete/${id}`);

    return response.data; // Return the response data for handling on the frontend
  } catch (error) {
    console.error('Error deleting dispatch record:', error);
    throw error.response?.data || error.message; // Propagate error to frontend
  }
};