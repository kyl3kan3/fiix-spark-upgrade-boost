
import React, { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { exportReportToPdf } from "@/utils/pdfExport";
import ReportsList from "./reports/ReportsList";
import ReportChart from "./reports/ReportChart";
import CustomReportForm from "./reports/CustomReportForm";
import { monthlyWorkOrders, assetPerformanceData, maintenanceTrendsData } from "./reports/data";

const ReportsContent: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const isMobile = useIsMobile();
  
  const handleGenerateReport = (reportType: string) => {
    setSelectedReport(reportType);
    toast.success(`${reportType} report generated successfully`);
  };

  const handleGenerateCustomReport = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Custom report generated successfully");
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
      default:
        return monthlyWorkOrders;
    }
  };

  return (
    <div className="space-y-6">
      {/* Available Reports Section */}
      <ReportsList onGenerateReport={handleGenerateReport} />
      
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
