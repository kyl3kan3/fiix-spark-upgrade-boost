
import React from "react";
import { Button } from "@/components/ui/button";

interface SystemSettingsProps {
  onResetSetup: () => void;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ onResetSetup }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">System Settings</h3>
        <p className="text-sm text-muted-foreground">
          Advanced system configuration options.
        </p>
      </div>
      <div className="border-t pt-5">
        <Button 
          variant="destructive" 
          onClick={onResetSetup}
        >
          Reset Setup Wizard
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          This will allow you to go through the setup process again.
        </p>
      </div>
    </div>
  );
};

export default SystemSettings;
