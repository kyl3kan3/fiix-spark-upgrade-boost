
import { createCanvas, canvasToFile } from './canvasUtils';

/**
 * Converts Excel files to images
 */
export const convertExcelToImage = async (file: File): Promise<File> => {
  const { canvas, ctx } = createCanvas(800, 1100);
  
  ctx.fillStyle = 'black';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('Excel Document', 50, 50);
  
  ctx.font = '16px Arial';
  ctx.fillText(`File: ${file.name}`, 50, 100);
  ctx.fillText('Excel files need to be converted to CSV first', 50, 150);
  ctx.fillText('for proper vendor data extraction.', 50, 180);
  
  return canvasToFile(canvas, file.name, 'xlsx|xls');
};
