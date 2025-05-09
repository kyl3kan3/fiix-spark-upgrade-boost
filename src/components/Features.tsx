
import { ArrowRight, BarChart2, Calendar, Clock, ClipboardCheck, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const featureItems = [
  {
    title: "Work Order Management",
    description: "Create, assign, and track work orders with ease to ensure nothing falls through the cracks.",
    icon: <ClipboardCheck className="h-12 w-12 p-2 bg-fiix-100 text-fiix-600 rounded-lg" />,
  },
  {
    title: "Preventive Maintenance",
    description: "Schedule recurring maintenance tasks to prevent costly breakdowns and extend asset life.",
    icon: <Calendar className="h-12 w-12 p-2 bg-fiix-100 text-fiix-600 rounded-lg" />,
  },
  {
    title: "Asset Management",
    description: "Keep detailed records of all your equipment, including maintenance history and documentation.",
    icon: <Settings className="h-12 w-12 p-2 bg-fiix-100 text-fiix-600 rounded-lg" />,
  },
  {
    title: "Team Collaboration",
    description: "Improve communication between maintenance teams with real-time updates and notifications.",
    icon: <Users className="h-12 w-12 p-2 bg-fiix-100 text-fiix-600 rounded-lg" />,
  },
  {
    title: "Performance Analytics",
    description: "Gain insights into your maintenance operations with detailed reports and KPI tracking.",
    icon: <BarChart2 className="h-12 w-12 p-2 bg-fiix-100 text-fiix-600 rounded-lg" />,
  },
  {
    title: "Downtime Tracking",
    description: "Monitor equipment downtime and identify opportunities to improve efficiency.",
    icon: <Clock className="h-12 w-12 p-2 bg-fiix-100 text-fiix-600 rounded-lg" />,
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Powerful Features for Maintenance Excellence
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Fiix brings everything you need to streamline your maintenance operations in one intuitive platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureItems.map((item, index) => (
            <div 
              key={index} 
              className="p-6 border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white"
            >
              <div className="mb-6">{item.icon}</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button 
            className="bg-fiix-600 hover:bg-fiix-700 text-white px-8 py-6 text-lg group"
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
