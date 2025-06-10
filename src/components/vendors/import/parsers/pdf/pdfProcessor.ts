
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
  
  // Check if instructions indicate each page is a vendor
  const shouldTreatPagesAsVendors = shouldTreatEachPageAsVendor(instructions, expectedCount, pageTexts.length);
  
  // Group vendors by page
  const vendorsByPage = pageTexts.map((pageText, pageIndex) => {
    console.log(`📄 Processing page ${pageIndex + 1}:`, pageText.substring(0, 200) + '...');
    
    let sections: string[];
    
    if (shouldTreatPagesAsVendors) {
      // Treat the entire page as one vendor
      console.log(`📋 Treating entire page ${pageIndex + 1} as single vendor based on instructions`);
      sections = [pageText];
    } else {
      // Split the page into sections as before
      sections = splitTextIntoSections(pageText, pageTexts, expectedCount);
    }
    
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
  if (!instructions) {
    // Fallback to count matching if no instructions
    return expectedCount === pageCount;
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
  
  const hasPageVendorInstruction = pageVendorPatterns.some(pattern => 
    pattern.test(instructionsLower)
  );
  
  if (hasPageVendorInstruction) {
    console.log('✅ Instructions clearly indicate each page should be treated as a vendor');
    return true;
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
  
  const hasSplitInstruction = splitPatterns.some(pattern => 
    pattern.test(instructionsLower)
  );
  
  if (hasSplitInstruction) {
    console.log('📋 Instructions indicate pages should be split into multiple vendors');
    return false;
  }
  
  // If expected count matches page count and no conflicting instructions, treat pages as vendors
  if (expectedCount === pageCount) {
    console.log('📋 Expected count matches page count, treating each page as vendor');
    return true;
  }
  
  // Default to splitting if unclear
  console.log('📋 Instructions unclear, defaulting to splitting pages');
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
