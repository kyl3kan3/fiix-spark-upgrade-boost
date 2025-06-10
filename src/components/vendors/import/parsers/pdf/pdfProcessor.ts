
import { analyzeAndCategorizeText } from '../../services/textAnalysisService';
import { entityToVendor } from './entityToVendorConverter';
import { splitTextIntoSections } from './pdfTextSplitter';

export function processSingleVendor(text: string, instructions?: string): any[] {
  const entity = analyzeAndCategorizeText(text, instructions);
  return [entityToVendor(entity)];
}

export function processMultipleVendors(text: string, pageTexts: string[], expectedCount?: number, instructions?: string): any[] {
  console.log('🔍 Processing multiple vendors with page grouping');
  console.log('📄 Page texts:', pageTexts.length, 'pages');
  console.log('📝 Instructions provided:', instructions || 'None');
  console.log('🎯 Expected count:', expectedCount || 'Not specified');
  
  // ALWAYS check instructions first, regardless of other factors
  const shouldTreatPagesAsVendors = shouldTreatEachPageAsVendor(instructions, expectedCount, pageTexts.length);
  
  console.log('🚨 DECISION: shouldTreatPagesAsVendors =', shouldTreatPagesAsVendors);
  console.log('🚨 This means each page will be treated as:', shouldTreatPagesAsVendors ? 'ONE VENDOR' : 'POTENTIALLY MULTIPLE VENDORS');
  
  // Group vendors by page
  const vendorsByPage = pageTexts.map((pageText, pageIndex) => {
    console.log(`📄 Processing page ${pageIndex + 1}:`, pageText.substring(0, 200) + '...');
    
    let sections: string[];
    
    if (shouldTreatPagesAsVendors) {
      // Treat the entire page as one vendor
      console.log(`📋 ✅ TREATING ENTIRE PAGE ${pageIndex + 1} AS SINGLE VENDOR based on analysis`);
      sections = [pageText];
    } else {
      // Split the page into sections as before
      console.log(`📋 ❌ SPLITTING PAGE ${pageIndex + 1} INTO MULTIPLE SECTIONS`);
      sections = splitTextIntoSections(pageText, pageTexts, expectedCount);
    }
    
    console.log(`📊 Page ${pageIndex + 1} resulted in ${sections.length} sections`);
    
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

function shouldTreatEachPageAsVendor(instructions?: string, expectedCount?: number, pageCount?: number): boolean {
  console.log('🔍 === INSTRUCTION ANALYSIS START ===');
  console.log('📝 Raw instructions:', instructions);
  console.log('🔢 Expected count:', expectedCount);
  console.log('📄 Page count:', pageCount);
  
  if (!instructions) {
    console.log('❌ No instructions provided, checking count fallback');
    const result = expectedCount === pageCount;
    console.log('🎯 Count fallback result:', result);
    return result;
  }
  
  const instructionsLower = instructions.toLowerCase();
  console.log('🔍 Analyzing instructions for page handling:', instructionsLower);
  
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
  
  console.log('🔍 Testing patterns against instructions...');
  for (let i = 0; i < pageVendorPatterns.length; i++) {
    const pattern = pageVendorPatterns[i];
    const matches = pattern.test(instructionsLower);
    console.log(`Pattern ${i + 1}: ${pattern} -> ${matches ? '✅ MATCH' : '❌ no match'}`);
    if (matches) {
      console.log('✅ Instructions clearly indicate each page should be treated as a vendor');
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
  
  console.log('🔍 Testing split patterns...');
  for (let i = 0; i < splitPatterns.length; i++) {
    const pattern = splitPatterns[i];
    const matches = pattern.test(instructionsLower);
    console.log(`Split pattern ${i + 1}: ${pattern} -> ${matches ? '✅ MATCH' : '❌ no match'}`);
    if (matches) {
      console.log('📋 Instructions indicate pages should be split into multiple vendors');
      return false;
    }
  }
  
  // If expected count matches page count and no conflicting instructions, treat pages as vendors
  if (expectedCount === pageCount) {
    console.log('📋 Expected count matches page count, treating each page as vendor');
    return true;
  }
  
  // Default to splitting if unclear
  console.log('📋 Instructions unclear, defaulting to splitting pages');
  console.log('🔍 === INSTRUCTION ANALYSIS END ===');
  return false;
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
