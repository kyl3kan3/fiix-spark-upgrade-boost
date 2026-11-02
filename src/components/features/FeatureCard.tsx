
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FeatureItem } from "./FeaturesData";

interface FeatureCardProps {
 item: FeatureItem;
 selectedFeature: string | null;
 viewType: string;
 onSelectFeature: (title: string, demoEnabled: boolean) => void;
 compact?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
 item, 
 selectedFeature, 
 viewType, 
 onSelectFeature,
 compact = false,
}) => {
 const demoPath = `/feature/${encodeURIComponent(item.title)}`;

 return (
 <Card 
 className={`border border-border hover:shadow-lg transition-ui duration-300 hover:border-primary/20 group ${ selectedFeature === item.title ? "ring-2 ring-primary" : "" } ${viewType === "list" ? "overflow-hidden" : ""}`}
 >
 <CardContent className={viewType === "grid" ? "p-6" : "p-6 flex flex-col md:flex-row md:items-center gap-6"}>
 <div className={viewType === "grid" 
 ? "mb-6 transform group-hover:scale-110 transition-transform duration-300" 
 : "flex-shrink-0"
 }>
 {item.icon}
 </div>
 
 <div className={viewType === "list" ? "flex-1" : ""}>
 <h3 className="text-xl font-semibold mb-3 text-foreground">{item.title}</h3>
 {!compact && <p className="text-foreground mb-4">{item.description}</p>}
 
 {item.demoEnabled ? (
 <Button
 asChild
 className="mt-4 bg-primary hover:bg-primary/90 text-white"
 onClick={() => onSelectFeature(item.title, true)}
 >
 <Link to={demoPath}>Try demo</Link>
 </Button>
 ) : (
 <Button 
 className="mt-4 bg-primary hover:bg-primary/90 text-white"
 onClick={() => onSelectFeature(item.title, false)}
 >
 Start free trial
 </Button>
 )}
 </div>
 </CardContent>
 </Card>
 );
};

export default FeatureCard;
