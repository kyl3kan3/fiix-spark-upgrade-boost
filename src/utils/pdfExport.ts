
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ExportOptions {
 /** Entity id used to look up attachments in the `attachments` table (entity_type = 'report'). */
 reportEntityId?: string;
}

const fetchImageAsDataUrl = async (url: string): Promise<{ dataUrl: string; format: string } | null> => {
 try {
 const res = await fetch(url);
 if (!res.ok) return null;
 const blob = await res.blob();
 const dataUrl: string = await new Promise((resolve, reject) => {
 const r = new FileReader();
 r.onload = () => resolve(r.result as string);
 r.onerror = reject;
 r.readAsDataURL(blob);
 });
 const mime = blob.type.toLowerCase();
 const format = mime.includes("png") ? "PNG" : mime.includes("webp") ? "WEBP" : "JPEG";
 return { dataUrl, format };
 } catch {
 return null;
 }
};

export const exportReportToPdf = async (
 reportType: string,
 data: any[],
 options: ExportOptions = {}
) => {
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
 const tableRows = data.map(item =>
 Object.values(item).map((v) => (v == null ? "" : String(v))),
 );
 
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

 // Append attached photos for this report (if any)
 if (options.reportEntityId) {
 try {
 const { data: attachments } = await supabase
 .from("attachments")
 .select("url,file_name,caption,description,sort_order,created_at")
 .eq("entity_type", "report")
 .eq("entity_id", options.reportEntityId)
 .order("sort_order", { ascending: true })
 .order("created_at", { ascending: true });

 if (attachments && attachments.length > 0) {
 doc.addPage();
 doc.setFontSize(16);
 doc.setTextColor(0, 0, 0);
 doc.text("Attached Photos", 14, 20);

 const margin = 14;
 const imgW = pageWidth - margin * 2;
 const imgH = 90;
 let cursorY = 30;
 const pageH = doc.internal.pageSize.getHeight();

 for (const att of attachments) {
 const img = await fetchImageAsDataUrl(att.url);
 if (!img) continue;
 if (cursorY + imgH + 30 > pageH - 15) {
 doc.addPage();
 cursorY = 20;
 }
 try {
 doc.addImage(img.dataUrl, img.format, margin, cursorY, imgW, imgH, undefined, "FAST");
 } catch {
 continue;
 }
 cursorY += imgH + 4;
 doc.setFontSize(11);
 doc.setTextColor(0, 0, 0);
 const label = att.caption || att.file_name || "Photo";
 doc.text(label, margin, cursorY);
 cursorY += 5;
 if (att.description) {
 doc.setFontSize(9);
 doc.setTextColor(80, 80, 80);
 const lines = doc.splitTextToSize(att.description, imgW);
 doc.text(lines, margin, cursorY);
 cursorY += lines.length * 4;
 }
 cursorY += 8;
 }
 }
 } catch (err) {
 console.warn("Failed to embed report photos:", err);
 }
 }

 // Add footer to every page
 const footer = `© ${new Date().getFullYear()} MaintenEase - All rights reserved`;
 const pageCount = (doc as any).internal.getNumberOfPages();
 for (let p = 1; p <= pageCount; p++) {
 doc.setPage(p);
 doc.setFontSize(10);
 doc.setTextColor(0, 0, 0);
 doc.text(footer, pageWidth / 2 - 40, doc.internal.pageSize.getHeight() - 10);
 }

 // Save PDF
 doc.save(`${reportType.toLowerCase().replace(/\s+/g, '-')}-report.pdf`);
 return true;
 } catch (error) {
 console.error("Error exporting PDF:", error);
 toast.error("Failed to generate PDF report");
 throw error;
 }
};
