import React, { useState, useEffect } from "react";
import { getVehicleById } from "../../services/vehicleService"; // Import the service
import { getVehicleAssignmentById } from "../../services/vehicleAssignService"; // Import the assignment service

interface FullRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
}

const FullRecordModal: React.FC<FullRecordModalProps> = ({
  isOpen,
  onClose,
  vehicleId,
}) => {
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen && vehicleId) {
      fetchVehicleDetails();
    }
  }, [isOpen, vehicleId]);

  const fetchVehicleDetails = async () => {
    try {
      setLoading(true);
      // Fetch vehicle data
      const vehicleResponse = await getVehicleById(vehicleId);
      setVehicleData(vehicleResponse);

      // Fetch personnel assigned to the vehicle
      const assignmentResponse = await getVehicleAssignmentById(vehicleId);
      setPersonnel(assignmentResponse.user_profiles || []); // Assuming user_profiles contain the personnel details
    } catch (error) {
      console.error("Error fetching vehicle details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || loading || !vehicleData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-3xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Bus Full Record</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition duration-150 ease-in-out"
          >
            ✕
          </button>
        </div>

        {/* General Information */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-blue-600">General Information</h3>
            <div className="grid grid-cols-2 gap-4 mt-4 text-gray-700">
              <p>
                <span className="font-medium">Bus Number:</span> {vehicleData?.vehicle_id || "N/A"}
              </p>
              <p>
                <span className="font-medium">Plate Number:</span> {vehicleData?.plate_number || "N/A"}
              </p>
              <p>
                <span className="font-medium">Engine Number:</span> {vehicleData?.engine_number || "N/A"}
              </p>
              <p>
                <span className="font-medium">Chasis Number:</span> {vehicleData?.chasis_number || "N/A"}
              </p>
              <p>
                <span className="font-medium">OR Number:</span> {vehicleData?.or_id || "N/A"}
              </p>
              <p>
                <span className="font-medium">CR Number:</span> {vehicleData?.cr_id || "N/A"}
              </p>
            </div>
          </div>

          {/* Insurance Details */}
          <div>
            <h3 className="text-lg font-semibold text-blue-600">Insurance Details</h3>
            <div className="mt-4 text-gray-700">
              <p>
                <span className="font-medium">Third Party Liability:</span> {vehicleData?.third_pli || "N/A"}
              </p>
              <p>
                <span className="font-medium">Third Party Liability Validity:</span> {vehicleData?.third_pli_validity || "N/A"}
              </p>
              <p>
                <span className="font-medium">Comprehensive Insurance (CI):</span> {vehicleData?.ci || "N/A"}
              </p>
              <p>
                <span className="font-medium">CI Validity:</span> {vehicleData?.ci_validity || "N/A"}
              </p>
            </div>
          </div>

          {/* Purchase Information */}
          <div>
            <h3 className="text-lg font-semibold text-blue-600">Purchase Information</h3>
            <div className="mt-4 text-gray-700">
              <p>
                <span className="font-medium">Date Purchased:</span> {vehicleData?.date_purchased || "N/A"}
              </p>
              <p>
                <span className="font-medium">Supplier:</span> {vehicleData?.supplier || "N/A"}
              </p>
            </div>
          </div>

          {/* Personnel */}
          <div>
            <h3 className="text-lg font-semibold text-blue-600">Personnel</h3>
            <div className="mt-4 text-gray-700">
              {personnel.length > 0 ? (
                personnel.map((person, index) => (
                  <div key={index}>
                    <p>
                      <span className="font-medium">
                        {person.position === 'driver' ? 'Driver:' : 'Assigned PAO:'}
                      </span>
                      {` ${person.first_name} ${person.middle_initial}. ${person.last_name}`}
                    </p>
                  </div>
                ))
              ) : (
                <p>No personnel assigned.</p>
              )}
            </div>
          </div>

          {/* Route */}
          {vehicleData?.route && (
            <div>
              <h3 className="text-lg font-semibold text-blue-600">Route</h3>
              <p className="mt-4 text-gray-700">{vehicleData?.route || "Not Assigned"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FullRecordModal;
