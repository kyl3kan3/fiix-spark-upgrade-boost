
import { EntityClassification } from './types';
import { extractStructuredData } from './structuredDataExtractor';
import { analyzeUnstructuredText } from './unstructuredTextAnalyzer';

export type { EntityClassification } from './types';

export function analyzeAndCategorizeText(text: string, instructions?: string): EntityClassification {
  const result: EntityClassification = { rawText: text };
  
  // If instructions are provided, log them for debugging
  if (instructions) {
    console.log('📝 Using import instructions:', instructions);
  }
  
  // First, try to extract structured data using labels
  const structuredData = extractStructuredData(text, instructions);
  if (structuredData.hasStructuredData) {
    return { ...result, ...structuredData };
  }
  
  // Fall back to the original analysis method
  return analyzeUnstructuredText(text, result, instructions);
}
