
import React from "react";
import { Loader2 } from "lucide-react";

interface SetupLoaderProps {
  message?: string;
}

export const SetupLoader: React.FC<SetupLoaderProps> = ({
  message = "Loading setup...",
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};
