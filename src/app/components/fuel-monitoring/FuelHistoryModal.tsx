"use client";
import React, { useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";

const FuelHistoryModal = ({ isOpen, onClose, history }) => {
  useEffect(() => {
    if (history && history.length > 0) {
      console.log("History data is available.");
    } else {
      console.log("No history data.");
    }
  }, [history]);

  // Function to generate a PDF from the fuel record history table
  const downloadPDF = () => {
    console.log("Generating PDF...");
    const doc = new jsPDF();
    const tableColumn = [
      "Date",
      "Distance (KM)",
      "Fuel Type",
      "Fuel Price (PHP)",
      "Fuel Quantity (L)",
      "Total Amount (PHP)",
    ];
    const tableRows = [];

    history.forEach((record) => {
      const purchaseDate = record.purchase_date
        ? new Date(record.purchase_date).toLocaleDateString()
        : "N/A";

      // Format the fuel price and total expense with commas and "₱"
      const formatCurrency = (value) => {
        const number = parseFloat(
          value
            .toString()
            .replace(/[^\d.-]/g, "")
            .trim()
        );
        return "P " + number.toLocaleString(); // Format with commas and "₱" symbol
      };

      const fuelPrice = record.fuel_price
        ? formatCurrency(record.fuel_price)
        : "N/A";
      const fuelQuantity = record.fuel_liters_quantity || "N/A";
      const totalExpense = record.total_expense
        ? formatCurrency(record.total_expense)
        : "N/A";

      const row = [
        purchaseDate,
        record.odometer_km || "N/A",
        record.fuel_type || "N/A",
        fuelPrice, // Display fuel price with "₱" and commas
        fuelQuantity,
        totalExpense, // Display total expense with "₱" and commas
      ];

      tableRows.push(row);
    });

    // Add title and table to the PDF
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Fuel Record History", 14, 15);
    doc.setFont("helvetica", "normal");
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: {
        fontSize: 10,
        halign: "center",
      },
      columnStyles: {
        0: { halign: "center" },
        1: { halign: "center" },
        2: { halign: "center" },
        3: { halign: "center" },
        4: { halign: "center" },
        5: { halign: "center" },
      },
    });

    doc.save("Fuel_Record_History.pdf");

    console.log("PDF generated and saved.");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50"
      style={{ margin: 0, padding: 0, width: "100vw", height: "100vh" }}
    >
      <div className="bg-white w-full max-w-5xl p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Fuel Record History</h2>
          <button
            className="text-gray-500 hover:text-red-500"
            onClick={onClose}
          >
            <FaTimes size={20} />
          </button>
        </div>
        {history && history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg text-center">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b text-gray-700">Date</th>
                  <th className="px-4 py-2 border-b text-gray-700">
                    Distance (KM)
                  </th>
                  <th className="px-4 py-2 border-b text-gray-700">
                    Fuel Type
                  </th>
                  <th className="px-4 py-2 border-b text-gray-700">
                    Fuel Price (PHP)
                  </th>
                  <th className="px-4 py-2 border-b text-gray-700">
                    Fuel Quantity (L)
                  </th>
                  <th className="px-4 py-2 border-b text-gray-700">
                    Total Amount (PHP)
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, index) => {
                  const purchaseDate = record.purchase_date
                    ? new Date(record.purchase_date).toLocaleDateString()
                    : "N/A";
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border-b">{purchaseDate}</td>
                      <td className="px-4 py-2 border-b">
                        {record.odometer_km || "N/A"}
                      </td>
                      <td className="px-4 py-2 border-b">
                        {record.fuel_type || "N/A"}
                      </td>
                      <td className="px-4 py-2 border-b">
                        {record.fuel_price || "N/A"}
                      </td>
                      <td className="px-4 py-2 border-b">
                        {record.fuel_liters_quantity || "N/A"}
                      </td>
                      <td className="px-4 py-2 border-b">
                        {record.total_expense || "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No fuel record history available.</p>
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

export default FuelHistoryModal;
