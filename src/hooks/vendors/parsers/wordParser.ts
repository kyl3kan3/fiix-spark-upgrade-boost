
import mammoth from "mammoth";
import { VendorFormData } from "@/services/vendorService";
import { processWordText, isHeaderLine } from "./word/textProcessor";
import { parseKeyValuePair } from "./word/keyValueParser";
import { createVendorBuilder } from "./word/vendorBuilder";
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
        
        // Enhanced text processing for better vendor extraction
        const { lines } = processWordText(text);
        logger.logProcessedLines(lines);
        
        const vendors: ParsedVendor[] = [];
        const vendorBuilder = createVendorBuilder();
        
        console.log('[Word Parser] Starting to process', lines.length, 'lines');
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          logger.logLineProcessing(i, line);
          
          if (isHeaderLine(line)) {
            logger.logSkippedLine("header line");
            continue;
          }
          
          // Parse key-value pairs for the current vendor
          parseKeyValuePair(line, vendorBuilder.getCurrentVendor());
          
          // Add data from this line to the current vendor
          vendorBuilder.addDataFromLine(line);
          
          const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
          const isLastLine = i === lines.length - 1;
          
          // Check if we should finalize the current vendor
          if (vendorBuilder.shouldFinalize(line, nextLine, isLastLine)) {
            const vendor = vendorBuilder.finalize();
            if (vendor) {
              // Remove logo URL logic since it's not in the database
              logger.logVendorFinalized(vendor);
              vendors.push(vendor);
            }
            vendorBuilder.reset();
          }
        }
        
        // Don't forget the last vendor if it wasn't finalized
        const finalVendor = vendorBuilder.finalize();
        if (finalVendor) {
          // Remove logo URL logic since it's not in the database
          logger.logVendorFinalized(finalVendor);
          vendors.push(finalVendor);
        }
        
        logger.logParsingComplete(vendors.length, vendors);
        
        if (vendors.length === 0) {
          const textSample = text.substring(0, 500);
          throw new Error(`No vendor data found in the Word document. 

Text sample from document:
"${textSample}${text.length > 500 ? '...' : ''}"

Please ensure your document contains vendor information in one of these formats:
1. **Company names in headers or bold text** followed by contact details
2. **List format** with clear vendor entries separated by blank lines  
3. **Key-value format** like:
   - Company Name: ABC Services
   - Contact: John Doe
   - Phone: 555-0123

The parser looks for company names (especially those with keywords like "Hardware", "Electric", "Inc", etc.) and groups related contact information together.`);
        }
        
        console.log('[Word Parser] Successfully extracted', vendors.length, 'vendors');
        resolve(vendors);
      } catch (error) {
        console.error("Word parser error:", error);
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read Word document'));
    reader.readAsArrayBuffer(file);
  });
};
