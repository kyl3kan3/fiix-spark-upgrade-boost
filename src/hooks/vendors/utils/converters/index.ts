
import { convertDocxToImage } from './docxConverter';
import { convertPdfToImage } from './pdfConverter';
import { convertCsvToImage } from './csvConverter';
import { convertExcelToImage } from './excelConverter';
import { convertTextToImage } from './textConverter';

/**
 * Converts various file types to images for better AI Vision processing
 */
export const convertFileToImage = async (file: File): Promise<File> => {
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  // If it's already an image, return as-is
  if (fileType.startsWith('image/')) {
    return file;
  }

  // Convert DOCX/DOC files
  if (fileName.endsWith('.docx') || fileName.endsWith('.doc') || fileType.includes('word')) {
    return await convertDocxToImage(file);
  }

  // Convert PDF files
  if (fileName.endsWith('.pdf') || fileType === 'application/pdf') {
    return await convertPdfToImage(file);
  }

  // Convert CSV files
  if (fileName.endsWith('.csv') || fileType === 'text/csv') {
    return await convertCsvToImage(file);
  }

  // Convert Excel files
  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileType.includes('sheet')) {
    return await convertExcelToImage(file);
  }

  // Convert plain text files
  if (fileType.startsWith('text/') || fileName.endsWith('.txt')) {
    return await convertTextToImage(file);
  }

  // Default: try to treat as text and convert
  return await convertTextToImage(file);
};

// Re-export individual converters for direct use if needed
export { convertDocxToImage } from './docxConverter';
export { convertPdfToImage } from './pdfConverter';
export { convertCsvToImage } from './csvConverter';
export { convertExcelToImage } from './excelConverter';
export { convertTextToImage } from './textConverter';
