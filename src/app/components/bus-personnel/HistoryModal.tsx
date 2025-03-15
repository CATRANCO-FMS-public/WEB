"use client";
import React from "react";
import { FaTimes } from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";

const HistoryModal = ({ isOpen, onClose, history }) => {
  if (!isOpen) return null;

  // Function to generate a PDF from the history table
  // Function to generate a PDF from the history table
  const downloadPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Name", "Position", "Date Hired", "Status"];
    const tableRows = [];

    history.forEach((record) => {
      const fullName = `${record.details || "N/A"}`; // Use record.details directly
      const row = [
        fullName,
        record.position || "N/A",
        record.date_hired || "N/A",
        record.status || "N/A",
      ];
      tableRows.push(row);
    });

    // Add title and table to the PDF
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Personnel Record History", 14, 15);
    doc.setFont("helvetica", "normal");
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 10 },
    });
    doc.save("Personnel_Record_History.pdf");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-5xl p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Personnel Record History</h2>
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
                    Name
                  </th>
                  <th className="px-4 py-2 border-b text-left text-gray-700">
                    Position
                  </th>
                  <th className="px-4 py-2 border-b text-left text-gray-700">
                    Date Hired
                  </th>
                  <th className="px-4 py-2 border-b text-left text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">
                      {record.details || "N/A"}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {record.position || "N/A"}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {record.date_hired || "N/A"}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {record.status || "N/A"}
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
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
