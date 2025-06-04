
import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import VendorImportDialog from "./VendorImportDialog";

interface VendorPageActionsProps {
  onExport: () => void;
}

const VendorPageActions: React.FC<VendorPageActionsProps> = ({ onExport }) => {
  return (
    <div className="flex gap-2">
      <VendorImportDialog />
      <Button variant="outline" onClick={onExport}>
        <Download className="h-4 w-4 mr-2" />
        Export All
      </Button>
    </div>
  );
};

export default VendorPageActions;
