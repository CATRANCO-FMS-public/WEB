"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { updateProfile, getProfileById } from "@/app/services/userProfile";

const EditAssistantOfficerModal = ({
  isOpen,
  onClose,
  userProfileId,
  onSave,
}) => {
  const [birthday, setBirthday] = useState<string>(""); // State to hold birthday
  const [age, setAge] = useState<number | string>(""); // State to hold calculated age
  const [formData, setFormData] = useState({
    last_name: "",
    first_name: "",
    middle_initial: "",
    position: "passenger_assistant_officer",
    license_number: "",
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
          license_number: userProfileData.license_number || "",
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

  // Submit updated profile
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate required fields
    const requiredFields = [
      "last_name",
      "first_name",
      "middle_initial",
      "position",
      "license_number",
      "sex",
      "contact_number",
      "date_hired",
      "contact_person",
      "contact_person_number",
      "address",
    ];
  
    const missingFields = requiredFields.filter((field) => !formData[field]);
    if (missingFields.length > 0) {
      console.error("Error: Missing required fields", missingFields);
      alert(`Please fill in all required fields: ${missingFields.join(", ")}`);
      return;
    }
  
    if (!birthday) {
      console.error("Error: Missing date of birth");
      alert("Please provide a valid date of birth.");
      return;
    }
  
    if (!userProfileId) {
      console.error("Error: Missing userProfileId");
      alert("Cannot update the profile. User ID is missing.");
      return;
    }
  
    try {
      const updatedProfile = {
        ...formData,
        date_of_birth: birthday,
      };
  
      // Call the updateProfile API
      await updateProfile(userProfileId, updatedProfile);
  
      // Notify parent with updated profile
      onSave({ ...updatedProfile, user_profile_id: userProfileId });
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating the profile. Please try again.");
    }
  };
  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg p-6 h-[95vh] max-h-screen overflow-y-auto">
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

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mt-4">
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
              name="birthday"
              value={birthday}
              onChange={handleDateHiredChange}
              type="date"
              required
              className="focus:ring-2 focus:ring-blue-500"
            />
            <label className="block text-sm font-medium text-gray-700 mt-4">
              Date Hired
            </label>
            <Input
              name="Date Hired"
              value={formData.date_hired}
              type="date"
              readOnly
              className="focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Right Column */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mt-4">
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
          <div className="col-span-2 flex justify-end space-x-4 -mt-15 mb-1">
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
