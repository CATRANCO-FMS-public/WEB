import axios from 'axios';
import { getToken } from './authService';

// Base API URL (update this with your backend URL)
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Add interceptors for token handling - updated to use cookies
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

/**
 * Service to interact with FlespiController
 */
const FlespiService = {
  /**
   * Send Flespi data to the backend for processing.
   * @param {Object} flespiData - The data received from the Flespi stream.
   * @returns {Promise<Object>} Response from the backend.
   */
  handleData: async (flespiData) => {
    try {
      const response = await api.post('/flespi/handleData', flespiData);
      return response.data;
    } catch (error) {
      console.error('Error sending Flespi data:', error);
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Fetch the processed dispatch logs or other related data.
   * This can be extended based on your backend functionality.
   * @returns {Promise<Object>} Processed data or logs.
   */
  getDispatchLogs: async () => {
    try {
      const response = await api.get('/flespi/dispatchLogs'); // Update route if necessary
      return response.data;
    } catch (error) {
      console.error('Error fetching dispatch logs:', error);
      throw error.response ? error.response.data : error;
    }
  },
};

export default FlespiService;
