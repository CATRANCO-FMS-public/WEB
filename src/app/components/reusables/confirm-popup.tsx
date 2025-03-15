import React from "react";

interface ConfirmpopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const Confirmpopup: React.FC<ConfirmpopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  if (!isOpen) return null;

  const handleCancel = () => {
    console.log("Cancel button clicked");
    onClose();
  };

  const handleConfirm = () => {
    console.log("Confirm button clicked");
    onConfirm();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>{" "}
        {/* Use title prop */}
        <p className="mb-4">{message}</p> {/* Display the message prop */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default Confirmpopup;
