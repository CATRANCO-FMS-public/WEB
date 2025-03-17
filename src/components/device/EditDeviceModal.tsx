"use client";
import React, { useState, useEffect } from "react";
import {
  getTrackerVehicleMappingById,
  updateTrackerVehicleMapping,
  toggleTrackerVehicleMappingStatus,
  getAllTrackerVehicleMappings,
} from "@/services/deviceService"; // Import services and toggle service
import { getAllVehicles } from "@/services/vehicleService"; // Fetch available buses dynamically

const EditDeviceModal = ({ isOpen, onClose, deviceId, onSave }) => {
  const [deviceName, setDeviceName] = useState("");
  const [trackerIdent, setTrackerIdent] = useState("");
  const [originalTrackerIdent, setOriginalTrackerIdent] = useState(""); // Store original value
  const [busNumber, setBusNumber] = useState("");
  const [status, setStatus] = useState("");
  const [busOptions, setBusOptions] = useState([]); // Fetch bus options dynamically
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch bus options and device details dynamically
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        if (isOpen && deviceId) {
          // Fetch device details
          const deviceData = await getTrackerVehicleMappingById(deviceId);
          setDeviceName(deviceData.device_name);
          setTrackerIdent(deviceData.tracker_ident);
          setOriginalTrackerIdent(deviceData.tracker_ident); // Store original value
          setBusNumber(deviceData.vehicle?.vehicle_id || "");
          setStatus(deviceData.status);

          // Fetch all vehicles and existing mappings
          const [vehicles, mappings] = await Promise.all([
            getAllVehicles(),
            getAllTrackerVehicleMappings()
          ]);
          
          // Get array of vehicle IDs that are already assigned
          const assignedVehicleIds = mappings
            .filter(mapping => mapping.vehicle_id && mapping.id !== deviceId) // Exclude current device mapping
            .map(mapping => mapping.vehicle_id.toString());
          
          // Filter out vehicles that are already assigned, but include the current vehicle
          const availableVehicles = vehicles.filter(
            vehicle => !assignedVehicleIds.includes(vehicle.vehicle_id.toString()) || 
                      vehicle.vehicle_id.toString() === deviceData.vehicle?.vehicle_id
          );
          
          setBusOptions(availableVehicles);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load device details. Please try again.");
      } finally {
        setLoading(false);
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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-lg p-4 md:p-6 w-full md:w-2/3 lg:w-1/3 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg md:text-xl font-bold mb-4">
          Edit Tracker to a Vehicle
        </h2>
        {error && <p className="text-red-500 mb-4 text-sm md:text-base">{error}</p>}
        
        <div className="space-y-3 md:space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-1 md:mb-2 text-sm md:text-base">
              Device Name
            </label>
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="w-full px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1 md:mb-2 text-sm md:text-base">
              Tracker Identifier
            </label>
            <input
              type="text"
              value={trackerIdent}
              onChange={(e) => setTrackerIdent(e.target.value)}
              className="w-full px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1 md:mb-2 text-sm md:text-base">
              Bus Number
            </label>
            <select
              value={busNumber}
              onChange={(e) => setBusNumber(e.target.value)}
              className="w-full px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            >
              <option value="" disabled>
                {loading ? "Loading vehicles..." : "Select Bus Number"}
              </option>
              {busOptions.map((bus) => (
                <option key={bus.vehicle_id} value={bus.vehicle_id}>
                  {`ID: ${bus.vehicle_id} - Plate: ${bus.plate_number}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1 md:mb-2 text-sm md:text-base">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Status changes will be processed separately from other updates.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 md:space-x-4 mt-6">
          <button
            onClick={handleSave}
            className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm md:text-base"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="px-3 md:px-4 py-1.5 md:py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm md:text-base"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDeviceModal;
