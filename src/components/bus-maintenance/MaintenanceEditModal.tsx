"use client";
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getAllVehicles } from "@/services/vehicleService";

const MaintenanceEditModal = ({ isOpen, onClose, record, onSave }) => {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState("");
  const [maintenanceCost, setMaintenanceCost] = useState("");
  const [maintenanceDate, setMaintenanceDate] = useState(new Date());
  const [maintenanceAddress, setMaintenanceAddress] = useState("");
  const [maintenanceType, setMaintenanceType] = useState("");
  const [mechanicCompany, setMechanicCompany] = useState("");
  const [mechanicCompanyAddress, setMechanicCompanyAddress] = useState("");
  const [status, setStatus] = useState("active");

  // Maintenance types list
  const maintenanceTypes = [
    "oil_change",
    "tire_rotation",
    "brake_inspection",
    "engine_check",
    "transmission_service",
  ];

  // Fetch vehicles when the modal opens
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const vehicleData = await getAllVehicles();
        setVehicles(vehicleData);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    };

    if (isOpen) fetchVehicles();
  }, [isOpen]);

  // Sync modal state with the `record` prop
  useEffect(() => {
    if (record) {
      setVehicleId(record.vehicle_id || "");
      setMaintenanceCost(record.maintenance_cost || "");
      setMaintenanceDate(new Date(record.maintenance_date || new Date()));
      setMaintenanceAddress(record.maintenance_address || "");
      setMaintenanceType(record.maintenance_type || "");
      setMechanicCompany(record.mechanic_company || "");
      setMechanicCompanyAddress(record.mechanic_company_address || "");
      setStatus(record.maintenance_status || "active");
    }
  }, [record]);

  const handleSubmit = async () => {
    // Validate required fields
    if (
      !maintenanceType ||
      !maintenanceCost ||
      !mechanicCompany ||
      !mechanicCompanyAddress
    ) {
      alert("Please fill in all required fields.");
      return;
    }
    
    const formattedDate = `${maintenanceDate.toLocaleDateString(
      "en-CA"
    )} ${new Date().toLocaleTimeString("en-GB", { hour12: false })}`;
    const updatedRecord = {
      vehicle_id: vehicleId,
      maintenance_cost: maintenanceCost,
      maintenance_date: formattedDate,
      maintenance_address: maintenanceAddress,
      maintenance_type: maintenanceType,
      mechanic_company: mechanicCompany,
      mechanic_company_address: mechanicCompanyAddress,
      maintenance_status: status,
    };
    await onSave(record?.maintenance_scheduling_id, updatedRecord);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[800px]">
        <h2 className="text-lg font-bold mb-4">Edit Maintenance Record</h2>
        
        <div className="form grid grid-cols-2 gap-6">
          {/* Vehicle Info Column */}
          <div className="space-y-5">
            <div className="col-span-1">
              <label
                htmlFor="vehicleId"
                className="block text-sm font-medium text-gray-700"
              >
                Vehicle
              </label>
              <select
                id="vehicleId"
                className="border border-gray-300 p-3 rounded-md w-full mt-1"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
              >
                <option value="">Select a vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                    {vehicle.plate_number} - {vehicle.vehicle_id}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <label
                htmlFor="maintenanceDate"
                className="block text-sm font-medium text-gray-700"
              >
                Maintenance Date
              </label>
              <DatePicker
                id="maintenanceDate"
                selected={maintenanceDate}
                onChange={(date: Date) => setMaintenanceDate(date)}
                className="border border-gray-300 p-3 rounded-md w-full mt-1"
                dateFormat="MM/dd/yyyy"
              />
            </div>

            <div className="col-span-1">
              <label
                htmlFor="maintenanceCost"
                className="block text-sm font-medium text-gray-700"
              >
                Maintenance Cost
              </label>
              <input
                id="maintenanceCost"
                placeholder="PHP"
                value={maintenanceCost}
                onChange={(e) => setMaintenanceCost(e.target.value)}
                className="border border-gray-300 p-3 rounded-md w-full mt-1"
              />
            </div>
          </div>

          {/* Maintenance Info Column */}
          <div className="space-y-5">
            <div className="col-span-1">
              <label
                htmlFor="maintenanceType"
                className="block text-sm font-medium text-gray-700"
              >
                Maintenance Type
              </label>
              <select
                id="maintenanceType"
                className="border border-gray-300 p-3 rounded-md w-full mt-1"
                value={maintenanceType}
                onChange={(e) => setMaintenanceType(e.target.value)}
              >
                <option value="">Select a maintenance type</option>
                {maintenanceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
                <option value="others">Others</option>
              </select>
            </div>

            <div className="col-span-1">
              <label
                htmlFor="mechanicCompany"
                className="block text-sm font-medium text-gray-700"
              >
                Mechanic Company
              </label>
              <input
                id="mechanicCompany"
                placeholder="Mechanic Company"
                value={mechanicCompany}
                onChange={(e) => setMechanicCompany(e.target.value)}
                className="border border-gray-300 p-3 rounded-md w-full mt-1"
              />
            </div>
            
            <div className="col-span-1">
              <label
                htmlFor="mechanicCompanyAddress"
                className="block text-sm font-medium text-gray-700"
              >
                Mechanic Company Address
              </label>
              <input
                id="mechanicCompanyAddress"
                placeholder="Mechanic Company Address"
                value={mechanicCompanyAddress}
                onChange={(e) => setMechanicCompanyAddress(e.target.value)}
                className="border border-gray-300 p-3 rounded-md w-full mt-1"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 mt-4">
          <button
            className={`px-6 py-3 ${
              maintenanceType &&
              maintenanceCost &&
              mechanicCompany &&
              mechanicCompanyAddress
                ? "bg-blue-500 text-white"
                : "bg-gray-300 text-gray-500"
            } rounded-md`}
            onClick={handleSubmit}
            disabled={
              !maintenanceType ||
              !maintenanceCost ||
              !mechanicCompany ||
              !mechanicCompanyAddress
            }
          >
            Save
          </button>
          <button
            className="px-6 py-3 border border-red-500 text-white rounded-md bg-red-500"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceEditModal;
