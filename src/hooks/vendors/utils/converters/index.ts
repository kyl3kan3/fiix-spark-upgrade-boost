// Simplified converter exports - only keeping the working ones
export { convertDocxToImages } from './docxConverter';
export { convertPdfToImages } from './pdfConverter';
export { extractTextFromCanvas } from './canvasUtils';
export { extractTextFromFile } from './textExtractor';

// Simple file type detection
export const getFileType = (file: File): string => {
  const extension = file.name.toLowerCase().split('.').pop() || '';
  
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
    return 'image';
  }
  
  if (['pdf'].includes(extension)) {
    return 'pdf';
  }
  
  if (['docx', 'doc'].includes(extension)) {
    return 'docx';
  }
  
  if (['csv'].includes(extension)) {
    return 'csv';
  }
  
  if (['xlsx', 'xls'].includes(extension)) {
    return 'excel';
  }
  
  return 'text';
};

// Convert files to images for processing
export const convertToImages = async (file: File): Promise<string[]> => {
  const fileType = getFileType(file);
  
  switch (fileType) {
    case 'pdf':
      return convertPdfToImages(file);
    case 'docx':
      return convertDocxToImages(file);
    case 'image':
      return [URL.createObjectURL(file)];
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
};
