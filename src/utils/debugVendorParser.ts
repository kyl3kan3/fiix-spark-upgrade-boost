
import { VendorFormData } from "@/services/vendorService";

export interface ParseResult {
  success: boolean;
  error?: string;
  vendors?: VendorFormData[];
  debugInfo?: {
    step: string;
    details: any;
  };
}

export const debugParseVendorsFromFile = async (file: File): Promise<ParseResult> => {
  console.log('[Debug Parser] Starting file parsing for:', file.name, 'Size:', file.size, 'Type:', file.type);
  
  try {
    // Step 1: Validate file
    if (!file.name.endsWith('.docx') && !file.name.endsWith('.pdf')) {
      return {
        success: false,
        error: 'File must be .docx or .pdf format',
        debugInfo: { step: 'validation', details: { fileName: file.name, fileType: file.type } }
      };
    }

    // Step 2: Try to read file
    let text = '';
    try {
      if (file.name.endsWith('.docx')) {
        console.log('[Debug Parser] Processing DOCX file...');
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        console.log('[Debug Parser] ArrayBuffer size:', arrayBuffer.byteLength);
        
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
        console.log('[Debug Parser] Extracted text length:', text.length);
        console.log('[Debug Parser] Text preview:', text.substring(0, 500));
      } else {
        return {
          success: false,
          error: 'PDF parsing not yet implemented in debug version',
          debugInfo: { step: 'file_reading', details: 'PDF support coming soon' }
        };
      }
    } catch (fileError) {
      console.error('[Debug Parser] File reading error:', fileError);
      return {
        success: false,
        error: `Failed to read file: ${fileError.message}`,
        debugInfo: { step: 'file_reading', details: fileError }
      };
    }

    // Step 3: Simple text processing
    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: 'No text content found in file',
        debugInfo: { step: 'text_extraction', details: { textLength: text.length } }
      };
    }

    // Step 4: Basic vendor extraction (simplified)
    const vendors: VendorFormData[] = [];
    try {
      // Split by multiple blank lines to find potential vendor blocks
      const blocks = text.split(/\n\s*\n\s*\n/).filter(block => block.trim().length > 0);
      console.log('[Debug Parser] Found', blocks.length, 'text blocks');

      for (let i = 0; i < Math.min(blocks.length, 5); i++) { // Limit to first 5 for debugging
        const block = blocks[i].trim();
        console.log(`[Debug Parser] Processing block ${i + 1}:`, block.substring(0, 100));
        
        // Simple extraction logic
        const lines = block.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        const vendor: VendorFormData = {
          name: lines[0] || `Vendor ${i + 1}`, // First line as name
          email: extractEmail(block) || '',
          phone: extractPhone(block) || '',
          contact_person: '',
          contact_title: '',
          vendor_type: 'service',
          status: 'active',
          address: extractAddress(block) || '',
          city: '',
          state: '',
          zip_code: '',
          website: extractWebsite(block) || '',
          description: block.substring(0, 200),
          rating: null
        };

        vendors.push(vendor);
      }

      console.log('[Debug Parser] Successfully created', vendors.length, 'vendor records');
      
      return {
        success: true,
        vendors,
        debugInfo: { 
          step: 'complete', 
          details: { 
            blocksFound: blocks.length, 
            vendorsCreated: vendors.length,
            textLength: text.length
          } 
        }
      };

    } catch (processingError) {
      console.error('[Debug Parser] Processing error:', processingError);
      return {
        success: false,
        error: `Failed to process text: ${processingError.message}`,
        debugInfo: { step: 'text_processing', details: processingError }
      };
    }

  } catch (error) {
    console.error('[Debug Parser] Unexpected error:', error);
    return {
      success: false,
      error: `Unexpected error: ${error.message}`,
      debugInfo: { step: 'unknown', details: error }
    };
  }
};

// Simple extraction helpers
function extractEmail(text: string): string | null {
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  return emailMatch ? emailMatch[0] : null;
}

function extractPhone(text: string): string | null {
  const phoneMatch = text.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
  return phoneMatch ? phoneMatch[0] : null;
}

function extractWebsite(text: string): string | null {
  const websiteMatch = text.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/i);
  return websiteMatch ? websiteMatch[0] : null;
}

function extractAddress(text: string): string | null {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Look for lines that might contain addresses
  for (const line of lines) {
    if (/\d+.*\b(street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd)\b/i.test(line)) {
      return line;
    }
  }
  
  return null;
}
