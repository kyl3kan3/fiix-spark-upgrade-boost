import { analyzeAndCategorizeText } from '../services/textAnalysisService';
import { entityToVendor } from './pdf/entityToVendorConverter';
import { splitTextIntoSections } from './pdf/pdfTextSplitter';
import { hasVendorName } from '../services/vendorImportData';

export function parseDocxText(text: string, expectedCount?: number, instructions?: string) {
  if (!text.trim()) return [];
  const sections = expectedCount === 1 ? [text] : splitTextIntoSections(text, [], expectedCount, instructions);
  return sections.map(section => entityToVendor(analyzeAndCategorizeText(section, instructions))).filter(hasVendorName);
}

export async function parseDOCX(file: File, expectedCount?: number, instructions?: string) {
  const { default: mammoth } = await import('mammoth');
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return parseDocxText(result.value, expectedCount, instructions);
}
