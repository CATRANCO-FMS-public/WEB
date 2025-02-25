"use client";
import React, { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";
import Header from "../components/Header";
import MaintenanceAddModal from "../components/MaintenanceAddModal";
import MaintenanceEditModal from "../components/MaintenanceEditModal";
import CompletionProofModal from "../components/CompletionProofModal"; // Component for proof submission
import ViewProofModal from "../components/ViewProofModal"; // Component for viewing proof
import Pagination from "../components/Pagination";
import { FaSearch, FaPlus, FaHistory } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import {
  getAllActiveMaintenanceScheduling,
  getAllCompletedMaintenanceScheduling,
  createMaintenanceScheduling,
  updateMaintenanceScheduling,
  deleteMaintenanceScheduling,
  toggleMaintenanceSchedulingStatus,
} from "../services/maintenanceService";
import { AxiosError } from "axios";

import MaintenanceHistoryModal from "../components/MaintenanceHistoryModal";

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

  // Fetch records using react-query
  const fetchRecords = async () => {
    if (viewType === "active") {
      return (await getAllActiveMaintenanceScheduling()).data;
    } else {
      return (await getAllCompletedMaintenanceScheduling()).data;
    }
  };

  const { data: records = [], refetch } = useQuery({
    queryKey: ["maintenanceRecords", viewType],
    queryFn: fetchRecords,
    placeholderData: [], // Replace keepPreviousData with placeholderData
  });

  // Filter records based on search term
  const filteredRecords = Array.isArray(records)
    ? records.filter((record) =>
        Object.values(record)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : [];

  const handleReturnToActive = async (id: string | number) => {
    try {
      const formData = new FormData();
      if (currentRecord?.maintenance_complete_proof instanceof File) {
        formData.append(
          "maintenance_complete_proof",
          currentRecord.maintenance_complete_proof
        );
      }
      await toggleMaintenanceSchedulingStatus(Number(id), formData);
      refetch();
      setIsViewProofModalOpen(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(
          "Error returning to active:",
          error.response?.data || error.message || error
        );
      } else {
        console.error("Unexpected error:", error);
      }
    }
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

  // Pagination logic
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleRemove = async (id: string | number) => {
    try {
      await deleteMaintenanceScheduling(Number(id));
      refetch();
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  const handleSave = async (id: string | number, data: MaintenanceRecord) => {
    try {
      const maintenanceId = typeof id === "string" ? Number(id) : id;
      if (isNaN(maintenanceId)) throw new Error("Invalid ID");

      if (maintenanceId) {
        await updateMaintenanceScheduling(maintenanceId, data);
      } else {
        await createMaintenanceScheduling(data);
      }

      refetch();
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error saving record:", error);
    }
  };


  const handleProofSubmit = async (
    id: string | number,
    proofData: FormData
  ) => {
    try {
      const updatedRecord = await toggleMaintenanceSchedulingStatus(
        Number(id),
        proofData
      );
      refetch();
      setIsProofModalOpen(false);
    } catch (error) {
      console.error("Error submitting proof:", error);
    }
  };

  const handleViewProof = (record: MaintenanceRecord) => {
    setCurrentRecord(record);
    setIsViewProofModalOpen(true); // Open proof modal
  };

  return (
    <Layout>
      <Header title="Bus Maintenance Management" />
      <div className="options flex flex-col md:flex-row items-center p-4 w-full md:w-9/12 ml-1 space-y-4 md:space-y-0">
        {/* Active/Completed Toggle Buttons */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 md:space-x-2 w-full sm:w-auto">
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

        {/* Search Input */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full ml-2">
          <input
            type="text"
            placeholder="Find maintenance records"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-500 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          />

          {/* Add and View History Buttons */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-0 w-full sm:w-auto">
            <button
              className="flex items-center px-4 py-2 border-2 border-blue-500 rounded-md text-blue-500 transition-colors duration-300 ease-in-out hover:bg-blue-50 w-full sm:w-auto"
              onClick={() => setIsAddModalOpen(true)}
            >
              <FaPlus size={20} className="mr-2" />
              Add New
            </button>
            <button
              className="flex items-center px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 w-full sm:w-auto"
              onClick={handleOpenHistoryModal}
            >
              <FaHistory className="mr-2" />
              View History
            </button>
          </div>
        </div>
        {/* Render the modal if isHistoryModalOpen is true */}
        {isHistoryModalOpen && (
          <MaintenanceHistoryModal
            isOpen={isHistoryModalOpen} // Correct prop for modal visibility
            onClose={handleCloseHistoryModal} // Correct function to close the modal
            history={historyData}
          />
        )}
      </div>

      {/* Display Records */}
      <div className="records flex flex-col h-full">
        <div className="output grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-3 ml-5">
          {currentRecords.map((record) => (
            <div
              key={record.maintenance_scheduling_id}
              className="record-box-container mr-3 bg-white  border-gray-200 rounded-lg border-2 flex flex-col p-4 break-words text-sm relatives"
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
              <div className="left-4 right-4 flex justify-between space-x-2">
                {record.maintenance_status === "completed" ? (
                  <button
                    className="px-3 py-1.5 mt-3 bg-blue-500 text-white rounded hover:bg-blue-600 flex-1 sm:px-1 sm:py-2"
                    onClick={() => handleViewProof(record)}
                  >
                    View Completion Proof
                  </button>
                ) : (
                  <>
                    <button
                      className="px-3 py-1.5 mt-3 bg-blue-500 text-white rounded hover:bg-blue-600 flex-1 sm:px-1 sm:py-2"
                      onClick={() => {
                        setCurrentRecord(record);
                        setIsEditModalOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1.5 mt-3 bg-red-500 text-white rounded hover:bg-red-600 flex-1 sm:px-1 sm:py-2"
                      onClick={() =>
                        handleRemove(record.maintenance_scheduling_id)
                      }
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Component */}
      <div className="pagination-container mb-[46%]">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Modals */}
      <MaintenanceAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSave}
      />
      <MaintenanceEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        record={currentRecord}
        onSave={handleSave}
      />
      <CompletionProofModal
        isOpen={isProofModalOpen}
        onClose={() => setIsProofModalOpen(false)}
        record={currentRecord}
        onSubmit={handleProofSubmit}
      />
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
      <MaintenanceHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={filteredRecords} // Pass the records to the modal
      />
    </Layout>
  );
};

export default MaintenanceManagement;
