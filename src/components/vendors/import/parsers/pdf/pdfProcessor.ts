
import { analyzeAndCategorizeText } from '../../services/textAnalysisService';
import { entityToVendor } from './entityToVendorConverter';
import { splitTextIntoSections } from './pdfTextSplitter';

export function processSingleVendor(text: string): any[] {
  const entity = analyzeAndCategorizeText(text);
  return [entityToVendor(entity)];
}

export function processMultipleVendors(text: string, pageTexts: string[], expectedCount?: number, instructions?: string): any[] {
  console.log('🔍 Processing multiple vendors with page grouping');
  console.log('📄 Page texts:', pageTexts.length, 'pages');
  console.log('📝 Instructions provided:', instructions || 'None');
  
  // Group vendors by page
  const vendorsByPage = pageTexts.map((pageText, pageIndex) => {
    console.log(`📄 Processing page ${pageIndex + 1}:`, pageText.substring(0, 200) + '...');
    
    // Split each page into sections
    const sections = splitTextIntoSections(pageText, [pageText], expectedCount, instructions);
    
    // Analyze each section and convert to vendor format
    const pageVendors = sections.map(section => {
      const entity = analyzeAndCategorizeText(section, instructions);
      const vendor = entityToVendor(entity);
      // Add page information
      vendor.pageNumber = pageIndex + 1;
      vendor.sourceText = section;
      return vendor;
    });
    
    console.log(`✅ Found ${pageVendors.length} vendors on page ${pageIndex + 1}`);
    return {
      pageNumber: pageIndex + 1,
      vendors: pageVendors,
      pageText: pageText
    };
  });
  
  // Flatten all vendors but keep page grouping info
  const allVendors = vendorsByPage.flatMap(page => page.vendors);
  
  console.log('📊 Total vendors found:', allVendors.length);
  console.log('📄 Pages processed:', vendorsByPage.length);
  
  // Create a result object with typed properties
  const result = allVendors.length > 0 ? allVendors : [entityToVendor(analyzeAndCategorizeText(text, instructions))];
  
  // Attach page grouping as a non-enumerable property
  Object.defineProperty(result, 'pageGrouping', {
    value: vendorsByPage,
    enumerable: false
  });
  
  return result;
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
