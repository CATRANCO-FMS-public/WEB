import axios from "axios";
import { getToken } from "./authService";

// Define the base API URL
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Create an Axios instance with default headers
const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

// Add request interceptor to include the token in the headers
api.interceptors.request.use(
  async (config) => {
    const token = getToken(); // Use getToken() from authService instead of localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Fetch all tracker-to-vehicle mappings.
 * @returns {Promise<Object[]>} - List of mappings.
 */
export const getAllTrackerVehicleMappings = async () => {
  try {
    const response = await api.get("/user/admin/tracker-vehicle/all");
    return response.data.data; // Adjust structure based on backend response
  } catch (error) {
    console.error("Error fetching tracker-to-vehicle mappings:", error);
    throw error.response?.data || error;
  }
};

/**
 * Fetch a specific tracker-to-vehicle mapping by ID.
 * @param {string} id - The ID of the mapping to fetch.
 * @returns {Promise<Object>} - Tracker-to-vehicle mapping data.
 */
export const getTrackerVehicleMappingById = async (id) => {
  try {
    const response = await api.get(`/user/admin/tracker-vehicle/${id}`);
    return response.data.data; // Adjust structure based on backend response
  } catch (error) {
    console.error("Error fetching tracker-to-vehicle mapping by ID:", error);
    throw error.response?.data || error;
  }
};

/**
 * Create a new tracker-to-vehicle mapping.
 * @param {Object} mappingData - The data for the new mapping.
 * @returns {Promise<Object>} - The created mapping.
 */
export const createTrackerVehicleMapping = async (mappingData) => {
  try {
    const response = await api.post("/user/admin/tracker-vehicle/create", mappingData);
    return response.data.data; // Adjust structure based on backend response
  } catch (error) {
    console.error("Error creating tracker-to-vehicle mapping:", error);
    throw error.response?.data || error;
  }
};

/**
 * Update an existing tracker-to-vehicle mapping.
 * @param {string} id - The ID of the mapping to update.
 * @param {Object} mappingData - The updated mapping data.
 * @returns {Promise<Object>} - The updated mapping.
 */
export const updateTrackerVehicleMapping = async (id, mappingData) => {
  try {
    const response = await api.patch(`/user/admin/tracker-vehicle/update/${id}`, mappingData);
    return response.data.data; // Adjust structure based on backend response
  } catch (error) {
    console.error("Error updating tracker-to-vehicle mapping:", error);
    throw error.response?.data || error;
  }
};

/**
 * Delete a tracker-to-vehicle mapping.
 * @param {string} id - The ID of the mapping to delete.
 * @returns {Promise<Object>} - The result of the deletion.
 */
export const deleteTrackerVehicleMapping = async (id) => {
  try {
    const response = await api.delete(`/user/admin/tracker-vehicle/delete/${id}`);
    return response.data; // Adjust structure based on backend response
  } catch (error) {
    console.error("Error deleting tracker-to-vehicle mapping:", error);
    throw error.response?.data || error;
  }
};

/**
 * Toggle the status of a tracker-to-vehicle mapping.
 * @param {string} id - The ID of the mapping.
 * @returns {Promise<Object>} - The updated mapping with toggled status.
 */
export const toggleTrackerVehicleMappingStatus = async (id) => {
  try {
    const response = await api.patch(`/user/admin/tracker-vehicle/toggle_status/${id}`);
    return response.data.data; // Adjust structure based on backend response
  } catch (error) {
    console.error("Error toggling tracker-to-vehicle mapping status:", error);
    throw error.response?.data || error;
  }
};