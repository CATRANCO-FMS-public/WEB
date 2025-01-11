import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  createVehicleAssignment,
  getAllVehicleAssignments,
} from "@/app/services/vehicleAssignService";
import EditBusRecordModal from "@/app/components/EditBusRecordModal";
import EditPersonnelModal from "@/app/components/EditPersonnelModal";
import FullRecordModal from "@/app/components/FullRecordModal";

interface BusBoxProps {
  vehicle_id: string;
  busNumber: string;
  ORNumber: string;
  CRNumber: string;
  plateNumber: string;
  thirdLBI: string;
  comprehensiveInsurance?: string;
  ci: string;
  assignedDriver: string;
  assignedPAO: string;
  assignmentId: string | null;
  route?: string;
  onDelete: () => void;
  onUpdate: (updatedBus: any) => void;
}

const BusRecord: React.FC<BusBoxProps> = ({
  vehicle_id,
  busNumber,
  ORNumber,
  CRNumber,
  plateNumber,
  thirdLBI,
  ci,
  assignedDriver,
  assignedPAO,
  assignmentId: initialAssignmentId,
  route,
  onDelete,
  onUpdate,
}) => {
  const [assignmentId, setAssignmentId] = useState<string | null>(
    initialAssignmentId
  );
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isEditBusModalOpen, setIsEditBusModalOpen] = useState(false);
  const [isEditPersonnelModalOpen, setIsEditPersonnelModalOpen] =
    useState(false);
  const [isFullRecordModalOpen, setIsFullRecordModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const openFullRecordModal = () => setIsFullRecordModalOpen(true);
  const closeFullRecordModal = () => setIsFullRecordModalOpen(false);
  const toggleDropdown = useCallback(
    () => setDropdownOpen((prev) => !prev),
    []
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setAssignmentId(initialAssignmentId);
  }, [initialAssignmentId]);

  const fetchOrCreateAssignment = async () => {
    if (!assignmentId) {
      setLoading(true);
      try {
        const response = await getAllVehicleAssignments();
        const foundAssignment = response.find(
          (assignment) => assignment.vehicle.vehicle_id === vehicle_id
        );

        if (foundAssignment) {
          setAssignmentId(foundAssignment.vehicle_assignment_id);
        } else {
          const newAssignment = await createVehicleAssignment({
            vehicle_id,
            user_profile_ids: [assignedDriver, assignedPAO].filter(Boolean),
          });
          setAssignmentId(newAssignment.vehicle_assignment_id);
        }
      } catch (error) {
        console.error("Error fetching or creating assignment ID:", error);
        setAssignmentId(null);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchOrCreateAssignment();
  }, [vehicle_id, assignedDriver, assignedPAO, assignmentId]); // Re-run fetch if vehicle_id, assignedDriver, or assignedPAO change

  const handleEditBus = () => {
    setIsEditBusModalOpen(true);
    setDropdownOpen(false);
  };

  const handleEditPersonnel = () => {
    setIsEditPersonnelModalOpen(true);
    setDropdownOpen(false);
  };

  const handleModalClose = () => {
    setIsEditBusModalOpen(false);
    setIsEditPersonnelModalOpen(false);
  };

  const handleUpdate = (updatedBus: any) => {
    onUpdate(updatedBus); // Trigger parent update

    // Optionally update the assignmentId directly if needed
    setAssignmentId(updatedBus.assignmentId);

    // Re-fetch assignment after update to reflect changes
    fetchOrCreateAssignment();
  };

  return (
    <div className="record-box-container mr-1 bg-white  border-gray-200 rounded-lg border-2 flex flex-col p-4 break-words text-sm relative">
      {/* Table Content */}
      <table className="w-full border-collapse mb-16 table-auto">
        <tbody>
          <tr>
            <td className="border p-2 font-bold">Bus Number:</td>
            <td className="border p-2">{busNumber}</td>
          </tr>
          <tr>
            <td className="border p-2 font-bold">OR Number:</td>
            <td className="border p-2">{ORNumber}</td>
          </tr>
          <tr>
            <td className="border p-2 font-bold">CR Number:</td>
            <td className="border p-2">{CRNumber}</td>
          </tr>
          <tr>
            <td className="border p-2 font-bold">Plate Number:</td>
            <td className="border p-2">{plateNumber}</td>
          </tr>
          <tr>
            <td className="border p-2 font-bold">Third LBI:</td>
            <td className="border p-2">{thirdLBI}</td>
          </tr>
          <tr>
            <td className="border p-2 font-bold">Comprehensive Insurance:</td>
            <td className="border p-2">{ci}</td>
          </tr>
          <tr>
            <td className="border p-2 font-bold">Assigned Driver:</td>
            <td className="border p-2">{assignedDriver}</td>
          </tr>
          <tr>
            <td className="border p-2 font-bold">Assigned PAO:</td>
            <td className="border p-2">{assignedPAO}</td>
          </tr>
          <tr>
            <td className="border p-2 font-bold">Route:</td>
            <td className="border p-2">{route || "Not Assigned"}</td>
          </tr>
        </tbody>
      </table>

      {/* Action Buttons */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between space-x-2">
        <button
          className="px-3 py-1.5 mt-3 bg-red-500 text-white rounded hover:bg-red-600 flex-1 sm:px-1 sm:py-2"
          onClick={onDelete}
        >
          Remove
        </button>

        <div className="relative flex-1 mt-3" ref={dropdownRef}>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full h-full"
            onClick={toggleDropdown}
          >
            Edit
          </button>
          {dropdownOpen && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 w-60">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 focus:outline-none"
                onClick={handleEditBus}
              >
                Edit Bus Record
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 focus:outline-none"
                onClick={handleEditPersonnel}
              >
                Edit Personnel Assignment
              </button>
            </div>
          )}
        </div>

        <button
          onClick={openFullRecordModal}
          className="px-3 py-1.5 mt-3 bg-green-500 text-white rounded hover:bg-green-600 flex-1 sm:px-1 sm:py-2"
        >
          View Full Record
        </button>
      </div>

      {/* Modals */}
      <FullRecordModal
        isOpen={isFullRecordModalOpen}
        onClose={closeFullRecordModal}
        vehicleId={vehicle_id} // Pass vehicle_id instead of busDetails
      />


      {isEditBusModalOpen && (
        <EditBusRecordModal
          vehicle_id={vehicle_id}
          onClose={handleModalClose}
          onSubmit={(updatedBus) => handleUpdate(updatedBus)} // Pass the handleUpdate function here
          refreshData={fetchOrCreateAssignment} // Add refreshData prop here
        />
      )}

      {isEditPersonnelModalOpen && (
        <EditPersonnelModal
          assignmentId={assignmentId}
          vehicleId={vehicle_id}
          initialDriver={assignedDriver}
          initialPAO={assignedPAO}
          onClose={handleModalClose}
          onUpdate={(updatedDriver, updatedPAO) => {
            handleUpdate({
              updatedDriver,
              updatedPAO,
              vehicle_id,
            });
          }}
        />
      )}
    </div>
  );
};

export default BusRecord;
