"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaBell,
  FaCaretDown,
  FaBars,
} from "react-icons/fa";
import Link from "next/link";
import { logout, getToken } from "@/services/authService";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Loading Spinner Component
const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="mt-4 text-gray-600">Logging out...</p>
    </div>
  </div>
);

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [burgerMenuVisible, setBurgerMenuVisible] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const toggleBurgerMenu = () => {
    setBurgerMenuVisible(!burgerMenuVisible);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      // Hide the dropdown immediately when logout is clicked
      setDropdownVisible(false);
      
      const token = getToken();

      if (!token) {
        toast.error("No active session found");
        router.push("/login");
        return;
      }

      setIsLoading(true);
      
      try {
        await logout();
        
        toast.success("Successfully logged out!");

        // Delay the redirect slightly to show the success message
        setTimeout(() => {
          router.push("/login");
        }, 1000);
      } catch (error) {
        toast.error("Failed to logout. Please try again.");
      }
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="header flex flex-row justify-between mt-7">
      <div className="title ml-2 text-violet-700 pl-3">
        <h1 className="font-semibold text-2xl md:text-3xl lg:text-4xl">
          {title}
        </h1>
      </div>
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
      
      {isLoading && <Spinner />}
      
      
      <div className="icon-container">
        <div className="icons flex flex-row">
          <div className="md:hidden bg-white h-6 mt-0.5 mr-3">
            <button onClick={toggleBurgerMenu} className="md:hidden">
              <FaBars size={25} className="text-violet-700 cursor-pointer" />
            </button>
          </div>
          <div className="md:flex md:flex-row md:border-r-2  md:border-gray-400 md:mr-4 md:text-violet-700 hidden">
            <Link href="/notification">
              <FaBell size={25} className="mr-5 mt-2 cursor-pointer" />
            </Link>
          </div>
          <div className="profile md:ml-3 mr-6 md:flex md:items-center md:justify-center md:relative hidden">
            <FaUser
              size={42}
              className="rounded-full border border-gray-400 p-2"
            />
            <FaCaretDown
              size={20}
              className="ml-2 cursor-pointer"
              onClick={toggleDropdown}
            />
            {dropdownVisible && (
              <div
                ref={dropdownRef}
                className="absolute top-0 right-0 mt-10 w-36 text-base bg-white border border-gray-300 rounded shadow-lg z-50"
              >
                <Link
                  href="/editprofile"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-500 font-semibold hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        {burgerMenuVisible && (
          <div className="absolute top-16 right-0 bg-white shadow-lg rounded-md w-48 z-50">
            <Link
              href="/notification"
              className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
            >
              Notifications
            </Link>
            <Link
              href="/editprofile"
              className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
            >
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-red-500 font-semibold hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
