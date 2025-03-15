import React from "react";

interface RecordBoxProps {
  driverId: string;
  driverName: string;
  birthday: string;
  age: number;
  gender?: string; // Optional
  licenseNumber?: string; // Optional
  address: string;
  contactNumber: string;
  contactPerson: string;
  contactPersonNumber?: string; // Optional
  onDelete: () => void;
  onEdit: () => void; // Edit handler
  onView: () => void; // View handler
}

const PersonnelRecord: React.FC<RecordBoxProps> = ({
  driverId,
  driverName,
  birthday,
  age,
  gender,
  licenseNumber,
  address,
  contactNumber,
  contactPerson,
  contactPersonNumber,
  onDelete,
  onEdit,
  onView,
}) => {
  return (
    <div className="record-box-container mr-1 bg-white  border-gray-200 rounded-lg border-2 flex flex-col p-4 break-words text-sm relative">
      {/* Table Content */}
      <table className="w-full border-collapse mb-16 table-auto"><tbody><tr>
        <td className="border p-2 font-bold">Name:</td>
        <td className="border p-2">{driverName}</td>
      </tr><tr>
        <td className="border p-2 font-bold">ID:</td>
        <td className="border p-2">{driverId}</td>
      </tr><tr>
        <td className="border p-2 font-bold">Birthday:</td>
        <td className="border p-2">{birthday}</td>
      </tr><tr>
        <td className="border p-2 font-bold">Age:</td>
        <td className="border p-2">{age}</td>
      </tr>{gender && <tr>
        <td className="border p-2 font-bold">Gender:</td>
        <td className="border p-2">{gender}</td>
      </tr>}{licenseNumber && <tr>
        <td className="border p-2 font-bold">License Number:</td>
        <td className="border p-2">{licenseNumber}</td>
      </tr>}<tr>
        <td className="border p-2 font-bold">Address:</td>
        <td className="border p-2">{address}</td>
      </tr><tr>
        <td className="border p-2 font-bold">Phone Number:</td>
        <td className="border p-2">{contactNumber}</td>
      </tr><tr>
        <td className="border p-2 font-bold">Contact Person:</td>
        <td className="border p-2">{contactPerson}</td>
      </tr>{contactPersonNumber && <tr>
        <td className="border p-2 font-bold">Contact Person Number:</td>
        <td className="border p-2">{contactPersonNumber}</td>
      </tr>}</tbody></table>
{/* Buttons */}
<div className="absolute bottom-4 left-4 right-4 flex justify-between space-x-2">
  <button
    className="px-3 py-1.5 mt-3 bg-red-500 text-white rounded hover:bg-red-600 flex-1 sm:px-1 sm:py-2"
    onClick={(e) => {
      e.stopPropagation();
      onDelete();
    }}
  >
    Remove
  </button>
  <button
    className="px-3 py-1.5 mt-3 bg-blue-500 text-white rounded hover:bg-blue-600 flex-1 sm:px-1 sm:py-2"
    onClick={onEdit}
  >
    Edit
  </button>
  <button
    className="px-3 py-1.5 mt-3 bg-green-500 text-white rounded hover:bg-green-600 flex-1 sm:px-1 sm:py-2"
    onClick={onView}
  >
    View Full Data
  </button>
      </div>
    </div>
  );
};

export default PersonnelRecord;
