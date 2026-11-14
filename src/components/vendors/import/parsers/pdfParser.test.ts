import { beforeEach, expect, it, vi } from 'vitest';
vi.mock('./pdf/pdfTextExtractor', () => ({ extractTextFromPdf: vi.fn() }));
vi.mock('./pdf/pdfOcrFallback', () => ({ handleOcrFallback: vi.fn() }));
import { extractTextFromPdf } from './pdf/pdfTextExtractor';
import { handleOcrFallback } from './pdf/pdfOcrFallback';
import { parsePDF } from './pdfParser';

beforeEach(() => vi.resetAllMocks());
it('keeps an empty structured OCR result empty', async () => {
  vi.mocked(extractTextFromPdf).mockResolvedValue({ text: '', pageTexts: [''] });
  vi.mocked(handleOcrFallback).mockResolvedValue({ text: '[]', isGptResult: true });
  expect(await parsePDF({} as File, 1)).toEqual([]);
});
it('recovers every scanned page and preserves instructions and page identities', async () => {
  vi.mocked(extractTextFromPdf).mockResolvedValue({ text: 'Acme HVAC\n555-123-4567', pageTexts: ['Acme HVAC\n555-123-4567', '', ''] });
  vi.mocked(handleOcrFallback)
    .mockResolvedValueOnce({ text: 'Acme HVAC\n555-123-4567', isGptResult: false })
    .mockResolvedValueOnce({ text: 'Beta HVAC\n555-222-1234', isGptResult: false })
    .mockResolvedValueOnce({ text: '[{"name":"Gamma LLC"}]', isGptResult: true });
  const file = {} as File;
  const rows = await parsePDF(file, 3, 'one vendor per page');
  expect(rows.map(v => [v.name, v.pageNumber])).toEqual([['Acme HVAC', 1], ['Beta HVAC', 2], ['Gamma LLC', 3]]);
  expect(handleOcrFallback).toHaveBeenNthCalledWith(3, file, '', 'one vendor per page', 3, undefined);
});
