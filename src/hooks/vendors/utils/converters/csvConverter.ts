
import { createCanvas, canvasToFile, renderCsvOnCanvas } from './canvasUtils';

/**
 * Converts CSV files to images
 */
export const convertCsvToImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const { canvas, ctx } = createCanvas(1200, 1600);
        
        // Render CSV data in a table-like format
        await renderCsvOnCanvas(ctx, text, canvas.width, canvas.height);
        
        const imageFile = await canvasToFile(canvas, file.name, 'csv');
        resolve(imageFile);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read CSV file'));
    reader.readAsText(file);
  });
};
