import { afterEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ getDocument: vi.fn(), worker: { workerSrc: '' } }));
vi.mock('pdfjs-dist', () => ({ getDocument: mocks.getDocument, GlobalWorkerOptions: mocks.worker }));
vi.mock('pdfjs-dist/build/pdf.worker.min.mjs?url', () => ({ default: '/assets/pdf.worker.min.mjs' }));
vi.mock('./pdfOcrFallback', () => ({ handleOcrFallback: async (_file: File, _text: string, _instructions: string, page: number, render: (page: number) => Promise<string>) => {
  await render(page);
  return { text: `Vendor ${page} LLC\n555-123-4567`, isGptResult: false };
} }));
import { parsePDF } from '../pdfParser';
afterEach(() => vi.unstubAllGlobals());
it('reads and opens a scanned PDF once for all pages and releases it', async () => {
  const destroy = vi.fn(async () => undefined);
  const render = vi.fn(() => ({ promise: Promise.resolve() }));
  mocks.getDocument.mockReturnValue({ promise: Promise.resolve({ numPages: 5, destroy, getPage: async () => ({ getTextContent: async () => ({ items: [] }), getViewport: () => ({ width: 100, height: 100 }), render }) }) });
  vi.stubGlobal('document', { createElement: () => ({ getContext: () => ({}), toDataURL: () => 'data:image/png;base64,fixture' }) });
  const arrayBuffer = vi.fn(async () => new ArrayBuffer(10));
  const rows = await parsePDF({ arrayBuffer } as unknown as File);
  expect(rows).toHaveLength(5);
  expect(arrayBuffer).toHaveBeenCalledTimes(1);
  expect(mocks.getDocument).toHaveBeenCalledTimes(1);
  expect(render).toHaveBeenCalledTimes(5);
  expect(destroy).toHaveBeenCalledTimes(1);
  expect(mocks.worker.workerSrc).toBe('/assets/pdf.worker.min.mjs');
});
