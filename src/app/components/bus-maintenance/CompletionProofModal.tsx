import React, { useState } from "react";

const CompletionProofModal = ({ isOpen, onClose, record, onSubmit }) => {
  const [proof, setProof] = useState(null);
  const [error, setError] = useState(null); // State to handle errors
  const [isSubmitting, setIsSubmitting] = useState(false); // State to manage loading state

  // Reset the state when the modal is opened or closed
  React.useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setProof(null);
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleProofChange = (e) => {
    setProof(e.target.files[0]);
    setError(null); // Clear error when a file is selected
  };

  const handleSubmit = async () => {
    if (!proof) {
      setError("Please upload proof to complete the maintenance.");
      return;
    }

    const formData = new FormData();
    formData.append("maintenance_complete_proof", proof);

    try {
      setIsSubmitting(true); // Set loading state
      await onSubmit(record.maintenance_scheduling_id, formData);
      setIsSubmitting(false); // Reset loading state after successful submission
      setProof(null); // Reset the proof state
    } catch (err) {
      setIsSubmitting(false);
      setError("Failed to submit proof. Please try again.");
      console.error("Error submitting proof:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Submit Proof for Completion</h2>
        <p className="mb-4">
          Upload proof to confirm the completion of this maintenance task.
        </p>
        <input
          type="file"
          accept="image/*"
          onChange={handleProofChange}
          className="mb-4"
        />
        {error && (
          <p className="text-red-500 text-sm mb-4">
            {error}
          </p>
        )}
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={onClose}
            disabled={isSubmitting} // Disable button while submitting
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded text-white ${
              isSubmitting ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"
            }`}
            onClick={handleSubmit}
            disabled={isSubmitting} // Disable button while submitting
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletionProofModal;
