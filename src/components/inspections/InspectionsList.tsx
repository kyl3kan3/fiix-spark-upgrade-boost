import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Inspection {
  id: string;
  title: string;
  status: string;
  dueDate: string;
  assignedTo: string;
}

const InspectionsList: React.FC = () => {
  const navigate = useNavigate();
  // Initialize with empty array to fix the error
  const inspections: Inspection[] = [];

  return (
    <div>
      {inspections.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No inspections found</h3>
          <p className="text-gray-500 mb-6">
            Start by creating your first inspection checklist
          </p>
          <Button
            onClick={() => navigate("/inspections/new")}
            className="bg-maintenease-600 hover:bg-maintenease-700"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Inspection
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {inspections.map((inspection) => (
            <Card
              key={inspection.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/inspections/${inspection.id}`)}
            >
              {/* Inspection item details would go here */}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InspectionsList;
