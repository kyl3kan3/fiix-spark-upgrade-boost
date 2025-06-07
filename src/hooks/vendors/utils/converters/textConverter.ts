
import { createCanvas, canvasToFile, renderTextOnCanvas } from './canvasUtils';

/**
 * Converts text files to images
 */
export const convertTextToImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const { canvas, ctx } = createCanvas(800, 1100);
        
        await renderTextOnCanvas(ctx, text, canvas.width, canvas.height);
        
        const imageFile = await canvasToFile(canvas, file.name, 'txt|text');
        resolve(imageFile);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read text file'));
    reader.readAsText(file);
  });
};
