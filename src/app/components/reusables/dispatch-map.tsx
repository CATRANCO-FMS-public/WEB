import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, Marker, Polyline, InfoWindow } from "@react-google-maps/api";
import StaticLocationsData from "../extras/StaticLocationsData";

interface BusData {
  number: string;
  name: string;
  status: string;
  latitude: number;
  longitude: number;
  time: string;
  speed: number;
}

interface DispatchMapProps {
  busData: BusData[];
  pathData: { [busNumber: string]: { lat: number; lng: number }[] };
  onBusClick: (busNumber: string) => void;
  selectedBus?: string | null;
}

const mapContainerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "10px",
};

const defaultMapCenter = {
  lat: 8.48325558794408,
  lng: 124.5866112118501,
};

const mapOptions = {
  zoomControl: true,
  streetViewControl: false,
  fullscreenControl: false,
  gestureHandling: "auto",
  mapTypeId: "roadmap",
};

const getIconUrl = (status: string) => {
  switch (status) {
    case "on alley":
      return "/bus_on_alley.png";
    case "on road":
      return "/bus_on_road.png";
    default:
      return "/bus_idle.png";
  }
};

const DispatchMap: React.FC<DispatchMapProps> = ({
  busData,
  pathData,
  onBusClick,
  selectedBus,
}) => {
  const [zoomLevel, setZoomLevel] = useState(13);
  const [localBusData, setLocalBusData] = useState<BusData[]>([]); // To store bus data from local storage or props
  const mapRef = useRef<google.maps.Map | null>(null);
  const [activeMarker, setActiveMarker] = useState(null);

  useEffect(() => {
    // Check if there's bus data in local storage
    const storedBusData = localStorage.getItem("busData");
    if (storedBusData) {
      setLocalBusData(JSON.parse(storedBusData)); // Load data from local storage
    } else {
      setLocalBusData(busData); // Use the passed bus data
    }
  }, [busData]);

  // Update local storage whenever busData changes
  useEffect(() => {
    if (busData && busData.length > 0) {
      localStorage.setItem("busData", JSON.stringify(busData)); // Store bus data in local storage
    }
  }, [busData]);

  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    map.addListener("zoom_changed", () => {
      const currentZoom = map.getZoom() || 15;
      setZoomLevel(currentZoom);
    });
  };

  const fitMapBounds = () => {
    if (mapRef.current) {
      const bounds = new window.google.maps.LatLngBounds();
      StaticLocationsData.forEach((location) => {
        bounds.extend(location.primaryCoordinate);
      });
      mapRef.current.fitBounds(bounds);
    }
  };

  useEffect(() => {
    fitMapBounds();
  }, [mapRef.current]);

  const generateUniqueColor = (busNumber: string) => {
    // A simple color generator based on bus number (or another unique property)
    const colors = [
      "#FF0000", // Red
      "#00FF00", // Green
      "#0000FF", // Blue
      "#FFFF00", // Yellow
      "#FF00FF", // Magenta
      "#00FFFF", // Cyan
      "#FFA500", // Orange
      "#800080", // Purple
    ];
    const index = parseInt(busNumber, 10) % colors.length;
    return colors[index];
  };

  

  return (
    <div className="relative w-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultMapCenter}
        zoom={zoomLevel}
        options={mapOptions}
        onLoad={handleMapLoad}
      >
        {/* Render dynamic bus markers and corresponding polyline */}
        {localBusData.map((bus) => {
          const busPath = pathData[bus.number] || [];

          // Determine polyline color based on bus status and assign unique colors for "on road"
          let polylineColor = "gray"; // Default color for idle status
          if (bus.status === "on road") {
            polylineColor = generateUniqueColor(bus.number);
          } else if (bus.status === "on alley") {
            polylineColor = "orange";
          }

          return (
            <React.Fragment key={bus.number}>
              {/* Marker for the bus */}
              <Marker
                position={{ lat: bus.latitude, lng: bus.longitude }}
                icon={{
                  url: getIconUrl(bus.status),
                  scaledSize: new window.google.maps.Size(50, 50),
                }}
                onClick={() => onBusClick(bus.number)}
              >
                {selectedBus === bus.number && (
                  <InfoWindow position={{ lat: bus.latitude, lng: bus.longitude }}>
                    <div>
                      <strong>Bus {bus.number}</strong>
                      <br />
                      Speed: {bus.speed} km/h
                      <br />
                      Status: {bus.status}
                      <br />
                      Latitude: {bus.latitude?.toFixed(6) || "N/A"}, Longitude: {bus.longitude?.toFixed(6) || "N/A"}
                      <br />
                      Time: {bus.time}
                    </div>
                  </InfoWindow>
                )}
              </Marker>

              {/* Polyline for the bus */}
              {busPath.length > 0 && (
                <Polyline
                  path={busPath} // Use the path specific to this bus
                  options={{
                    strokeColor: polylineColor,
                    strokeWeight: 4,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* Render static location markers */}
        {StaticLocationsData.map((location) => (
        <Marker
          key={location.id}
          position={location.primaryCoordinate}
          icon={{
            url: `/${location.title.toLowerCase().replace(" ", "_")}.png`,
            scaledSize: new window.google.maps.Size(50, 50),
          }}
          title={location.title}
          onClick={() => setActiveMarker(location.id)}  // Set active marker on click
        >
          {activeMarker === location.id && (
            <InfoWindow onCloseClick={() => setActiveMarker(null)} position={location.primaryCoordinate}>
              <div>{location.title}</div>
            </InfoWindow>
          )}
        </Marker>
      ))}
      </GoogleMap>
    </div>
  );
};

export default DispatchMap;