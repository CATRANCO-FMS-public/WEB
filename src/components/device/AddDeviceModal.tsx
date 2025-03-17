"use client";
import React, { useState, useEffect } from "react";
import { getAllVehicles } from "@/services/vehicleService"; // Service to fetch vehicles
import { 
  createTrackerVehicleMapping,
  getAllTrackerVehicleMappings 
} from "@/services/deviceService"; // Service to create tracker-vehicle mapping and get existing mappings

const AddDeviceModal = ({ isOpen, onClose, onSave }) => {
  const [deviceName, setDeviceName] = useState("");
  const [trackerIdent, setTrackerIdent] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [busOptions, setBusOptions] = useState([]); // Store available vehicles
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch available vehicles dynamically
  useEffect(() => {
    const fetchVehiclesAndMappings = async () => {
      try {
        setLoading(true);
        // Fetch both all vehicles and current mappings
        const [vehicles, mappings] = await Promise.all([
          getAllVehicles(),
          getAllTrackerVehicleMappings()
        ]);
        
        // Get array of vehicle IDs that are already assigned
        const assignedVehicleIds = mappings
          .filter(mapping => mapping.vehicle_id) // Only consider mappings that have a vehicle_id
          .map(mapping => mapping.vehicle_id.toString());
        
        // Filter out vehicles that are already assigned
        const availableVehicles = vehicles.filter(
          vehicle => !assignedVehicleIds.includes(vehicle.vehicle_id.toString())
        );
        
        setBusOptions(availableVehicles);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load available vehicles. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchVehiclesAndMappings();
    }
  }, [isOpen]);

  const handleSave = async () => {
    // Check if all required fields are filled
    if (!deviceName.trim() || !trackerIdent.trim() || !vehicleId.trim()) {
      setError("All fields are required.");
      return;
    }

    setError(""); // Clear any previous errors

    try {
      const mappingData = {
        device_name: deviceName,
        tracker_ident: trackerIdent,
        vehicle_id: vehicleId,
      };
      const newMapping = await createTrackerVehicleMapping(mappingData);
      onSave(newMapping);
      resetForm();
      onClose();
    } catch (error: any) {
      console.error("Error creating tracker-to-vehicle mapping:", error);
      // Handle different types of errors
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError("Failed to create mapping. Please try again.");
      }
    }
  };

  const resetForm = () => {
    setDeviceName("");
    setTrackerIdent("");
    setVehicleId("");
    setError("");
  };

  // Check if form is valid
  const isFormValid = () => {
    return deviceName.trim() !== "" && trackerIdent.trim() !== "" && vehicleId.trim() !== "";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full md:w-2/3 lg:w-1/3 rounded-lg shadow-lg p-4 md:p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg md:text-xl font-bold mb-4">
          Add Tracker to a Vehicle 
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
              placeholder="Enter device name"
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
              placeholder="Enter tracker identifier"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-1 md:mb-2 text-sm md:text-base">
              Vehicle
            </label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            >
              <option value="" disabled>
                {loading ? "Loading vehicles..." : "Select a vehicle"}
              </option>
              {busOptions.map((bus) => (
                <option key={bus.vehicle_id} value={bus.vehicle_id}>
                  {`ID: ${bus.vehicle_id} - Plate: ${bus.plate_number}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 md:space-x-4 mt-6">
          <button
            onClick={handleSave}
            disabled={!isFormValid()}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md text-sm md:text-base ${
              isFormValid()
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-blue-300 text-white cursor-not-allowed"
            }`}
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

export default AddDeviceModal;
