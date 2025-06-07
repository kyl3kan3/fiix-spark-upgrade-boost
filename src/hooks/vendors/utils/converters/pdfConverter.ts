
import { createCanvas, canvasToFile } from './canvasUtils';

/**
 * Converts PDF files to images
 */
export const convertPdfToImage = async (file: File): Promise<File> => {
  // For now, create a placeholder image with PDF info
  // In a full implementation, you'd use PDF.js to render the actual pages
  const { canvas, ctx } = createCanvas(800, 1100);
  
  ctx.fillStyle = 'black';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('PDF Document', 50, 50);
  
  ctx.font = '16px Arial';
  ctx.fillText(`File: ${file.name}`, 50, 100);
  ctx.fillText(`Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`, 50, 130);
  
  ctx.fillStyle = 'red';
  ctx.font = '14px Arial';
  ctx.fillText('Note: For better AI parsing, please convert', 50, 180);
  ctx.fillText('your PDF to images or Word document', 50, 200);
  
  return canvasToFile(canvas, file.name, 'pdf');
};
