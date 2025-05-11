
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { WorkOrderWithRelations, WorkOrderComment } from "@/types/workOrders";
import { formatDate } from './dateUtils';

// Define a proper type for the comment with user
interface CommentWithUser extends WorkOrderComment {
  user?: {
    first_name: string;
    last_name: string;
  } | null;
}

export const exportWorkOrderToPdf = (workOrder: WorkOrderWithRelations) => {
  // Create a new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Add title
  doc.setFontSize(20);
  doc.text('Work Order Report', pageWidth / 2, 20, { align: 'center' });
  
  // Add Work Order ID and creation date
  doc.setFontSize(12);
  doc.text(`Work Order #${workOrder.id.split('-')[0]}`, 14, 30);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 38);
  
  // Add work order title
  doc.setFontSize(16);
  doc.text(workOrder.title, pageWidth / 2, 50, { align: 'center' });
  
  // Add status and priority
  const statusText = `Status: ${workOrder.status.replace('_', ' ')}`;
  const priorityText = `Priority: ${workOrder.priority}`;
  doc.setFontSize(12);
  doc.text(statusText, 14, 60);
  doc.text(priorityText, pageWidth - 14, 60, { align: 'right' });
  
  // Add dates
  doc.text(`Created: ${formatDate(workOrder.created_at)}`, 14, 70);
  if (workOrder.due_date) {
    doc.text(`Due: ${formatDate(workOrder.due_date)}`, pageWidth - 14, 70, { align: 'right' });
  }
  
  // Add assignment info
  doc.text('Created by:', 14, 80);
  doc.text(workOrder.creator ? 
    `${workOrder.creator.first_name} ${workOrder.creator.last_name}` : 
    'Unknown', 50, 80);
    
  doc.text('Assigned to:', 14, 90);
  doc.text(workOrder.assignee ? 
    `${workOrder.assignee.first_name} ${workOrder.assignee.last_name}` : 
    'Unassigned', 50, 90);
  
  // Add asset information if available
  if (workOrder.asset) {
    doc.text('Asset:', 14, 100);
    doc.text(workOrder.asset.name, 50, 100);
    
    if (workOrder.asset.location) {
      doc.text('Location:', 14, 110);
      doc.text(workOrder.asset.location, 50, 110);
    }
    
    if (workOrder.asset.serial_number) {
      doc.text('Serial Number:', 14, 120);
      doc.text(workOrder.asset.serial_number, 50, 120);
    }
  }
  
  // Add description
  doc.text('Description:', 14, workOrder.asset ? 130 : 100);
  
  // Handle multi-line description
  const splitDescription = doc.splitTextToSize(
    workOrder.description, 
    pageWidth - 28
  );
  doc.text(splitDescription, 14, workOrder.asset ? 138 : 108);
  
  // Calculate the Y position after the description
  const yPosAfterDescription = workOrder.asset 
    ? Math.min(138 + splitDescription.length * 6, 220) 
    : Math.min(108 + splitDescription.length * 6, 220);
  
  // Add comments section if there are any
  if (workOrder.comments && workOrder.comments.length > 0) {
    doc.text('Comments:', 14, yPosAfterDescription);
    
    // Add comments table
    autoTable(doc, {
      startY: yPosAfterDescription + 5,
      head: [['User', 'Date', 'Comment']],
      body: workOrder.comments.map((comment: CommentWithUser) => [
        comment.user ? `${comment.user.first_name} ${comment.user.last_name}` : 'Unknown',
        formatDate(comment.created_at),
        comment.comment
      ]),
      margin: { top: 10 },
      styles: { overflow: 'linebreak', cellWidth: 'wrap' },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 40 },
        2: { cellWidth: 'auto' }
      }
    });
  }
  
  // Save the PDF with a filename based on the work order ID and title
  const fileName = `work_order_${workOrder.id.split('-')[0]}_${workOrder.title.replace(/\s+/g, '_').toLowerCase()}.pdf`;
  doc.save(fileName);
};
