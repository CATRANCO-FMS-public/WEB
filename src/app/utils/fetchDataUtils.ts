import { getAllVehicles } from "@/services/vehicleService";
import { getAllMaintenanceScheduling } from "@/services/maintenanceService";
import { getAllProfiles } from "@/services/userProfile";

export const fetchVehiclesData = async () => {
  const vehicles = await getAllVehicles();
  return vehicles.filter((vehicle) => vehicle.vehicle_id).length;
};

export const fetchMaintenanceData = async () => {
  const maintenance = await getAllMaintenanceScheduling();
  return maintenance.filter((item) => item.maintenance_scheduling_id).length;
};

export const fetchProfilesData = async () => {
  const profiles = await getAllProfiles();
  return profiles.length;
};
