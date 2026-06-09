
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
 const height = isMobile ? 300 : 400;
 switch (reportType) {
 case "Work Order Statistics":
 return (
 <div style={{ width: "100%", height }}>
 <BarChartComponent data={data} />
 </div>
 );
 case "Asset Performance":
 return (
 <div style={{ width: "100%", height }}>
 <PieChartComponent data={data} />
 </div>
 );
 case "Maintenance Trends":
 case "Custom Report":
 return (
 <div style={{ width: "100%", height }}>
 <LineChartComponent data={data} />
 </div>
 );
 default:
 return (
 <div className="flex flex-col items-center justify-center h-64">
 <BarChartIcon className="h-12 w-12 text-muted-foreground mb-2" />
 <p className="text-muted-foreground">Select a report type to generate a chart</p>
 </div>
 );
 }
 };
 
 const handlePrint = () => {
 window.print();
 };

 return (
 <Card id="report-chart-container" className="bg-card border border-border shadow-sm">
 <CardHeader className="flex flex-row items-center justify-between pb-2">
 <CardTitle className="font-headline text-xl font-bold text-foreground">{reportType}</CardTitle>
 <div className="flex items-center gap-2">
 <Button
 variant="outline"
 size="sm"
 onClick={handlePrint}
 className="hidden md:flex items-center gap-2 border-border"
 >
 <Printer className="h-4 w-4" />
 Print
 </Button>
 <Button
 size="sm"
 onClick={onExport}
 disabled={isExporting}
 className="bg-primary hover:bg-primary-variant text-primary-foreground"
 >
 <Download className="h-4 w-4 mr-2" />
 {isExporting ? "Exporting..." : "Export PDF"}
 </Button>
 </div>
 </CardHeader>
 <CardContent className="pt-4">
 {renderChart()}

 <div className="mt-4 p-4 bg-background rounded-lg border border-border">
 <h4 className="font-semibold text-sm text-foreground mb-2">Report Summary</h4>
 <p className="text-sm text-muted-foreground">
 {reportType === "Work Order Statistics" && "Work orders created, completed, and in progress per month over the last 6 months."}
 {reportType === "Asset Performance" && "Distribution of work orders across your most active assets over the last 6 months."}
 {reportType === "Maintenance Trends" && "Preventive vs. corrective work per month, classified by work order priority."}
 {reportType === "Custom Report" && "Work order activity for the most recent months."}
 </p>
 </div>
 </CardContent>
 </Card>
 );
};

export default ReportChart;
