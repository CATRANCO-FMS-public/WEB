"use client";
import React, { useState, useEffect } from "react";
import {
  getTrackerVehicleMappingById,
  updateTrackerVehicleMapping,
  toggleTrackerVehicleMappingStatus,
} from "@/app/services/trackerService"; // Import services and toggle service
import { getAllVehicles } from "@/app/services/vehicleService"; // Fetch available buses dynamically

const EditDeviceModal = ({ isOpen, onClose, deviceId, onSave }) => {
  const [deviceName, setDeviceName] = useState("");
  const [trackerIdent, setTrackerIdent] = useState("");
  const [originalTrackerIdent, setOriginalTrackerIdent] = useState(""); // Store original value
  const [busNumber, setBusNumber] = useState("");
  const [status, setStatus] = useState("");
  const [busOptions, setBusOptions] = useState([]); // Fetch bus options dynamically
  const [error, setError] = useState("");

  // Fetch bus options and device details dynamically
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (isOpen && deviceId) {
          // Fetch device details
          const deviceData = await getTrackerVehicleMappingById(deviceId);
          setDeviceName(deviceData.device_name);
          setTrackerIdent(deviceData.tracker_ident);
          setOriginalTrackerIdent(deviceData.tracker_ident); // Store original value
          setBusNumber(deviceData.vehicle?.vehicle_id || "");
          setStatus(deviceData.status);

          // Fetch available buses
          const vehicles = await getAllVehicles();
          setBusOptions(vehicles);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load device details. Please try again.");
      }
    };

    if (isOpen) {
      fetchDetails();
    }
  }, [isOpen, deviceId]);

  const handleSave = async () => {
    if (!deviceName || !busNumber) {
      setError("Device name and bus number are required.");
      return;
    }
  
    try {
      // Define a type for the updated device
      type UpdatedDevice = {
        id: any; // Use a more specific type if possible
        device_name: string;
        vehicle_id: string;
        tracker_ident?: string; // Make this optional with ?
      };
      
      // Create the object with the optional property
      const updatedDevice: UpdatedDevice = {
        id: deviceId,
        device_name: deviceName,
        vehicle_id: busNumber,
      };
      
      // Only include tracker_ident if it was changed
      if (trackerIdent !== originalTrackerIdent) {
        updatedDevice.tracker_ident = trackerIdent;
      }
  
      // Attempt to update the device
      await updateTrackerVehicleMapping(deviceId, updatedDevice);
      
      // If status has changed, toggle it separately
      const originalStatus = await getTrackerVehicleMappingById(deviceId).then(data => data.status);
      if (status !== originalStatus) {
        await toggleTrackerVehicleMappingStatus(deviceId);
      }
      
      onSave(updatedDevice); // Pass updated device to parent
      onClose(); // Close modal
    } catch (err) {
      // If the error is related to a duplicate tracker ident, show a warning message
      if (err.message && err.message.includes("The tracker ident has already been taken")) {
        setError(
          `Warning: The tracker ident is already in use. Do you still want to proceed with this?`
        );
      } else {
        setError(`Failed to save changes. Reason: ${err.message || err}`);
      }
    }
  };
  
  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">
          Edit Tracker-to-Vehicle Mapping
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700">Device Name</label>
          <input
            type="text"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Tracker Identifier</label>
          <input
            type="text"
            value={trackerIdent}
            onChange={(e) => setTrackerIdent(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Bus Number</label>
          <select
            value={busNumber}
            onChange={(e) => setBusNumber(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          >
            <option value="" disabled>
              Select Bus Number
            </option>
            {busOptions.map((bus) => (
              <option key={bus.vehicle_id} value={bus.vehicle_id}>
                {`ID: ${bus.vehicle_id} - Plate: ${bus.plate_number}`}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Status changes will be processed separately from other updates.
          </p>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDeviceModal;
