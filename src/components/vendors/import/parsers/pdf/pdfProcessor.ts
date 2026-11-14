import { analyzeAndCategorizeText } from '../../services/textAnalysisService';
import { entityToVendor } from './entityToVendorConverter';
import { splitTextIntoSections } from './pdfTextSplitter';
import { hasVendorName, normalizeVendorImport } from '../../services/vendorImportData';
import { logger } from '@/lib/logger';

export function processSingleVendor(text: string, instructions?: string): any[] {
  const vendor = entityToVendor(analyzeAndCategorizeText(text, instructions));
  return hasVendorName(vendor) ? [vendor] : [];
}

export function processMultipleVendors(text: string, pageTexts: string[], expectedCount?: number, instructions?: string): any[] {
  // OCR text replaces empty extraction output; never manufacture rows from blank pages.
  const hasExtractedText = pageTexts.some(page => page.trim().length > 0);
  const pages = hasExtractedText ? pageTexts : [text];
  const wholePage = shouldTreatEachPageAsVendor(instructions, expectedCount, pages.length);
  const pageGrouping = pages.map((pageText, index) => {
    const sections = wholePage ? [pageText] : splitTextIntoSections(pageText, [], undefined, instructions);
    const vendors = sections.flatMap(section => processSingleVendor(section, instructions)).map(vendor => ({ ...vendor, pageNumber: index + 1 }));
    return { pageNumber: index + 1, pageText, vendors };
  });
  const result = pageGrouping.flatMap(page => page.vendors);
  Object.defineProperty(result, 'pageGrouping', { value: pageGrouping, enumerable: false });
  return result;
}

function shouldTreatEachPageAsVendor(instructions?: string, expectedCount?: number, pageCount?: number): boolean {
 logger.log('🔍 === INSTRUCTION ANALYSIS START ===');
 logger.log('📝 Raw instructions:', instructions);
 logger.log('🔢 Expected count:', expectedCount);
 logger.log('📄 Page count:', pageCount);
 
 if (!instructions) {
 logger.log('❌ No instructions provided, checking count fallback');
 const result = expectedCount === pageCount;
 logger.log('🎯 Count fallback result:', result);
 return result;
 }
 
 const instructionsLower = instructions.toLowerCase();
 logger.log('🔍 Analyzing instructions for page handling:', instructionsLower);
 
 // Look for explicit instructions about pages being vendors - more comprehensive patterns
 const pageVendorPatterns = [
 // Direct statements
 /each page (is|contains|has) (a|one) vendor/,
 /one vendor per page/,
 /page per vendor/,
 /every page (is|contains|has) (a|one) vendor/,
 /(individual|separate) vendor (on|per) each page/,
 /treat each page as (a|one) vendor/,
 /consider each page (a|one) vendor/,
 
 // More natural language patterns
 /pages? (are|is) vendors?/,
 /vendor on each page/,
 /vendor per page/,
 /page equals vendor/,
 /page = vendor/,
 
 // Variations with "single"
 /single vendor per page/,
 /one single vendor per page/,
 
 // Don't split variations
 /(don't|do not|don't) split pages?/,
 /(don't|do not|don't) break (up|down) pages?/,
 /keep pages? (whole|intact|together)/,
 /entire pages? (are|is) vendors?/,
 /whole pages? (are|is) vendors?/,
 /full pages? (are|is) vendors?/
 ];
 
 logger.log('🔍 Testing patterns against instructions...');
 for (let i = 0; i < pageVendorPatterns.length; i++) {
 const pattern = pageVendorPatterns[i];
 const matches = pattern.test(instructionsLower);
 logger.log(`Pattern ${i + 1}: ${pattern} -> ${matches ? '✅ MATCH' : '❌ no match'}`);
 if (matches) {
 logger.log('✅ Instructions clearly indicate each page should be treated as a vendor');
 return true;
 }
 }
 
 // Look for instructions that suggest splitting pages
 const splitPatterns = [
 /multiple vendors per page/,
 /split (each )?pages?/,
 /break (up|down) pages?/,
 /vendors? (are )?separated by/,
 /multiple (entries|vendors) per page/,
 /divide pages?/,
 /parse pages? for multiple/
 ];
 
 logger.log('🔍 Testing split patterns...');
 for (let i = 0; i < splitPatterns.length; i++) {
 const pattern = splitPatterns[i];
 const matches = pattern.test(instructionsLower);
 logger.log(`Split pattern ${i + 1}: ${pattern} -> ${matches ? '✅ MATCH' : '❌ no match'}`);
 if (matches) {
 logger.log('📋 Instructions indicate pages should be split into multiple vendors');
 return false;
 }
 }
 
 // If expected count matches page count and no conflicting instructions, treat pages as vendors
 if (expectedCount === pageCount) {
 logger.log('📋 Expected count matches page count, treating each page as vendor');
 return true;
 }
 
 // Default to splitting if unclear
 logger.log('📋 Instructions unclear, defaulting to splitting pages');
 logger.log('🔍 === INSTRUCTION ANALYSIS END ===');
 return false;
}

export function processGptResult(gptText: string): any[] {
  const parsed: unknown = JSON.parse(gptText);
  if (!Array.isArray(parsed)) throw new Error('Expected a vendor array from image analysis.');
  return parsed.map(normalizeVendorImport).filter(hasVendorName);
}
