"use client";

import React, { useState, useEffect } from "react";
import Sidebar2 from "../components/reusesables/sidebar-settings";
import Header from "../components/reusesables/header";
import {
  getProfile,
  updateAccount,
  updateOwnAccount,
  getOwnProfile,
} from "../services/authService";
import { useQuery } from "@tanstack/react-query";

const EditProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"account" | "profile">("account");
  const [profileSettings, setProfileSettings] = useState({
    lastName: "",
    firstName: "",
    middleInitial: "",
    address: "",
    dateOfBirth: "",
    sex: "",
    contactNumber: "",
    contactPerson: "",
    contactPersonNumber: "",
  });

  const [accountSettings, setAccountSettings] = useState({
    username: "",
    email: "",
    oldPassword: "",
    newPassword: "",
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { 
    data: accountData,
    isLoading: isAccountLoading,
    isError: isAccountError,
    refetch: refetchAccount
  } = useQuery({
    queryKey: ["account"],
    queryFn: getProfile,
  });

  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError: isProfileError,
    refetch: refetchProfile
  } = useQuery({
    queryKey: ["profile"],
    queryFn: getOwnProfile,
  });

  useEffect(() => {
    if (accountData) {
      setAccountSettings({
        username: accountData.username,
        email: accountData.email,
        oldPassword: "",
        newPassword: "",
      });
    }
  }, [accountData]);

  useEffect(() => {
    if (profileData?.profile) {
      setProfileSettings({
        lastName: profileData.profile.last_name || "",
        firstName: profileData.profile.first_name || "",
        middleInitial: profileData.profile.middle_initial || "",
        address: profileData.profile.address || "",
        dateOfBirth: profileData.profile.date_of_birth || "",
        sex: profileData.profile.sex || "",
        contactNumber: profileData.profile.contact_number || "",
        contactPerson: profileData.profile.contact_person || "",
        contactPersonNumber: profileData.profile.contact_person_number || "",
      });
      setSelectedImage(profileData.profile.user_profile_image || null);
    }
  }, [profileData]);
  
  const loading = isAccountLoading || isProfileLoading;

  const handleProfileChange = (field: string, value: string) => {
    setProfileSettings({ ...profileSettings, [field]: value });
  };

  const handleAccountChange = (field: string, value: string) => {
    setAccountSettings({ ...accountSettings, [field]: value });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append("user_profile_image", file);

        const result = await updateOwnAccount(formData);

        setSelectedImage(URL.createObjectURL(file));
        alert("Profile image updated successfully!");
        refetchProfile();
      } catch (error) {
        console.error("Error updating profile image:", error);
        alert("Failed to update profile image.");
      }
    }
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        last_name: profileSettings.lastName,
        first_name: profileSettings.firstName,
        middle_initial: profileSettings.middleInitial,
        address: profileSettings.address,
        date_of_birth: profileSettings.dateOfBirth,
        sex: profileSettings.sex,
        contact_number: profileSettings.contactNumber,
        contact_person: profileSettings.contactPerson,
        contact_person_number: profileSettings.contactPersonNumber,
      };

      await updateOwnAccount(payload);
      alert("Profile settings updated successfully!");
      refetchProfile();
    } catch (error: any) {
      console.error("Error updating profile settings:", error);
      if (error.response && error.response.data) {
        const backendErrors = error.response.data.errors || {};
        const errorMessages = Object.values(backendErrors).flat().join("\n");
        alert(`Failed to update profile settings:\n${errorMessages}`);
      } else {
        alert("An unknown error occurred.");
      }
    }
  };

  const handleUpdateEmail = async () => {
    try {
      await updateAccount({ email: accountSettings.email });
      alert("Email updated successfully!");
      refetchAccount();
    } catch (error) {
      console.error("Error updating email:", error);
      alert("Failed to update email.");
    }
  };

  const handleUpdatePassword = async () => {
    if (!accountSettings.oldPassword || !accountSettings.newPassword) {
      alert("Both old and new passwords are required.");
      return;
    }

    try {
      await updateAccount({
        old_password: accountSettings.oldPassword,
        password: accountSettings.newPassword,
      });
      alert("Password updated successfully!");
      refetchAccount();
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Failed to update password. Please ensure the old password is correct.");
    }
  };

  return (
    <section className="h-screen flex flex-row bg-white">
      <Sidebar2 />
      <section className="right w-full bg-slate-200 overflow-y-hidden">
        <Header title="Edit Profile" />
        <div className="content flex flex-col h-full px-10 py-4">
          {loading && (
            <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600">Loading data...</p>
              </div>
            </div>
          )}
          <div className="bg-white rounded-lg shadow-lg w-full px-6 py-4">
            <div className="flex justify-center mb-6">
              <button
                className={`px-4 py-2 mr-4 ${
                  activeTab === "account"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                } rounded-md`}
                onClick={() => setActiveTab("account")}
              >
                Account Settings
              </button>
              <button
                className={`px-4 py-2 ${
                  activeTab === "profile"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                } rounded-md`}
                onClick={() => setActiveTab("profile")}
              >
                Profile Settings
              </button>
            </div>

            {activeTab === "account" && (
              <div className="space-y-6">
                <div>
                  <label className="block font-medium">Email</label>
                  <input
                    type="email"
                    value={accountSettings.email}
                    onChange={(e) =>
                      handleAccountChange("email", e.target.value)
                    }
                    className="block w-full mt-1 px-3 py-2 border rounded-md"
                  />
                  <button
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
                    onClick={() => alert("Email update functionality is not shown")}
                  >
                    Update Email
                  </button>
                </div>
                <div>
                  <label className="block font-medium">Old Password</label>
                  <input
                    type="password"
                    value={accountSettings.oldPassword}
                    onChange={(e) =>
                      handleAccountChange("oldPassword", e.target.value)
                    }
                    className="block w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-medium">New Password</label>
                  <input
                    type="password"
                    value={accountSettings.newPassword}
                    onChange={(e) =>
                      handleAccountChange("newPassword", e.target.value)
                    }
                    className="block w-full mt-1 px-3 py-2 border rounded-md"
                  />
                  <button
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
                    onClick={handleUpdatePassword}
                  >
                    Update Password
                  </button>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <form onSubmit={handleSubmitProfile} className="space-y-6">
                <h2 className="text-lg font-semibold">Profile Settings</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Last Name", field: "lastName" },
                    { label: "First Name", field: "firstName" },
                    { label: "Middle Initial", field: "middleInitial" },
                    { label: "Address", field: "address" },
                    { label: "Date of Birth", field: "dateOfBirth", type: "date" },
                    { label: "Sex", field: "sex" },
                    { label: "Contact Number", field: "contactNumber" },
                    { label: "Contact Person", field: "contactPerson" },
                    { label: "Contact Person Number", field: "contactPersonNumber" },
                  ].map(({ label, field, type = "text" }) => (
                    <div key={field}>
                      <label>{label}</label>
                      <input
                        type={type}
                        value={
                          profileSettings[
                            field as keyof typeof profileSettings
                          ] || ""
                        }
                        onChange={(e) =>
                          handleProfileChange(field, e.target.value)
                        }
                        className="block w-full mt-1 px-3 py-2 border rounded-md"
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="submit"
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Save Profile Settings
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </section>
  );
};

export default EditProfile;
