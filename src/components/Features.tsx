
import { useState } from "react";
import { ArrowRight, BarChart2, Calendar, Clock, ClipboardCheck, Settings, Users, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

// Feature categories
const categories = [
  { value: "all", label: "All Features" },
  { value: "core", label: "Core Features" },
  { value: "advanced", label: "Advanced" },
  { value: "reporting", label: "Reporting" },
];

// Features data with categories
const featureItems = [
  {
    title: "Work Order Management",
    description: "Create, assign, and track work orders with ease to ensure nothing falls through the cracks.",
    icon: <ClipboardCheck className="h-12 w-12 p-2 bg-fiix-100 text-fiix-600 rounded-lg" />,
    category: "core",
    benefits: ["Streamlined workflows", "Real-time updates", "Mobile accessibility"],
  },
  {
    title: "Preventive Maintenance",
    description: "Schedule recurring maintenance tasks to prevent costly breakdowns and extend asset life.",
    icon: <Calendar className="h-12 w-12 p-2 bg-fiix-100 text-fiix-600 rounded-lg" />,
    category: "core",
    benefits: ["Reduce unexpected downtime", "Extend equipment life", "Optimize maintenance schedules"],
  },
  {
    title: "Asset Management",
    description: "Keep detailed records of all your equipment, including maintenance history and documentation.",
    icon: <Settings className="h-12 w-12 p-2 bg-fiix-100 text-fiix-600 rounded-lg" />,
    category: "core",
    benefits: ["Centralized asset database", "Complete maintenance history", "Document storage"],
  },
  {
    title: "Team Collaboration",
    description: "Improve communication between maintenance teams with real-time updates and notifications.",
    icon: <Users className="h-12 w-12 p-2 bg-fiix-100 text-fiix-600 rounded-lg" />,
    category: "advanced",
    benefits: ["Streamlined communication", "Task assignment", "Mobile notifications"],
  },
  {
    title: "Performance Analytics",
    description: "Gain insights into your maintenance operations with detailed reports and KPI tracking.",
    icon: <BarChart2 className="h-12 w-12 p-2 bg-fiix-100 text-fiix-600 rounded-lg" />,
    category: "reporting",
    benefits: ["Customizable dashboards", "Exportable reports", "Key metric tracking"],
  },
  {
    title: "Downtime Tracking",
    description: "Monitor equipment downtime and identify opportunities to improve efficiency.",
    icon: <Clock className="h-12 w-12 p-2 bg-fiix-100 text-fiix-600 rounded-lg" />,
    category: "reporting",
    benefits: ["Minimize production losses", "Identify problem areas", "Calculate true maintenance costs"],
  },
];

const Features = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Filter features based on selected category
  const filteredFeatures = selectedCategory === "all" 
    ? featureItems 
    : featureItems.filter(item => item.category === selectedCategory);

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
          
          {/* Category filter */}
          <div className="max-w-xs mx-auto mb-12">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full border-fiix-300 focus:ring-fiix-500">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFeatures.map((item, index) => (
            <Card 
              key={index} 
              className="border border-gray-100 hover:shadow-lg transition-all duration-300 hover:border-fiix-300 group"
            >
              <CardContent className="p-6">
                <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
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
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button 
            className="bg-fiix-600 hover:bg-fiix-700 text-white px-8 py-6 text-lg group animate-fade-in"
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
