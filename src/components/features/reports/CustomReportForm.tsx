
import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface CustomReportFormProps {
  onSubmit: (e: React.FormEvent) => void;
}

const CustomReportForm: React.FC<CustomReportFormProps> = ({ onSubmit }) => {
  const metrics = ["Completion Time", "Cost", "Labor Hours", "Parts Used", "Downtime", "Failure Causes"];
  
  return (
    <div className="bg-gray-100 p-6 rounded-lg">
      <h3 className="text-lg font-medium mb-4">Custom Reports</h3>
      <p className="mb-4">Create customized reports by selecting the metrics and data you want to analyze.</p>
      
      <form className="space-y-4" onSubmit={onSubmit}>
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
            {metrics.map((metric) => (
              <div key={metric} className="flex items-center">
                <input type="checkbox" id={metric} className="mr-2" />
                <label htmlFor={metric} className="text-sm">{metric}</label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex gap-4">
          <Button 
            type="submit" 
            className="bg-fiix-500 hover:bg-fiix-600"
          >
            Generate Custom Report
          </Button>
          <Button 
            type="button"
            variant="outline"
            onClick={() => toast.info("PDF export will be available after generating the report")}
            className="flex items-center gap-2"
            disabled={true}
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CustomReportForm;
