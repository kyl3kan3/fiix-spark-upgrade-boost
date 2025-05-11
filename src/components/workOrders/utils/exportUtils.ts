import { jsPDF } from 'jspdf';
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

export const exportWorkOrderToCsv = (workOrder: WorkOrderWithRelations) => {
  // Define CSV headers
  const headers = [
    'ID',
    'Title',
    'Description',
    'Status',
    'Priority',
    'Created Date',
    'Due Date',
    'Created By',
    'Assigned To',
    'Asset',
    'Asset Location',
    'Asset Serial Number'
  ];
  
  // Format data for CSV
  const data = [
    workOrder.id.split('-')[0],
    workOrder.title,
    workOrder.description.replace(/,/g, ';').replace(/\n/g, ' '), // Replace commas and newlines to avoid CSV formatting issues
    workOrder.status.replace('_', ' '),
    workOrder.priority,
    formatDate(workOrder.created_at),
    workOrder.due_date ? formatDate(workOrder.due_date) : '',
    workOrder.creator ? `${workOrder.creator.first_name} ${workOrder.creator.last_name}` : 'Unknown',
    workOrder.assignee ? `${workOrder.assignee.first_name} ${workOrder.assignee.last_name}` : 'Unassigned',
    workOrder.asset?.name || '',
    workOrder.asset?.location || '',
    workOrder.asset?.serial_number || ''
  ];
  
  // Create CSV content
  let csvContent = headers.join(',') + '\n';
  csvContent += data.join(',');
  
  // Add comments section if there are comments
  if (workOrder.comments && workOrder.comments.length > 0) {
    csvContent += '\n\nCOMMENTS\n';
    csvContent += 'User,Date,Comment\n';
    
    workOrder.comments.forEach((comment: CommentWithUser) => {
      const commentUser = comment.user ? `${comment.user.first_name} ${comment.user.last_name}` : 'Unknown';
      const commentDate = formatDate(comment.created_at);
      const commentText = comment.comment.replace(/,/g, ';').replace(/\n/g, ' '); // Replace commas and newlines
      
      csvContent += `${commentUser},${commentDate},${commentText}\n`;
    });
  }
  
  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `work_order_${workOrder.id.split('-')[0]}_${workOrder.title.replace(/\s+/g, '_').toLowerCase()}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportWorkOrderToExcel = (workOrder: WorkOrderWithRelations) => {
  // Generate Excel data as a blob
  // Excel files are binary, so we'll use the .xlsx MIME type
  
  // First, construct XML for Excel spreadsheet
  let xmlContent = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
  xmlContent += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
  xmlContent += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">';
  
  // Add styles
  xmlContent += '<Styles>';
  xmlContent += '<Style ss:ID="Header"><Font ss:Bold="1"/></Style>';
  xmlContent += '</Styles>';
  
  // Start main worksheet
  xmlContent += '<Worksheet ss:Name="Work Order Details">';
  xmlContent += '<Table>';
  
  // Add headers row
  xmlContent += '<Row ss:StyleID="Header">';
  ['Field', 'Value'].forEach(header => {
    xmlContent += `<Cell><Data ss:Type="String">${header}</Data></Cell>`;
  });
  xmlContent += '</Row>';
  
  // Add data rows for work order details
  const addRow = (field: string, value: string) => {
    xmlContent += '<Row>';
    xmlContent += `<Cell><Data ss:Type="String">${field}</Data></Cell>`;
    xmlContent += `<Cell><Data ss:Type="String">${value}</Data></Cell>`;
    xmlContent += '</Row>';
  };
  
  addRow('ID', workOrder.id.split('-')[0]);
  addRow('Title', workOrder.title);
  addRow('Status', workOrder.status.replace('_', ' '));
  addRow('Priority', workOrder.priority);
  addRow('Created Date', formatDate(workOrder.created_at));
  addRow('Due Date', workOrder.due_date ? formatDate(workOrder.due_date) : 'Not set');
  addRow('Created By', workOrder.creator ? 
    `${workOrder.creator.first_name} ${workOrder.creator.last_name}` : 'Unknown');
  addRow('Assigned To', workOrder.assignee ? 
    `${workOrder.assignee.first_name} ${workOrder.assignee.last_name}` : 'Unassigned');
  
  if (workOrder.asset) {
    addRow('Asset', workOrder.asset.name);
    if (workOrder.asset.location) addRow('Location', workOrder.asset.location);
    if (workOrder.asset.serial_number) addRow('Serial Number', workOrder.asset.serial_number);
  }
  
  addRow('Description', workOrder.description);
  
  xmlContent += '</Table>';
  xmlContent += '</Worksheet>';
  
  // Add comments worksheet if there are comments
  if (workOrder.comments && workOrder.comments.length > 0) {
    xmlContent += '<Worksheet ss:Name="Comments">';
    xmlContent += '<Table>';
    
    // Add headers row
    xmlContent += '<Row ss:StyleID="Header">';
    ['User', 'Date', 'Comment'].forEach(header => {
      xmlContent += `<Cell><Data ss:Type="String">${header}</Data></Cell>`;
    });
    xmlContent += '</Row>';
    
    // Add comment rows
    workOrder.comments.forEach((comment: CommentWithUser) => {
      xmlContent += '<Row>';
      xmlContent += `<Cell><Data ss:Type="String">${
        comment.user ? `${comment.user.first_name} ${comment.user.last_name}` : 'Unknown'
      }</Data></Cell>`;
      xmlContent += `<Cell><Data ss:Type="String">${formatDate(comment.created_at)}</Data></Cell>`;
      xmlContent += `<Cell><Data ss:Type="String">${
        comment.comment.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      }</Data></Cell>`;
      xmlContent += '</Row>';
    });
    
    xmlContent += '</Table>';
    xmlContent += '</Worksheet>';
  }
  
  xmlContent += '</Workbook>';
  
  // Create the Excel blob
  const blob = new Blob([xmlContent], { 
    type: 'application/vnd.ms-excel' 
  });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `work_order_${workOrder.id.split('-')[0]}_${workOrder.title.replace(/\s+/g, '_').toLowerCase()}.xls`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
