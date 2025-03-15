"use client";
import React, { useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";

const MaintenanceHistoryModal = ({ isOpen, onClose, history }) => {
  useEffect(() => {
    if (history && history.length > 0) {
      console.log("History data is available.");
    } else {
      console.log("No history data.");
    }
  }, [history]);

  // Function to generate a PDF from the maintenance history table
  const downloadPDF = () => {
    console.log("Generating PDF...");
    const doc = new jsPDF();
    const tableColumn = [
      "Maintenance ID",
      "Maintenance Type",
      "Maintenance Date",
      "Maintenance Cost",
      "Vehicle ID",
      "Mechanic Company",
      "Mechanic Company Address",
      "Maintenance Status",
    ];
    const tableRows = [];

    history.forEach((record) => {
      const maintenanceDate = record.maintenance_date
        ? new Date(record.maintenance_date).toLocaleDateString()
        : "N/A";
      const row = [
        record.maintenance_scheduling_id || "N/A",
        record.maintenance_type || "N/A",
        maintenanceDate,
        record.maintenance_cost || "N/A",
        record.vehicle_id || "N/A",
        record.mechanic_company || "N/A",
        record.mechanic_company_address || "N/A",
        record.maintenance_status || "N/A",
      ];
      tableRows.push(row);
    });

    // Add title and table to the PDF
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Maintenance Record History", 14, 15);
    doc.setFont("helvetica", "normal");
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 10 },
    });
    doc.save("Maintenance_Record_History.pdf");

    console.log("PDF generated and saved.");
  };

  if (!isOpen) return null; //

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50"
      style={{ margin: 0, padding: 0, width: "100vw", height: "100vh" }}
    >
      <div className="bg-white w-full max-w-5xl p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Maintenance Record History</h2>
          <button
            className="text-gray-500 hover:text-red-500"
            onClick={onClose}
          >
            <FaTimes size={20} />
          </button>
        </div>
        {history && history.length > 0 ? (
          <div className="overflow-y-scroll max-h-96"> 
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b text-left text-gray-700 w-40">
                    Maintenance ID
                  </th>
                  <th className="px-4 py-2 border-b text-left text-gray-700 w-28">
                    Bus Number
                  </th>
                  <th className="px-4 py-2 border-b text-left text-gray-700 w-32">
                    Maintenance Type
                  </th>
                  <th className="px-4 py-2 border-b text-left text-gray-700 w-32">
                    Maintenance Date
                  </th>

                  <th className="px-4 py-2 border-b text-left text-gray-700 w-40">
                    Maintenance Cost
                  </th>
                  <th className="px-4 py-2 border-b text-left text-gray-700 w-28">
                    Mechanic Company
                  </th>
                  <th className="px-4 py-2 border-b text-left text-gray-700 w-28">
                    Mechanic Address
                  </th>
                  <th className="px-4 py-2 border-b text-left text-gray-700 w-28">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, index) => {
                  const maintenanceDate = record.maintenance_date
                    ? new Date(record.maintenance_date).toLocaleDateString()
                    : "N/A";
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border-b w-20">
                        {record.maintenance_scheduling_id || "N/A"}
                      </td>
                      <td className="px-4 py-2 border-b w-28">
                        {record.vehicle_id || "N/A"}
                      </td>
                      <td className="px-4 py-2 border-b w-32">
                        {record.maintenance_type || "N/A"}
                      </td>
                      <td className="px-4 py-2 border-b w-40">
                        {maintenanceDate}
                      </td>
                      <td className="px-4 py-2 border-b w-32">
                        {record.maintenance_cost || "N/A"}
                      </td>

                      <td className="px-4 py-2 border-b w-32">
                        {record.mechanic_company || "N/A"}
                      </td>
                      <td className="px-4 py-2 border-b w-40">
                        {record.mechanic_company_address || "N/A"}
                      </td>
                      <td className="px-4 py-2 border-b w-28">
                        {record.maintenance_status || "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No maintenance history available.</p>
        )}
        <div className="flex justify-end mt-4">
          <button
            onClick={downloadPDF}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceHistoryModal;
