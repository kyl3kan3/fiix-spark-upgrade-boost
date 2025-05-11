
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, PieChart, LineChart, FilterIcon } from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart as RechartLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart as RechartBarChart,
  Bar
} from "recharts";
import { toast } from "sonner";

// Sample data for reports
const monthlyWorkOrders = [
  { month: "Jan", completed: 42, requested: 52 },
  { month: "Feb", completed: 47, requested: 55 },
  { month: "Mar", completed: 51, requested: 58 },
  { month: "Apr", completed: 56, requested: 61 },
  { month: "May", completed: 62, requested: 65 },
  { month: "Jun", completed: 58, requested: 60 },
];

const ReportsContent: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  
  const handleGenerateReport = (reportType: string) => {
    setSelectedReport(reportType);
    toast.success(`${reportType} report generated successfully`);
  };

  const handleGenerateCustomReport = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Custom report generated successfully");
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-100 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Available Reports</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full inline-block mb-2">
                  <BarChart3 className="h-6 w-6 text-blue-700" />
                </div>
                <h3 className="font-medium">Work Order Statistics</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Analyze work order completion rates, average resolution times, and more.
              </p>
              <Button 
                className="w-full bg-fiix-500 hover:bg-fiix-600" 
                onClick={() => handleGenerateReport("Work Order Statistics")}
              >
                Generate Report
              </Button>
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
              <Button 
                className="w-full bg-fiix-500 hover:bg-fiix-600"
                onClick={() => handleGenerateReport("Asset Performance")}
              >
                Generate Report
              </Button>
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
              <Button 
                className="w-full bg-fiix-500 hover:bg-fiix-600"
                onClick={() => handleGenerateReport("Maintenance Trends")}
              >
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {selectedReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedReport === "Work Order Statistics" && <BarChart3 className="h-5 w-5" />}
                {selectedReport === "Asset Performance" && <PieChart className="h-5 w-5" />}
                {selectedReport === "Maintenance Trends" && <LineChart className="h-5 w-5" />}
                <span>{selectedReport}</span>
              </div>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <FilterIcon className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                {selectedReport === "Work Order Statistics" ? (
                  <RechartBarChart data={monthlyWorkOrders}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="requested" fill="#8884d8" name="Work Orders Requested" />
                    <Bar dataKey="completed" fill="#82ca9d" name="Work Orders Completed" />
                  </RechartBarChart>
                ) : selectedReport === "Asset Performance" ? (
                  <RechartLineChart data={monthlyWorkOrders}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="completed" stroke="#8884d8" activeDot={{ r: 8 }} name="Performance Rating" />
                  </RechartLineChart>
                ) : (
                  <RechartLineChart data={monthlyWorkOrders}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="requested" stroke="#8884d8" activeDot={{ r: 8 }} name="Preventive" />
                    <Line type="monotone" dataKey="completed" stroke="#82ca9d" activeDot={{ r: 8 }} name="Corrective" />
                  </RechartLineChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="bg-gray-100 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Custom Reports</h3>
        <p className="mb-4">Create customized reports by selecting the metrics and data you want to analyze.</p>
        
        <form className="space-y-4" onSubmit={handleGenerateCustomReport}>
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
          
          <Button type="submit" className="bg-fiix-500 hover:bg-fiix-600">Generate Custom Report</Button>
        </form>
      </div>
    </div>
  );
};

export default ReportsContent;
