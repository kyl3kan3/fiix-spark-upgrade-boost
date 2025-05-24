
import React from "react";
import { Loader2 } from "lucide-react";

interface SetupLoaderProps {
  message?: string;
}

export const SetupLoader: React.FC<SetupLoaderProps> = ({ 
  message = "Loading setup..." 
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="mt-4">{message}</p>
      </div>
    </div>
  );
};
