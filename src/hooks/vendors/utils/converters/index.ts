
import { convertDocxToImage } from './docxConverter';
import { convertPdfToImage } from './pdfConverter';

export const getFileType = (file: File): string => {
  const extension = file.name.toLowerCase().split('.').pop() || '';
  const mimeType = file.type.toLowerCase();
  
  if (['csv'].includes(extension)) {
    return 'csv';
  }
  
  if (['pdf'].includes(extension) || mimeType.includes('pdf')) {
    return 'pdf';
  }
  
  if (['docx', 'doc'].includes(extension) || mimeType.includes('word')) {
    return 'docx';
  }
  
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension) || mimeType.startsWith('image/')) {
    return 'image';
  }
  
  if (['txt', 'rtf'].includes(extension) || mimeType.includes('text')) {
    return 'text';
  }
  
  if (['xlsx', 'xls'].includes(extension) || mimeType.includes('spreadsheet')) {
    return 'spreadsheet';
  }
  
  if (['ppt', 'pptx'].includes(extension) || mimeType.includes('presentation')) {
    return 'presentation';
  }
  
  return 'unsupported';
};

export const convertToImages = async (file: File): Promise<File[]> => {
  const fileType = getFileType(file);
  
  try {
    switch (fileType) {
      case 'pdf':
        const pdfImage = await convertPdfToImage(file);
        return [pdfImage];
        
      case 'docx':
        const docxImage = await convertDocxToImage(file);
        return [docxImage];
        
      case 'image':
        // Already an image, return as-is
        return [file];
        
      case 'csv':
        throw new Error('CSV files should be parsed directly, not converted to images');
        
      case 'text':
      case 'spreadsheet':
      case 'presentation':
        // For these types, create a text-based image representation
        const textImage = await convertTextToImage(file);
        return [textImage];
        
      default:
        throw new Error(`Unsupported file type: ${fileType}. Please upload CSV, DOCX, PDF, or image files.`);
    }
  } catch (error) {
    console.error('Error converting file to images:', error);
    throw error;
  }
};

const convertTextToImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        
        // Create canvas with the text content
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('Cannot create canvas context');
        }
        
        canvas.width = 800;
        canvas.height = 1100;
        
        // Fill with white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add document header
        ctx.fillStyle = 'black';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(`Document: ${file.name}`, 30, 40);
        
        // Add content
        ctx.font = '12px Arial';
        const lines = text.split('\n');
        let y = 80;
        
        for (const line of lines.slice(0, 60)) { // Limit to prevent overflow
          if (y > canvas.height - 30) break;
          
          // Wrap long lines
          const words = line.split(' ');
          let currentLine = '';
          
          for (const word of words) {
            const testLine = currentLine + word + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > canvas.width - 60 && currentLine !== '') {
              ctx.fillText(currentLine, 30, y);
              currentLine = word + ' ';
              y += 16;
              
              if (y > canvas.height - 30) break;
            } else {
              currentLine = testLine;
            }
          }
          
          if (currentLine && y <= canvas.height - 30) {
            ctx.fillText(currentLine, 30, y);
            y += 16;
          }
        }
        
        // Convert canvas to file
        canvas.toBlob((blob) => {
          if (blob) {
            const imageFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.png'), {
              type: 'image/png'
            });
            resolve(imageFile);
          } else {
            reject(new Error('Failed to create image from text'));
          }
        }, 'image/png');
        
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read text file'));
    reader.readAsText(file);
  });
};
