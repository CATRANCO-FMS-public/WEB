"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login, getProfile } from "../services/authService";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Loading Spinner Component
const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="mt-4 text-gray-600">Logging in...</p>
    </div>
  </div>
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
  const [showPassword, setShowPassword] = useState(false);
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

  const handleLogin = async () => {
    const errors = validateLoginForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      Object.values(errors).forEach(error => {
        toast.error(error);
      });
      return;
    }

    setLoading(true);

    try {
      const response = await login({
        username: formData.username,
        password: formData.password,
      });

      if (response?.token) {
        const userProfile = await getProfile();
        localStorage.setItem("userProfile", JSON.stringify(userProfile));
        
        toast.success("Successfully logged in!");
        
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex flex-col md:flex-row bg-white">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      {/* Left Side - Logo */}
      <div className="w-full md:w-1/2 h-[30vh] md:h-screen flex justify-center items-center">
        <img
          src="/logo.png"
          alt="Logo"
          className="w-4/5 max-w-[300px] md:max-w-none object-contain md:ml-20"
        />
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 flex-1 flex px-4 md:px-10 items-center">
        <div className="form-container w-full md:w-4/5 bg-slate-200 rounded-xl shadow-lg shadow-cyan-500/50 flex flex-col items-center py-8 md:py-12 px-4 md:px-0">
          <div className="forms space-y-6 w-full max-w-[400px] px-4 md:px-0 md:w-4/5">
            {/* Login Form Fields */}
            <Input
              className="h-12 md:h-16 text-base md:text-lg"
              type="text"
              placeholder="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            
            <div className="relative">
              <Input
                className="h-12 md:h-16 text-base md:text-lg pr-12"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <div className="btn-container mt-8 md:mt-12 w-full flex flex-col items-center px-4 md:px-0">
            <Button
              className="h-12 md:h-16 w-full max-w-[400px] md:w-4/5 text-white text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-500 to-red-500 hover:opacity-90 transition-opacity"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </div>
        </div>
      </div>

      {loading && <Spinner />}
    </section>
  );
}
