import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ClipboardX } from "lucide-react";

const InspectionNotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4 md:px-6 lg:px-8 py-16 text-center">
      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-4">
        <ClipboardX className="h-6 w-6 text-muted-foreground" />
      </div>
      <h2 className="font-headline text-xl font-semibold mb-2">Inspection Not Found</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
        We couldn't find the inspection you're looking for. It may have been deleted or you may not have access to view it.
      </p>
      <Button variant="outline" onClick={() => navigate("/inspections")}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Inspections
      </Button>
    </div>
  );
};

export default InspectionNotFound;
