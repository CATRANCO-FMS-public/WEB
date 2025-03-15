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

// User Profile Services

// Create User Profile
export const createProfile = async (profileData) => {
  try {
    const response = await api.post("/user/admin/profiles/create", profileData);
    return response.data;
  } catch (error) {
    console.error("Create profile error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Get All User Profiles
export const getAllProfiles = async () => {
  try {
    const response = await api.get("/user/admin/profiles/all");

    // Assuming the profiles have a 'status' or 'is_deleted' field indicating their state
    const activeProfiles = response.data.filter(
      (profile) => profile.status !== "deleted"
    ); // or use profile.is_deleted !== true

    return activeProfiles; // Return only active profiles
  } catch (error) {
    console.error("Get all profiles error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Get Profile by ID
export const getProfileById = async (id) => {
  try {
    const response = await api.get(`/user/admin/profiles/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Get profile by ID error: ${id}`, error);
    throw error.response ? error.response.data : error;
  }
};

// Update User Profile
export const updateProfile = async (id, profileData) => {
  try {
    const response = await api.patch(
      `/user/admin/profiles/update/${id}`,
      profileData
    );
    return response.data;
  } catch (error) {
    console.error(`Update profile error: ${id}`, error);
    throw error.response ? error.response.data : error;
  }
};

// Update Profile Image
export const updateProfileImage = async (id, imageData) => {
  try {
    const formData = new FormData();
    formData.append("user_profile_image", imageData);

    const response = await api.post(`/user/admin/updateOwnProfile`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Update profile image error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Delete Profile Image
export const deleteProfileImage = async (profileId) => {
  try {
    const response = await api.delete(
      `/user/profile/${profileId}/delete-image`
    );
    return response.data;
  } catch (error) {
    console.error("Delete profile image error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Delete User Profile
export const deleteProfile = async (id) => {
  try {
    const response = await api.delete(`/user/admin/profiles/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Delete profile error: ${id}`, error);
    throw error.response ? error.response.data : error;
  }
};

// Get User Profiles by Status
export const getOffDutyUserProfiles = async () => {
  try {
    const response = await api.get(`/user/admin/profiles/user_profiles/off_duty`);
    return response.data;
  } catch (error) {
    console.error(`Get profiles by status error:`, error);
    throw error.response ? error.response.data : error;
  }
};