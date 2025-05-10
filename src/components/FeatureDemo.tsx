
import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { featureContentMap } from "./features/FeatureContentMap";
import NotFoundFeature from "./features/NotFoundFeature";

const FeatureDemo = () => {
  const { featureId } = useParams();
  const navigate = useNavigate();
  const decodedFeatureId = featureId ? decodeURIComponent(featureId) : null;
  
  const feature = decodedFeatureId ? featureContentMap[decodedFeatureId] : null;

  if (!feature) {
    return <NotFoundFeature />;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Button 
        onClick={() => navigate('/dashboard')} 
        className="mb-6 bg-gray-100 hover:bg-gray-200 text-gray-800"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{feature.title}</h1>
        <p className="text-xl text-gray-600">{feature.description}</p>
      </div>
      
      {feature.content}
    </div>
  );
};

export default FeatureDemo;
