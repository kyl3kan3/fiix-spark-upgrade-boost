
import React, { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { exportReportToPdf } from "@/utils/pdfExport";
import ReportsList from "./reports/ReportsList";
import ReportChart from "./reports/ReportChart";
import CustomReportForm from "./reports/CustomReportForm";
import { monthlyWorkOrders } from "./reports/data";

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
      // For demonstration purposes, we're using the same data for all reports
      // In a real application, you would use different data for each report type
      await exportReportToPdf(selectedReport, monthlyWorkOrders);
    } finally {
      setIsExporting(false);
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
          data={monthlyWorkOrders}
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
