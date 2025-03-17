"use client";
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import Header from "@/components/reusesables/header";
import Confirmpopup from "@/components/reusesables/confirm-popup";
import { FaSearch, FaPlus, FaHistory } from "react-icons/fa";
import BusRecord from "@/components/bus-profile/BusRecord";
import AddBusRecordModal from "@/components/bus-profile/AddBusRecordModal";
import AssignBusPersonnelModal from "@/components/bus-profile/AssignBusPersonnelModal";
import Pagination from "@/components/reusesables/pagination";
import { getAllVehicles, deleteVehicle } from "../../services/vehicleService";
import {
  getAllVehicleAssignments,
  deleteVehicleAssignment,
} from "../../services/vehicleAssignService";
import HistoryModalForBus from "@/components/bus-profile/HistoryModalForBus";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BusRecordDisplay = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);
  const [deleteAssignmentId, setDeleteAssignmentId] = useState<string | null>(
    null
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignPersonnelModalOpen, setIsAssignPersonnelModalOpen] =
    useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [busHistory, setBusHistory] = useState([]);
  const [toastKey, setToastKey] = React.useState(0);
  const toastId = React.useRef<string | number | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  interface BusRecordType {
    vehicle_id: string;
    plate_number: string;
    engine_number: string;
    chasis_number: string;
    or_id: string;
    cr_id: string;
    third_pli_policy_no: string;
    third_pli: string;
    ci: string;
    supplier: string;
    route: string | null;
    date_purchased: Date | string;
  }

  const { data: busRecords = [], isError: isVehiclesError, error: vehiclesError, isLoading: isVehiclesLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: getAllVehicles
  });

  const { data: vehicleAssignments = [], isError: isAssignmentsError, error: assignmentsError, isLoading: isAssignmentsLoading } = useQuery({
    queryKey: ['vehicleAssignments'],
    queryFn: getAllVehicleAssignments,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    }
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: deleteVehicleAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicleAssignments'] });
    }
  });

  const openHistoryModal = () => {
    const history = busRecords.map((record) => {
      const { driver, conductor } = getAssignedProfiles(record.vehicle_id);
      return {
        busNumber: record.vehicle_id,
        plateNumber: record.plate_number,
        OR: record.or_id,
        CR: record.cr_id,
        driverAssigned: driver,
        paoAssigned: conductor,
        datePurchased: record.date_purchased || "N/A",
      };
    });
    setBusHistory(history);
    setIsHistoryModalOpen(true);
  };

  const handleDelete = (recordId, assignmentId) => {
    setDeleteRecordId(recordId);
    setDeleteAssignmentId(assignmentId);
    setIsDeletePopupOpen(true);
  };

  const showToast = async (operation: Promise<any>, actionType: 'add' | 'edit' | 'delete' | 'assign') => {
    // Dismiss all existing toasts
    toast.dismiss();
    // Force remount toast container
    setToastKey(prev => prev + 1);
    
    // Show loading toast with appropriate message
    const loadingMessage = 
      actionType === 'add' ? "Adding new bus..." :
      actionType === 'edit' ? "Updating bus record..." :
      actionType === 'delete' ? "Deleting bus record..." :
      "Updating bus personnel assignment...";
    
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
      
      // Update toast to success with appropriate message
      const successMessage = 
        actionType === 'add' ? "New bus added successfully!" :
        actionType === 'edit' ? "Bus record updated successfully!" :
        actionType === 'delete' ? "Bus record deleted successfully!" :
        "Bus personnel assignment updated successfully!";
      
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
      // Update toast to error with appropriate message
      const errorMessage = 
        actionType === 'add' ? "Failed to add new bus." :
        actionType === 'edit' ? "Failed to update bus record." :
        actionType === 'delete' ? "Failed to delete bus record." :
        "Failed to update bus personnel assignment.";
      
      toast.update(toastId.current, {
        render: errorMessage + " Please try again.",
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

  const confirmDelete = async () => {
    if (deleteRecordId && deleteAssignmentId) {
      const operation = async () => {
        await Promise.all([
          deleteVehicleMutation.mutateAsync(deleteRecordId),
          deleteAssignmentMutation.mutateAsync(deleteAssignmentId)
        ]);
        setDeleteRecordId(null);
        setDeleteAssignmentId(null);
        setIsDeletePopupOpen(false);
      };

      await showToast(operation(), 'delete');
    }
  };

  const cancelDelete = () => {
    setDeleteRecordId(null);
    setIsDeletePopupOpen(false);
  };

  const handleAddNewBus = async (newBus: any) => {
    const operation = async () => {
      queryClient.setQueryData(['vehicles'], (old: any) => [...old, newBus]);
      setSelectedVehicleId(newBus.vehicle_id);
      setIsAddModalOpen(false);
      setIsAssignPersonnelModalOpen(true);
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    };

    await showToast(operation(), 'add');
  };

  const handleEditBus = async (updatedBus) => {
    const operation = async () => {
      queryClient.setQueryData(['vehicles'], (old: any[]) =>
        old.map((record) =>
          record.vehicle_id === updatedBus.vehicle_id ? {
            ...record,
            plate_number: updatedBus.plate_number || record.plate_number,
            or_id: updatedBus.or_id || record.or_id,
            cr_id: updatedBus.cr_id || record.cr_id,
            third_pli: updatedBus.third_pli || record.third_pli,
            ci: updatedBus.ci || record.ci,
            route: updatedBus.route || record.route
          } : record
        )
      );
      
      if (updatedBus.assignedDriver || updatedBus.assignedPAO) {
        await queryClient.invalidateQueries({ 
          queryKey: ['vehicleAssignments'],
          refetchType: 'active'
        });
        
        await queryClient.refetchQueries({ 
          queryKey: ['vehicleAssignments'],
          type: 'active'
        });
      }
      
      setIsEditModalOpen(false);
    };

    await showToast(operation(), 'edit');
  };

  const handleAddVehicleAssignment = async (newAssignment) => {
    const operation = async () => {
      setIsAssignPersonnelModalOpen(false);
      
      await queryClient.invalidateQueries({ 
        queryKey: ['vehicleAssignments'],
        refetchType: 'active',
        exact: true
      });
      
      await queryClient.refetchQueries({ 
        queryKey: ['vehicleAssignments'],
        exact: true,
        type: 'active'
      });
      
      setCurrentPage(prev => prev);
    };

    await showToast(operation(), 'assign');
  };

  const getAssignedProfiles = (vehicleId) => {
    const assignment = vehicleAssignments.find(
      (assignment) => assignment.vehicle_id === vehicleId
    );

    if (!assignment) {
      return { driver: "N/A", conductor: "N/A" };
    }

    const driver = assignment.user_profiles.find(
      (profile) => profile.position === "driver"
    );
    const conductor = assignment.user_profiles.find(
      (profile) => profile.position === "passenger_assistant_officer"
    );

    return {
      driver: driver ? `${driver.first_name} ${driver.last_name}` : "N/A",
      conductor: conductor
        ? `${conductor.first_name} ${conductor.last_name}`
        : "N/A",
    };
  };

  const filteredRecords = busRecords.filter((record) =>
    record.plate_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
        containerId="bus-profiles-toasts"
      />
      <Header title="Bus Profiles" />
      <div className="content flex flex-col flex-1 overflow-y-auto p-6 sm:p-12">
        <div className="options flex flex-col space-y-3 p-3 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-center">
          <div className="w-full sm:w-1/2 md:w-2/5 lg:w-1/3">
            <input
              type="text"
              placeholder="Find bus"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-500 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center px-4 py-2 border-2 border-blue-500 rounded-md text-blue-500 transition-colors duration-300 ease-in-out hover:bg-blue-50"
            >
              <FaPlus size={22} className="mr-2" />
              Add New
            </button>

            <button
              onClick={openHistoryModal}
              className="flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              <FaHistory size={22} className="mr-2" />
              View History
            </button>
          </div>
        </div>

        {isVehiclesLoading || isAssignmentsLoading ? (
          <div className="text-center text-blue-500 mt-10">Loading bus profiles...</div>
        ) : isVehiclesError || isAssignmentsError ? (
          <div className="text-center text-red-500 mt-10">Error loading bus profiles.</div>
        ) : busRecords.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">No bus profiles found.</div>
        ) : (
          <div className="records flex flex-col h-full">
            <div className="output grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-3">
              {paginatedRecords
                .filter(record => {
                  // Only include records that have complete assignment data
                  if (record.vehicle_id === selectedVehicleId) {
                    const assignment = vehicleAssignments.find(
                      a => a.vehicle_id === record.vehicle_id
                    );
                    const { driver, conductor } = getAssignedProfiles(record.vehicle_id);
                    
                    // Filter out the record if it's newly added and doesn't have complete data
                    return assignment && driver !== "N/A" && conductor !== "N/A" && !isAssignPersonnelModalOpen;
                  }
                  return true; // Keep all other records
                })
                .map((record: BusRecordType) => {
                  const assignment = vehicleAssignments.find(
                    (assignment) => assignment.vehicle_id === record.vehicle_id
                  );
                  const assignmentId = assignment ? assignment.vehicle_assignment_id : "";
                  const { driver, conductor } = getAssignedProfiles(record.vehicle_id);

                  return (
                    <BusRecord
                      key={record.vehicle_id}
                      vehicle_id={record.vehicle_id}
                      busNumber={record.vehicle_id}
                      ORNumber={record.or_id}
                      CRNumber={record.cr_id}
                      plateNumber={record.plate_number}
                      thirdLBI={record.third_pli}
                      ci={record.ci}
                      assignedDriver={driver}
                      assignedPAO={conductor}
                      route={record.route || "Not Assigned"}
                      assignmentId={assignmentId}
                      onDelete={() => handleDelete(record.vehicle_id, assignmentId)}
                      onUpdate={handleEditBus}
                    />
                  );
                })}
            </div>
            <div className="pagination-container p-4 mb-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        )}
      </div>
      {isDeletePopupOpen && (
        <Confirmpopup
          isOpen={isDeletePopupOpen}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title="Delete Profile"
          message="Are you sure you want to delete this profile?"
        />
      )}
      {isAddModalOpen && (
        <AddBusRecordModal
          onClose={() => setIsAddModalOpen(false)}
          refreshData={() => queryClient.invalidateQueries({ queryKey: ['vehicles'] })}
          onSubmit={(newBus) => {
            handleAddNewBus(newBus);
          }}
        />
      )}
      {isAssignPersonnelModalOpen && (
        <AssignBusPersonnelModal
          onClose={() => setIsAssignPersonnelModalOpen(false)}
          refreshData={() => {
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
          }}
          onAssign={(newAssignment) => {
            handleAddVehicleAssignment(newAssignment);
          }}
          vehicleId={selectedVehicleId}
          preSelectedVehicle={selectedVehicleId}
        />
      )}

      {isHistoryModalOpen && (
        <HistoryModalForBus
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          history={busHistory}
        />
      )}
    </Layout>
  );
};

export default BusRecordDisplay;