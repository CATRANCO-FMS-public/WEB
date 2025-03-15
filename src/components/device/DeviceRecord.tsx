"use client";
import React from "react";
import { FaTrash, FaEdit } from "react-icons/fa";

const DeviceRecord = ({
  deviceId,
  deviceName,
  serialNumber,
  busNumber,
  status,
  onDelete,
  onEdit,
}) => {
  return (
    <div className="record-box-container -ml-1 bg-white  border-gray-200 rounded-lg border-2 flex flex-col p-4 break-words text-sm relative">
      {/* Table Content */}
      <table className="w-full overflow-x-auto border-collapse mb-16 ">
        <tbody>
          <tr>
            <td className="border p-2 font-bold">Device Name:</td>
            <td className="border p-2">{deviceName}</td>
          </tr>
          <tr>
            <td className="border p-2 font-bold">Device ID:</td>
            <td className="border p-2">{deviceId}</td>
          </tr>
          <tr>
            <td className="border p-2 font-bold">Serial Number:</td>
            <td className="border p-2">{serialNumber}</td>
          </tr>
          <tr>
            <td className="border p-2 font-bold">Bus Number:</td>
            <td className="border p-2">{busNumber}</td>
          </tr>
          <tr>
            <td className="border p-2 font-bold">Status:</td>
            <td className="border p-2">
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  status.toLowerCase() === "active"
                    ? "bg-green-100 text-green-700"
                    : status.toLowerCase() === "inactive"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {status}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Buttons */}
      <div className="absolute bottom-5 left-4 right-4 flex justify-between h-12 space-x-2">
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center space-x-2 flex-1"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
           <span>Remove</span>
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center space-x-2 flex-1"
          onClick={onEdit}
        >
           <span>Edit</span>
        </button>
      </div>
    </div>
  );
};

export default DeviceRecord;
