"use client";

import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center gap-1.5 sm:gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 sm:px-3 sm:py-1.5 border rounded-md disabled:opacity-50 text-sm min-w-[36px] sm:min-w-0"
      >
        &laquo;
      </button>
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 sm:px-3 sm:py-1.5 border rounded-md text-sm min-w-[36px] sm:min-w-0 ${
            currentPage === page ? "bg-blue-600 text-white" : ""
          }`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 sm:px-3 sm:py-1.5 border rounded-md disabled:opacity-50 text-sm min-w-[36px] sm:min-w-0"
      >
        &raquo;
      </button>
    </div>
  );
};

export default Pagination;
