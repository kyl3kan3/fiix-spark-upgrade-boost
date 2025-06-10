
import { analyzeAndCategorizeText } from '../../services/textAnalysisService';
import { entityToVendor } from './entityToVendorConverter';
import { splitTextIntoSections } from './pdfTextSplitter';

export function processSingleVendor(text: string): any[] {
  console.log('🔄 Processing single vendor with text:', text.substring(0, 200) + '...');
  
  // Clean and normalize the text
  const cleanText = text.trim();
  if (cleanText.length < 10) {
    console.warn('⚠️ Text too short for processing:', cleanText);
    return [];
  }
  
  console.log('📊 Analyzing text for single vendor...');
  const entity = analyzeAndCategorizeText(cleanText);
  
  console.log('📋 Entity analysis result:', entity);
  
  const vendor = entityToVendor(entity);
  
  console.log('✅ Single vendor processed:', vendor);
  console.log('🏢 Vendor name:', vendor.name);
  console.log('📞 Vendor phone:', vendor.phone);
  console.log('📧 Vendor email:', vendor.email);
  
  // Always return at least one vendor, even if minimal
  if (!vendor.name || vendor.name === 'Unnamed Vendor') {
    console.log('⚠️ Vendor has no name, but still returning it for user review');
  }
  
  return [vendor];
}

export function processMultipleVendors(text: string, pageTexts: string[], expectedCount?: number): any[] {
  console.log('🔄 Processing multiple vendors. Expected count:', expectedCount);
  console.log('📄 Text length:', text.length, 'Pages:', pageTexts.length);
  
  // Clean the text first
  const cleanText = text.trim();
  if (cleanText.length < 20) {
    console.warn('⚠️ Text too short for multi-vendor processing');
    return [];
  }
  
  // Split text into sections based on document structure
  console.log('🔪 Splitting text into sections...');
  const sections = splitTextIntoSections(cleanText, pageTexts, expectedCount);
  console.log('📝 Split into sections:', sections.length);
  sections.forEach((section, index) => {
    console.log(`📄 Section ${index + 1} preview:`, section.substring(0, 100) + '...');
  });
  
  // Analyze each section and convert to vendor format
  const vendors = sections.map((section, index) => {
    console.log(`🔍 Processing section ${index + 1}:`, section.substring(0, 100) + '...');
    const entity = analyzeAndCategorizeText(section);
    const vendor = entityToVendor(entity);
    console.log(`📋 Section ${index + 1} resulted in vendor:`, {
      name: vendor.name,
      phone: vendor.phone,
      email: vendor.email
    });
    return vendor;
  });
  
  console.log('📊 All vendors before filtering:', vendors.map(v => ({ name: v.name, hasName: !!v.name })));
  
  // Much more lenient filtering - only reject completely empty vendors
  const validVendors = vendors.filter((vendor, index) => {
    const hasAnyData = vendor.name || vendor.phone || vendor.email || vendor.address;
    const hasMinimalName = vendor.name && vendor.name.length > 1 && vendor.name !== 'Unnamed Vendor';
    
    console.log(`🔍 Vendor ${index + 1} validation:`, {
      name: vendor.name,
      hasAnyData,
      hasMinimalName,
      willKeep: hasAnyData
    });
    
    if (!hasAnyData) {
      console.warn('❌ Filtered out vendor with no data:', vendor);
    } else {
      console.log('✅ Keeping vendor:', vendor.name || 'No name');
    }
    
    return hasAnyData;
  });
  
  console.log('✅ Final valid vendors:', validVendors.length);
  
  // If no valid vendors found from sections, try processing the entire text as one vendor
  if (validVendors.length === 0) {
    console.log('🔄 No vendors from sections, trying full text as single vendor');
    const fallbackVendor = processSingleVendor(cleanText);
    console.log('📋 Fallback result:', fallbackVendor);
    return fallbackVendor;
  }
  
  return validVendors;
}

export function processGptResult(gptText: string): any[] {
  console.log('🤖 Processing GPT result');
  try {
    const parsed = JSON.parse(gptText);
    if (Array.isArray(parsed)) {
      console.log('✅ GPT returned valid array:', parsed.length, 'items');
      return parsed;
    }
  } catch (error) {
    console.log('⚠️ GPT result not valid JSON, falling through to normal processing');
  }
  return [];
}
