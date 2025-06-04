
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const VendorDetailHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4 mb-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/vendors")}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Vendors
      </Button>
    </div>
  );
};

export default VendorDetailHeader;
