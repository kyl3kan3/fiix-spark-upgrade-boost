import { expect, it, vi } from 'vitest';
vi.mock('tesseract.js', () => ({ default: { recognize: vi.fn() } }));
vi.mock('../../services/gptVisionService', () => ({ callGptVision: vi.fn() }));
vi.mock('./pdfTextExtractor', () => ({ renderPdfToImage: vi.fn() }));
import Tesseract from 'tesseract.js';
import { callGptVision } from '../../services/gptVisionService';
import { handleOcrFallback } from './pdfOcrFallback';

it('keeps short legitimate extracted names without unnecessary OCR', async () => {
  const render = vi.fn();
  expect(await handleOcrFallback({} as File, 'IBM', undefined, 1, render)).toEqual({ text: 'IBM', isGptResult: false });
  expect(render).not.toHaveBeenCalled();
});
it('passes instructions to the AI fallback and preserves an empty result', async () => {
  vi.mocked(Tesseract.recognize).mockResolvedValue({ data: { text: '' } } as any);
  vi.mocked(callGptVision).mockResolvedValue([]);
  const render = vi.fn(async () => 'data:image/png;base64,fixture');
  expect(await handleOcrFallback({} as File, '', 'one vendor per page', 2, render)).toEqual({ text: '[]', isGptResult: true });
  expect(render).toHaveBeenCalledWith(2);
  expect(callGptVision).toHaveBeenCalledWith('fixture', 'one vendor per page');
});
