
import { extractTextFromPdf } from './pdf/pdfTextExtractor';
import { handleOcrFallback } from './pdf/pdfOcrFallback';
import { processSingleVendor, processMultipleVendors, processGptResult } from './pdf/pdfProcessor';

export async function parsePDF(file: File, expectedCount?: number): Promise<any[]> {
  console.log('📄 Starting PDF parsing:', {
    fileName: file.name,
    fileSize: file.size,
    expectedCount
  });
  
  try {
    console.log('📖 Extracting text from PDF...');
    const { text: extractedText, pageTexts } = await extractTextFromPdf(file);
    
    console.log('📖 PDF text extraction result:', {
      extractedTextLength: extractedText.length,
      pageCount: pageTexts.length,
      extractedTextPreview: extractedText.substring(0, 500) + '...'
    });
    
    // Handle OCR fallback if text extraction failed
    console.log('🔍 Checking if OCR fallback is needed...');
    const { text, isGptResult } = await handleOcrFallback(file, extractedText);
    
    console.log('🔍 OCR fallback result:', {
      finalTextLength: text.length,
      isGptResult,
      textPreview: text.substring(0, 500) + '...'
    });
    
    // If GPT Vision returned structured data, use it directly
    if (isGptResult) {
      console.log('🤖 Processing GPT Vision result...');
      const gptResults = processGptResult(text);
      if (gptResults.length > 0) {
        console.log('✅ GPT Vision results found:', gptResults.length, 'vendors');
        return gptResults;
      }
      console.log('⚠️ GPT Vision returned no valid results');
    }
    
    // If expecting 1 vendor, treat entire document as single vendor
    if (expectedCount === 1) {
      console.log('🎯 Processing as single vendor (expectedCount = 1)');
      const result = processSingleVendor(text);
      console.log('✅ Single vendor processing result:', result);
      return result;
    }
    
    // Process multiple vendors
    console.log('🎯 Processing as multiple vendors');
    const result = processMultipleVendors(text, pageTexts, expectedCount);
    console.log('✅ Multiple vendor processing result:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Error in PDF parsing:', error);
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
}
