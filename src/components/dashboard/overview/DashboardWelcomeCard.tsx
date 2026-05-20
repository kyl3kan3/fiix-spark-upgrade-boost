
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
 <div className="mb-6 bg-card p-4 md:p-6 rounded-xl shadow-sm border border-border animate-entry overflow-hidden">
 <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 text-foreground break-words">
 Welcome, <span className="text-maintenease-500">{userName}</span>
 </h1>
 <p className="text-foreground flex flex-wrap items-center gap-2">
 <span className="bg-maintenease-100 dark:bg-maintenease-900 text-maintenease-700 dark:text-maintenease-300 px-3 py-1 rounded-full text-sm font-medium">
 {formatRole(role)}
 </span> 
 {companyName ? (
 <span className="break-words">at {companyName}</span>
 ) : (
 <span className="text-muted-foreground break-words">No company assigned</span>
 )}
 </p>
 </div>
 );
};

export default DashboardWelcomeCard;
