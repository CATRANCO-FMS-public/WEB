import React, { useState } from "react";

interface VehicleAssignmentData {
  vehicle_assignment_id: number;
  number: string;
  status: string;
}

interface AlleyModalProps {
  isOpen: boolean;
  vehicleData: VehicleAssignmentData | null;
  onClose: () => void;
  onConfirm: (selectedRoute: string, vehicleAssignmentId: number) => void;
  availableRoutes: string[];
}

const AlleyModal: React.FC<AlleyModalProps> = ({
  isOpen,
  vehicleData,
  onClose,
  onConfirm,
  availableRoutes,
}) => {
  const [selectedRoute, setSelectedRoute] = useState<string>("");

  const resetRoute = () => setSelectedRoute("");

  if (!isOpen || !vehicleData) return null;

  const handleConfirm = () => {
    onConfirm(selectedRoute, vehicleData.vehicle_assignment_id);
    resetRoute(); // Reset the selected route
    onClose();
  };

  const handleClose = () => {
    resetRoute(); // Reset the selected route on cancel
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Alley On</h2>
        <div>
          <p>
            <strong>Vehicle ID:</strong> {vehicleData.number}
          </p>
          <p>
            <strong>Status:</strong> {vehicleData.status}
          </p>
        </div>

        <div className="mt-4">
          <label className="block mb-2" htmlFor="route">
            Select Route:
          </label>
          <select
            id="route"
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">-- Select Route --</option>
            {availableRoutes?.map((route, index) => (
              <option key={index} value={route}>
                {route}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex justify-between">
          <button
            onClick={handleConfirm}
            disabled={!selectedRoute.trim()}
            className={`px-4 py-2 ${
              !selectedRoute.trim()
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-green-500 text-white"
            } rounded-lg`}
          >
            Confirm
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlleyModal;
