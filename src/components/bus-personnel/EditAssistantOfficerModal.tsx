"use client";
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { updateProfile, getProfileById } from "@/services/userProfile";

const EditAssistantOfficerModal = ({
  isOpen,
  onClose,
  userProfileId,
  onSave,
}) => {
  const [birthday, setBirthday] = useState<string>(""); // State to hold birthday
  const [age, setAge] = useState<number | string>(""); // State to hold calculated age
  const [apiError, setApiError] = useState<string>(""); // Add API error state
  const formRef = useRef<HTMLFormElement>(null); // Add form ref
  const [formData, setFormData] = useState({
    last_name: "",
    first_name: "",
    middle_initial: "",
    position: "passenger_assistant_officer",
    sex: "Male",
    contact_number: "",
    date_hired: "",
    contact_person: "",
    contact_person_number: "",
    address: "",

    status: "",
  });

  // Fetch user profile data when the modal is opened
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userProfileId) return;
      try {
        const response = await getProfileById(userProfileId);
        const userProfileData = response.profile;

        setFormData({
          last_name: userProfileData.last_name || "",
          first_name: userProfileData.first_name || "",
          middle_initial: userProfileData.middle_initial || "",
          position: userProfileData.position || "passenger_assistant_officer",
          sex: userProfileData.sex || "Male",
          date_hired: userProfileData.date_hired || "",
          status: userProfileData.status || "",
          contact_number: userProfileData.contact_number || "",
          contact_person: userProfileData.contact_person || "",
          contact_person_number: userProfileData.contact_person_number || "",
          address: userProfileData.address || "",
        });
        setBirthday(userProfileData.date_of_birth || ""); // Set birthday for age calculation
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    if (isOpen) fetchUserProfile();
  }, [userProfileId, isOpen]);

  // Calculate age when birthday changes
  useEffect(() => {
    if (birthday) {
      const birthDate = new Date(birthday);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();
      if (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getDate() < birthDate.getDate())
      ) {
        calculatedAge--;
      }
      setAge(calculatedAge);
    } else {
      setAge(""); // Clear age if no birthday is provided
    }
  }, [birthday]);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle birthday changes
  const handleBirthdayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBirthday(e.target.value);
  };
  // Handle date hired changes
  const handleDateHiredChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBirthday(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formRef.current && formRef.current.reportValidity()) {
      try {
        setApiError(""); // Clear any previous errors
        const updatedProfile = {
          ...formData,
          date_of_birth: birthday,
        };
        if (!userProfileId) {
          throw new Error("Error: Missing userProfileId");
        }
        await updateProfile(userProfileId, updatedProfile);
        onSave({ ...updatedProfile, user_profile_id: userProfileId });
        onClose();
      } catch (error) {
        console.error("Error updating profile:", error);
        setApiError(
          error.message || 
          error.error || 
          "An error occurred while updating the profile"
        );
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-2xl font-semibold">
            Edit Passenger Assistant Officer Record
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            &times;
          </button>
        </div>

        {apiError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{apiError}</span>
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mt-4">
          {/* Left Column */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <Input
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              placeholder="e.g. Callo"
              required
              className="focus:ring-2 focus:ring-blue-500"
            />
            <label className="block text-sm font-medium text-gray-700 mt-4">
              First Name
            </label>
            <Input
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              placeholder="e.g. Juan"
              required
              className="focus:ring-2 focus:ring-blue-500"
            />
            <label className="block text-sm font-medium text-gray-700 mt-4">
              Middle Initial
            </label>
            <Input
              name="middle_initial"
              value={formData.middle_initial}
              onChange={handleInputChange}
              placeholder="e.g. V"
              required
              className="focus:ring-2 focus:ring-blue-500"
            />
            <label className="block text-sm font-medium text-gray-700 mt-4">
              Position
            </label>
            <Input
              name="position"
              value="Passenger Assistant Officer"
              disabled
              className="focus:outline-none"
            />
            
            <label className="block text-sm font-medium text-gray-700 mt-4">
              Date Hired
            </label>
            <Input
              name="date_hired"
              value={formData.date_hired}
              type="date"
              readOnly
              className="focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Right Column */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <Input
              name="birthday"
              value={birthday}
              onChange={handleBirthdayChange}
              type="date"
              required
              className="focus:ring-2 focus:ring-blue-500"
            />
            <label className="block text-sm font-medium text-gray-700 ">
              Age
            </label>
            <Input
              value={age}
              readOnly
              className="focus:ring-2 focus:ring-blue-500"
            />
            <label className="block text-sm font-medium text-gray-700 mt-4">
              Gender
            </label>
            <select
              name="sex"
              value={formData.sex}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <label className="block text-sm font-medium text-gray-700 mt-4">
              Contact Number
            </label>
            <Input
              name="contact_number"
              value={formData.contact_number}
              onChange={handleInputChange}
              placeholder="e.g. 09123456789"
              required
              className="focus:ring-2 focus:ring-blue-500"
            />
            <label className="block text-sm font-medium text-gray-700 mt-4">
              Contact Person
            </label>
            <Input
              name="contact_person"
              value={formData.contact_person}
              onChange={handleInputChange}
              placeholder="Contact Person Name"
              required
              className="focus:ring-2 focus:ring-blue-500"
            />
            <label className="block text-sm font-medium text-gray-700 mt-4">
              Contact Person Number
            </label>
            <Input
              name="contact_person_number"
              value={formData.contact_person_number}
              onChange={handleInputChange}
              placeholder="e.g. 09123456789"
              required
              className="focus:ring-2 focus:ring-blue-500"
            />
            <label className="block text-sm font-medium text-gray-700 mt-4">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter Address"
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {/* Buttons */}
          <div className="col-span-2 flex justify-end space-x-4 mt-6">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAssistantOfficerModal;
