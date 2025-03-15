import React, { useEffect } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const visiblePages = 3; // Limit to 3 visible page buttons
  const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
  const endPage = Math.min(totalPages, startPage + visiblePages - 1);

  const pages = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);

  // Automatically adjust currentPage if it's greater than totalPages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      onPageChange(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
      onPageChange(1);
    }
  }, [currentPage, totalPages, onPageChange]);

  // Don't render pagination if there are no pages
  if (totalPages === 0) return null;

  return (
    <div className="pagination flex items-center justify-center space-x-2 mt-6">
      <button
        className={`px-3 py-1 border rounded ${
          currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-gray-700 hover:bg-gray-200"
        }`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &lt; Previous
      </button>

      {pages.map((page) => (
        <button
          key={page}
          className={`px-3 py-1 border rounded ${
            page === currentPage ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-200"
          }`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      <button
        className={`px-3 py-1 border rounded ${
          currentPage === totalPages ? "cursor-not-allowed text-gray-400" : "text-gray-700 hover:bg-gray-200"
        }`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next &gt;
      </button>
    </div>
  );
};

export default Pagination;
