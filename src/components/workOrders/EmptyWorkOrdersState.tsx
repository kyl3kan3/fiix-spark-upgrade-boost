
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const EmptyWorkOrdersState: React.FC = () => {
  return (
    <div className="text-center py-10 text-gray-500">
      <p>No work orders found</p>
      <Link to="/work-orders/new" className="mt-4 inline-block">
        <Button variant="outline">Create your first work order</Button>
      </Link>
    </div>
  );
};

export default EmptyWorkOrdersState;
