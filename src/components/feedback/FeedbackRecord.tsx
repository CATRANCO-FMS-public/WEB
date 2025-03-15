import React from "react";

interface FeedbackRecordProps {
  phoneNumber: string;
  rating: number;
  comment: string;
  date: string;
  onDelete: () => void;
}

const FeedbackRecord: React.FC<FeedbackRecordProps> = ({
  phoneNumber = "N/A",
  rating = 0,
  comment = "No comments provided",
  date = "N/A",
  onDelete,
}) => {
  // Function to render stars
  const renderStars = (rating: number) => {
    const totalStars = 5;
    return Array.from({ length: totalStars }, (_, i) =>
      i < rating ? (
        <span key={i} className="text-yellow-500">&#9733;</span>
      ) : (
        <span key={i} className="text-gray-300">&#9734;</span>
      )
    );
  };

  return (
    <div className="record-box-container mr-1 bg-white border-gray-200 rounded-lg border-2 flex flex-col p-4 break-words text-sm h-full">
      <div className="flex-1">
        <table className="w-full border-collapse -mb-1 table-auto">
          <tbody>
            <tr>
              <td className="border p-2 font-bold">Phone Number:</td>
              <td className="border p-2">{phoneNumber}</td>
            </tr>
            <tr>
              <td className="border p-2 font-bold">Rating:</td>
              <td className="border p-2">{renderStars(rating)}</td>
            </tr>
            <tr>
              <td className="border p-2 font-bold">Comment:</td>
              <td className="border p-2 whitespace-pre-wrap">{comment}</td>
            </tr>
            <tr>
              <td className="border p-2 font-bold">Date:</td>
              <td className="border p-2">{date}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* This button will always be at the bottom */}
      <div className="mt-4">
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 w-full"
          onClick={onDelete}
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default FeedbackRecord;
