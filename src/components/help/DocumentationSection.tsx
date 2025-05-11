
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface DocumentationSectionProps {
  searchQuery: string;
}

const DocumentationSection: React.FC<DocumentationSectionProps> = ({ searchQuery }) => {
  // Documentation categories and articles
  const documentationItems = [
    {
      category: "Getting Started",
      articles: [
        {
          title: "System Overview",
          description: "Learn about the key components of MaintenEase",
          content: "MaintenEase is a comprehensive maintenance management system designed to streamline work order processing, asset management, and preventive maintenance scheduling. The system consists of several integrated modules that work together to provide a complete solution for maintenance teams."
        },
        {
          title: "Quick Start Guide",
          description: "Set up your account and start using MaintenEase",
          content: "This quick start guide will help you get up and running with MaintenEase in minutes. First, set up your user profile and organization details. Then, import your assets or create them manually. Finally, configure your team members and start creating work orders."
        }
      ]
    },
    {
      category: "Work Orders",
      articles: [
        {
          title: "Creating Work Orders",
          description: "Step-by-step guide to creating work orders",
          content: "To create a work order, navigate to the Work Orders section and click the 'Create Work Order' button. Fill in the required information including description, priority, assigned technician, and related asset. You can also attach documents and set due dates for the work order."
        },
        {
          title: "Managing Work Order Status",
          description: "Learn how to update and track work order status",
          content: "Work orders in MaintenEase progress through several status stages: New, Assigned, In Progress, On Hold, and Completed. You can update the status from the work order detail page or from the work orders list using the quick actions menu."
        }
      ]
    },
    {
      category: "Asset Management",
      articles: [
        {
          title: "Adding Assets",
          description: "How to add and categorize assets",
          content: "To add a new asset, navigate to the Assets section and click 'Add Asset'. You'll need to provide details such as asset name, type, location, and specifications. You can also upload images and documents related to the asset, and assign it to a parent asset if applicable."
        },
        {
          title: "Asset Lifecycle Management",
          description: "Track assets from acquisition to retirement",
          content: "MaintenEase helps you track the complete lifecycle of your assets from acquisition through operation to eventual retirement or disposal. You can record purchase information, warranty details, depreciation schedules, and replacement plans for each asset."
        }
      ]
    },
    {
      category: "Reports",
      articles: [
        {
          title: "Generating Reports",
          description: "Learn how to create and customize reports",
          content: "MaintenEase offers several built-in report templates including Work Order Statistics, Asset Performance, and Maintenance Trends. To generate a report, go to the Reports section, select the desired report type, specify the date range and other parameters, and click 'Generate'."
        },
        {
          title: "Exporting Reports",
          description: "How to export and share reports",
          content: "After generating a report, you can export it in various formats including PDF, Excel, and CSV. Look for the export buttons near the top of the report display. You can also schedule automated report generation and distribution via email."
        }
      ]
    }
  ];

  // Filter documentation based on search query
  const filteredDocumentation = searchQuery
    ? documentationItems.map(category => ({
        ...category,
        articles: category.articles.filter(article =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.articles.length > 0)
    : documentationItems;

  return (
    <div className="space-y-8">
      {filteredDocumentation.length === 0 ? (
        <p className="text-gray-500">No documentation found for "{searchQuery}"</p>
      ) : (
        filteredDocumentation.map((category, index) => (
          <div key={index}>
            <h2 className="text-xl font-bold mb-4">{category.category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.articles.map((article, articleIndex) => (
                <Card key={articleIndex} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start">
                      <FileText className="h-5 w-5 text-maintenease-600 mt-0.5 mr-2" />
                      <div>
                        <CardTitle className="text-lg">{article.title}</CardTitle>
                        <CardDescription>{article.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-3">{article.content}</p>
                    <div className="mt-4">
                      <a href="#" className="text-sm font-medium text-maintenease-600 hover:underline">
                        Read more
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default DocumentationSection;
