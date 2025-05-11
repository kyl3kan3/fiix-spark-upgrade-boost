
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, Calendar, Wrench, FileText, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TutorialsSectionProps {
  searchQuery: string;
}

interface TutorialItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: string;
}

const TutorialsSection: React.FC<TutorialsSectionProps> = ({ searchQuery }) => {
  const tutorials: TutorialItem[] = [
    {
      title: "Getting Started with MaintenEase",
      description: "Learn the basics of navigating and using MaintenEase",
      icon: <BookOpen className="h-10 w-10 p-2 bg-blue-100 text-blue-600 rounded-lg" />,
      duration: "15 min",
      difficulty: "Beginner",
      category: "Basics"
    },
    {
      title: "Creating and Managing Work Orders",
      description: "Master the work order lifecycle from creation to completion",
      icon: <Wrench className="h-10 w-10 p-2 bg-green-100 text-green-600 rounded-lg" />,
      duration: "20 min",
      difficulty: "Beginner",
      category: "Work Orders"
    },
    {
      title: "Setting Up Preventive Maintenance Schedules",
      description: "Learn how to create and manage recurring maintenance tasks",
      icon: <Calendar className="h-10 w-10 p-2 bg-purple-100 text-purple-600 rounded-lg" />,
      duration: "25 min",
      difficulty: "Intermediate",
      category: "Preventive Maintenance"
    },
    {
      title: "Asset Management Best Practices",
      description: "Tips and tricks for effective asset lifecycle management",
      icon: <Wrench className="h-10 w-10 p-2 bg-yellow-100 text-yellow-600 rounded-lg" />,
      duration: "30 min",
      difficulty: "Intermediate",
      category: "Assets"
    },
    {
      title: "Creating Custom Reports",
      description: "Design and save custom reports for your specific needs",
      icon: <FileText className="h-10 w-10 p-2 bg-red-100 text-red-600 rounded-lg" />,
      duration: "35 min",
      difficulty: "Advanced",
      category: "Reports"
    },
    {
      title: "Analyzing Maintenance Performance",
      description: "Using analytics to improve maintenance effectiveness",
      icon: <BarChart2 className="h-10 w-10 p-2 bg-indigo-100 text-indigo-600 rounded-lg" />,
      duration: "40 min",
      difficulty: "Advanced",
      category: "Analytics"
    }
  ];

  // Filter tutorials based on search query
  const filteredTutorials = searchQuery
    ? tutorials.filter(tutorial =>
        tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutorial.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tutorials;

  // Group tutorials by difficulty level for display
  const beginnerTutorials = filteredTutorials.filter(t => t.difficulty === "Beginner");
  const intermediateTutorials = filteredTutorials.filter(t => t.difficulty === "Intermediate");
  const advancedTutorials = filteredTutorials.filter(t => t.difficulty === "Advanced");

  return (
    <div className="space-y-8">
      {filteredTutorials.length === 0 ? (
        <p className="text-gray-500">No tutorials found for "{searchQuery}"</p>
      ) : (
        <>
          {beginnerTutorials.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                Beginner Tutorials
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {beginnerTutorials.map((tutorial, index) => (
                  <TutorialCard key={index} tutorial={tutorial} />
                ))}
              </div>
            </div>
          )}

          {intermediateTutorials.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                Intermediate Tutorials
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {intermediateTutorials.map((tutorial, index) => (
                  <TutorialCard key={index} tutorial={tutorial} />
                ))}
              </div>
            </div>
          )}

          {advancedTutorials.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                Advanced Tutorials
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {advancedTutorials.map((tutorial, index) => (
                  <TutorialCard key={index} tutorial={tutorial} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const TutorialCard: React.FC<{ tutorial: TutorialItem }> = ({ tutorial }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          {tutorial.icon}
          <span className="flex items-center text-sm text-gray-500">
            <Clock className="h-3 w-3 mr-1" /> {tutorial.duration}
          </span>
        </div>
        <CardTitle className="mt-2">{tutorial.title}</CardTitle>
        <CardDescription>{tutorial.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">Category: {tutorial.category}</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Start Tutorial</Button>
      </CardFooter>
    </Card>
  );
};

export default TutorialsSection;
