
import React from "react";
import { Building2 } from "lucide-react";

interface DashboardWelcomeCardProps {
  userName: string;
  role: string;
  companyName: string;
}

const DashboardWelcomeCard: React.FC<DashboardWelcomeCardProps> = ({
  userName,
  role,
  companyName
}) => {
  const formatRole = (role: string) => {
    // Capitalize the role for display
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="mb-6 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 animate-entry overflow-hidden">
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 text-gray-800 dark:text-white break-words">
        Welcome, <span className="text-maintenease-500">{userName}</span>
      </h1>
      <p className="text-gray-600 dark:text-gray-300 flex flex-wrap items-center gap-2">
        <span className="bg-maintenease-100 dark:bg-maintenease-900 text-maintenease-700 dark:text-maintenease-300 px-3 py-1 rounded-full text-sm font-medium">
          {formatRole(role)}
        </span> 
        {companyName ? (
          <span className="break-words">at {companyName}</span>
        ) : (
          <span className="text-gray-500 break-words">No company assigned</span>
        )}
      </p>
    </div>
  );
};

export default DashboardWelcomeCard;
