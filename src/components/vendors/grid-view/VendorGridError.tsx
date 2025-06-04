
import React from "react";

const VendorGridError: React.FC = () => {
  return (
    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <p className="text-red-500 dark:text-red-400">Error loading vendors.</p>
    </div>
  );
};

export default VendorGridError;
