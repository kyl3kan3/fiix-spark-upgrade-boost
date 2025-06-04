
import React from "react";
import { type Vendor } from "@/services/vendorService";

interface VendorRatingProps {
  vendor: Vendor;
}

const VendorRating: React.FC<VendorRatingProps> = ({ vendor }) => {
  if (!vendor.rating) return null;

  return (
    <div className="flex items-center gap-1 mt-2">
      <span className="font-medium text-sm text-gray-600">Rating:</span>
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`text-sm ${
              i < vendor.rating! ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            ★
          </span>
        ))}
        <span className="text-gray-600 text-sm">({vendor.rating}/5)</span>
      </div>
    </div>
  );
};

export default VendorRating;
