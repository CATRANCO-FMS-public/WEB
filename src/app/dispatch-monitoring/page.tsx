"use client";

import React, { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import Header from "../components/reusesables/header";
import DispatchMap from "../components/reusesables/dispatch-map";
import Pusher from "pusher-js";
import Echo from "laravel-echo";
import { FaBus } from "react-icons/fa";
import { getAllVehicleAssignments } from "../services/vehicleAssignService";
import {
  startAlley,
  getAllOnAlley,
  getAllOnRoad,
  startDispatch,
  endAlley,
  deleteRecord,
  endDispatch,
} from "../services/dispatchService";
import { MapProvider } from "@/providers/MapProvider";
import AlleyModal from "../components/dispatch_monitoring/AlleyModal";
import DispatchModal from "../components/dispatch_monitoring/DispatchModal";
import StaticLocationsData from "../components/extras/StaticLocationsData";
import { useQuery } from '@tanstack/react-query';
import { ToastContainer, toast } from 'react-toastify';

interface VehicleAssignmentData {
  number: string;
  status: string;
  route: string;
  dispatch_logs_id: string | null;
  name: string;
  vehicle_assignment_id: number;
}

interface BusData {
  number: string;
  latitude: number;
  longitude: number;
  speed: number;
  status: string;
  time: string;
  dispatch_logs_id: string | null;
  name: string;
  route: string;
}

const DispatchMonitoring: React.FC = () => {
  const busDataRef = useRef<BusData[]>([]);
  const pathDataRef = useRef<{ lat: number; lng: number }[]>([]);
  const [busData, setBusData] = useState<BusData[]>([]);
  const [vehicleAssignmentData, setVehicleAssignmentData] = useState<
    VehicleAssignmentData[]
  >([]); // Renamed state
  const vehicleAssignmentDataRef = useRef<VehicleAssignmentData[]>([]);
  const [pathData, setPathData] = useState<{
    [busNumber: string]: { lat: number; lng: number }[];
  }>({});
  const [loading, setLoading] = useState(true);
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [activeButton, setActiveButton] = useState<string>("all");
  const [isAlleyModalOpen, setIsAlleyModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [modalVehicleData, setModalVehicleData] =
    useState<VehicleAssignmentData | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [toastKey, setToastKey] = React.useState(0);
  const toastId = React.useRef<string | number | null>(null);

  const { data: vehicleAssignmentsData, isLoading, refetch } = useQuery({
    queryKey: ['vehicleAssignments'],
    queryFn: async () => {
      console.log("Fetching vehicle assignments...");

      // Fetch all vehicle assignments
      const vehicleAssignments = await getAllVehicleAssignments();
      const onAlley = await getAllOnAlley();
      const onRoad = await getAllOnRoad();

      // Create a mapping of vehicle_id to dispatch_logs_id for easier lookup
      const alleyDispatchLogsMap = new Map(
        onAlley.map((vehicle) => [
          vehicle.vehicle_assignments.vehicle.vehicle_id,
          vehicle.dispatch_logs_id,
        ])
      );
      const roadDispatchLogsMap = new Map(
        onRoad.map((vehicle) => [
          vehicle.vehicle_assignments.vehicle.vehicle_id,
          vehicle.dispatch_logs_id,
        ])
      );

      // Map vehicle assignments with fetched statuses and dispatch_logs_id
      const mappedVehicles = vehicleAssignments.map((vehicle: any) => {
        let status = "idle";
        let dispatch_logs_id = null;

        if (alleyDispatchLogsMap.has(vehicle.vehicle_id)) {
          status = "on alley";
          dispatch_logs_id = alleyDispatchLogsMap.get(vehicle.vehicle_id);
        }
        else if (roadDispatchLogsMap.has(vehicle.vehicle_id)) {
          status = "on road";
          dispatch_logs_id = roadDispatchLogsMap.get(vehicle.vehicle_id);
        }

        return {
          number: vehicle.vehicle_id,
          status: status,
          route: "",
          dispatch_logs_id: dispatch_logs_id,
          name: vehicle.name || "Unnamed",
          vehicle_assignment_id: vehicle.vehicle_assignment_id,
        };
      });

      return mappedVehicles;
    },
  });

  useEffect(() => {
    if (vehicleAssignmentsData) {
      vehicleAssignmentDataRef.current = vehicleAssignmentsData;
      setVehicleAssignmentData(vehicleAssignmentsData);
      setLoading(false);
    }
  }, [vehicleAssignmentsData]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);

    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit", // Correct type
      minute: "2-digit", // Correct type
      hour12: true, // Remains as a boolean
    };

    return date.toLocaleString("en-US", options); // Returns time in format like '10:00 AM'
  };

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

    channel
      .subscribed(() => {
        console.log("Subscribed to flespi-data channel");
      })
      .listen("FlespiDataReceived", (event: any) => {
        const { vehicle_id, location, dispatch_log } = event;

        console.log("Real Time Data:", event);

        // Update pathData without clearing other tracker data
        setPathData((prev) => {
          const newPathData = {
            ...prev,
            [vehicle_id]: [
              ...(prev[vehicle_id] || []),
              { lat: location.latitude, lng: location.longitude },
            ],
          };
          console.log("Updated pathData:", newPathData);
          return newPathData;
        });

        // Update busData
        setBusData((prevBusData) => {
          const updatedBusData = new Map(
            prevBusData.map((bus) => [bus.number, bus])
          );

          const updatedBus = updatedBusData.get(vehicle_id) || {
            number: vehicle_id,
            latitude: null,
            longitude: null,
            speed: 0,
            time: "",
            status: "idle",
            dispatch_logs_id: null,
            name: "Unnamed",
            route: "",
          };

          updatedBusData.set(vehicle_id, {
            ...updatedBus,
            latitude: location.latitude,
            longitude: location.longitude,
            speed: location.speed,
            time: formatTime(event.timestamp),
            status: dispatch_log?.status || "idle",
            dispatch_logs_id: dispatch_log?.dispatch_logs_id || null,
            route: dispatch_log?.route || "",
          });

          const updatedBusDataArray = Array.from(updatedBusData.values());
          busDataRef.current = updatedBusDataArray; // Update ref here
          localStorage.setItem("busData", JSON.stringify(updatedBusDataArray));
          return updatedBusDataArray;
        });

        const matchedLocation = StaticLocationsData.find((loc) =>
          loc.coordinates.some(
            (coord) =>
              Math.abs(coord.lat - location.latitude) < 0.0001 &&
              Math.abs(coord.lng - location.longitude) < 0.0001
          )
        );

        console.log("Matched Location:", matchedLocation);

        if (
          matchedLocation &&
          dispatch_log?.dispatch_logs_id &&
          dispatch_log.status === "on road"
        ) {
          endDispatch(dispatch_log.dispatch_logs_id).then(() => {
            console.log(`Dispatch ended for vehicle: ${vehicle_id}`);
            refetch();
            setPathData((prevPaths) => {
              const updatedPaths = { ...prevPaths };
              delete updatedPaths[vehicle_id];
              return updatedPaths;
            });
          });
        }
      });

    return () => {
      echo.leaveChannel("flespi-data");
      console.log("Unsubscribed from flespi-data channel");
    };
  }, [refetch]);

  const getButtonColor = (status: string, dispatch_logs_id: string | null) => {
    if (!dispatch_logs_id) {
      return "bg-gray-300 text-black"; // idle state
    }

    switch (status) {
      case "on alley":
        return "bg-orange-400 text-black"; // For on alley
      case "on road":
        return "bg-green-500 text-white"; // For on road
      case "idle":
        return "bg-gray-300 text-black"; // For idle
      case "all":
        return "bg-blue-500 text-white"; // For all (this can be defined more specifically if needed)
      default:
        return "bg-gray-300 text-black"; // Default color
    }
  };

  const filterButtons = (status: any) => {
    switch (status) {
      case "on alley":
        return "bg-orange-400 text-black"; // For on alley
      case "on road":
        return "bg-green-500 text-white"; // For on road
      case "idle":
        return "bg-gray-300 text-black"; // For idle
      case "all":
        return "bg-blue-500 text-white"; // For all (this can be defined more specifically if needed)
      default:
        return "bg-gray-300 text-black"; // Default color
    }
  };

  const showToast = async (operation: Promise<any>, loadingMessage: string, successMessage: string) => {
    // Dismiss all existing toasts
    toast.dismiss();
    // Force remount toast container
    setToastKey(prev => prev + 1);
    
    // Show loading toast
    toastId.current = toast.loading(loadingMessage, {
      position: "top-right",
      closeButton: false,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: false,
      progress: undefined
    });

    try {
      await operation;
      
      // Update toast to success with specific message
      toast.update(toastId.current, {
        render: successMessage,
        type: "success",
        isLoading: false,
        autoClose: 2000,
        closeButton: false,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
        onClose: () => {
          toastId.current = null;
          setToastKey(prev => prev + 1);
        }
      });
    } catch (error) {
      // Update toast to error
      toast.update(toastId.current, {
        render: error.response?.data?.message || "Operation failed. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 2000,
        closeButton: false,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
        onClose: () => {
          toastId.current = null;
          setToastKey(prev => prev + 1);
        }
      });
      throw error;
    }
  };

  const handleAlleyConfirm = async (selectedRoute: string) => {
    if (!selectedRoute.trim()) {
      toast.error("No route selected.");
      return;
    }

    if (!modalVehicleData?.vehicle_assignment_id) {
      toast.error("Vehicle assignment ID is missing.");
      return;
    }

    const operation = async () => {
      await startAlley({
        route: selectedRoute,
        vehicle_assignment_id: modalVehicleData.vehicle_assignment_id,
      });
      setIsAlleyModalOpen(false);
      await refetch();
    };

    await showToast(
      operation(), 
      "Starting alley operation...", 
      "Vehicle successfully moved to alley!"
    );
  };

  const handleDispatchConfirm = async (selectedRoute: string) => {
    if (!selectedRoute.trim()) {
      toast.error("No route selected.");
      return;
    }

    if (!modalVehicleData?.vehicle_assignment_id) {
      toast.error("Vehicle assignment ID is missing.");
      return;
    }

    const operation = async () => {
      // End the alley first
      await endAlley(modalVehicleData.dispatch_logs_id);

      // Start the dispatch
      const data = {
        route: selectedRoute,
        vehicle_assignment_id: modalVehicleData.vehicle_assignment_id,
      };
      await startDispatch(data);
      
      setIsDispatchModalOpen(false);
      await refetch();
    };

    await showToast(
      operation(), 
      "Processing dispatch operation...", 
      "Vehicle successfully dispatched to route!"
    );
  };

  const handleDeleteDispatchLogs = async (vehicle: any) => {
    if (!vehicle?.dispatch_logs_id) {
      toast.error("Dispatch log ID not found.");
      return;
    }

    const operation = async () => {
      await deleteRecord(vehicle.dispatch_logs_id);
      setShowDeleteConfirmation(false);
      await refetch();
    };

    await showToast(
      operation(), 
      "Deleting dispatch record...", 
      "Dispatch record successfully deleted!"
    );
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false); // Close the modal if cancel
  };

  const handleLongPress = (vehicle) => {
    const pressDuration = 3000; // 2 seconds
    let pressTimer: any;

    const onMouseDown = () => {
      pressTimer = setTimeout(() => {
        setSelectedVehicle(vehicle); // Set the vehicle data to be deleted
        setShowDeleteConfirmation(true); // Show confirmation modal after 2 seconds
      }, pressDuration);
    };

    const onMouseUp = () => {
      clearTimeout(pressTimer); // If mouse is released before 2 seconds, cancel the delete action
    };

    return {
      onMouseDown,
      onMouseUp,
    };
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      toast.dismiss();
      if (toastId.current) {
        toast.dismiss(toastId.current);
      }
    };
  }, []);

  return (
    <Layout>
      <ToastContainer
        key={toastKey}
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        theme="light"
        limit={1}
        style={{ zIndex: 9999 }}
        containerId="dispatch-monitoring-toasts"
      />
      <Header title="Dispatch Monitoring" />
      <section className="p-4 flex flex-col items-center">
        <div className="w-full md:w-5/6 flex flex-col h-full">
          <MapProvider>
            {loading ? (
              <div className="text-center text-blue-500 mt-8">Loading map...</div>
            ) : (
              <div className="sm:h-96 lg:h-[500px] border-2">
                <DispatchMap
                  busData={busData}
                  pathData={pathData} // Now pathData is an object with bus numbers as keys
                  onBusClick={(busNumber) => {
                    setSelectedBus(busNumber);
                    const clickedBus = busData.find(
                      (bus) => bus.number === busNumber
                    );
                    if (clickedBus) {
                      setPathData((prev) => ({
                        ...prev,
                        [busNumber]: [
                          ...(prev[busNumber] || []), // Preserve existing path data
                          { lat: clickedBus.latitude, lng: clickedBus.longitude }, // Add new point
                        ],
                      }));
                    }
                  }}
                  selectedBus={selectedBus}
                />
              </div>
            )}
          </MapProvider>

          <div className="flex flex-wrap justify-start space-x-2 space-y-2 sm:space-y-0 mb-5 mt-8 sm:mt-100">
            {["all", "idle", "on road", "on alley"].map((status) => (
              <button
                key={status}
                className={`px-4 py-2 rounded-md text-sm sm:text-lg font-semibold transition-transform duration-300 ease-in-out shadow-md ${
                  activeButton === status
                    ? "transform scale-110 border-2 border-blue-700 shadow-lg"
                    : "hover:shadow-lg"
                } ${
                  status === "all"
                    ? "bg-blue-500 text-white"
                    : filterButtons(status)
                }`}
                onClick={() => setActiveButton(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <div className="vehicle-info grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicleAssignmentData
              .slice() // Create a shallow copy to avoid mutating the original array
              .sort((a, b) => {
                const numberA = parseInt(a.number, 10);
                const numberB = parseInt(b.number, 10);
                return numberA - numberB;
              })
              .filter((vehicle) => {
                if (activeButton === "all") return true; // Show all vehicles
                return vehicle.status === activeButton; // Filter by status
              })
              .map((vehicle) => {
                const { onMouseDown, onMouseUp } = handleLongPress(vehicle);

                return (
                  <button
                    key={vehicle.number}
                    onClick={() => {
                      setModalVehicleData(vehicle); // Set the selected vehicle data
                      if (vehicle.status === "idle") {
                        setIsAlleyModalOpen(true); // Open AlleyModal for idle status
                      } else if (vehicle.status === "on alley") {
                        setIsDispatchModalOpen(true); // Open OnRoadModal for on alley status
                      }

                      // Select the bus on the map when button is clicked
                      setSelectedBus(vehicle.number); // Set selected bus on map
                    }}
                    onMouseDown={onMouseDown}
                    onMouseUp={onMouseUp}
                    className={`w-full p-4 rounded-lg flex items-center space-x-4 shadow-md ${getButtonColor(
                      vehicle.status,
                      vehicle.dispatch_logs_id
                    )}`}
                  >
                    <FaBus size={24} />
                    <div className="flex flex-col text-xs sm:text-sm md:text-base">
                      <span className="font-bold">
                        Vehicle ID: {vehicle.number}
                      </span>
                      <span>Status: {vehicle.status}</span>
                    </div>
                  </button>
                );
              })}
          </div>

          {/* Confirmation Modal */}
          {showDeleteConfirmation && (
            <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold">
                  Are you sure you want to cancel this?
                </h2>
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => handleDeleteDispatchLogs(selectedVehicle)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    className="bg-gray-300 text-black px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Alley Modal */}
      <AlleyModal
        isOpen={isAlleyModalOpen}
        vehicleData={modalVehicleData}
        onClose={() => setIsAlleyModalOpen(false)}
        onConfirm={handleAlleyConfirm}
        availableRoutes={["Canitoan", "Silver Creek", "Cogon"]}
      />

      {/* Alley Modal */}
      <DispatchModal
        isOpen={isDispatchModalOpen}
        vehicleData={modalVehicleData}
        onClose={() => setIsDispatchModalOpen(false)}
        onConfirm={handleDispatchConfirm}
        availableRoutes={["Canitoan", "Silver Creek", "Cogon"]}
      />
    </Layout>
  );
};

export default DispatchMonitoring;