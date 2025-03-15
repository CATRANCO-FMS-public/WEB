import React, { useState } from "react";

const ViewBioDataModal = ({ isOpen, onClose, profile }) => {
  if (!isOpen || !profile) return null;

  const [showCredentials, setShowCredentials] = useState(false);

  const {
    first_name,
    last_name,
    date_of_birth,
    license_number,
    address,
    contact_number,
    contact_person,
    sex,
    date_hired,
    status,
    position,
  } = profile.profile;

  const { username } = profile.user;

  const age = calculateAge(date_of_birth);
  const isDispatcher = position === "dispatcher";

  // Generate username based on the format: LastName_YYYYMMDD
  const generateUsername = () => {
    const hireDate = new Date(date_hired);
    const year = hireDate.getFullYear();
    const month = String(hireDate.getMonth() + 1).padStart(2, '0');
    const day = String(hireDate.getDate()).padStart(2, '0');
    return `${last_name}_${year}${month}${day}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-md w-11/12 md:w-3/4 lg:w-1/2 max-h-[90vh] flex flex-col">
        <h2 className="text-2xl font-bold mb-4">
          Full Data of {first_name} {last_name}
        </h2>
        
        <div className="overflow-y-auto flex-grow pr-2">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="border p-2 font-bold">Name:</td>
                <td className="border p-2">
                  {first_name} {last_name}
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-bold">Birthday:</td>
                <td className="border p-2">{date_of_birth}</td>
              </tr>
              <tr>
                <td className="border p-2 font-bold">Age:</td>
                <td className="border p-2">{age}</td>
              </tr>
              <tr>
                <td className="border p-2 font-bold">Gender:</td>
                <td className="border p-2">{sex}</td>
              </tr>
              <tr>
                <td className="border p-2 font-bold">License Number:</td>
                <td className="border p-2">{license_number}</td>
              </tr>
              <tr>
                <td className="border p-2 font-bold">Address:</td>
                <td className="border p-2">{address}</td>
              </tr>
              <tr>
                <td className="border p-2 font-bold">Contact Number:</td>
                <td className="border p-2">{contact_number}</td>
              </tr>
              <tr>
                <td className="border p-2 font-bold">Contact Person:</td>
                <td className="border p-2">{contact_person}</td>
              </tr>
              <tr>
                <td className="border p-2 font-bold">Date Hired:</td>
                <td className="border p-2">{date_hired || "N/A"}</td>
              </tr>
              <tr>
                <td className="border p-2 font-bold">Status:</td>
                <td className="border p-2">{status || "Active"}</td>
              </tr>
              <tr>
                <td className="border p-2 font-bold">Position:</td>
                <td className="border p-2">{position}</td>
              </tr>
              {isDispatcher && (
                <tr>
                  <td className="border p-2 font-bold">Mobile App Credentials:</td>
                  <td className="border p-2">
                    <button
                      onClick={() => setShowCredentials(!showCredentials)}
                      className="text-blue-500 hover:text-blue-700 underline"
                    >
                      {showCredentials ? "Hide Credentials" : "Show Credentials"}
                    </button>
                    {showCredentials && (
                      <div className="mt-2 p-2 bg-gray-100 rounded">
                        <p><strong>Username:</strong> {username}</p>
                        <p><strong>Default Password:</strong> {username}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Note: Please change your password upon first login
                        </p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-4 pt-4 border-t">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

function calculateAge(birthday) {
  const birthDate = new Date(birthday);
  const ageDiff = Date.now() - birthDate.getTime();
  return new Date(ageDiff).getUTCFullYear() - 1970;
}

export default ViewBioDataModal;
