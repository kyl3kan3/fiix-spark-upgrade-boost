
import mammoth from "mammoth";
import { VendorFormData } from "@/services/vendorService";
import { processWordText, isHeaderLine } from "./word/textProcessor";
import { parseKeyValuePair } from "./word/keyValueParser";
import { createVendorBuilder } from "./word/vendorBuilder";
import { createDebugLogger } from "./word/debugLogger";

interface ParsedVendor extends VendorFormData {
  // Additional fields for validation
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
        
        const { lines } = processWordText(text);
        logger.logProcessedLines(lines);
        
        const vendors: ParsedVendor[] = [];
        const vendorBuilder = createVendorBuilder();
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          logger.logLineProcessing(i, line);
          
          // Skip obvious headers
          if (isHeaderLine(line)) {
            logger.logSkippedLine("header line");
            continue;
          }
          
          // Parse key-value pairs
          parseKeyValuePair(line, vendorBuilder.getCurrentVendor());
          
          // Extract patterns from line
          vendorBuilder.addDataFromLine(line);
          
          // Check if we should finalize vendor
          const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
          const isLastLine = i === lines.length - 1;
          
          if (vendorBuilder.shouldFinalize(line, nextLine, isLastLine)) {
            const vendor = vendorBuilder.finalize();
            if (vendor) {
              logger.logVendorFinalized(vendor);
              vendors.push(vendor);
            }
            vendorBuilder.reset();
          }
        }
        
        // Add final vendor if exists
        const finalVendor = vendorBuilder.finalize();
        if (finalVendor) {
          logger.logVendorFinalized(finalVendor);
          vendors.push(finalVendor);
        }
        
        logger.logParsingComplete(vendors.length, vendors);
        
        if (vendors.length === 0) {
          const textSample = text.substring(0, 500);
          throw new Error(`No vendor data found in the Word document. 

Text sample from document:
"${textSample}${text.length > 500 ? '...' : ''}"

Please ensure your document contains vendor information in a clear format like:
- Company Name: ABC Services
- Email: contact@abc.com
- Phone: 555-0123

Or simple lists with company names and contact details.`);
        }
        
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
