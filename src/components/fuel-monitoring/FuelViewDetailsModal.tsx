import React from "react";
import { FaBus } from "react-icons/fa";

interface FuelViewData {
  purchase_date?: string;
  odometer_km?: string;
  fuel_price?: string;
  fuel_type?: string;
  fuel_liters_quantity?: string;
  total_expense?: string;
  odometer_distance_proof?: string | null;
  fuel_receipt_proof?: string | null;
}

const FuelViewDetailsModal = ({
  selectedBus,
  viewData = {}, // Default value is an empty object
  onClose = () => {},
}: {
  selectedBus: string;
  viewData: FuelViewData;
  onClose: () => void;
}) => {
  const {
    purchase_date = "N/A",
    odometer_km = "N/A",
    fuel_price = "N/A",
    fuel_type = "N/A",
    fuel_liters_quantity = "N/A",
    total_expense,
    odometer_distance_proof = null,
    fuel_receipt_proof = null,
  } = viewData;

  const BASE_URL =
    process.env.NEXT_PUBLIC_STORAGE_URL ||
    "http://catranco.jwisnetwork.com/storage/";

  const calculatedTotalExpense =
    total_expense ||
    (!isNaN(parseFloat(fuel_price)) && !isNaN(parseFloat(fuel_liters_quantity))
      ? (parseFloat(fuel_price) * parseFloat(fuel_liters_quantity)).toFixed(2)
      : "N/A");

  const formatDate = (date) => {
    if (!date || date === "N/A") return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderImage = (imagePath, altText) => {
    if (!imagePath) {
      return (
        <div className="w-full border border-gray-300 p-2 rounded bg-gray-100 text-center text-gray-500">
          No Image Available
        </div>
      );
    }

    const fullUrl = `${BASE_URL}${imagePath.replace(/^\/+/, "")}`;
    console.log("Rendering image from URL:", fullUrl);
    return (
      <img
        src={fullUrl}
        alt={altText}
        className="w-full h-auto max-h-48 border border-gray-300 p-2 rounded object-contain"
        onError={(e) => {
          const target = e.target as HTMLImageElement; // Type assertion
          console.error(`Failed to load image from URL: ${fullUrl}`);
          target.src = "/placeholder-image.png"; // Fallback image
          target.alt = "Placeholder image"; // Set alt text
        }}
      />
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-5/6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-6">
          <FaBus size={32} className="mr-3" />
          <span className="text-xl font-bold">BUS {selectedBus}</span>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row md:space-x-6">
          {/* Left Section */}
          <div className="w-full md:w-1/2">
            <InfoItem label="Date" value={formatDate(purchase_date)} />
            <InfoItem label="Odometer (KM)" value={odometer_km} />
            <InfoItem label="Fuel Type" value={fuel_type} />
            <InfoItem label="Fuel Price (PHP)" value={fuel_price} />
            <InfoItem label="Fuel Quantity (L)" value={fuel_liters_quantity} />
          </div>

          {/* Right Section */}
          <div className="w-full md:w-1/2">
            <InfoItem
              label="Total Expense (PHP)"
              value={calculatedTotalExpense}
            />
            <div className="mb-4">
              <label className="block font-medium">Odometer Proof</label>
              {renderImage(
                odometer_distance_proof,
                `Odometer proof for Bus ${selectedBus}`
              )}
            </div>
            <div className="mb-4">
              <label className="block font-medium">Fuel Receipt Proof</label>
              {renderImage(
                fuel_receipt_proof,
                `Fuel receipt proof for Bus ${selectedBus}`
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none"
            aria-label="Close modal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div className="mb-4">
    <label className="block font-medium">{label}</label>
    <p className="border border-gray-300 p-2 rounded bg-gray-100">{value}</p>
  </div>
);

export default FuelViewDetailsModal;
