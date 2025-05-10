
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, PieChart, LineChart } from "lucide-react";

const ReportsContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-100 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Available Reports</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full inline-block mb-2">
                  <BarChart className="h-6 w-6 text-blue-700" />
                </div>
                <h3 className="font-medium">Work Order Statistics</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Analyze work order completion rates, average resolution times, and more.
              </p>
              <Button className="w-full bg-fiix-500 hover:bg-fiix-600">Generate Report</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <div className="bg-green-100 p-3 rounded-full inline-block mb-2">
                  <PieChart className="h-6 w-6 text-green-700" />
                </div>
                <h3 className="font-medium">Asset Performance</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                View equipment reliability, downtime analysis, and maintenance costs.
              </p>
              <Button className="w-full bg-fiix-500 hover:bg-fiix-600">Generate Report</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <div className="bg-purple-100 p-3 rounded-full inline-block mb-2">
                  <LineChart className="h-6 w-6 text-purple-700" />
                </div>
                <h3 className="font-medium">Maintenance Trends</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Track preventive vs. corrective maintenance over time and identify patterns.
              </p>
              <Button className="w-full bg-fiix-500 hover:bg-fiix-600">Generate Report</Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="bg-gray-100 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Custom Reports</h3>
        <p className="mb-4">Create customized reports by selecting the metrics and data you want to analyze.</p>
        
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Report Type</label>
              <select className="w-full p-2 border rounded-md">
                <option>Work Order Analysis</option>
                <option>Asset Performance</option>
                <option>Maintenance Costs</option>
                <option>Technician Productivity</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Time Period</label>
              <select className="w-full p-2 border rounded-md">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>Custom range</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Include Metrics</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {["Completion Time", "Cost", "Labor Hours", "Parts Used", "Downtime", "Failure Causes"].map((metric) => (
                <div key={metric} className="flex items-center">
                  <input type="checkbox" id={metric} className="mr-2" />
                  <label htmlFor={metric} className="text-sm">{metric}</label>
                </div>
              ))}
            </div>
          </div>
          
          <Button className="bg-fiix-500 hover:bg-fiix-600">Generate Custom Report</Button>
        </div>
      </div>
    </div>
  );
};

export default ReportsContent;
