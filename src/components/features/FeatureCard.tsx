
import React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FeatureItem } from "./FeaturesData";

interface FeatureCardProps {
  item: FeatureItem;
  selectedFeature: string | null;
  viewType: string;
  onSelectFeature: (title: string, demoEnabled: boolean) => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  item, 
  selectedFeature, 
  viewType, 
  onSelectFeature 
}) => {
  return (
    <Card 
      className={`border border-gray-100 hover:shadow-lg transition-all duration-300 hover:border-fiix-300 group ${
        selectedFeature === item.title ? "ring-2 ring-fiix-500" : ""
      } ${viewType === "list" ? "overflow-hidden" : ""}`}
    >
      <CardContent className={viewType === "grid" ? "p-6" : "p-6 flex flex-col md:flex-row md:items-center gap-6"}>
        <div className={viewType === "grid" 
          ? "mb-6 transform group-hover:scale-110 transition-transform duration-300" 
          : "flex-shrink-0"
        }>
          {item.icon}
        </div>
        
        <div className={viewType === "list" ? "flex-1" : ""}>
          <h3 className="text-xl font-semibold mb-3 text-gray-900">{item.title}</h3>
          <p className="text-gray-600 mb-4">{item.description}</p>
          
          <div className="mt-4 space-y-2">
            {item.benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center text-sm text-gray-600">
                <Check className="h-4 w-4 text-fiix-500 mr-2 flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
          
          <Button 
            className="mt-6 bg-fiix-500 hover:bg-fiix-600 text-white"
            onClick={() => onSelectFeature(item.title, item.demoEnabled)}
          >
            {item.demoEnabled ? "Try Demo" : "Coming Soon"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
