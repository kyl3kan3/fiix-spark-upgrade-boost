
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface DashboardErrorStateProps {
  errorMessage: string;
}

const DashboardErrorState: React.FC<DashboardErrorStateProps> = ({ errorMessage }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-maintenease-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center glass-morphism dark:glass-morphism-dark p-10 rounded-xl max-w-md">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
        <p className="mt-4 text-xl font-medium text-red-600">Dashboard Error</p>
        <p className="text-gray-600 dark:text-gray-300 mt-2">{errorMessage}</p>
        <div className="mt-6 flex justify-center">
          <Button 
            onClick={() => window.location.reload()}
            className="mr-2"
          >
            Refresh Page
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate("/auth")}
          >
            Return to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardErrorState;
