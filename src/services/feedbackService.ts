// feedbackService.js
import axios from "axios";
import { getToken } from "./authService";

// Define the base API URL
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Define the type for the feedback record
export interface FeedbackRecord {
  feedback_logs_id: string;
  phone_number: string;
  rating: number;
  comments: string;
  created_at: string;
}

// Add interceptors for token handling - updated to use cookies
api.interceptors.request.use(
  async (config) => {
    const token = getToken(); // Use getToken() from authService instead of localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Feedback Services
// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Response Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);
/**
 * Create a new feedback log.
 * @param {Object} feedbackData - The feedback data { vehicle_id, rating, comments }.
 * @returns {Object} - Response data containing the feedback log ID.
 */
export const createFeedbackLog = async (feedbackData) => {
  try {
    const response = await api.post("/user/feedback", feedbackData);
    return response.data;
  } catch (error) {
    console.error("Error creating feedback log:", error);
    throw error.response ? error.response.data : error;
  }
};

/**
 * Generate OTP for phone number verification.
 * @param {Object} otpData - The OTP request data { feedback_logs_id, phone_number }.
 * @returns {Object} - Response data with OTP details.
 */
export const generateOTP = async (otpData) => {
  try {
    const response = await api.post("/user/otp/generate", otpData);
    return response.data;
  } catch (error) {
    console.error("Error generating OTP:", error);
    throw error.response ? error.response.data : error;
  }
};

/**
 * Verify the phone number using OTP.
 * @param {Object} verificationData - The verification request { phone_number, otp }.
 * @param {string} feedbackLogsId - The feedback log ID.
 * @returns {Object} - Response data confirming verification.
 */
export const verifyPhoneNumber = async (feedbackLogsId, verificationData) => {
  try {
    const response = await api.post(
      `/user/feedback/${feedbackLogsId}/verify-phone`,
      verificationData
    );
    return response.data;
  } catch (error) {
    console.error("Error verifying phone number:", error);
    throw error.response ? error.response.data : error;
  }
};

// **Fuel Logs Service Functions**

/**
 * Fetch all fuel logs.
 * @returns {Promise<Object[]>} - An array of fuel logs.
 */
export const fetchAllFuelLogs = async (): Promise<{
  data: FeedbackRecord[];
}> => {
  try {
    const response = await api.get("/user/admin/feedbacks/all");
    return response.data; // We expect response.data to be the array of feedback records.
  } catch (error) {
    console.error("Error fetching all fuel logs:", error);
    throw error.response ? error.response.data : error;
  }
};
/**
 * Fetch a single fuel log by ID.
 * @param {number} id - The ID of the fuel log.
 * @returns {Promise<Object>} - The fuel log data.
 */
export const fetchFuelLogById = async (id) => {
  try {
    const response = await api.get(`/user/admin/feedbacks/${id}`);
    console.log("Fetched Fuel Log:", response.data); // Debugging log
    return response.data;
  } catch (error) {
    console.error(`Error fetching fuel log with ID ${id}:`, error);
    throw error.response ? error.response.data : error;
  }
};
