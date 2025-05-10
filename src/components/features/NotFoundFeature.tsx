
import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFoundFeature: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h2 className="text-2xl font-bold mb-4">Feature Demo Not Found</h2>
      <p className="mb-8">The requested feature demo is not available.</p>
      <Button 
        onClick={() => navigate('/dashboard')} 
        className="bg-fiix-500 hover:bg-fiix-600"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Return to Dashboard
      </Button>
    </div>
  );
};

export default NotFoundFeature;
