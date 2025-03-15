import React, { useState, useEffect } from "react";
import { getOffDutyUserProfiles } from "@/app/services/userProfile";
import { getAllVehicles } from "@/app/services/vehicleService";
import { createVehicleAssignment } from "@/app/services/vehicleAssignService";

interface AssignBusPersonnelModalProps {
  onClose: () => void;
  refreshData: () => void;
  onAssign: (newAssignment: any) => void;
  vehicleId: string;
  preSelectedVehicle?: string;
}

const AssignBusPersonnelModal = ({
  onClose,
  refreshData,
  onAssign,
  vehicleId,
  preSelectedVehicle,
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleId || "");
  const [drivers, setDrivers] = useState([]);
  const [paos, setPaos] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedPAO, setSelectedPAO] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch profiles and vehicles on component mount
  useEffect(() => {
    const fetchProfilesAndVehicles = async () => {
      setLoading(true);
      try {
        // Fetch profiles of users who are off-duty
        const profiles = await getOffDutyUserProfiles();
        console.log("Fetched profiles:", profiles);  // Log the profiles to inspect
        
        const driverProfiles = profiles.filter(
          (profile) => profile.position === "driver"
        );
        const paoProfiles = profiles.filter(
          (profile) =>
            profile.position === "passenger_assistant_officer"
        );
        const vehicleData = await getAllVehicles();
  
        setDrivers(driverProfiles);
        setPaos(paoProfiles);
        setVehicles(vehicleData);
      } catch (fetchError) {
        console.error("Error fetching profiles or vehicles:", fetchError);
        setError("Error fetching profiles or vehicles.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchProfilesAndVehicles();
  }, []);
  
  const handleDoneClick = async (e) => {
    e.preventDefault();

    if (!selectedDriver || !selectedPAO || !selectedVehicle) {
      setError("Please select a driver, PAO, and vehicle.");
      return;
    }

    setLoading(true);
    setError(""); // Clear any previous errors

    try {
      const assignmentData = {
        vehicle_id: selectedVehicle,
        user_profile_ids: [selectedDriver, selectedPAO],
      };

      const response = await createVehicleAssignment(assignmentData);

      // Assuming a successful response contains the `assignment` object
      if (response.assignment) {
        console.log("Assignment created successfully:", response.assignment);

        // Close the modal first
        onClose();
        
        // Then trigger callbacks
        if (refreshData) {
          refreshData();
        }
        
        if (onAssign) {
          onAssign(response.assignment);
        }
      } else {
        // Handle case where response doesn't contain assignment
        console.error("Unexpected response format:", response);
        setError("Unexpected response from server. Please try again.");
        setLoading(false);
      }
    } catch (catchError) {
      console.error("Error creating vehicle assignment:", catchError);

      // If an error is received, log it and show a generic error message
      setError(
        "An error occurred while creating the assignment. Please try again."
      );
      setLoading(false); // Make sure to set loading to false on error
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg p-5">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-2xl font-semibold">Assign Bus Personnel</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            &times;
          </button>
        </div>
        <form className="grid grid-cols-1 gap-3 mt-3">
          <div>
            <h1 className="text-xl mb-2">Driver Assignment</h1>
            {loading ? (
              <p>Loading drivers...</p>
            ) : (
              <select
                value={selectedDriver}
                onChange={(e) => {
                  setSelectedDriver(e.target.value);
                  setError(""); // Reset error on change
                }}
                className="h-10 text-lg border border-gray-300 rounded-md p-2 w-full"
              >
                <option value="">Select a Driver</option>
                {drivers.map((driver) => (
                  <option
                    key={driver.user_profile_id}
                    value={driver.user_profile_id}
                  >
                    {`${driver.first_name} ${driver.last_name}`}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <h1 className="text-xl mb-2">
              Passenger Assistant Officer Assignment
            </h1>
            {loading ? (
              <p>Loading PAOs...</p>
            ) : (
              <select
                value={selectedPAO}
                onChange={(e) => {
                  setSelectedPAO(e.target.value);
                  setError(""); // Reset error on change
                }}
                className="h-10 text-lg border border-gray-300 rounded-md p-2 w-full"
              >
                <option value="">Select a PAO</option>
                {paos.map((pao) => (
                  <option
                    key={pao.user_profile_id}
                    value={pao.user_profile_id}
                  >
                    {`${pao.first_name} ${pao.last_name}`}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <h1 className="text-xl mb-2">Select Vehicle</h1>
            {loading ? (
              <p>Loading vehicles...</p>
            ) : (
              <select
                value={selectedVehicle}
                onChange={(e) => {
                  setSelectedVehicle(e.target.value);
                  setError(""); // Reset error on change
                }}
                className="h-10 text-lg border border-gray-300 rounded-md p-2 w-full"
                disabled={!!preSelectedVehicle} // Disable if pre-selected
              >
                {preSelectedVehicle ? (
                  <option value={preSelectedVehicle}>
                    {preSelectedVehicle}
                  </option>
                ) : (
                  <>
                    <option value="">Select a Vehicle</option>
                    {vehicles.map((vehicle) => (
                      <option
                        key={vehicle.vehicle_id}
                        value={vehicle.vehicle_id}
                      >
                        {vehicle.vehicle_id}
                      </option>
                    ))}
                  </>
                )}
              </select>
            )}
          </div>

          <div className="flex justify-end space-x-4 mt-4">
            <button
              type="button"
              onClick={handleDoneClick}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              disabled={loading}
            >
              Done
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-500 text-gray-500 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignBusPersonnelModal;
