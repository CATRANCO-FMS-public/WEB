"use client";
import Sidebar from "@/components/reusesables/sidebar";
import Header from "@/components/reusesables/header";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getVehicleById, updateVehicle } from "@/services/vehicleService";

const BusUpdate = () => {
  const searchParams = useSearchParams();
  const vehicle_id = searchParams.get("vehicle_id");
  const router = useRouter();

  // State for vehicle details
  const [busDetails, setBusDetails] = useState({
    vehicle_id: "",
    or_id: "",
    cr_id: "",
    plate_number: "",
    engine_number: "",
    chasis_number: "",
    third_pli: "",
    third_pli_policy_no: "",
    ci: "",
    supplier: "",
  });

  // State for validity dates (initialized to empty strings)
  const [third_pli_validity, setTPLValidity] = useState<Date | null>(null);
  const [ci_validity, setCIValidity] = useState<Date | null>(null);
  const [date_purchased, setDatePurchased] = useState<Date | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch vehicle details on mount
  useEffect(() => {
    if (!vehicle_id) {
      setError("Vehicle ID is missing.");
      router.push("/bus-profiles");
      return;
    }

    const fetchVehicleDetails = async () => {
      try {
        const data = await getVehicleById(vehicle_id);
        setBusDetails({
          vehicle_id: data.vehicle_id || "",
          or_id: data.or_id || "",
          cr_id: data.cr_id || "",
          plate_number: data.plate_number || "",
          engine_number: data.engine_number || "",
          chasis_number: data.chasis_number || "",
          third_pli: data.third_pli || "",
          third_pli_policy_no: data.third_pli_policy_no || "",
          ci: data.ci || "",
          supplier: data.supplier || "",
        });
        setTPLValidity(data.third_pli_validity ? data.third_pli_validity : "");
        setCIValidity(data.ci_validity ? data.ci_validity : "");
        setDatePurchased(data.date_purchased ? data.date_purchased : "");
      } catch (err) {
        console.error("Error fetching vehicle details:", err);
        setError("Failed to fetch vehicle details.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetails();
  }, [vehicle_id, router]);

  // Update handler
  const handleUpdate = async () => {
    try {
      // Prepare the updated data
      const updatedData = {
        or_id: busDetails.or_id,
        cr_id: busDetails.cr_id,
        engine_number: busDetails.engine_number,
        chasis_number: busDetails.chasis_number,
        third_pli: busDetails.third_pli,
        third_pli_policy_no: busDetails.third_pli_policy_no,
        ci: busDetails.ci,
        supplier: busDetails.supplier,
        third_pli_validity: third_pli_validity || null,
        ci_validity: ci_validity || null,
        date_purchased: date_purchased || null,
      };

      // Update the vehicle record
      await updateVehicle(vehicle_id, updatedData);
      alert("Bus record updated successfully!");
      router.push("/bus-profiles");
    } catch (err) {
      console.error("Error updating vehicle:", err);

      if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat().join("\n");
        alert(`Update failed:\n${errorMessages}`);
      } else {
        setError("Failed to update vehicle. Please try again.");
      }
    }
  };

  // Cancel handler
  const handleCancelClick = () => {
    router.push("/bus-profiles");
  };

  if (loading) {
    return <div>Loading vehicle details...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <section className="h-screen flex flex-row bg-white">
      <Sidebar />

      <section className="w-full bg-slate-200">
        <Header title="Update Bus Record" />

        <section className="right w-full overflow-y-hidden">
          <div className="forms-container ml-14">
            <div className="output flex flex-row space-x-2 mt-20">
              <div className="forms flex w-11/12 bg-white h-auto rounded-lg border border-gray-300">
                <div className="1st-row flex-col m-5 ml-14 w-96 space-y-4 mt-10">
                  <h1>Vehicle ID</h1>
                  <Input
                    className="h-10 text-lg"
                    type="text"
                    placeholder="Vehicle ID"
                    value={busDetails.vehicle_id}
                    onChange={(e) =>
                      setBusDetails({
                        ...busDetails,
                        vehicle_id: e.target.value,
                      })
                    }
                    disabled
                  />
                  <h1>OR Number</h1>
                  <Input
                    className="h-10 text-lg"
                    type="text"
                    placeholder="OR #"
                    value={busDetails.or_id}
                    onChange={(e) =>
                      setBusDetails({ ...busDetails, or_id: e.target.value })
                    }
                  />
                  <h1>CR Number</h1>
                  <Input
                    className="h-10 text-lg"
                    type="text"
                    placeholder="CR #"
                    value={busDetails.cr_id}
                    onChange={(e) =>
                      setBusDetails({ ...busDetails, cr_id: e.target.value })
                    }
                  />
                  <h1>Plate Number</h1>
                  <Input
                    className="h-10 text-lg"
                    type="text"
                    placeholder="Plate Number"
                    value={busDetails.plate_number}
                    onChange={(e) =>
                      setBusDetails({
                        ...busDetails,
                        plate_number: e.target.value,
                      })
                    }
                    disabled
                  />
                </div>
                <div className="2nd-row flex-col m-5 w-96 space-y-4 mt-10">
                  <h1>Third Party Liability Insurance</h1>
                  <Input
                    className="h-10 text-lg"
                    type="text"
                    placeholder="Third Party Insurance"
                    value={busDetails.third_pli}
                    onChange={(e) =>
                      setBusDetails({
                        ...busDetails,
                        third_pli: e.target.value,
                      })
                    }
                  />
                  <h1>Third Party Liability Policy Number</h1>
                  <Input
                    className="h-10 text-lg"
                    type="text"
                    placeholder="Policy Number"
                    value={busDetails.third_pli_policy_no}
                    onChange={(e) =>
                      setBusDetails({
                        ...busDetails,
                        third_pli_policy_no: e.target.value,
                      })
                    }
                  />
                  <h1>Third Party Liability Validity</h1>
                  <DatePicker
                    selected={
                      third_pli_validity ? new Date(third_pli_validity) : null
                    }
                    onChange={(date: Date | null) => setTPLValidity(date)}
                    className="border border-gray-500 p-3 rounded-md w-full mt-1"
                    dateFormat="MM/dd/yyyy"
                  />

                  <h1>Comprehensive Insurance</h1>
                  <Input
                    className="h-10 text-lg"
                    type="text"
                    placeholder="Comprehensive Insurance"
                    value={busDetails.ci}
                    onChange={(e) =>
                      setBusDetails({ ...busDetails, ci: e.target.value })
                    }
                  />
                  <h1>Comprehensive Insurance Validity</h1>
                  <DatePicker
                    selected={ci_validity ? new Date(ci_validity) : null}
                    onChange={(date: Date | null) => setCIValidity(date)}
                    className="border border-gray-500 p-3 rounded-md w-full mt-1"
                    dateFormat="MM/dd/yyyy"
                  />
                </div>
                <div className="3rd-row ml-14 mt-10">
                  <h1>Date Purchased</h1>
                  <DatePicker
                    selected={date_purchased ? new Date(date_purchased) : null}
                    onChange={(date: Date | null) => setDatePurchased(date)}
                    className="border border-gray-500 p-3 rounded-md w-full mt-1"
                    dateFormat="MM/dd/yyyy"
                  />
                  <h1 className="mb-4 mt-4">Supplier</h1>
                  <Input
                    className="h-10 text-lg"
                    type="text"
                    placeholder="Supplier"
                    value={busDetails.supplier}
                    onChange={(e) =>
                      setBusDetails({ ...busDetails, supplier: e.target.value })
                    }
                  />
                </div>
                <div className="relative">
                  <div className="buttons absolute bottom-0 right-0 flex flex-col space-y-5 w-24 mb-8 mr-8">
                    <button
                      onClick={handleUpdate}
                      className="flex items-center justify-center px-4 py-2 border-2 border-blue-500 rounded-md text-blue-500 transition-colors duration-300 ease-in-out hover:bg-blue-50"
                    >
                      Update
                    </button>
                    <button
                      onClick={handleCancelClick}
                      className="flex items-center justify-center px-4 py-2 border-2 border-red-500 rounded-md text-red-500 transition-colors duration-300 ease-in-out hover:bg-red-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>
    </section>
  );
};

export default BusUpdate;
