
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import FeatureCard from "./features/FeatureCard";
import FeatureFilters from "./features/FeatureFilters";
import { featureItems } from "./features/FeaturesData";

const Features = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewType, setViewType] = useState("grid");
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  
  // Filter features based on selected category
  const filteredFeatures = selectedCategory === "all" 
    ? featureItems 
    : featureItems.filter(item => item.category === selectedCategory);

  const handleDemoClick = (title: string, demoEnabled: boolean) => {
    setSelectedFeature(title);
    
    if (demoEnabled) {
      // Navigate to the feature demo page
      navigate(`/feature/${encodeURIComponent(title)}`);
    } else {
      toast(`${title} demo is coming soon. Please check back later.`);
    }
  };
  
  const handleExploreAll = () => {
    navigate('/feature/Work%20Order%20Management');
  };

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 animate-fade-in">
            Powerful Features for Maintenance Excellence
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Fiix brings everything you need to streamline your maintenance operations in one intuitive platform.
          </p>
          
          <FeatureFilters
            selectedCategory={selectedCategory}
            viewType={viewType}
            onCategoryChange={setSelectedCategory}
            onViewTypeChange={setViewType}
          />
        </div>

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
            />
          ))}
        </div>

        {filteredFeatures.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No features found in this category.</p>
          </div>
        )}

        <div className="mt-16 text-center">
          <Button 
            className="bg-fiix-600 hover:bg-fiix-700 text-white px-8 py-6 text-lg group animate-fade-in"
            onClick={handleExploreAll}
          >
            Explore All Features
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Features;
