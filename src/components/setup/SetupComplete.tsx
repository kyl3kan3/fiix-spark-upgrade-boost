
import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SetupComplete: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <div className="rounded-full bg-green-100 p-3 mb-6">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2">Setup Complete!</h2>
      
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        Your MaintenEase system is now configured and ready to use.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mb-8">
        <div className="bg-gray-50 p-6 rounded-lg border text-center">
          <div className="text-3xl font-bold text-maintenease-600 mb-2">
            <span className="inline-block bg-maintenease-100 rounded-full h-12 w-12 flex items-center justify-center">
              1
            </span>
          </div>
          <h3 className="font-semibold mb-1">Add Assets</h3>
          <p className="text-sm text-muted-foreground">
            Start by adding your equipment and assets
          </p>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg border text-center">
          <div className="text-3xl font-bold text-maintenease-600 mb-2">
            <span className="inline-block bg-maintenease-100 rounded-full h-12 w-12 flex items-center justify-center">
              2
            </span>
          </div>
          <h3 className="font-semibold mb-1">Create Work Orders</h3>
          <p className="text-sm text-muted-foreground">
            Set up maintenance tasks and work orders
          </p>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg border text-center">
          <div className="text-3xl font-bold text-maintenease-600 mb-2">
            <span className="inline-block bg-maintenease-100 rounded-full h-12 w-12 flex items-center justify-center">
              3
            </span>
          </div>
          <h3 className="font-semibold mb-1">Invite Your Team</h3>
          <p className="text-sm text-muted-foreground">
            Add team members to collaborate
          </p>
        </div>
      </div>
      
      <Button size="lg" className="gap-2 mb-6" onClick={() => navigate('/dashboard')}>
        Go to Dashboard <ArrowRight className="h-4 w-4" />
      </Button>
      
      <p className="text-sm text-muted-foreground">
        You can modify these settings anytime from the Settings page
      </p>
    </div>
  );
};

export default SetupComplete;
