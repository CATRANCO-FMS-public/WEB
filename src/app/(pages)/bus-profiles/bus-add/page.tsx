"use client";
import React, { useState, useRef, useEffect } from "react";

import { useRouter } from "next/navigation";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { Input } from "@/components/ui/input";
import Sidebar from "@/components/reusesables/sidebar";
import Header from "@/components/reusesables/header";

import { createVehicle } from "@/services/vehicleService";

const BusAdd = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const [TPLValidity, setTPLValidity] = useState(new Date());
  const [CIValidity, setCIValidity] = useState(new Date());
  const [DatePurchased, setDatePurchased] = useState(new Date());

  // State for input fields
  const [busNumber, setBusNumber] = useState("");
  const [officialReceipt, setOfficialReceipt] = useState("");
  const [certificateOfRegistration, setCertificateOfRegistration] =
    useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [engineNumber, setEngineNumber] = useState("");
  const [chasisNumber, setChasisNumber] = useState("");
  const [thirdPartyInsurance, setThirdPartyInsurance] = useState("");
  const [thirdPartyPolicyNo, setThirdPartyPolicyNo] = useState("");
  const [comprehensiveInsurance, setComprehensiveInsurance] = useState("");
  const [supplier, setSupplier] = useState("");

  const formatDate = (date: Date | null): string | null => {
    if (!date) return null; // Handle null cases
    return date.toISOString().slice(0, 19).replace("T", " "); // Converts to 'YYYY-MM-DD HH:MM:SS'
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  // Close dropdown if clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate bus numbers
  const busOptions = Array.from(
    { length: 11 },
    (_, i) => `BUS ${String(i + 1).padStart(3, "0")}`
  );

  // Function to handle the cancel button click
  const handleCancelClick = () => {
    router.push("/bus-profiles"); // Redirect to bus-profiles on cancel
  };

  // Function to handle the next button click
  const handleNextClick = () => {
    router.push("/bus-profiles/bus-add/assign-personnel"); // Redirect to assign personnel on next
  };

  // Function to handle the submit action for creating a vehicle
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    const vehicleData = {
      vehicle_id: busNumber,
      or_id: officialReceipt,
      cr_id: certificateOfRegistration,
      plate_number: plateNumber,
      engine_number: engineNumber,
      chasis_number: chasisNumber,
      third_pli: thirdPartyInsurance,
      third_pli_policy_no: thirdPartyPolicyNo,
      third_pli_validity: formatDate(TPLValidity),
      ci: comprehensiveInsurance,
      ci_validity: formatDate(CIValidity), // Format date
      date_purchased: formatDate(DatePurchased), // Format date
      supplier: supplier,
    };

    try {
      const response = await createVehicle(vehicleData);
      console.log("Vehicle created successfully:", response);
      // Optionally redirect or show success message
      handleNextClick(); // Redirect to assign personnel after creation
    } catch (error) {
      console.error("Error creating vehicle:", error);
      // Handle error (e.g., show an error message)
    }
  };

  return (
    <section className="h-screen flex flex-row bg-white">
      <Sidebar />

      <section className="w-full bg-slate-200">
        <Header title="Add Bus Record" />

        <section className="right w-full overflow-y-hidden">
          <div className="forms-container ml-14">
            <form
              onSubmit={handleSubmit}
              className="output flex flex-row space-x-2 mt-20"
            >
              <div className="forms flex w-11/12 bg-white h-140 rounded-lg border-1 border-gray-300">
                <div className="1st-row flex-col m-5 ml-14 w-96 space-y-4 mt-10">
                  <h1>Bus Number</h1>
                  <Input
                    className="h-10 text-lg"
                    type="text"
                    placeholder="Bus Number"
                    value={busNumber}
                    onChange={(e) => setBusNumber(e.target.value)} // Update state
                  />
                  <h1>Official Receipt of Registration</h1>
                  <Input
                    className="h-10 text-lg"
                    type="text"
                    placeholder="OR #"
                    value={officialReceipt}
                    onChange={(e) => setOfficialReceipt(e.target.value)} // Update state
                  />
                  <h1>Certificate of Registration</h1>
                  <Input
                    className="h-10 text-lg"
                    type="text"
                    placeholder="CR #"
                    value={certificateOfRegistration}
                    onChange={(e) =>
                      setCertificateOfRegistration(e.target.value)
                    } // Update state
                  />
                  <h1>Plate Number</h1>
                  <Input
                    className="h-10 text-lg"
                    type="text"
                    placeholder="#"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)} // Update state
                  />
                  <h1>Engine Number</h1>
                  <Input
                    className="h-10 text-lg"
                    type="text"
                    placeholder="#"
                    value={engineNumber}
                    onChange={(e) => setEngineNumber(e.target.value)} // Update state
                  />
                  <h1>Chasis Number</h1>
                  <Input
                    className="h-10 text-lg"
                    type="text"
                    placeholder="#"
                    value={chasisNumber}
                    onChange={(e) => setChasisNumber(e.target.value)} // Update state
                  />
                </div>
                <div className="2nd-row flex-col m-5 w-96 space-y-4 mt-10">
                  <h1>3rd Party Liability Insurance</h1>
                  <Input
                    className="h-10 text-lg"
                    type="text"
                    placeholder="#"
                    value={thirdPartyInsurance}
                    onChange={(e) => setThirdPartyInsurance(e.target.value)} // Update state
                  />
                  <h1>3rd Party Liability Insurance Policy No.</h1>
                  <Input
                    className="h-10 text-lg"
                    type="text"
                    placeholder=""
                    value={thirdPartyPolicyNo}
                    onChange={(e) => setThirdPartyPolicyNo(e.target.value)} // Update state
                  />
                  <h1>3rd Party Liability Insurance Validity</h1>
                  <DatePicker
                    id="TPLValidity"
                    selected={TPLValidity}
                    onChange={(date: Date) => setTPLValidity(date)} // Ensure only a single date is passed
                    className="border border-gray-500 p-3 rounded-md w-full mt-1"
                    dateFormat="MM/dd/yyyy"
                  />

                  <h1>Comprehensive Insurance</h1>
                  <Input
                    className="h-10 text-lg"
                    type="text"
                    placeholder=""
                    value={comprehensiveInsurance}
                    onChange={(e) => setComprehensiveInsurance(e.target.value)} // Update state
                  />
                  <h1>Comprehensive Insurance Validity</h1>
                  <DatePicker
                    id="CIValidity"
                    selected={CIValidity}
                    onChange={(date: Date) => setCIValidity(date)} // Ensure only a single date is passed
                    className="border border-gray-500 p-3 rounded-md w-full mt-1"
                    dateFormat="MM/dd/yyyy"
                  />
                </div>
                <div className="3rd-row ml-14 mt-10">
                  <h1>Date Purchased</h1>
                  <DatePicker
                    id="DatePurchased"
                    selected={DatePurchased}
                    onChange={(date: Date) => setDatePurchased(date)} // Ensure only a single date is passed
                    className="border border-gray-500 p-3 rounded-md w-full mt-1"
                    dateFormat="MM/dd/yyyy"
                  />
                  <h1 className="mb-4 mt-4">Supplier</h1>
                  <Input
                    className="h-10 text-lg"
                    type="text"
                    placeholder="Partner Name"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)} // Update state
                  />
                </div>
                <div className="relative">
                  <div className="buttons absolute bottom-0 right-0 flex flex-col space-y-5 w-24 mb-8 mr-8">
                    <button
                      type="submit" // Set button type to submit
                      className="flex items-center justify-center px-4 py-2 border-2 border-blue-500 rounded-md text-blue-500 transition-colors duration-300 ease-in-out hover:bg-blue-50"
                    >
                      Add
                    </button>
                    <button
                      onClick={handleCancelClick} // Call handleCancelClick on Cancel button
                      className="flex items-center justify-center px-4 py-2 border-2 border-red-500 rounded-md text-red-500 transition-colors duration-300 ease-in-out hover:bg-blue-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </section>
      </section>
    </section>
  );
};

export default BusAdd;
