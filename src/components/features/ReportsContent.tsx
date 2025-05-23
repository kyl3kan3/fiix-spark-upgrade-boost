
import React, { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { exportReportToPdf } from "@/utils/pdfExport";
import ReportsList from "./reports/ReportsList";
import ReportChart from "./reports/ReportChart";
import CustomReportForm from "./reports/CustomReportForm";
import { monthlyWorkOrders, assetPerformanceData, maintenanceTrendsData } from "./reports/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const ReportsContent: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  
  // Simulate loading state for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleGenerateReport = (reportType: string) => {
    setSelectedReport(reportType);
    toast.success(`${reportType} report generated successfully`);
  };

  const handleGenerateCustomReport = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Custom report generated successfully");
    setSelectedReport("Custom Report");
  };

  const handleExportPdf = async () => {
    if (!selectedReport) return;
    
    setIsExporting(true);
    try {
      const dataToExport = getReportData();
      await exportReportToPdf(selectedReport, dataToExport);
      toast.success("Report exported to PDF successfully");
    } catch (error) {
      toast.error("Failed to export report");
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const getReportData = () => {
    switch (selectedReport) {
      case "Work Order Statistics":
        return monthlyWorkOrders;
      case "Asset Performance":
        return assetPerformanceData;
      case "Maintenance Trends":
        return maintenanceTrendsData;
      case "Custom Report":
        // In a real app, this would be generated from custom parameters
        return [...monthlyWorkOrders].slice(0, 5);
      default:
        return monthlyWorkOrders;
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-fiix-500" />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Analytics & Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Generate reports based on your maintenance data to gain insights and make informed decisions.
          </p>
          
          {/* Available Reports Section */}
          <ReportsList onGenerateReport={handleGenerateReport} />
        </CardContent>
      </Card>
      
      {/* Selected Report Chart */}
      {selectedReport && (
        <ReportChart 
          reportType={selectedReport}
          data={getReportData()}
          isMobile={isMobile}
          isExporting={isExporting}
          onExport={handleExportPdf}
        />
      )}
      
      {/* Custom Reports Section */}
      <CustomReportForm onSubmit={handleGenerateCustomReport} />
    </div>
  );
};

export default ReportsContent;
