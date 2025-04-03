"use client";
import React, { useState, useRef, useEffect } from "react";
import Sidebar2 from "@/components/reusesables/sidebar-settings";
import Header from "@/components/reusesables/header";
import { FaCarCrash, FaCog, FaOilCan, FaTools, FaTruck } from "react-icons/fa";
import { getAllActiveMaintenanceScheduling } from "@/services/maintenanceService";

const DashboardHeader = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]); // State to store maintenance records

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch active maintenance records
  interface MaintenanceRecord {
    maintenance_scheduling_id: string; // Change to string
    maintenance_type: string;
    maintenance_date: string;
  }
  interface MaintenanceResponse {
    data: MaintenanceRecord[];
  }

  useEffect(() => {
    const fetchActiveMaintenance = async () => {
      try {
        const response: MaintenanceResponse =
          await getAllActiveMaintenanceScheduling();
        // Ensure we access the 'data' field correctly
        setMaintenanceRecords(response.data || []);
      } catch (error) {
        console.error("Error fetching active maintenance records:", error);
      }
    };

    fetchActiveMaintenance();
  }, []);

  // Map maintenance types to icons
  const maintenanceIcons = {
    oil_change: <FaOilCan size={60} className="text-blue-500" />,
    tire_rotation: <FaTruck size={60} className="text-green-500" />,
    brake_inspection: <FaCarCrash size={60} className="text-red-500" />,
    engine_check: <FaCog size={60} className="text-yellow-500" />,
    transmission_service: <FaTools size={60} className="text-purple-500" />,
  };

  return (
    <section className="h-screen flex flex-row bg-white">
      <Sidebar2 />

      <section className="right w-full bg-slate-200 overflow-y-hidden">
        <Header title="Notifications" />

        <div className="content flex flex-col h-full">
          <div className="Notifications mt-10">
            <h1 className="text-violet-700 text-xl ml-32 font-normal">
              Active Maintenance Records
            </h1>
            <div className="output flex mt-8 items-center justify-center">
              <div className="locations w-5/6 bg-white h-160 rounded-lg border-2 border-gray-200">
                {maintenanceRecords.length > 0 ? (
                  maintenanceRecords.map((record) => (
                    <div
                      key={record.maintenance_scheduling_id}
                      className="notifs w-auto m-4 h-24 border-gray-200 rounded-lg border-2 flex items-center"
                    >
                      <div className="logo ml-4">
                        {maintenanceIcons[record.maintenance_type] || (
                          <FaTools size={60} className="text-gray-500" />
                        )}
                      </div>
                      <div className="title ml-4">
                        <h1 className="type-notif text-violet-700 font-semibold">
                          Bus {record.maintenance_scheduling_id} Maintenance
                        </h1>
                        <p className="description-notif text-gray-700">
                          {record.maintenance_type
                            .replace(/_/g, " ")
                            .toUpperCase()}
                        </p>
                      </div>
                      <div className="date-notif ml-auto mr-10">
                        <div className="date-description">
                          <h1 className="title font-semibold">Date</h1>
                          <p className="date">
                            {record.maintenance_date || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-gray-500">
                      No active maintenance records found.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default DashboardHeader;
