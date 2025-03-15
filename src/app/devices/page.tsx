"use client";

import React, { useState } from "react";
import Layout from "@/components/Layout";
import Header from "@/components/reusesables/header";
import Confirmpopup from "@/components/reusesables/confirm-popup";
import AddDeviceModal from "@/components/device/AddDeviceModal";
import Pagination from "@/components/reusesables/pagination";
import { FaPlus } from "react-icons/fa";
import DeviceRecord from "@/components/device/DeviceRecord";
import {
  getAllTrackerVehicleMappings,
  deleteTrackerVehicleMapping,
} from "@/services/deviceService";
import EditDeviceModal from "@/components/device/EditDeviceModal";
import { useQuery } from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Define the device type
interface Device {
  id: string | number;
  device_name: string;
  tracker_ident: string;
  vehicle_id?: string;
  status: string;
}

const DeviceManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Limit to 4 cards per page
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [deleteRecordId, setDeleteRecordId] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [toastKey, setToastKey] = React.useState(0);
  const toastId = React.useRef<string | number | null>(null);

  // Fetch devices using useQuery with loading and error states
  const { data: devices = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["devices"],
    queryFn: getAllTrackerVehicleMappings,
  });

  const filteredDevices = devices.filter((device) =>
    device.device_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);
  const paginatedDevices = filteredDevices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
      
      // Update toast to success
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
    }
  };

  const handleAddNewDevice = async () => {
    const operation = async () => {
      setIsAddModalOpen(false);
      await refetch();
    };

    await showToast(operation(), "Adding new device...", "Device created successfully!");
  };

  const handleDelete = (recordId: number) => {
    setDeleteRecordId(recordId);
    setIsDeletePopupOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteRecordId !== null) {
      const operation = async () => {
        await deleteTrackerVehicleMapping(deleteRecordId.toString());
        setDeleteRecordId(null);
        setIsDeletePopupOpen(false);
        await refetch();
      };

      await showToast(operation(), "Deleting device...", "Device deleted successfully!");
    }
  };

  const cancelDelete = () => {
    setDeleteRecordId(null);
    setIsDeletePopupOpen(false);
  };

  const handleEdit = (deviceId: number) => {
    setSelectedDeviceId(deviceId);
    setIsEditModalOpen(true);
  };

  const handleEditSave = async () => {
    const operation = async () => {
      setIsEditModalOpen(false);
      await refetch();
    };

    await showToast(operation(), "Updating device...", "Device updated successfully!");
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
      <section className="flex flex-row h-screen bg-white">
        <div className="w-full flex flex-col bg-slate-200">
          <Header title="Device Management" />
          <div className="content flex flex-col flex-1 p-3 overflow-y-auto">
            <div className="options flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-center mb-4">
              <input
                type="text"
                placeholder="Search Trackers"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-500 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
              />
              <button
                className="flex items-center justify-center px-4 py-2 border-2 border-blue-500 rounded-md text-blue-500 transition-colors duration-300 ease-in-out hover:bg-blue-50"
                onClick={() => setIsAddModalOpen(true)}
              >
                <FaPlus className="mr-2" /> Add New
              </button>
            </div>

            {isLoading ? (
              <div className="text-center text-blue-500 mt-10">Loading devices...</div>
            ) : isError ? (
              <div className="text-center text-red-500 mt-10">Error loading devices.</div>
            ) : filteredDevices.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">No devices found.</div>
            ) : (
              <>
                <div className="records grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {paginatedDevices.map((device) => (
                    <DeviceRecord
                      key={device.id}
                      deviceId={typeof device.id === "string" ? Number(device.id) : device.id}
                      deviceName={device.device_name}
                      serialNumber={device.tracker_ident}
                      busNumber={device.vehicle_id || "Unassigned"}
                      status={device.status}
                      onDelete={() => handleDelete(Number(device.id))}
                      onEdit={() => handleEdit(Number(device.id))}
                    />
                  ))}
                </div>

                <div className="mt-4 p-2">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <AddDeviceModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddNewDevice}
        />
        <EditDeviceModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          deviceId={selectedDeviceId}
          onSave={handleEditSave}
        />
        <Confirmpopup
          isOpen={isDeletePopupOpen}
          onConfirm={confirmDelete}
          onClose={cancelDelete}
          title="Delete Device"
          message="Are you sure you want to delete this tracker-to-vehicle mapping?"
        />
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
          containerId="device-management-toasts"
        />
      </section>
    </Layout>
  );
};

export default DeviceManagement;