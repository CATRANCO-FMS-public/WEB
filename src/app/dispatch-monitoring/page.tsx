"use client";
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Header from "../components/Header"; 
import { FaBus } from "react-icons/fa";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import mqtt from "mqtt";

interface BusData {
  number: string;
  name: string;
  status: string;
  latitude: number;
  longitude: number;
}

// Custom Marker Icon for buses
const busIcon = new L.Icon({
  iconUrl: "/bus-icon.png", // Ensure this path points to a valid icon file
  iconSize: [30, 40],
  iconAnchor: [15, 40], // Anchor for the icon position
  popupAnchor: [0, -40],
});

const DispatchMonitoring: React.FC = () => {
  const [busData, setBusData] = useState<BusData[]>([]);
  const [pathData, setPathData] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBus, setSelectedBus] = useState<string | null>(null);

  useEffect(() => {
    // Connect to the MQTT broker
    const client = mqtt.connect("wss://mqtt.flespi.io", {
      username: process.env.NEXT_PUBLIC_FLESPI_TOKEN || "",
    });

    client.on("connect", () => {
      console.log("Connected to Flespi MQTT broker");
      client.subscribe("flespi/message/gw/devices/#", (err) => {
        if (err) {
          console.error("Failed to subscribe to MQTT topic", err);
        } else {
          console.log("Subscribed to Flespi MQTT topic");
          setLoading(false);
        }
      });
    });

    client.on("message", (topic, message) => {
      console.log("Received MQTT message:", topic, message.toString());
      try {
        const parsedMessage = JSON.parse(message.toString());
        const deviceId = parsedMessage["device.id"];

        if (parsedMessage["position.latitude"] && parsedMessage["position.longitude"]) {
          if (selectedBus === deviceId) {
            setPathData((prevPath) => [
              ...prevPath,
              [parsedMessage["position.latitude"], parsedMessage["position.longitude"]],
            ]);
          }

          setBusData((prevData) => {
            const updatedData = prevData.map((bus) =>
              bus.number === deviceId
                ? {
                    ...bus,
                    status: `Speed: ${parsedMessage["position.speed"]} km/h`,
                    latitude: parsedMessage["position.latitude"],
                    longitude: parsedMessage["position.longitude"],
                  }
                : bus
            );

            if (!updatedData.some((bus) => bus.number === deviceId)) {
              updatedData.push({
                number: deviceId,
                name: `Bus ${deviceId}`,
                status: `Speed: ${parsedMessage["position.speed"]} km/h`,
                latitude: parsedMessage["position.latitude"],
                longitude: parsedMessage["position.longitude"],
              });
            }

            return updatedData;
          });
        }
      } catch (error) {
        console.error("Error processing MQTT message", error);
      }
    });

    client.on("error", (err) => {
      console.error("MQTT error", err);
      setError("Failed to connect to MQTT broker.");
    });

    return () => {
      client.end();
    };
  }, [selectedBus]);

  return (
    <Layout>
      <Header title="Dispatch Monitoring" />
      <section className="p-4 flex flex-col items-center">
        <div className="w-5/6 flex flex-col h-full">
          <div className="bus-location">
            <div className="output flex flex-row space-x-2 mt-8">
              <div className="locations w-full bg-white h-auto rounded-lg border-2 border-violet-400">
                {loading ? (
                  <div className="text-center mt-8">Loading map...</div>
                ) : (
                  <MapContainer
                    center={[8.48325558794408, 124.5866112118501]}
                    zoom={13}
                    style={{ height: "450px", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                    />
                    {pathData.length > 0 && (
                      <Polyline positions={pathData} color="blue" weight={4} />
                    )}
                    {busData.map((bus) => (
                      <Marker
                        key={bus.number}
                        position={[bus.latitude, bus.longitude]}
                        icon={busIcon}
                        eventHandlers={{
                          click: () => {
                            setSelectedBus(bus.number);
                          },
                        }}
                      >
                        <Popup>
                          <div>
                            <strong>Bus {bus.number}</strong>
                            <br />
                            Status: {bus.status}
                            <br />
                            Lat: {bus.latitude}, Lon: {bus.longitude}
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                )}
              </div>
            </div>
          </div>
          {error && <div className="text-center text-red-500 mt-8">{error}</div>}
          <div className="bus-info flex flex-row mt-12 space-x-4">
            <div className="col-bus space-y-4">
              {busData.map((bus) => {
                const isSelected = selectedBus === bus.number;
                return (
                  <button
                    key={bus.number}
                    onClick={() => setSelectedBus(bus.number)}
                    className={`container w-80 p-4 rounded-lg flex flex-row space-x-8 ${
                      isSelected
                        ? "bg-blue-500 text-white"
                        : "bg-gray-300 text-black"
                    } transition-all duration-200`}
                  >
                    <FaBus size={30} />
                    <h1 className="font-bold">
                      {bus.name} (ID: {bus.number})
                    </h1>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default DispatchMonitoring;
