"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useRouter } from "next/navigation";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { FaBus } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

import { groupByTimeInterval } from "../../helper/fuel-helper";

import Layout from "@/components/Layout";
import Header from "@/components/reusesables/header";
import Pagination from "@/components/reusesables/pagination";

import { fetchAllFuelLogs } from "@/services/fuellogsService";
import { getAllVehicles } from "@/services/vehicleService";
import { getAllMaintenanceScheduling } from "@/services/maintenanceService";

const FuelMonitoring = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [timeInterval, setTimeInterval] = useState("daily");
  const [selectedBus, setSelectedBus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 3; // Number of buses to display per page

  const {
    data: fuelLogs = [],
    error: fuelError,
  } = useQuery({ queryKey: ["fuelLogs"], queryFn: fetchAllFuelLogs });

  const {
    data: vehicles = [],
    error: vehicleError,
  } = useQuery({ queryKey: ["vehicles"], queryFn: getAllVehicles });

  const {
    data: maintenanceSchedules = [],
    error: maintenanceError,
  } = useQuery({
    queryKey: ["maintenanceSchedules"],
    queryFn: getAllMaintenanceScheduling,
  });

  React.useEffect(() => {
    if (vehicles.length > 0) {
      setSelectedBus(vehicles[0].vehicle_id);
    }
  }, [vehicles]);

  if (fuelError || vehicleError || maintenanceError) {
    return <div className="text-red-500">Failed to load data. Please try again.</div>;
  }

  // Generate chart data based on time interval and selected bus
  const chartData = {
    daily: groupByTimeInterval(
      fuelLogs.filter((log) => log.vehicle_id === selectedBus),
      "daily"
    ),

    weekly: groupByTimeInterval(
      fuelLogs.filter((log) => log.vehicle_id === selectedBus),
      "weekly"
    ),
    monthly: groupByTimeInterval(
      fuelLogs.filter((log) => log.vehicle_id === selectedBus),
      "monthly"
    ),
    yearly: groupByTimeInterval(
      fuelLogs.filter((log) => log.vehicle_id === selectedBus),
      "yearly"
    ),
  };

  const currentData = chartData[timeInterval] || chartData.daily;

  const data = {
    labels: currentData.map((entry) => entry.label), // Labels based on time interval
    datasets: [
      {
        label: "Distance (KM)",
        data: currentData.map((entry) => entry.distance), // Distance data
        borderColor: "red", // Red color for distance
        backgroundColor: "rgba(255, 99, 132, 0.2)", // Light red background for distance
      },
      {
        label: "Liters Used (L)",
        data: currentData.map((entry) => entry.liters), // Liters data
        borderColor: "blue", // Blue color for liters
        backgroundColor: "rgba(54, 162, 235, 0.2)", // Light blue background for liters
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          maxRotation: 45, // Adjust the rotation
          minRotation: 0,
        },
      },
    },
    plugins: {
      tooltip: {
        enabled: true, // Enable tooltips
        mode: "index" as const, // Change 'index' to 'index' as a constant type
        intersect: false, // Show tooltip when hovering over any point in the dataset
        callbacks: {
          title: (tooltipItem) => {
            // Display the label (date, day, or period) as the title of the tooltip
            return tooltipItem[0].label;
          },
          label: (tooltipItem) => {
            // Get the dataset label and value for the tooltip (Distance and Liters)
            const datasetIndex = tooltipItem.datasetIndex;
            const data = tooltipItem.raw;
            if (datasetIndex === 0) {
              // Distance (KM) dataset
              return `Distance: ${data} KM`;
            } else if (datasetIndex === 1) {
              // Liters Used (L) dataset
              return `Liters: ${data} L`;
            }
          },
        },
      },
    },
  };

  const totalPages = Math.ceil(vehicles.length / itemsPerPage);

  const displayedBuses = vehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleBusClick = (busId) => {
    setSelectedBus(busId);
  };
  const chartWidth = Math.max(1000, currentData.length * 50);
  const navigateToViewRecord = () => {
    const maintenance = maintenanceSchedules.find(
      (schedule) =>
        schedule.vehicle_id === selectedBus &&
        schedule.maintenance_status === "active"
    );
    const status = maintenance ? "Maintenance" : "On Operation";
    router.push(
      `/fuel-monitoring/view-record?bus=${selectedBus}&status=${encodeURIComponent(
        status
      )}`
    );
  };

  const handlePrint = async () => {
    const chartElement = document.querySelector(
      ".chart-container"
    ) as HTMLElement | null;
    if (!chartElement) return; // Early return if chartElement is not found

    try {
      // Ensure chartElement is treated as an HTMLElement
      const canvas = await html2canvas(chartElement as HTMLElement);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
      pdf.save(`fuel-monitoring-bus-${selectedBus}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
    }
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <Layout>
      <Header title="Fuel Monitoring" />
      <section className="p-6 sm:p-12">
        <div className="flex justify-center items-center w-full">
          <div className="relative w-full">
            <div className="relative chart-container w-full h-[300px] sm:h-[400px] md:h-[500px] bg-white p-2 sm:p-4 rounded-lg shadow-lg">
              <div className="absolute inset-0 flex justify-center items-center opacity-10 z-0">
                <span className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-500">
                  {selectedBus ? `Bus ${selectedBus}` : "Loading..."}
                </span>
              </div>
              <Line
                data={data}
                options={options}
                className="relative z-10"
                height={300}
              />
            </div>
          </div>
        </div>

        <div className="chart-options w-full mx-auto mt-3 space-y-3 sm:space-y-0 sm:flex sm:flex-row sm:justify-between sm:items-center">
          <div className="time-intervals grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full sm:w-auto">
            {["daily", "weekly", "monthly", "yearly"].map((interval) => (
              <button
                key={interval}
                className={`px-2 py-1 text-sm sm:text-base rounded ${
                  timeInterval === interval
                    ? "bg-blue-500 text-white"
                    : "bg-gray-500 text-white"
                }`}
                onClick={() => setTimeInterval(interval)}
              >
                {interval.charAt(0).toUpperCase() + interval.slice(1)}
              </button>
            ))}
          </div>

          <div className="right-btns flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <button
              onClick={navigateToViewRecord}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm sm:text-base"
              disabled={!selectedBus}
            >
              View Record
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm sm:text-base"
            >
              Print Chart as PDF
            </button>
          </div>
        </div>

        <div className="buses mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full mx-auto">
          {displayedBuses.map((bus) => {
            const maintenance = maintenanceSchedules.find(
              (schedule) =>
                schedule.vehicle_id === bus.vehicle_id &&
                schedule.maintenance_status === "active"
            );

            const bgColor = maintenance ? "bg-yellow-400" : "bg-green-400";
            const textColor = maintenance ? "text-black" : "text-white";

            return (
              <div
                key={bus.vehicle_id}
                className={`flex flex-col p-3 sm:p-4 rounded-lg shadow cursor-pointer ${bgColor} ${
                  selectedBus === bus.vehicle_id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => handleBusClick(bus.vehicle_id)}
              >
                <div className="flex items-center space-x-2">
                  <FaBus size={20} className="sm:text-2xl" />
                  <span className={`font-bold text-sm sm:text-base ${textColor}`}>
                    Bus {bus.vehicle_id} - {bus.plate_number}
                  </span>
                </div>
                <span className={`mt-1 text-xs sm:text-sm ${textColor}`}>
                  {maintenance
                    ? `${maintenance.maintenance_type} Scheduled`
                    : "On Operation"}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 sm:mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </section>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-sm sm:text-base text-gray-600">Loading data...</p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default FuelMonitoring;
