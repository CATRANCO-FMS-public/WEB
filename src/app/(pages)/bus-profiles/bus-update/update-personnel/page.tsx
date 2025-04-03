"use client";
import Sidebar from "@/components/reusesables/sidebar";
import Header from "@/components/reusesables/header";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAllProfiles } from "@/services/userProfile";
import { getVehicleAssignmentById, updateVehicleAssignment } from "@/services/vehicleAssignService";

const UpdatePersonnel = () => {
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get("vehicle_assignment_id");
  const router = useRouter();

  const [drivers, setDrivers] = useState([]);
  const [paos, setPaos] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedPAO, setSelectedPAO] = useState("");
  const [vehicleId, setVehicleId] = useState(""); // Store the vehicle_id
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!assignmentId) {
      setError("Assignment ID is missing. Redirecting...");
      setTimeout(() => {
        router.push("/bus-profiles");
      }, 2000);
      return;
    }

    const fetchData = async () => {
      try {
        const profiles = await getAllProfiles();
        const driverProfiles = profiles.filter(
          (profile) => profile.profile.position === "driver"
        );
        const paoProfiles = profiles.filter(
          (profile) => profile.profile.position === "passenger_assistant_officer"
        );

        setDrivers(driverProfiles);
        setPaos(paoProfiles);

        const assignment = await getVehicleAssignmentById(assignmentId);

        if (assignment && assignment.user_profiles) {
          const currentDriver =
            assignment.user_profiles.find((p) => p.position === "driver")
              ?.user_profile_id || "";
          const currentPAO =
            assignment.user_profiles.find(
              (p) => p.position === "passenger_assistant_officer"
            )?.user_profile_id || "";

          setSelectedDriver(currentDriver);
          setSelectedPAO(currentPAO);
          setVehicleId(assignment.vehicle_id); // Store the vehicle_id
        } else {
          setError("No personnel assignment found for the provided ID.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [assignmentId, router]);

  const handleUpdate = async () => {
    if (!selectedDriver || !selectedPAO) {
      setError("Please select both a driver and a PAO.");
      return;
    }
  
    setLoading(true);
    try {
      const response = await updateVehicleAssignment(assignmentId, {
        user_profile_ids: [selectedDriver, selectedPAO],
        vehicle_id: vehicleId, // Include the vehicle_id
      });
  
      // Check if the response contains a successful update message
      if (response.message === "Vehicle Assignment Updated Successfully") {
        alert("Personnel assignment updated successfully!");
        router.push("/bus-profiles");
      } else {
        throw new Error(response.message || "Update failed. Please check your inputs.");
      }
    } catch (err) {
      console.error("Error updating personnel assignment:", err);
      setError(err.message || "Failed to update personnel assignment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    router.push("/bus-profiles");
  };

  if (loading) {
    return (
      <div className="text-center text-blue-500 mt-10">
        Loading personnel data...
        <div className="spinner mt-4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-10">
        {error}
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => router.push("/bus-profiles")}
        >
          Back to Bus Profiles
        </button>
      </div>
    );
  }

  return (
    <section className="h-screen flex flex-row bg-white">
      <Sidebar />
      <section className="w-full bg-slate-200">
        <Header title="Update Personnel Assignment" />
        <section className="right w-full flex justify-center items-center">
          <div className="forms-container">
            <div className="forms flex flex-col items-center w-[500px] bg-white min-h-[500px] rounded-lg border border-gray-300 p-8 space-y-6 mt-20">
              <h1 className="text-xl mt-10">Driver Assignment</h1>
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="h-10 text-lg border border-gray-300 rounded-md p-2 w-full"
              >
                <option value="">Select a Driver</option>
                {drivers.length > 0 ? (
                  drivers.map((driver) => (
                    <option
                      key={driver.profile.user_profile_id}
                      value={driver.profile.user_profile_id}
                    >
                      {`${driver.profile.first_name} ${driver.profile.last_name}`}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No drivers available
                  </option>
                )}
              </select>

              <h1 className="text-xl mt-4">Passenger Officer Assistant Assignment</h1>
              <select
                value={selectedPAO}
                onChange={(e) => setSelectedPAO(e.target.value)}
                className="h-10 text-lg border border-gray-300 rounded-md p-2 w-full"
              >
                <option value="">Select a PAO</option>
                {paos.length > 0 ? (
                  paos.map((pao) => (
                    <option
                      key={pao.profile.user_profile_id}
                      value={pao.profile.user_profile_id}
                    >
                      {`${pao.profile.first_name} ${pao.profile.last_name}`}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No PAOs available
                  </option>
                )}
              </select>

              {error && <p className="text-red-500">{error}</p>}

              <div className="buttons flex justify-center space-x-4 w-full mt-6">
                <button
                  onClick={handleUpdate}
                  className={`px-4 py-2 w-24 border-2 ${
                    loading
                      ? "border-gray-300 text-gray-400 cursor-not-allowed"
                      : "border-blue-500 text-blue-500 hover:bg-blue-50"
                  }`}
                  disabled={loading}
                >
                  Done
                </button>
                <button
                  onClick={handleCancelClick}
                  className="px-4 py-2 w-24 border-2 border-red-500 rounded-md text-red-500 transition-colors duration-300 ease-in-out hover:bg-red-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </section>
      </section>
    </section>
  );
};

export default UpdatePersonnel;
