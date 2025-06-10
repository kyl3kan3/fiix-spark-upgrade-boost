
import { extractTextFromPdf } from './pdf/pdfTextExtractor';
import { handleOcrFallback } from './pdf/pdfOcrFallback';
import { processSingleVendor, processMultipleVendors, processGptResult } from './pdf/pdfProcessor';

export async function parsePDF(file: File, expectedCount?: number, instructions?: string): Promise<any[]> {
  const { text: extractedText, pageTexts } = await extractTextFromPdf(file);
  
  // Handle OCR fallback if text extraction failed
  const { text, isGptResult } = await handleOcrFallback(file, extractedText);
  
  // If GPT Vision returned structured data, use it directly
  if (isGptResult) {
    const gptResults = processGptResult(text);
    if (gptResults.length > 0) {
      return gptResults;
    }
  }
  
  // If expecting 1 vendor, treat entire document as single vendor
  if (expectedCount === 1) {
    return processSingleVendor(text, instructions);
  }
  
  // Process multiple vendors
  return processMultipleVendors(text, pageTexts, expectedCount, instructions);
}
