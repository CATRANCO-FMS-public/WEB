"use client";
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getAllVehicles } from "../../services/vehicleService";

const MaintenanceAddModal = ({ isOpen, onClose, onSave }) => {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState("");
  const [maintenanceCost, setMaintenanceCost] = useState("");
  const [maintenanceDate, setMaintenanceDate] = useState(new Date());
  const [maintenanceType, setMaintenanceType] = useState("");
  const [mechanicCompany, setMechanicCompany] = useState("");
  const [mechanicCompanyAddress, setMechanicCompanyAddress] = useState("");
  const [otherMaintenanceType, setOtherMaintenanceType] = useState(""); // New state for "others"
  const [error, setError] = useState(""); // Add error state

  // Maintenance types list
  const maintenanceTypes = [
    "oil_change",
    "tire_rotation",
    "brake_inspection",
    "engine_check",
    "transmission_service",
  ];

  // Fetch available vehicles and the next maintenance number when the modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchInitialData = async () => {
        try {
          setError(""); // Clear any previous errors
          const vehicleData = await getAllVehicles();
          setVehicles(vehicleData);
        } catch (error) {
          console.error("Error fetching data:", error);
          setError("Failed to load vehicles. Please try again later.");
        }
      };

      fetchInitialData();
    }
  }, [isOpen]);

  const handleMaintenanceTypeChange = (e) => {
    const selectedType = e.target.value;
    setMaintenanceType(selectedType);

    // Clear the "other" field when switching away from "others"
    if (selectedType !== "others") {
      setOtherMaintenanceType("");
    }
  };

  const clearForm = () => {
    setVehicleId("");
    setMaintenanceCost("");
    setMaintenanceDate(new Date());
    setMaintenanceType("");
    setMechanicCompany("");
    setMechanicCompanyAddress("");
    setOtherMaintenanceType("");
    setError("");
  };

  const handleClose = () => {
    clearForm();
    onClose();
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (
      !maintenanceType ||
      !maintenanceCost ||
      !mechanicCompany ||
      !mechanicCompanyAddress
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setError(""); // Clear any previous errors
      const formattedDate = `${maintenanceDate.toLocaleDateString(
        "en-CA"
      )} ${maintenanceDate.toLocaleTimeString("en-GB", { hour12: false })}`;

      const finalMaintenanceType =
        maintenanceType === "others" ? otherMaintenanceType : maintenanceType;

      const newRecord = {
        vehicle_id: vehicleId || "N/A",
        maintenance_cost: maintenanceCost || "0",
        maintenance_date: formattedDate,
        maintenance_type: finalMaintenanceType || "unspecified",
        mechanic_company: mechanicCompany || "N/A",
        mechanic_company_address: mechanicCompanyAddress || "N/A",
        maintenance_status: "active",
      };

      await onSave(null, newRecord);
      onClose();
    } catch (error) {
      console.error("Error saving maintenance record:", error);
      setError("Failed to save maintenance record. Please try again later.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[800px]">
        <h2 className="text-lg font-bold mb-4">Add New Maintenance Record</h2>
        
        {/* Add error message display */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="form grid grid-cols-2 gap-6">
          {/* Vehicle Info Column */}
          <div className="space-y-5">
            <div className="col-span-1">
              <label
                htmlFor="vehicleId"
                className="block text-sm font-medium text-gray-700"
              >
                Vehicle
              </label>
              <select
                id="vehicleId"
                className="border border-gray-300 p-3 rounded-md w-full mt-1"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
              >
                <option value="">Select a vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                    {vehicle.plate_number} - {vehicle.vehicle_id}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <label
                htmlFor="maintenanceDate"
                className="block text-sm font-medium text-gray-700"
              >
                Maintenance Date
              </label>
              <DatePicker
                id="maintenanceDate"
                selected={maintenanceDate}
                onChange={(date: Date) => setMaintenanceDate(date)}
                className="border border-gray-300 p-3 rounded-md w-full mt-1"
                dateFormat="MM/dd/yyyy"
              />
            </div>

            <div className="col-span-1">
              <label
                htmlFor="maintenanceCost"
                className="block text-sm font-medium text-gray-700"
              >
                Maintenance Cost
              </label>
              <input
                id="maintenanceCost"
                placeholder="PHP"
                value={maintenanceCost}
                onChange={(e) => setMaintenanceCost(e.target.value)}
                className="border border-gray-300 p-3 rounded-md w-full mt-1"
              />
            </div>
          </div>

          {/* Maintenance Info Column */}
          <div className="space-y-5">
            <div className="col-span-1">
              <label
                htmlFor="maintenanceType"
                className="block text-sm font-medium text-gray-700"
              >
                Maintenance Type
              </label>
              <select
                id="maintenanceType"
                className="border border-gray-300 p-3 rounded-md w-full mt-1"
                value={maintenanceType}
                onChange={handleMaintenanceTypeChange}
              >
                <option value="">Select a maintenance type</option>
                {maintenanceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
                <option value="others">Others (Specify Below)</option>
              </select>
            </div>

            {maintenanceType === "others" && (
              <div className="col-span-1">
                <label
                  htmlFor="otherMaintenanceType"
                  className="block text-sm font-medium text-gray-700"
                >
                  Specify Other Concern
                </label>
                <input
                  id="otherMaintenanceType"
                  placeholder="Describe the maintenance type"
                  value={otherMaintenanceType}
                  onChange={(e) => setOtherMaintenanceType(e.target.value)}
                  className="border border-gray-300 p-3 rounded-md mt-1 w-full"
                />
              </div>
            )}

            <div className="col-span-1">
              <label
                htmlFor="mechanicCompany"
                className="block text-sm font-medium text-gray-700"
              >
                Mechanic Company
              </label>
              <input
                id="mechanicCompany"
                placeholder="Mechanic Company"
                value={mechanicCompany}
                onChange={(e) => setMechanicCompany(e.target.value)}
                className="border border-gray-300 p-3 rounded-md w-full mt-1"
              />
            </div>
            
            <div className="col-span-1">
              <label
                htmlFor="mechanicCompanyAddress"
                className="block text-sm font-medium text-gray-700"
              >
                Mechanic Company Address
              </label>
              <input
                id="mechanicCompanyAddress"
                placeholder="Mechanic Company Address"
                value={mechanicCompanyAddress}
                onChange={(e) => setMechanicCompanyAddress(e.target.value)}
                className="border border-gray-300 p-3 rounded-md w-full mt-1"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 mt-4">
          <button
            className={`px-6 py-3 ${
              maintenanceType &&
              maintenanceCost &&
              mechanicCompany &&
              mechanicCompanyAddress
                ? "bg-blue-500 text-white"
                : "bg-gray-300 text-gray-500"
            } rounded-md`}
            onClick={handleSubmit}
            disabled={
              !maintenanceType ||
              !maintenanceCost ||
              !mechanicCompany ||
              !mechanicCompanyAddress
            }
          >
            Save
          </button>
          <button
            className="px-6 py-3 border border-red-500 text-white rounded-md bg-red-500"
            onClick={handleClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceAddModal;
