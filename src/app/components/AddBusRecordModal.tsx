"use client";
import React, { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import AssignBusPersonnelModal from "../components/AssignBusPersonnelModal";
import { createVehicle } from "../services/vehicleService"; // Import the service

interface AddBusRecordModalProps {
  onClose: () => void;
  refreshData: () => void;
  onSubmit: (newBus: any) => void;
}

const AddBusRecordModal: React.FC<AddBusRecordModalProps> = ({
  onClose,
  refreshData,
  onSubmit, // Destructure the onSubmit prop
}) => {
  const [busNumber, setBusNumber] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [officialReceipt, setOfficialReceipt] = useState("");
  const [certificateOfRegistration, setCertificateOfRegistration] =
    useState("");
  const [engineNumber, setEngineNumber] = useState("");
  const [chasisNumber, setChasisNumber] = useState("");
  const [thirdPartyInsurance, setThirdPartyInsurance] = useState("");
  const [thirdPartyPolicyNo, setThirdPartyPolicyNo] = useState("");
  const [thirdPartyValidity, setThirdPartyValidity] = useState(new Date());
  const [comprehensiveInsurance, setComprehensiveInsurance] = useState("");
  const [comprehensiveValidity, setComprehensiveValidity] = useState(
    new Date()
  );
  const [route, setRoute] = useState("");
  const [datePurchased, setDatePurchased] = useState(new Date());
  const [supplier, setSupplier] = useState("");

  const [isSubmitted, setIsSubmitted] = useState(false); // Track submission state

  const formatDate = (date: Date | string) => {
    if (!date) return null;
    const parsedDate = new Date(date); // Convert string to Date object
    if (isNaN(parsedDate.getTime())) return null; // Check if the timestamp is NaN
    return parsedDate.toISOString().slice(0, 19).replace("T", " "); // Convert to 'YYYY-MM-DD HH:MM:SS'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const vehicleData = {
      vehicle_id: busNumber,
      plate_number: plateNumber,
      or_id: officialReceipt,
      cr_id: certificateOfRegistration,
      engine_number: engineNumber,
      chasis_number: chasisNumber,
      third_pli: thirdPartyInsurance,
      third_pli_policy_no: thirdPartyPolicyNo,
      third_pli_validity: formatDate(thirdPartyValidity),
      ci: comprehensiveInsurance,
      ci_validity: formatDate(comprehensiveValidity),
      date_purchased: formatDate(datePurchased),
      supplier: supplier,
      route: route,
    };

    try {
      // Send the vehicle data to the backend
      await createVehicle(vehicleData);

      // Call the onSubmit prop with the new bus data
      if (onSubmit) {
        onSubmit(vehicleData);
      }

      // Close the modal after submission instead of showing AssignBusPersonnelModal
      onClose();
      
      // No need to set isSubmitted to true anymore
      // The parent component will handle opening the AssignBusPersonnelModal
    } catch (error) {
      console.error("Error adding vehicle:", error);
    }
  };

  // Add function to check if form is valid
  const isFormValid = () => {
    return (
      busNumber.trim() !== "" &&
      plateNumber.trim() !== "" &&
      officialReceipt.trim() !== "" &&
      certificateOfRegistration.trim() !== "" &&
      engineNumber.trim() !== "" &&
      chasisNumber.trim() !== "" &&
      thirdPartyInsurance.trim() !== "" &&
      thirdPartyPolicyNo.trim() !== "" &&
      comprehensiveInsurance.trim() !== "" &&
      supplier.trim() !== "" &&
      route.trim() !== ""
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-2xl font-semibold">Add Bus Record</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mt-4">
          {/* Bus Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bus Number
            </label>
            <input
              type="text"
              value={busNumber}
              onChange={(e) => setBusNumber(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              placeholder="Bus Number"
              required
            />
          </div>

          {/* Official Receipt */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Official Receipt of Registration
            </label>
            <input
              type="text"
              value={officialReceipt}
              onChange={(e) => setOfficialReceipt(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              placeholder="OR #"
              required
            />
          </div>

          {/* Certificate of Registration */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Certificate of Registration
            </label>
            <input
              type="text"
              value={certificateOfRegistration}
              onChange={(e) => setCertificateOfRegistration(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              placeholder="CR #"
              required
            />
          </div>

          {/* Plate Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Plate Number
            </label>
            <input
              type="text"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              placeholder="Plate Number"
              required
            />
          </div>

          {/* Engine Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Engine Number
            </label>
            <input
              type="text"
              value={engineNumber}
              onChange={(e) => setEngineNumber(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              placeholder="Engine Number"
              required
            />
          </div>

          {/* Chasis Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Chasis Number
            </label>
            <input
              type="text"
              value={chasisNumber}
              onChange={(e) => setChasisNumber(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              placeholder="Chasis Number"
              required
            />
          </div>

          {/* Third Party Liability Insurance */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              3rd Party Liability Insurance
            </label>
            <input
              type="text"
              value={thirdPartyInsurance}
              onChange={(e) => setThirdPartyInsurance(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              placeholder="3rd Party Liability Insurance"
              required
            />
          </div>

          {/* 3rd Party Policy Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              3rd Party Liability Insurance Policy No.
            </label>
            <input
              type="text"
              value={thirdPartyPolicyNo}
              onChange={(e) => setThirdPartyPolicyNo(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              placeholder="Policy No."
              required
            />
          </div>

          {/* 3rd Party Liability Insurance Validity */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              3rd Party Liability Insurance Validity
            </label>
            <input
              type="date"
              value={thirdPartyValidity.toISOString().slice(0, 10)} // Format as YYYY-MM-DD
              onChange={(e) => setThirdPartyValidity(new Date(e.target.value))}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Comprehensive Insurance */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Comprehensive Insurance
            </label>
            <input
              type="text"
              value={comprehensiveInsurance}
              onChange={(e) => setComprehensiveInsurance(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              placeholder="Comprehensive Insurance"
              required
            />
          </div>

          {/* Comprehensive Insurance Validity */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Comprehensive Insurance Validity
            </label>
            <input
              type="date"
              value={comprehensiveValidity.toISOString().slice(0, 10)} // Format as YYYY-MM-DD
              onChange={(e) =>
                setComprehensiveValidity(new Date(e.target.value))
              }
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date Purchased */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date Purchased
            </label>
            <input
              type="date"
              value={datePurchased.toISOString().slice(0, 10)} // Format as YYYY-MM-DD
              onChange={(e) => setDatePurchased(new Date(e.target.value))}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Supplier */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Supplier
            </label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              placeholder="Supplier Name"
              required
            />
          </div>
          {/* Route */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Route
            </label>
            <select
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="" disabled>
                Select a Route
              </option>
              <option value="Canitoan">Canitoan</option>
              <option value="Silver Creek">Silver Creek</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="col-span-2 mt-4 flex justify-end">
            <button
              type="submit"
              disabled={!isFormValid()}
              className={`px-4 py-2 rounded-md ${
                isFormValid() 
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : "bg-blue-300 text-white cursor-not-allowed"
              }`}
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md ml-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBusRecordModal;
