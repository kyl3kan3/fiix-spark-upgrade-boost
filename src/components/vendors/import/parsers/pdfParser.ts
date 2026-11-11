import { extractTextFromPdf } from './pdf/pdfTextExtractor';
import { handleOcrFallback } from './pdf/pdfOcrFallback';
import { processSingleVendor, processMultipleVendors, processGptResult } from './pdf/pdfProcessor';

export async function parsePDF(file: File, expectedCount?: number, instructions?: string): Promise<any[]> {
  const { pageTexts, renderPage, close } = await extractTextFromPdf(file);
  try {
    const recoveredPages: string[] = [];
    const structuredVendors: any[] = [];
    // Recover each scanned page independently, including mixed text/scanned documents.
    for (let index = 0; index < pageTexts.length; index++) {
      const result = await handleOcrFallback(file, pageTexts[index], instructions, index + 1, renderPage);
      if (result.isGptResult) {
        structuredVendors.push(...processGptResult(result.text).map(vendor => ({ ...vendor, pageNumber: index + 1 })));
        recoveredPages.push('');
      } else {
        recoveredPages.push(result.text);
      }
    }
    const text = recoveredPages.join('\n\n');
    const textVendors = expectedCount === 1
      ? processSingleVendor(text, instructions)
      : processMultipleVendors(text, recoveredPages, expectedCount, instructions);
    return [...textVendors, ...structuredVendors].sort((a, b) => (a.pageNumber ?? 0) - (b.pageNumber ?? 0));
  } finally { await close?.(); }
}
