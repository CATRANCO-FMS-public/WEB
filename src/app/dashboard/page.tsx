"use client";

import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Header from "../components/reusesables/header";
import { FaBus, FaCog, FaUsers } from "react-icons/fa";
import { getAllVehicles } from "@/app/services/vehicleService";
import { getAllActiveMaintenanceScheduling } from "../services/maintenanceService";
import { getAllProfiles } from "@/app/services/userProfile";
import { MapProvider } from "@/providers/MapProvider";
import Pusher from "pusher-js";
import Echo from "laravel-echo";
import DispatchMap from "../components/reusesables/dispatch-map";
import { useQuery } from "@tanstack/react-query";

interface BusData {
  number: string;
  name: string;
  status: string;
  latitude: number;
  longitude: number;
  time: string;
  speed: number;
  driver: string;
  conductor: string;
  plateNumber: string;
}

interface MaintenanceRecord {
  id: string;
  busNumber: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
}

const DashboardHeader: React.FC = () => {
  const [busData, setBusData] = useState<BusData[]>([]);
  const [selectedBusDetails, setSelectedBusDetails] = useState<BusData | null>(null);
  const [pathData, setPathData] = useState<{ [busNumber: string]: { lat: number; lng: number }[] }>({});

  // Replace direct API calls with React Query
  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: getAllVehicles
  });

  const { data: maintenance } = useQuery({
    queryKey: ['maintenance'],
    queryFn: getAllActiveMaintenanceScheduling
  });

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: getAllProfiles
  });

  const busesInOperation = vehicles?.length ?? 0;
  const busesInMaintenance = maintenance?.data?.length ?? 0;
  const currentEmployees = profiles?.length ?? 0;

  // Real-Time Data Integration
  useEffect(() => {
    const echo = new Echo({
      broadcaster: "pusher",
      client: new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
        wsHost: process.env.NEXT_PUBLIC_PUSHER_HOST || undefined,
        wsPort: process.env.NEXT_PUBLIC_PUSHER_PORT
          ? parseInt(process.env.NEXT_PUBLIC_PUSHER_PORT, 10)
          : undefined,
        wssPort: process.env.NEXT_PUBLIC_PUSHER_PORT
          ? parseInt(process.env.NEXT_PUBLIC_PUSHER_PORT, 10)
          : 443,
        forceTLS: process.env.NEXT_PUBLIC_PUSHER_SCHEME === "https",
        disableStats: true,
      }),
    });

    const channel = echo.channel("flespi-data");
    console.log("Subscribed to flespi-data channel");

    channel.listen("FlespiDataReceived", (event: any) => {
      const { vehicle_id, plate_number, location, dispatch_log } = event;
      const status = dispatch_log?.status || "idle";
      const driver = dispatch_log?.vehicle_assignment?.user_profiles.find(
        (profile: any) => profile.position === "driver"
      )?.name;
      const conductor = dispatch_log?.vehicle_assignment?.user_profiles.find(
        (profile: any) => profile.position === "passenger_assistant_officer"
      )?.name;

      setBusData((prevData) => {
        const existingBus = prevData.find((bus) => bus.number === vehicle_id);

        if (existingBus) {
          return prevData.map((bus) =>
            bus.number === vehicle_id
              ? {
                  ...bus,
                  latitude: location.latitude,
                  longitude: location.longitude,
                  speed: location.speed,
                  time: formatTime(event.timestamp),
                  status,
                  driver,
                  conductor,
                }
              : bus
          );
        } else {
          return [
            ...prevData,
            {
              number: vehicle_id,
              name: `Bus ${vehicle_id}`,
              latitude: location.latitude,
              longitude: location.longitude,
              speed: location.speed,
              time: formatTime(event.timestamp),
              driver,
              conductor,
              plateNumber: plate_number || "Unknown Plate",
              status,
            },
          ];
        }
      });

      setPathData((prevPaths) => ({
        ...prevPaths,
        [vehicle_id]: [
          ...(prevPaths[vehicle_id] || []),
          { lat: location.latitude, lng: location.longitude }, // Updated keys to 'lat' and 'lng'
        ],
      }));
    });

    return () => {
      echo.leaveChannel("flespi-data");
    };
  }, []);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);

    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit", // Corrected type
      minute: "2-digit", // Corrected type
      hour12: true, // Remains as boolean
    };

    return date.toLocaleString("en-US", options);
  };

  return (
    <Layout>
      <Header title="Dashboard" />

      <section className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 bg-slate-200">
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white shadow-md rounded-lg p-4 flex items-center space-x-4">
              <FaBus className="text-blue-500" size={40} />
              <div>
                <h1 className="text-2xl font-bold">{busesInOperation}</h1>
                <p>Buses in Operation</p>
              </div>
            </div>
            <div className="bg-white shadow-md rounded-lg p-4 flex items-center space-x-4">
              <FaCog className="text-green-500" size={40} />
              <div>
                <h1 className="text-2xl font-bold">{busesInMaintenance}</h1>
                <p>Buses in Maintenance</p>
              </div>
            </div>
            <div className="bg-white shadow-md rounded-lg p-4 flex items-center space-x-4">
              <FaUsers className="text-purple-500" size={40} />
              <div>
                <h1 className="text-2xl font-bold">{currentEmployees}</h1>
                <p>Current Employees</p>
              </div>
            </div>
          </div>

          <MapProvider>
            <DispatchMap
              busData={busData}
              pathData={pathData}
              onBusClick={(busNumber) => {
                const busDetails = busData.find(
                  (bus) => bus.number === busNumber
                );
                setSelectedBusDetails(busDetails || null);
              }}
              selectedBus={selectedBusDetails?.number || null}
            />
          </MapProvider>
        </div>

        <div className="w-full lg:w-1/4 bg-white shadow-md rounded-lg p-4">
          {selectedBusDetails ? (
            <div>
              <h1 className="text-red-600 text-2xl font-bold">
                Bus {selectedBusDetails.number}
              </h1>
              <ul className="list-disc list-inside space-y-4 text-base mt-4">
                <li>
                  <strong>Driver:</strong> {selectedBusDetails.driver}
                </li>
                <li>
                  <strong>Conductor:</strong> {selectedBusDetails.conductor}
                </li>
                <li>
                  <strong>Plate Number:</strong>{" "}
                  {selectedBusDetails.plateNumber}
                </li>
                <li>
                  <strong>Status:</strong> {selectedBusDetails.status}
                </li>
                <li>
                  <strong>Speed:</strong> {selectedBusDetails.speed} km/h
                </li>
                <li>
                  <strong>Time:</strong> {selectedBusDetails.time}
                </li>
              </ul>
            </div>
          ) : (
            <h1 className="text-red-600 text-2xl font-bold">Select a Bus</h1>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default DashboardHeader;
