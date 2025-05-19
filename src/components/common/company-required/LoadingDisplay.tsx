
import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingDisplayProps {
  message?: string;
}

export const LoadingDisplay: React.FC<LoadingDisplayProps> = ({ message = "Loading your profile..." }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-maintenease-600 mx-auto" />
        <p className="mt-4 text-lg font-medium text-gray-700">{message}</p>
      </div>
    </div>
  );
};
