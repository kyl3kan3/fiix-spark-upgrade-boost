
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const EmptyWorkOrdersState: React.FC = () => {
  return (
    <div className="text-center py-10 text-gray-500">
      <p>No work orders found</p>
      <Link to="/work-orders/new" className="mt-4 inline-block">
        <Button variant="outline" className="border-maintenease-600 text-maintenease-600 hover:bg-maintenease-50">
          Create your first work order
        </Button>
      </Link>
    </div>
  );
};

export default EmptyWorkOrdersState;
