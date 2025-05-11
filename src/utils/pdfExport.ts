
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

export const exportReportToPdf = (reportType: string, data: any[]) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add title
    const title = `${reportType} Report`;
    doc.setFontSize(20);
    const titleWidth = doc.getStringUnitWidth(title) * 20 / doc.internal.scaleFactor;
    const titleX = (pageWidth - titleWidth) / 2;
    doc.text(title, titleX, 20);
    
    // Add date
    doc.setFontSize(10);
    const dateStr = `Generated on: ${new Date().toLocaleDateString()}`;
    doc.text(dateStr, pageWidth - 60, 10);
    
    // Add table with data
    const tableHeaders = Object.keys(data[0]).map(key => 
      key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
    );
    const tableRows = data.map(item => Object.values(item));
    
    autoTable(doc, {
      head: [tableHeaders],
      body: tableRows,
      startY: 30,
      theme: 'striped',
      headStyles: { fillColor: [0, 175, 135] }
    });
    
    // Add footer
    const footer = "© MaintenEase - All rights reserved";
    doc.setFontSize(8);
    doc.text(footer, pageWidth / 2 - 25, doc.internal.pageSize.getHeight() - 10);
    
    // Save PDF
    doc.save(`${reportType.toLowerCase().replace(/\s+/g, '-')}-report.pdf`);
    toast.success("PDF report successfully downloaded");
  } catch (error) {
    console.error("Error exporting PDF:", error);
    toast.error("Failed to generate PDF report");
  }
};
