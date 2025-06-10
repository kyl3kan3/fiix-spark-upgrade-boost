
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
  
  // Look for explicit instructions about pages being vendors
  const pageVendorKeywords = [
    'each page is a vendor',
    'each page contains one vendor',
    'one vendor per page',
    'page per vendor',
    'every page is a vendor',
    'individual vendor on each page',
    'separate vendor per page'
  ];
  
  const hasPageVendorInstruction = pageVendorKeywords.some(keyword => 
    instructionsLower.includes(keyword)
  );
  
  if (hasPageVendorInstruction) {
    console.log('📋 Instructions indicate each page should be treated as a vendor');
    return true;
  }
  
  // Look for instructions that suggest splitting pages
  const splitKeywords = [
    'multiple vendors per page',
    'split each page',
    'vendors are separated by',
    'multiple entries per page'
  ];
  
  const hasSplitInstruction = splitKeywords.some(keyword => 
    instructionsLower.includes(keyword)
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
