
import mammoth from "mammoth";
import { VendorFormData } from "@/services/vendorService";
import { processWordText } from "./word/textProcessor";
import { EnhancedVendorDataProcessor } from "./word/enhancedVendorDataProcessor";
import { createDebugLogger } from "./word/debugLogger";

interface ParsedVendor extends VendorFormData {
  // Remove logo_url since it's not in the database schema
}

export const parseWord = async (file: File): Promise<ParsedVendor[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value;
        
        const logger = createDebugLogger();
        logger.logTextExtraction(text);
        
        // Enhanced text processing
        const { lines } = processWordText(text);
        logger.logProcessedLines(lines);
        
        console.log('[Word Parser] Starting enhanced processing of', lines.length, 'lines');
        
        // Use the enhanced processor
        const processor = new EnhancedVendorDataProcessor();
        const processedData = await processor.processDocument(lines);
        
        const vendors = processedData.vendors;
        
        // Log processing results
        console.log('[Word Parser] Enhanced processing complete:');
        console.log('- Vendors found:', vendors.length);
        console.log('- Overall confidence:', (processedData.confidence * 100).toFixed(0) + '%');
        console.log('- Warnings:', processedData.warnings.length);
        
        if (processedData.warnings.length > 0) {
          console.warn('[Word Parser] Processing warnings:', processedData.warnings);
        }
        
        logger.logParsingComplete(vendors.length, vendors);
        
        if (vendors.length === 0) {
          const textSample = text.substring(0, 500);
          throw new Error(`No vendor data found in the Word document. 

Enhanced parser results:
- Text blocks identified: ${processedData.blocks.length}
- Processing confidence: ${(processedData.confidence * 100).toFixed(0)}%
- Warnings: ${processedData.warnings.length}

Text sample from document:
"${textSample}${text.length > 500 ? '...' : ''}"

The enhanced parser uses AI-powered segmentation and regex fallbacks to identify vendors. Please ensure your document contains vendor information in recognizable formats.`);
        }
        
        console.log('[Word Parser] Successfully extracted', vendors.length, 'vendors using enhanced processing');
        resolve(vendors);
      } catch (error) {
        console.error("Enhanced word parser error:", error);
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read Word document'));
    reader.readAsArrayBuffer(file);
  });
};
