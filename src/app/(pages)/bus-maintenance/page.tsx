"use client";

import React, { useState, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";

import dynamic from 'next/dynamic';

import { FaPlus, FaHistory } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from "@/components/Layout";
import Header from "@/components/reusesables/header";
import Pagination from "@/components/reusesables/pagination";

import {
  getAllActiveMaintenanceScheduling,
  getAllCompletedMaintenanceScheduling,
  createMaintenanceScheduling,
  updateMaintenanceScheduling,
  deleteMaintenanceScheduling,
  toggleMaintenanceSchedulingStatus,
} from "../../../services/maintenanceService";

const MaintenanceAddModal = dynamic(
  () => import("@/components/bus-maintenance/MaintenanceAddModal"),
  { ssr: false }
);

const MaintenanceEditModal = dynamic(
  () => import("@/components/bus-maintenance/MaintenanceEditModal"),
  { ssr: false }
);

const CompletionProofModal = dynamic(
  () => import("@/components/bus-maintenance/CompletionProofModal"),
  { ssr: false }
);

const ViewProofModal = dynamic(
  () => import("@/components/bus-maintenance/ViewProofModal"),
  { ssr: false }
);

const MaintenanceHistoryModal = dynamic(
  () => import("@/components/bus-maintenance/MaintenanceHistoryModal"),
  { ssr: false }
);

// Define interface for MaintenanceRecord
interface MaintenanceRecord {
  maintenance_scheduling_id: string | number;
  vehicle_id?: string;
  maintenance_status?: string;
  maintenance_complete_proof?: File | null;
  maintenance_type?: string;
  maintenance_cost?: string;
  maintenance_date?: string;
  mechanic_company?: string;
  mechanic_company_address?: string;
}

// Add this new interface for the confirmation modal
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

// Add this new component for confirmation
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  message 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Confirm Action</h2>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const MaintenanceManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [isViewProofModalOpen, setIsViewProofModalOpen] = useState(false); // New state for viewing proof
  const [currentRecord, setCurrentRecord] = useState<MaintenanceRecord | null>(
    null
  ); // Fix here
  const [searchTerm, setSearchTerm] = useState("");
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]); // Define the history data type as necessary
  const [viewType, setViewType] = useState("active"); // "active" or "completed"
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 3;

  // Add these new state variables for the confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | number | null>(null);

  const [toastKey, setToastKey] = React.useState(0);
  const toastId = React.useRef<string | number | null>(null);

  const showToast = async (operation: Promise<any>, loadingMessage: string, successMessage: string) => {
    // Dismiss all existing toasts
    toast.dismiss();
    // Force remount toast container
    setToastKey(prev => prev + 1);
    
    // Show loading toast
    toastId.current = toast.loading(loadingMessage, {
      position: "top-right",
      closeButton: false,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: false,
      progress: undefined
    });

    try {
      await operation;
      
      // Update toast to success with specific message
      toast.update(toastId.current, {
        render: successMessage,
        type: "success",
        isLoading: false,
        autoClose: 2000,
        closeButton: false,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
        onClose: () => {
          toastId.current = null;
          setToastKey(prev => prev + 1);
        }
      });
    } catch (error) {
      // Update toast to error
      toast.update(toastId.current, {
        render: "Operation failed. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 2000,
        closeButton: false,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
        onClose: () => {
          toastId.current = null;
          setToastKey(prev => prev + 1);
        }
      });
      throw error; // Re-throw to handle specific error cases
    }
  };

  // Fetch records using react-query
  const fetchRecords = async () => {
    if (viewType === "active") {
      return (await getAllActiveMaintenanceScheduling()).data;
    } else {
      return (await getAllCompletedMaintenanceScheduling()).data;
    }
  };

  const { data: records, isLoading, isError, refetch } = useQuery({
    queryKey: ["maintenanceRecords", viewType],
    queryFn: fetchRecords,
  });

  // Filter records based on search term, but check if records exists first
  const filteredRecords = records && Array.isArray(records)
    ? records.filter((record) =>
        Object.values(record)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : [];

  const handleReturnToActive = async (id: string | number) => {
    const operation = async () => {
      const formData = new FormData();
      if (currentRecord?.maintenance_complete_proof instanceof File) {
        formData.append("maintenance_complete_proof", currentRecord.maintenance_complete_proof);
      }
      await toggleMaintenanceSchedulingStatus(Number(id), formData);
      await refetch();
      setIsViewProofModalOpen(false);
    };

    await showToast(operation(), "Returning to active status...", "Maintenance record returned to active status successfully!");
  };

  // Function to open the history modal
  const handleOpenHistoryModal = () => {
    console.log("View History button clicked");
    setIsHistoryModalOpen(true); // This will open the history modal
  };

  // Function to close the history modal
  const handleCloseHistoryModal = () => {
    console.log("Closing the history modal");
    setIsHistoryModalOpen(false); // This will close the modal
  };

  // Pagination logic with null checks
  const totalPages = Math.ceil((filteredRecords?.length || 0) / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const handlePageChange = (page: number) => setCurrentPage(page);

  // Update the handleRemove function to use the confirmation flow
  const handleRemove = async (id: string | number) => {
    const operation = async () => {
      await deleteMaintenanceScheduling(Number(id));
      await refetch();
    };

    await showToast(operation(), "Deleting maintenance record...", "Maintenance record deleted successfully!");
  };
  
  // Add this new function to handle the delete confirmation
  const handleDeleteClick = (id: string | number) => {
    setRecordToDelete(id);
    setIsConfirmModalOpen(true);
  };
  
  const confirmDelete = () => {
    if (recordToDelete !== null) {
      handleRemove(recordToDelete);
    }
  };

  const handleSave = async (id: string | number, data: MaintenanceRecord) => {
    const operation = async () => {
      const maintenanceId = typeof id === "string" ? Number(id) : id;
      if (isNaN(maintenanceId)) throw new Error("Invalid ID");

      if (maintenanceId) {
        await updateMaintenanceScheduling(maintenanceId, data);
      } else {
        await createMaintenanceScheduling(data);
      }

      await refetch();
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
    };

    await showToast(
      operation(),
      id ? "Updating maintenance record..." : "Creating maintenance record...",
      id ? "Maintenance record updated successfully!" : "Maintenance record created successfully!"
    );
  };

  const handleProofSubmit = async (id: string | number, proofData: FormData) => {
    const operation = async () => {
      await toggleMaintenanceSchedulingStatus(Number(id), proofData);
      await refetch();
      setIsProofModalOpen(false);
    };

    await showToast(operation(), "Submitting completion proof...", "Completion proof submitted successfully!");
  };

  const handleViewProof = (record: MaintenanceRecord) => {
    setCurrentRecord(record);
    setIsViewProofModalOpen(true); // Open proof modal
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      toast.dismiss();
      if (toastId.current) {
        toast.dismiss(toastId.current);
      }
    };
  }, []);

  return (
    <Layout>
      <Header title="Bus Maintenance Management" />
      <ToastContainer
        key={toastKey}
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        theme="light"
        limit={1}
        style={{ zIndex: 9999 }}
        containerId="maintenance-toasts"
      />
      <div className="content flex flex-col flex-1 overflow-y-auto p-6 sm:p-12">
        <div className="options flex flex-col space-y-4 p-3">
          {/* Active/Completed Toggle Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              className={`px-4 py-2 rounded-md ${
                viewType === "active"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
              onClick={() => setViewType("active")}
            >
              Active
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                viewType === "completed"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
              onClick={() => setViewType("completed")}
            >
              Completed
            </button>
          </div>

          {/* Search Input and Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 sm:items-center">
            <div className="w-full sm:w-1/3 md:w-2/5 lg:w-1/3">
              <input
                type="text"
                placeholder="Find maintenance records"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-500 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Add and View History Buttons */}
            <button
              className="flex items-center justify-center px-4 py-2 border-2 border-blue-500 rounded-md text-blue-500 transition-colors duration-300 ease-in-out hover:bg-blue-50"
              onClick={() => setIsAddModalOpen(true)}
            >
              <FaPlus size={20} className="mr-2" />
              Add New
            </button>
            <button
              className="flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              onClick={handleOpenHistoryModal}
            >
              <FaHistory className="mr-2" />
              View History
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center text-blue-500 mt-10">Loading maintenance records...</div>
        ) : isError ? (
          <div className="text-center text-red-500 mt-10">Error loading maintenance records.</div>
        ) : filteredRecords?.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">No maintenance records found.</div>
        ) : (
          <div className="records flex flex-col h-full">
            <div className="output grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-3">
              {currentRecords.map((record) => (
                <div
                  key={record.maintenance_scheduling_id}
                  className="record-box-container bg-white border-gray-200 rounded-lg border-2 flex flex-col p-4 break-words text-sm"
                >
                  <table className="w-full border-collapse mb-1 table-auto">
                    <tbody>
                      <tr>
                        <td className="border p-2 font-bold">Bus:</td>
                        <td className="border p-2">{record.vehicle_id || "N/A"}</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-bold">Status:</td>
                        <td className="border p-2">
                          <button
                            className={`px-2 py-1 rounded text-black ${
                              record.maintenance_status === "active"
                                ? "bg-yellow-400"
                                : "bg-green-400"
                            }`}
                            onClick={() => {
                              if (record.maintenance_status === "active") {
                                setCurrentRecord(record);
                                setIsProofModalOpen(true);
                              }
                            }}
                          >
                            {record.maintenance_status || "N/A"}
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-bold">Type:</td>
                        <td className="border p-2">
                          {record.maintenance_type || "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-bold">Cost:</td>
                        <td className="border p-2">
                          PHP{" "}
                          {record.maintenance_cost
                            ? parseFloat(record.maintenance_cost).toFixed(2)
                            : "0.00"}
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-bold">Date:</td>
                        <td className="border p-2">
                          {record.maintenance_date || "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-bold">Company:</td>
                        <td className="border p-2">
                          {record.mechanic_company || "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-bold">Address:</td>
                        <td className="border p-2">
                          {record.mechanic_company_address || "N/A"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="flex justify-between space-x-2">
                    {record.maintenance_status === "completed" ? (
                      <>
                        <button
                          className="px-3 py-1.5 mt-3 bg-blue-500 text-white rounded hover:bg-blue-600 flex-1"
                          onClick={() => handleViewProof(record)}
                        >
                          View Proof
                        </button>
                        <button
                          className="px-3 py-1.5 mt-3 bg-red-500 text-white rounded hover:bg-red-600 flex-1"
                          onClick={() => handleDeleteClick(record.maintenance_scheduling_id)}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="px-3 py-1.5 mt-3 bg-blue-500 text-white rounded hover:bg-blue-600 flex-1"
                          onClick={() => {
                            setCurrentRecord(record);
                            setIsEditModalOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1.5 mt-3 bg-red-500 text-white rounded hover:bg-red-600 flex-1"
                          onClick={() => handleDeleteClick(record.maintenance_scheduling_id)}
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="pagination-container p-4 mb-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        )}

        {/* Modals */}
        {isAddModalOpen && (
          <Suspense fallback={<div>Loading...</div>}>
            <MaintenanceAddModal 
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              onSave={handleSave}
            />
          </Suspense>
        )}
        {isEditModalOpen && (
          <Suspense fallback={<div>Loading...</div>}>
            <MaintenanceEditModal 
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              record={currentRecord}
              onSave={handleSave}
            />
          </Suspense>
        )}
        {isProofModalOpen && (
          <Suspense fallback={<div>Loading...</div>}>
            <CompletionProofModal 
              isOpen={isProofModalOpen}
              onClose={() => setIsProofModalOpen(false)}
              record={currentRecord}
              onSubmit={handleProofSubmit}
            />
          </Suspense>
        )}
        {isViewProofModalOpen && (
          <Suspense fallback={<div>Loading...</div>}>
            <ViewProofModal 
              isOpen={isViewProofModalOpen}
              onClose={() => setIsViewProofModalOpen(false)}
              proof={currentRecord?.maintenance_complete_proof}
              onReturnToActive={() => {
                if (currentRecord?.maintenance_scheduling_id) {
                  handleReturnToActive(currentRecord.maintenance_scheduling_id);
                } else {
                  console.error("Maintenance scheduling ID is undefined.");
                }
              }}
            />
          </Suspense>
        )}
        {isHistoryModalOpen && (
          <Suspense fallback={<div>Loading...</div>}>
            <MaintenanceHistoryModal 
              isOpen={isHistoryModalOpen}
              onClose={() => setIsHistoryModalOpen(false)}
              history={filteredRecords} // Pass the records to the modal
            />
          </Suspense>
        )}
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={confirmDelete}
          message="Are you sure you want to delete this maintenance record? This action cannot be undone."
        />
      </div>
    </Layout>
  );
};

export default MaintenanceManagement;
