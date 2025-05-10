
import React from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

const DashboardHeader: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <LayoutDashboard className="h-6 w-6 text-maintenease-600" />
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>
      <Button 
        onClick={() => navigate("/feature/Work%20Order%20Management")} 
        className="bg-maintenease-600 hover:bg-maintenease-700"
      >
        Create Work Order
      </Button>
    </div>
  );
};

export default DashboardHeader;
