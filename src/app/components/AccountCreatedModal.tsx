"use client";
import React from "react";

interface UserProfile {
  user_profile_id: number;
  first_name: string;
  last_name: string;
  middle_initial: string;
  license_number?: string;
  position: string;
  date_hired: string;
}

interface User {
  user_id: number;
  username: string;
  role_id: number;
  status: number;
}

interface AccountCreatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  user: User | null;
}

const AccountCreatedModal = ({ isOpen, onClose, profile, user }: AccountCreatedModalProps) => {
  if (!isOpen || !profile || !user) return null;

  const getRoleName = (roleId: number) => {
    switch (roleId) {
      case 1:
        return "Admin";
      case 2:
        return "Staff";
      case 3:
        return "Driver";
      case 4:
        return "Dispatcher";
      default:
        return "Unknown Role";
    }
  };

  const getStatusText = (status: number) => {
    return status === 1 ? "Active" : "Inactive";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-2xl font-semibold text-green-600">Account Created Successfully</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            &times;
          </button>
        </div>

        <div className="mt-4">
          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-lg mb-2">Account Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <p className="text-sm text-gray-600">Username:</p>
              <p className="text-sm font-medium">{user.username}</p>
              
              <p className="text-sm text-gray-600">Role:</p>
              <p className="text-sm font-medium">{getRoleName(user.role_id)}</p>
              
              <p className="text-sm text-gray-600">Status:</p>
              <p className="text-sm font-medium">{getStatusText(user.status)}</p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Personnel Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <p className="text-sm text-gray-600">Name:</p>
              <p className="text-sm font-medium">
                {`${profile.first_name} ${profile.middle_initial}. ${profile.last_name}`}
              </p>
              
              <p className="text-sm text-gray-600">Position:</p>
              <p className="text-sm font-medium capitalize">
                {profile.position.replace(/_/g, ' ')}
              </p>
              
              <p className="text-sm text-gray-600">Date Hired:</p>
              <p className="text-sm font-medium">
                {new Date(profile.date_hired).toLocaleDateString()}
              </p>
              
              {profile.license_number && (
                <>
                  <p className="text-sm text-gray-600">License Number:</p>
                  <p className="text-sm font-medium">{profile.license_number}</p>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={onClose}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountCreatedModal; 