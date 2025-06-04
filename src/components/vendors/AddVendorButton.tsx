
import React from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddVendorButtonProps {
  canAdd: boolean;
}

const AddVendorButton: React.FC<AddVendorButtonProps> = ({ canAdd }) => {
  if (!canAdd) return null;

  return (
    <div className="fixed bottom-8 right-8 z-40">
      <Link to="/vendors/new">
        <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 shadow-lg">
          <Plus className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  );
};

export default AddVendorButton;
