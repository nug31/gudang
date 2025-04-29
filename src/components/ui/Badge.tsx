import React from "react";
import { RequestStatus } from "../../types";

interface BadgeProps {
  status: RequestStatus;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = "" }) => {
  let baseClasses = "px-3 py-1 text-xs font-medium rounded-full";

  const statusClasses = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-green-100 text-green-800",
    denied: "bg-red-100 text-red-800",
    fulfilled: "bg-blue-100 text-blue-800",
    out_of_stock: "bg-gray-100 text-gray-800",
  };

  const statusText = {
    pending: "Pending",
    approved: "Approved",
    denied: "Denied",
    fulfilled: "Fulfilled",
    out_of_stock: "Out of Stock",
  };

  return (
    <span className={`${baseClasses} ${statusClasses[status]} ${className}`}>
      {statusText[status]}
    </span>
  );
};
