
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
  return (
    <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 animate-entry">
      <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">
        Welcome, <span className="text-maintenease-500">{userName}</span>
      </h1>
      <p className="text-gray-600 dark:text-gray-300 flex items-center">
        <span className="bg-maintenease-100 dark:bg-maintenease-900 text-maintenease-700 dark:text-maintenease-300 px-3 py-1 rounded-full text-sm font-medium mr-2">
          {role}
        </span> 
        at {companyName || "Your Company"}
      </p>
    </div>
  );
};

export default DashboardWelcomeCard;
