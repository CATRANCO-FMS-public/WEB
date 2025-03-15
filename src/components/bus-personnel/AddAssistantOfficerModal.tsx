"use client";
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { createProfile } from "@/services/userProfile";

const AddAssistantOfficerModal = ({ isOpen, onClose, onSave }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [apiError, setApiError] = useState<string>("");

  const [birthday, setBirthday] = useState<string>("");
  const [age, setAge] = useState<number | string>("");
  const [dateHired, setDateHired] = useState<string>("");
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  
  const [formData, setFormData] = useState({
    last_name: "",
    first_name: "",
    middle_initial: "",
    position: "passenger_assistant_officer",
    sex: "",
    contact_number: "",
    contact_person: "",
    contact_person_number: "",
    address: "",
  });

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
      setAge("");
    }
  }, [birthday]);

  // Check if all required fields are filled
  useEffect(() => {
    const checkFormValidity = () => {
      const requiredFields = [
        formData.last_name,
        formData.first_name,
        formData.contact_number,
        formData.contact_person,
        formData.contact_person_number,
        formData.address,
        birthday,
        dateHired
      ];
      
      setIsFormValid(requiredFields.every(field => field.trim() !== ""));
    };
    
    checkFormValidity();
  }, [formData, birthday, dateHired]);

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

  const handleBirthdayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBirthday(e.target.value);
  };

  const handleDateHiredChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateHired(e.target.value);
  };

  const resetForm = () => {
    setFormData({
      last_name: "",
      first_name: "",
      middle_initial: "",
      position: "passenger_assistant_officer",
      sex: "",
      contact_number: "",
      contact_person: "",
      contact_person_number: "",
      address: "",
    });
    setBirthday("");
    setDateHired("");
    setAge("");
    setApiError("");
  };

  const handleSubmit = async () => {
    if (formRef.current && formRef.current.reportValidity()) {
      try {
        setApiError("");
        const profileData = {
          ...formData,
          date_of_birth: birthday,
          date_hired: dateHired,
        };
        const response = await createProfile(profileData);
        if (response && response.profile) {
          onSave(response.profile);
          resetForm();
          onClose();
        }
      } catch (error) {
        console.error("Error creating profile:", error);
        setApiError(
          error.message || 
          error.error || 
          "An error occurred while creating the profile"
        );
      }
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-2xl font-semibold">
            Add Passenger Assistant Officer Record
          </h2>
          <button
            onClick={handleClose}
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
        <form ref={formRef} className="grid grid-cols-2 gap-4 mt-4" noValidate>
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
            />
            <label className="block text-sm font-medium text-gray-700 mt-4">
              Middle Initial
            </label>
            <Input
              name="middle_initial"
              value={formData.middle_initial}
              onChange={handleInputChange}
              placeholder="e.g. V"
            />
            <label className="block text-sm font-medium text-gray-700 mt-5">
              Position
            </label>
            <Input
              name="position"
              value="Passenger Assistant Officer"
              disabled
            />
            <label className="block text-sm font-medium text-gray-700 mt-5">
              Date Hired
            </label>
            <Input
              name="date_hired"
              value={dateHired}
              onChange={handleDateHiredChange}
              type="date"
              required
            />
          </div>
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
            />
            <label className="block text-sm font-medium text-gray-700 mt-1">
              Age
            </label>
            <Input value={age} readOnly />
            <label className="block text-sm font-medium text-gray-700 mt-2">
              Gender
            </label>
            <select
              name="sex"
              value={formData.sex}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <label className="block text-sm font-medium text-gray-700 mt-2">
              Contact Number
            </label>
            <Input
              name="contact_number"
              value={formData.contact_number}
              onChange={handleInputChange}
              required
            />
            <label className="block text-sm font-medium text-gray-700 mt-2">
              Contact Person
            </label>
            <Input
              name="contact_person"
              value={formData.contact_person}
              onChange={handleInputChange}
              required
            />
            <label className="block text-sm font-medium text-gray-700 mt-2">
              Contact Person Number
            </label>
            <Input
              name="contact_person_number"
              value={formData.contact_person_number}
              onChange={handleInputChange}
              required
            />
            <label className="block text-sm font-medium text-gray-700 mt-2">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              className="w-full px-4 border rounded-md"
            />
          </div>
        </form>
        <div className="col-span-2 flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`${
              isFormValid ? "bg-blue-500 hover:bg-blue-600" : "bg-blue-300 cursor-not-allowed"
            } text-white px-6 py-2 rounded-md`}
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAssistantOfficerModal;
