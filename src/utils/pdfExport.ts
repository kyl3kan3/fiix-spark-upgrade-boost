
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

export const exportReportToPdf = async (reportType: string, data: any[]) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add logo/header image
    const logoSize = 40;
    doc.setFillColor(13, 71, 161); // Primary brand color
    doc.rect(0, 0, pageWidth, 25, 'F');
    
    // Add title
    const title = `${reportType} Report`;
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255); // White text for header
    const titleWidth = doc.getStringUnitWidth(title) * 20 / doc.internal.scaleFactor;
    const titleX = (pageWidth - titleWidth) / 2;
    doc.text(title, titleX, 16);
    
    // Add date
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Reset to black text
    const dateStr = `Generated on: ${new Date().toLocaleDateString()}`;
    doc.text(dateStr, 14, 35);
    
    // Add company name
    const companyName = localStorage.getItem('company_name') || 'Your Company';
    doc.setFontSize(14);
    doc.text(companyName, 14, 45);
    
    // Add table with data
    const tableHeaders = Object.keys(data[0]).map(key => 
      key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
    );
    const tableRows = data.map(item => Object.values(item));
    
    autoTable(doc, {
      head: [tableHeaders],
      body: tableRows,
      startY: 55,
      theme: 'striped',
      headStyles: { 
        fillColor: [13, 71, 161],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });
    
    // Add summary text
    let summaryText = "This report provides an overview of ";
    switch (reportType) {
      case "Work Order Statistics":
        summaryText += "work order completion rates and maintenance activities over time.";
        break;
      case "Asset Performance":
        summaryText += "equipment reliability, downtime analysis, and maintenance costs.";
        break;
      case "Maintenance Trends":
        summaryText += "preventive vs. corrective maintenance patterns and historical trends.";
        break;
      default:
        summaryText += "maintenance activities and performance metrics.";
    }
    
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.text("Summary", 14, finalY + 15);
    
    const splitText = doc.splitTextToSize(summaryText, pageWidth - 30);
    doc.text(splitText, 14, finalY + 25);
    
    // Add footer
    const footer = `© ${new Date().getFullYear()} MaintenEase - All rights reserved`;
    doc.setFontSize(10);
    doc.text(footer, pageWidth / 2 - 40, doc.internal.pageSize.getHeight() - 10);
    
    // Save PDF
    doc.save(`${reportType.toLowerCase().replace(/\s+/g, '-')}-report.pdf`);
    return true;
  } catch (error) {
    console.error("Error exporting PDF:", error);
    toast.error("Failed to generate PDF report");
    throw error;
  }
};
