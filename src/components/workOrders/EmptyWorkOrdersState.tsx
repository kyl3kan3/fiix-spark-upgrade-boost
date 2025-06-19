
import React from "react";
import { Button } from "@/components/ui/button";

interface EmptyWorkOrdersStateProps {
  onCreateWorkOrder: () => void;
}

const EmptyWorkOrdersState: React.FC<EmptyWorkOrdersStateProps> = ({ onCreateWorkOrder }) => {
  return (
    <div className="text-center py-10 text-gray-500">
      <p>No work orders found</p>
      <Button 
        variant="outline" 
        className="border-maintenease-600 text-maintenease-600 hover:bg-maintenease-50 mt-4"
        onClick={onCreateWorkOrder}
      >
        Create your first work order
      </Button>
    </div>
  );
};

export default EmptyWorkOrdersState;
