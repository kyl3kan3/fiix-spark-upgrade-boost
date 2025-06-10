
import { analyzeAndCategorizeText } from '../../services/textAnalysisService';
import { entityToVendor } from './entityToVendorConverter';
import { splitTextIntoSections } from './pdfTextSplitter';

export function processSingleVendor(text: string): any[] {
  const entity = analyzeAndCategorizeText(text);
  return [entityToVendor(entity)];
}

export function processMultipleVendors(text: string, pageTexts: string[], expectedCount?: number): any[] {
  // Split text into sections based on document structure
  const sections = splitTextIntoSections(text, pageTexts, expectedCount);
  
  // Analyze each section and convert to vendor format
  const vendors = sections.map(section => {
    const entity = analyzeAndCategorizeText(section);
    return entityToVendor(entity);
  });
  
  return vendors.length > 0 ? vendors : [entityToVendor(analyzeAndCategorizeText(text))];
}

export function processGptResult(gptText: string): any[] {
  try {
    const parsed = JSON.parse(gptText);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Fall through to normal processing
  }
  return [];
}
