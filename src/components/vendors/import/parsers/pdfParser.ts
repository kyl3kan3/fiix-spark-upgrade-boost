
import { analyzeAndCategorizeText } from '../services/textAnalysisService';
import { extractTextFromPdf } from './pdf/pdfTextExtractor';
import { splitTextIntoSections } from './pdf/pdfTextSplitter';
import { handleOcrFallback } from './pdf/pdfOcrFallback';
import { entityToVendor } from './pdf/entityToVendorConverter';

export async function parsePDF(file: File, expectedCount?: number): Promise<any[]> {
  const { text: extractedText, pageTexts } = await extractTextFromPdf(file);
  
  // Handle OCR fallback if text extraction failed
  const { text, isGptResult } = await handleOcrFallback(file, extractedText);
  
  // If GPT Vision returned structured data, use it directly
  if (isGptResult) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Fall through to normal processing
    }
  }
  
  // If expecting 1 vendor, treat entire document as single vendor
  if (expectedCount === 1) {
    const entity = analyzeAndCategorizeText(text);
    return [entityToVendor(entity)];
  }
  
  // Split text into sections based on document structure
  const sections = splitTextIntoSections(text, pageTexts, expectedCount);
  
  // Analyze each section and convert to vendor format
  const vendors = sections.map(section => {
    const entity = analyzeAndCategorizeText(section);
    return entityToVendor(entity);
  });
  
  return vendors.length > 0 ? vendors : [entityToVendor(analyzeAndCategorizeText(text))];
}
