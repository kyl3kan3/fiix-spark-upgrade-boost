
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer } from "recharts";
import { BarChart as BarChartIcon, Download, Printer } from "lucide-react";
import { BarChartComponent, LineChartComponent, PieChartComponent } from "./ChartComponents";

interface ReportChartProps {
  reportType: string;
  data: any[];
  isMobile: boolean;
  isExporting: boolean;
  onExport: () => void;
}

const ReportChart: React.FC<ReportChartProps> = ({ 
  reportType, 
  data, 
  isMobile, 
  isExporting,
  onExport 
}) => {
  // Determine which chart to render based on report type
  const renderChart = () => {
    switch (reportType) {
      case "Work Order Statistics":
        return (
          <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
            <BarChartComponent data={data} />
          </ResponsiveContainer>
        );
      case "Asset Performance":
        return (
          <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
            <PieChartComponent data={data} />
          </ResponsiveContainer>
        );
      case "Maintenance Trends":
      case "Custom Report":
        return (
          <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
            <LineChartComponent data={data} />
          </ResponsiveContainer>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-64">
            <BarChartIcon className="h-12 w-12 text-gray-300 mb-2" />
            <p className="text-gray-500">Select a report type to generate a chart</p>
          </div>
        );
    }
  };
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <Card id="report-chart-container">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">{reportType}</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="hidden md:flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button 
            size="sm"
            onClick={onExport}
            disabled={isExporting}
            className="bg-maintenease-500 hover:bg-maintenease-600 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export PDF"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {renderChart()}
        
        <div className="mt-4">
          <h4 className="font-medium text-sm mb-2">Report Summary</h4>
          <p className="text-sm text-gray-600">
            This {reportType.toLowerCase()} report shows data from the last 30 days. 
            {reportType === "Work Order Statistics" && " Work orders have increased by 12% compared to the previous period."}
            {reportType === "Asset Performance" && " Asset performance has improved with 8% less downtime compared to the previous period."}
            {reportType === "Maintenance Trends" && " Preventive maintenance has increased by 15% while corrective maintenance has decreased."}
            {reportType === "Custom Report" && " This custom report reflects the parameters you've selected."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportChart;
