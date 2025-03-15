// EditModal.tsx
import React from "react";
import Modal from "react-modal"; // Ensure you have react-modal installed
import { FaTimes } from "react-icons/fa";

// Ensure you set the app element for accessibility
Modal.setAppElement("#yourAppElementId");

interface EditModalProps {
  isOpen: boolean;
  formData: any; // Use a more specific type if possible
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, formData, onChange, onClose, onSubmit }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={true}
      className="modal"
      overlayClassName="overlay"
    >
      <div className="modal-content">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
        <button onClick={onClose} className="absolute top-4 right-4">
          <FaTimes size={20} />
        </button>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}>
          <div className="flex flex-col space-y-4">
            <input
              type="text"
              name="first_name"
              value={formData.first_name || ""}
              onChange={onChange}
              placeholder="First Name"
              className="border border-gray-300 rounded p-2"
              required
            />
            <input
              type="text"
              name="last_name"
              value={formData.last_name || ""}
              onChange={onChange}
              placeholder="Last Name"
              className="border border-gray-300 rounded p-2"
              required
            />
            <input
              type="text"
              name="license_number"
              value={formData.license_number || ""}
              onChange={onChange}
              placeholder="License Number"
              className="border border-gray-300 rounded p-2"
              required
            />
            <input
              type="text"
              name="address"
              value={formData.address || ""}
              onChange={onChange}
              placeholder="Address"
              className="border border-gray-300 rounded p-2"
              required
            />
            <input
              type="text"
              name="contact_number"
              value={formData.contact_number || ""}
              onChange={onChange}
              placeholder="Contact Number"
              className="border border-gray-300 rounded p-2"
              required
            />
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth || ""}
              onChange={onChange}
              placeholder="Date of Birth"
              className="border border-gray-300 rounded p-2"
              required
            />
          </div>
          <div className="flex justify-end mt-4">
            <button type="button" onClick={onClose} className="mr-2 px-4 py-2 border border-gray-300 rounded">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
              Update
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditModal;