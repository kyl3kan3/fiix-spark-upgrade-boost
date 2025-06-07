
import { VendorFormData } from "@/services/vendorService";
import { parseCSV } from "./csvParser";
import { parseWord } from "./wordParser";
import { convertFileToImage } from "../utils/documentConverter";
import { useVendorImageParser } from "../useVendorImageParser";

interface ParsedVendor extends VendorFormData {
  // Remove logo_url field since it's not in the database schema
}

export const parseFile = async (file: File, useImageParser: boolean = false): Promise<ParsedVendor[]> => {
  const fileExtension = file.name.toLowerCase().split('.').pop();
  const { parseImageWithVision, convertFileToBase64 } = useVendorImageParser();
  
  // If AI Vision parser is enabled, convert ANY file to image and use vision parsing
  if (useImageParser) {
    console.log('[File Parser] 🔄 AI Vision mode enabled - converting file to image format...');
    console.log(`[File Parser] 📄 Original file: ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)} MB, type: ${file.type}`);
    
    try {
      // Step 1: Convert any file type to an image representation
      const imageFile = await convertFileToImage(file);
      console.log(`[File Parser] ✅ File successfully converted to image`);
      console.log(`[File Parser] 🖼️ Image file size: ${(imageFile.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`[File Parser] 🖼️ Image type: ${imageFile.type}`);
      
      // Step 2: Convert the image to base64 for the Vision API
      const base64Image = await convertFileToBase64(imageFile);
      console.log(`[File Parser] ✅ Image converted to base64, length: ${(base64Image.length / 1024).toFixed(1)} KB`);
      
      // Step 3: Process with Vision API using ONLY the image data
      console.log('[File Parser] 🚀 Sending ONLY image data to GPT Vision API...');
      const vendors = await parseImageWithVision(base64Image);
      console.log(`[File Parser] ✅ AI Vision successfully extracted ${vendors.length} vendors from image`);
      
      return vendors;
    } catch (error) {
      console.error('[File Parser] ❌ AI Vision processing failed:', error);
      throw new Error(`AI Vision processing failed: ${error.message}`);
    }
  }
  
  // Standard file processing (text mode) - only when AI Vision is disabled
  console.log('[File Parser] 📝 Text mode active - using traditional parsers...');
  
  if (file.type.startsWith('image/')) {
    console.log('[File Parser] Processing image file with traditional image parser...');
    // For images in text mode, we still need to use the vision parser
    // but we'll indicate it's not the main AI Vision mode
    const base64Image = await convertFileToBase64(file);
    return await parseImageWithVision(base64Image);
  }
  
  switch (fileExtension) {
    case 'csv':
      console.log('[File Parser] Processing CSV file...');
      return await parseCSV(file);
    case 'xlsx':
    case 'xls':
      throw new Error('Excel files need to be converted to CSV first, or enable "AI Vision Parser" to process them automatically.');
    case 'pdf':
      throw new Error('For PDF files, please enable "AI Vision Parser" for automatic conversion and processing.');
    case 'doc':
    case 'docx':
      // Use Word parser for text mode, but suggest AI Vision for better results
      try {
        console.log('[File Parser] Processing Word document with text parser...');
        return await parseWord(file);
      } catch (error) {
        throw new Error('Word document parsing failed. Try enabling "AI Vision Parser" for better results with complex document layouts.');
      }
    default:
      throw new Error('Unsupported file format. Please use CSV, Word document, PDF, or image files, or enable "AI Vision Parser" to automatically convert your file.');
  }
};
