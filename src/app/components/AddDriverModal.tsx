"use client";
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { createProfile } from "@/app/services/userProfile";

const AddDriverModal = ({ isOpen, onClose, onSave }) => {
  const formRef = useRef<HTMLFormElement>(null);

  const [birthday, setBirthday] = useState<string>("");
  const [dateHired, setDateHired] = useState<string>("");
  const [age, setAge] = useState<number | string>("");

  const [formData, setFormData] = useState({
    last_name: "",
    first_name: "",
    middle_initial: "",
    position: "driver",
    license_number: "",
    sex: "Male",
    contact_number: "",
    contact_person: "",
    contact_person_number: "",
    address: "",
    status: "On Duty",
    specific_personnel_status: "",
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
    setDateHired(e.target.value);
  };
  const handleSubmit = async () => {
    if (formRef.current && formRef.current.reportValidity()) {
      try {
        const newProfile = {
          ...formData,
          date_of_birth: birthday,
          date_hired: dateHired,
        };
        const response = await createProfile(newProfile);
        if (response && response.profile) {
          onSave(response.profile);
        }
        onClose();
      } catch (error) {
        console.error("Error creating profile:", error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg p-6 h-[98vh] max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-2xl font-semibold">Add Driver Record</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            &times;
          </button>
        </div>

        <form
          ref={formRef}
          className="grid sm:grid-cols-1 lg:grid-cols-2 gap-4 mt-4"
          noValidate
        >
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

            <label className="block text-sm font-medium text-gray-700 mt-2">
              First Name
            </label>
            <Input
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              placeholder="e.g. Juan"
              required
            />

            <label className="block text-sm font-medium text-gray-700 mt-2">
              Middle Initial
            </label>
            <Input
              name="middle_initial"
              value={formData.middle_initial}
              onChange={handleInputChange}
              placeholder="e.g. V"
            />

            <label className="block text-sm font-medium text-gray-700 mt-2">
              Position
            </label>
            <Input
              name="position"
              value="Driver"
              disabled
              className="focus:outline-none"
            />

            <label className="block text-sm font-medium text-gray-700 mt-4">
              License Number
            </label>
            <Input
              name="license_number"
              value={formData.license_number}
              onChange={handleInputChange}
              placeholder="e.g. N03-12-123456"
              required
            />

            <label className="block text-sm font-medium text-gray-700 mt-4">
              Date Hired
            </label>
            <Input
              name="date_hired"
              value={dateHired}
              onChange={(e) => setDateHired(e.target.value)}
              type="date"
              required
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
              onChange={(e) => setBirthday(e.target.value)}
              type="date"
              required
            />
            <label className="block text-sm font-medium text-gray-700 mt-1">
              Age
            </label>
            <Input value={age} readOnly />

            <label className="block text-sm font-medium text-gray-700 mt-3">
              Gender
            </label>
            <select
              name="sex"
              value={formData.sex}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md"
            >
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
      </div>
    </div>
  );
};

export default AddDriverModal;
