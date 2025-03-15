import axios from "axios";
import { getToken } from "./authService";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export const createVehicleAssignment = async (assignmentData) => {
  try {
    const response = await api.post(
      "/user/admin/assignments/create",
      assignmentData
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || "An error occurred while creating the assignment."
    );
  }
};

export const getAllVehicleAssignments = async () => {
  try {
    const response = await api.get("/user/admin/assignments/all");
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || "An error occurred while fetching assignments."
    );
  }
};

export const getVehicleAssignmentById = async (assignmentId) => {
  try {
    const response = await api.get(`/user/admin/assignments/${assignmentId}`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data ||
      `An error occurred while fetching assignment ID: ${assignmentId}.`
    );
  }
};

export const updateVehicleAssignment = async (id, assignmentData) => {
  try {
    const response = await api.patch(
      `/user/admin/assignments/update/${id}`,
      assignmentData
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data ||
      `An error occurred while updating assignment ID: ${id}.`
    );
  }
};

export const deleteVehicleAssignment = async (id) => {
  try {
    const response = await api.delete(`/user/admin/assignments/delete/${id}`);
    return response.data;
  } catch (error) {
    // Log full error for debugging
    console.error("Error deleting assignment:", error.response?.data || error);
    throw (
      error.response?.data ||
      `An error occurred while deleting assignment ID: ${id}.`
    );
  }
};
