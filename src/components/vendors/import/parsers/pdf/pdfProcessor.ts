
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
  
  const entity = analyzeAndCategorizeText(cleanText);
  const vendor = entityToVendor(entity);
  
  console.log('✅ Single vendor processed:', vendor);
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
  const sections = splitTextIntoSections(cleanText, pageTexts, expectedCount);
  console.log('📝 Split into sections:', sections.length);
  
  // Analyze each section and convert to vendor format
  const vendors = sections.map((section, index) => {
    console.log(`🔍 Processing section ${index + 1}:`, section.substring(0, 100) + '...');
    const entity = analyzeAndCategorizeText(section);
    return entityToVendor(entity);
  }).filter(vendor => vendor.name && vendor.name !== 'Unnamed Vendor');
  
  console.log('✅ Processed vendors:', vendors.length);
  
  // If no valid vendors found from sections, try processing the entire text as one vendor
  if (vendors.length === 0) {
    console.log('🔄 No vendors from sections, trying full text as single vendor');
    const fallbackVendor = processSingleVendor(cleanText);
    return fallbackVendor;
  }
  
  return vendors;
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
