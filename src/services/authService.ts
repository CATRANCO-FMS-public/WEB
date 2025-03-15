import axios from 'axios';
import Cookies from 'js-cookie';

// Define the base API URL
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
  async (config) => {
    const token = getToken(); // Use the getToken function instead of localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Get token from cookies
export const getToken = () => {
  return Cookies.get('authToken');
};

// Set token to cookies
export const setToken = (token) => {
  Cookies.set('authToken', token, { 
    expires: 7, 
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'strict' 
  });
};

// Remove token from cookies
export const removeToken = () => {
  Cookies.remove('authToken');
};

// Set user profile
export const setUserProfile = (profile) => {
  Cookies.set('userProfile', JSON.stringify(profile), {
    expires: 7,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
};

// Get user profile
export const getUserProfile = () => {
  const profile = Cookies.get('userProfile');
  return profile ? JSON.parse(profile) : null;
};

// Authentication Services

// Login
export const login = async (credentials) => {
  try {
    const response = await api.post('/user/login', credentials);
    const { token } = response.data;
    if (token) {
      setToken(token);
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error.response ? error.response.data : error;
  }
};

// Register
export const register = async (userData) => {
  try {
    const response = await api.post('/user/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error.response ? error.response.data : error;
  }
};

// Get Logged-in User Profile
export const getProfile = async () => {
  try {
    const response = await api.get('/user/me');
    return response.data;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error.response ? error.response.data : error;
  }
};

export const getOwnProfile = async () => {
  try {
    const response = await api.get('/user/profile/view');
    return response.data;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error.response ? error.response.data : error;
  }
};

// Update Logged-in User Account
export const updateAccount = async (accountData) => {
  try {
    const response = await api.patch('/user/update', accountData);
    return response.data;
  } catch (error) {
    console.error('Update account error:', error);
    throw error.response ? error.response.data : error;
  }
};

export const updateOwnAccount = async (accountData) => {
  try {
    let payload;

    if (accountData instanceof FormData) {
      // If accountData is already FormData, use it as-is
      payload = accountData;
    } else {
      // Otherwise, convert accountData to FormData
      payload = new FormData();
      Object.keys(accountData).forEach((key) => {
        payload.append(key, accountData[key]);
      });
    }

    const response = await api.post('/user/admin/updateOwnProfile', payload, {
      headers: {
        'Content-Type': 'multipart/form-data', // Ensure the correct content type
      },
    });
    return response.data;
  } catch (error) {
    console.error('Update own account error:', error);
    throw error.response ? error.response.data : error;
  }
};

// Logout - clean up cookies
export const logout = () => {
  removeToken();
  Cookies.remove('userProfile');
};

// Deactivate User Account
export const deactivateAccount = async (userId) => {
  try {
    const response = await api.patch(`/user/admin/deactivate-account/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Deactivate account error:', error);
    throw error.response ? error.response.data : error;
  }
};

// Activate User Account
export const activateAccount = async (userId) => {
  try {
    const response = await api.patch(`/user/admin/activate-account/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Activate account error:', error);
    throw error.response ? error.response.data : error;
  }
};
