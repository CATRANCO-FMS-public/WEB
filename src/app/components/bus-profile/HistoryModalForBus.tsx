"use client";
import React from "react";
import { FaTimes } from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";

const HistoryModalForBus = ({ isOpen, onClose, history = [] }) => {
  if (!isOpen) return null;

  // Function to generate a PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    const tableColumn = [
      "Bus Number",
      "Plate Number",
      "OR",
      "CR",
      "Driver Assigned",
      "PAO Assigned",
      "Date Purchased",
    ];
    const tableRows = [];

    history.forEach((record) => {
      const row = [
        record.busNumber || "N/A",
        record.plateNumber || "N/A",
        record.OR || "N/A",
        record.CR || "N/A",
        record.driverAssigned || "N/A",
        record.paoAssigned || "N/A",
        record.datePurchased || "N/A",
      ];
      tableRows.push(row);
    });

    // Add title and table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Bus Records History", 14, 15);
    doc.setFont("helvetica", "normal");
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 10 },
    });
    doc.save("Bus_Records_History.pdf");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-5xl p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Bus Records History</h2>
          <button
            className="text-gray-500 hover:text-red-500"
            onClick={onClose}
          >
            <FaTimes size={20} />
          </button>
        </div>
        {history && history.length > 0 ? (
            <div className="overflow-auto max-h-96"> 
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b text-left text-gray-700">
                    Bus Number
                  </th>
                  <th className="px-4 py-2 border-b text-left text-gray-700">
                    Plate Number
                  </th>
                  <th className="px-4 py-2 border-b text-left text-gray-700">
                    OR
                  </th>
                  <th className="px-4 py-2 border-b text-left text-gray-700">
                    CR
                  </th>
                  <th className="px-4 py-2 border-b text-left text-gray-700">
                    Driver Assigned
                  </th>
                  <th className="px-4 py-2 border-b text-left text-gray-700">
                    PAO Assigned
                  </th>
                  <th className="px-4 py-2 border-b text-left text-gray-700">
                    Date Purchased
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">
                      {record.busNumber || "N/A"}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {record.plateNumber || "N/A"}
                    </td>
                    <td className="px-4 py-2 border-b">{record.OR || "N/A"}</td>
                    <td className="px-4 py-2 border-b">{record.CR || "N/A"}</td>
                    <td className="px-4 py-2 border-b">
                      {record.driverAssigned || "N/A"}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {record.paoAssigned || "N/A"}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {record.datePurchased || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No history records available.</p>
        )}
        <div className="mt-4 flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={downloadPDF}
          >
            Download PDF
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryModalForBus;
