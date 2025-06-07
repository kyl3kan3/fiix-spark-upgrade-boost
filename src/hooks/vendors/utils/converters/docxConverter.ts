
import { createCanvas, canvasToFile, renderTextOnCanvas } from './canvasUtils';
import { extractTextFromDocx } from './textExtractor';

/**
 * Converts DOCX files to images for better AI Vision processing
 */
export const convertDocxToImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        
        const { canvas, ctx } = createCanvas(800, 1100);
        
        // Extract text content from DOCX
        const text = await extractTextFromDocx(arrayBuffer);
        
        // Render text on canvas
        await renderTextOnCanvas(ctx, text, canvas.width, canvas.height);
        
        // Convert canvas to file
        const imageFile = await canvasToFile(canvas, file.name, 'docx|doc');
        resolve(imageFile);
        
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read document file'));
    reader.readAsArrayBuffer(file);
  });
};
