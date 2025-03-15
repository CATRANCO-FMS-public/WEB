"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "../components/Layout";
import Header from "../components/reusables/header";
import Confirmpopup from "../components/reusables/confirm-popup";
import FeedbackRecord from "../components/feedback/FeedbackRecord";
import { fetchAllFuelLogs } from "../services/feedbackService";
import Pagination from "../components/reusables/pagination";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface FeedbackRecord {
  feedback_logs_id: string;
  phone_number: string;
  rating: number;
  comments: string;
  created_at: string;
}

const FeedbackRecordDisplay = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);
  const [toastKey, setToastKey] = React.useState(0);
  const toastId = React.useRef<string | number | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["feedbackRecords"],
    queryFn: fetchAllFuelLogs,
  });

  const feedbackRecords: FeedbackRecord[] = data?.data || [];

  const showToast = async (operation: Promise<any>, loadingMessage: string) => {
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
        render: "Operation completed successfully!",
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
        render: error.response?.data?.message || "Operation failed. Please try again.",
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
      throw error;
    }
  };

  const handleDelete = (recordId: string) => {
    setDeleteRecordId(recordId);
    setIsDeletePopupOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteRecordId) {
      const operation = async () => {
        feedbackRecords.splice(
          feedbackRecords.findIndex(
            (record) => record.feedback_logs_id === deleteRecordId
          ),
          1
        );
        setDeleteRecordId(null);
        setIsDeletePopupOpen(false);
      };

      await showToast(operation(), "Deleting feedback record...");
    }
  };

  const cancelDelete = () => {
    setDeleteRecordId(null);
    setIsDeletePopupOpen(false);
  };

  const filteredRecords = feedbackRecords.filter((record) =>
    record.comments?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.phone_number?.includes(searchTerm)
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
      <Header title="Feedback Records" />
      <div className="content flex flex-col flex-1 mb-3">
        <div className="options flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 p-4 w-full sm:w-9/12 ml-1">
          <input
            type="text"
            placeholder="Search by phone number or comment"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-500 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          />
        </div>
        {isLoading ? (
          <div className="text-center text-blue-500 mt-10">Loading feedback...</div>
        ) : isError ? (
          <div className="text-center text-red-500 mt-10">Error loading feedback records.</div>
        ) : feedbackRecords.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">No feedback records found.</div>
        ) : (
          <div className="records flex flex-col h-full">
            <div className="output grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-3 ml-5">
              {paginatedRecords.map((record) => (
                <FeedbackRecord
                  key={record.feedback_logs_id}
                  phoneNumber={record.phone_number || "N/A"}
                  rating={record.rating || 0}
                  comment={record.comments || "No comments available"}
                  date={new Date(record.created_at).toLocaleString()}
                  onDelete={() => handleDelete(record.feedback_logs_id)}
                />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
      <Confirmpopup
        isOpen={isDeletePopupOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Feedback"
        message="Are you sure you want to delete this feedback?"
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
        containerId="feedback-toasts"
      />
    </Layout>
  );
};

export default FeedbackRecordDisplay;