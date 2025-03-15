import axios from "axios";
import { getToken } from "./authService";

// Define the base API URL for vehicles
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Create an instance of axios with default settings
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
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

// Function to create a vehicle
export const createVehicle = async (data) => {
  try {
    const response = await api.post("/user/admin/vehicles/create", data);
    return response.data;
  } catch (error) {
    console.error("Create Vehicle error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Function to get all vehicles
export const getAllVehicles = async () => {
  try {
    const response = await api.get("/user/admin/vehicles/all");
    return response.data;
  } catch (error) {
    console.error("Get All Vehicles error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Function to get a vehicle by ID
export const getVehicleById = async (id) => {
  try {
    const response = await api.get(`/user/admin/vehicles/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Get Vehicle by ID error: ${id}`, error);
    throw error.response ? error.response.data : error;
  }
};

// Function to update a vehicle
export const updateVehicle = async (id, data) => {
  try {
    const response = await api.patch(`/user/admin/vehicles/update/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Update Vehicle error: ${id}`, error);
    throw error.response ? error.response.data : error;
  }
};

// Function to delete a vehicle
export const deleteVehicle = async (id) => {
  try {
    const response = await api.delete(`/user/admin/vehicles/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Delete Vehicle error: ${id}`, error);
    throw error.response ? error.response.data : error;
  }
};
