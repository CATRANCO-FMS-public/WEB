import React, { useState, useEffect, useRef } from "react";
import { FaBus } from "react-icons/fa";
import { createFuelLog } from "@/app/services/fuellogsService";
import { toast } from "react-toastify";


const FuelAddModal = ({ selectedBus, onClose, onAdd }) => {
  const formRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [odometerError, setOdometerError] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    odometerKM: "",
    fuelType: "",
    fuelPrice: "",
    fuel_liters_quantity: "",
    total_expense: "",
    odometerProof: null,
    fuelReceiptProof: null,
  });

  useEffect(() => {
    if (formData.fuelPrice && formData.fuel_liters_quantity) {
      const price = parseFloat(formData.fuelPrice) || 0;
      const quantity = parseFloat(formData.fuel_liters_quantity) || 0;
      setFormData((prevData) => ({
        ...prevData,
        total_expense: (price * quantity).toFixed(2),
      }));
    }
  }, [formData.fuelPrice, formData.fuel_liters_quantity]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    setFormData((prev) => ({
      ...prev,
      [name]: file,
    }));
  };

  const handleSubmit = async () => {
    if (formRef.current && formRef.current.reportValidity()) {
      setIsSubmitting(true);
      setValidationErrors({});
      setApiError("");
      setOdometerError(null);
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("purchase_date", formData.date);
      formDataToSubmit.append("odometer_km", formData.odometerKM);
      formDataToSubmit.append(
        "fuel_liters_quantity",
        formData.fuel_liters_quantity
      );
      formDataToSubmit.append("fuel_price", formData.fuelPrice);
      formDataToSubmit.append("fuel_type", formData.fuelType);
      formDataToSubmit.append("vehicle_id", selectedBus);
      if (formData.odometerProof) {
        formDataToSubmit.append(
          "odometer_distance_proof",
          formData.odometerProof
        );
      }
      if (formData.fuelReceiptProof) {
        formDataToSubmit.append(
          "fuel_receipt_proof",
          formData.fuelReceiptProof
        );
      }

      try {
        const response = await createFuelLog(formDataToSubmit);
        console.log("Fuel log created:", response);
        onAdd(response);
        onClose();
        toast.success("New fuel log added successfully!");
      } catch (error) {
        console.error("Failed to create fuel log:", error);
        
        if (error?.response?.data?.previous_odometer) {
          setOdometerError({
            message: error.response.data.message,
            previous: error.response.data.previous_odometer,
            current: error.response.data.current_odometer
          });
        } else {
          setApiError(
            error?.response?.data?.message || 
            error.message || 
            "An error occurred while adding the fuel log"
          );
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Check if all required fields are filled
  const areAllFieldsFilled = () => {
    return (
      formData.date &&
      formData.odometerKM &&
      formData.fuelType &&
      formData.fuelPrice &&
      formData.fuel_liters_quantity
    );
  };

  // Helper function to show validation error
  const getErrorMessage = (fieldName) => {
    return validationErrors[fieldName] ? (
      <span className="text-red-500 text-sm mt-1">
        {validationErrors[fieldName]}
      </span>
    ) : null;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-5/6 max-w-4xl">
        <div className="flex items-center mb-6">
          <FaBus size={32} className="mr-3" />
          <span className="text-xl font-bold">BUS {selectedBus}</span>
        </div>
        
        {apiError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{apiError}</span>
          </div>
        )}

        <form ref={formRef} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Section */}
            <div>
              <label className="block font-medium">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full border ${
                  validationErrors.date ? 'border-red-500' : 'border-gray-300'
                } p-2 rounded`}
                required
              />
              {getErrorMessage('date')}

              <label className="block font-medium mt-4">
                Odometer (KM)
              </label>
              <input
                type="number"
                name="odometerKM"
                value={formData.odometerKM}
                onChange={handleChange}
                className={`w-full border ${
                  odometerError ? 'border-red-500' : 'border-gray-300'
                } p-2 rounded`}
                required
              />
              {odometerError && (
                <div className="text-red-500 text-sm mt-1">
                  <p>{odometerError.message}</p>
                  <p className="mt-1">
                    Previous reading: {odometerError.previous} km
                    <br />
                    Your input: {odometerError.current} km
                  </p>
                </div>
              )}

              <label className="block font-medium mt-4">Fuel Type</label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                required
              >
                <option value="">Select Fuel Type</option>
                <option value="unleaded">Unleaded</option>
                <option value="premium">Premium</option>
                <option value="diesel">Diesel</option>
              </select>
              {getErrorMessage('fuel_type')}

              <label className="block font-medium mt-4">Fuel Price (PHP)</label>
              <input
                type="number"
                name="fuelPrice"
                value={formData.fuelPrice}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                required
              />
              {getErrorMessage('fuel_price')}

              <label className="block font-medium mt-4">
                Fuel Quantity (L)
              </label>
              <input
                type="number"
                name="fuel_liters_quantity"
                value={formData.fuel_liters_quantity}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                required
              />
              {getErrorMessage('fuel_liters_quantity')}
            </div>
            {/* Right Section */}
            <div>
              <label className="block font-medium">Total Expense (PHP)</label>
              <input
                type="number"
                name="total_expense"
                value={formData.total_expense}
                disabled
                className="w-full border border-gray-300 p-2 rounded"
              />
              <label className="block font-medium mt-4">
                Distance (Odometer) Proof
              </label>
              <input
                type="file"
                name="odometerProof"
                onChange={handleFileChange}
                className="w-full border border-gray-300 p-2 rounded"
                accept="image/*"
              />
              <label className="block font-medium mt-4">
                Fuel Receipt Proof
              </label>
              <input
                type="file"
                name="fuelReceiptProof"
                onChange={handleFileChange}
                className="w-full border border-gray-300 p-2 rounded"
                accept="image/*"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !areAllFieldsFilled()}
              className="px-5 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Adding..." : "Add"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2 bg-red-500 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FuelAddModal;
