
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FeatureCard from "./features/FeatureCard";
import FeatureFilters from "./features/FeatureFilters";
import { featureItems } from "./features/FeaturesData";
import { SIGNUP_PATH } from "@/data/signupRoute";

type FeaturesProps = {
  /** Home stacks sections with a single signup CTA at the end; the /features page uses its own header + CTA. */
  variant?: "home" | "page";
};

const Features = ({ variant = "page" }: FeaturesProps) => {
 const navigate = useNavigate();
 const [selectedCategory, setSelectedCategory] = useState("all");
 const [viewType, setViewType] = useState("grid");
 const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
 
 const filteredFeatures = selectedCategory === "all" 
 ? featureItems 
 : featureItems.filter(item => item.category === selectedCategory);

 const handleDemoClick = (title: string, demoEnabled: boolean) => {
 setSelectedFeature(title);
 
 if (demoEnabled) {
 navigate(`/feature/${encodeURIComponent(title)}`);
 } else {
 navigate(SIGNUP_PATH);
 }
 };
 
 return (
 <section id="features" className="py-20 bg-card border-y border-border">
 <div className="container mx-auto px-4">
 {variant === "home" && (
 <h2 className="font-headline text-3xl md:text-4xl font-bold mb-10 text-center text-foreground">
 Features
 </h2>
 )}
 
 <FeatureFilters
 selectedCategory={selectedCategory}
 viewType={viewType}
 onCategoryChange={setSelectedCategory}
 onViewTypeChange={setViewType}
 />

 <div className={viewType === "grid" 
 ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
 : "flex flex-col space-y-6"
 }>
 {filteredFeatures.map((item, index) => (
 <FeatureCard
 key={index}
 item={item}
 selectedFeature={selectedFeature}
 viewType={viewType}
 onSelectFeature={handleDemoClick}
 compact={variant === "home"}
 />
 ))}
 </div>

 {filteredFeatures.length === 0 && (
 <div className="text-center py-12">
 <p className="text-xl text-foreground">No features in this category.</p>
 </div>
 )}
 </div>
 </section>
 );
};

export default Features;
