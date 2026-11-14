
import { EntityClassification } from './types';
import { extractStructuredData } from './structuredDataExtractor';
import { analyzeUnstructuredText } from './unstructuredTextAnalyzer';
import { logger } from "@/lib/logger";

export type { EntityClassification } from './types';

export function analyzeAndCategorizeText(text: string, instructions?: string): EntityClassification {
 const result: EntityClassification = { rawText: text };
 
 // If instructions are provided, log them for debugging
 if (instructions) {
 logger.log('📝 Using import instructions:', instructions);
 }
 
 // First, try to extract structured data using labels
 const structuredData = extractStructuredData(text, instructions);
 // Contacts alone do not identify a company; fill unlabeled fields as well.
 const unstructured = analyzeUnstructuredText(text, result, instructions);
 return { ...unstructured, ...structuredData };
}
