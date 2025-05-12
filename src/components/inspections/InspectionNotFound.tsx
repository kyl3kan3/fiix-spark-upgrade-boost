
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const InspectionNotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-8">
      <h2 className="text-2xl font-bold mb-4">Inspection Not Found</h2>
      <p className="text-gray-500 mb-6">
        We couldn't find the inspection you're looking for. It may have been deleted or you may not have access to view it.
      </p>
      <Button onClick={() => navigate("/inspections")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Inspections
      </Button>
    </div>
  );
};

export default InspectionNotFound;
