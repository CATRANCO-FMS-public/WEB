"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login, getProfile } from "../services/authService";

// Simple Loading Spinner Component
const Spinner = () => (
  <div className="loader-border border-t-4 border-blue-500 border-solid w-8 h-8 rounded-full animate-spin"></div>
);

interface FormData {
  username: string;
  password: string;
}

export default function AuthPage() {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for show/hide password
  const [loginSuccess, setLoginSuccess] = useState(false); // State for successful login notification
  const router = useRouter();

  React.useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      router.replace("/dashboard"); // Redirect immediately if token exists
    }
  }, []);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Validate login form
  const validateLoginForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.username) errors.username = "Username is required";
    if (!formData.password) errors.password = "Password is required";
    return errors;
  };

  // Handle login form submission
  const handleLogin = async () => {
    const errors = validateLoginForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);

    try {
      // Perform login
      const response = await login({
        username: formData.username,
        password: formData.password,
      });

      if (response?.token) {
        // Fetch and store updated user profile data after login
        const userProfile = await getProfile();
        localStorage.setItem("userProfile", JSON.stringify(userProfile));

        // Set login success to true
        setLoginSuccess(true);

        setTimeout(() => {
          router.push("/dashboard"); // Redirect to dashboard
        }, 1000); // Wait for notification to show before redirecting
      } else {
        setFormErrors({
          global: "Login failed. Please check your credentials.",
        });
      }
    } catch (error) {
      setFormErrors({
        global: error.message || "Login failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    router.push("/forgot-password"); // Redirect to forgot password page
  };

  return (
    <section className="h-screen flex flex-row bg-white">
      {/* Left Side - Logo */}
      <div className="left w-1/2 h-full flex justify-center items-center">
        <img
          src="/logo.png"
          alt="Logo"
          className="w-4/5 object-contain ml-20"
        />
      </div>

      {/* Right Side - Form */}
      <div className="right w-1/2 h-full flex ml-10 items-center">
        <div className="form-container h-3/4 w-4/5 bg-slate-200 rounded-xl shadow-lg shadow-cyan-500/50 flex flex-col items-center">
          <div className="forms space-y-6 w-4/5 mt-24">
            {/* Login Form Fields */}
            <Input
              className="h-16 text-lg"
              type="text"
              placeholder="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            {formErrors.username && (
              <p className="text-red-500">{formErrors.username}</p>
            )}
            <div className="relative">
              <Input
                className="h-16 text-lg"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {formErrors.password && (
              <p className="text-red-500">{formErrors.password}</p>
            )}
            {formErrors.global && (
              <p className="text-red-500">{formErrors.global}</p>
            )}
          </div>

          {/* Login and Forgot Password Buttons */}
          <div className="btn-container mt-12 w-full flex flex-col items-center space-y-4">
            <Button
              className="h-16 w-4/5 text-white text-2xl font-bold bg-gradient-to-r from-blue-500 to-red-500"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? <Spinner /> : "Login"}
            </Button>
          </div>
        </div>
      </div>

      {/* Success Notification (only shown on login page) */}
      {loginSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <p className="text-sm font-medium">Successfully Logged In</p>
        </div>
      )}
    </section>
  );
}
