// @vitest-environment node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, it, vi } from 'vitest';

// Vite uses Mammoth's browser build in production; Vitest SSR otherwise selects
// the Node build, whose input contract is Buffer rather than ArrayBuffer.
vi.mock('mammoth', async () => {
  const browserEntry = 'mammoth/mammoth.browser.js';
  return import(/* @vite-ignore */ browserEntry);
});
import { parseDOCX } from './docxParser';

it('extracts a real Word file and preserves contacts across paragraphs', async () => {
  const bytes = await readFile(resolve('src/components/vendors/import/parsers/fixtures/vendor-control.docx'));
  const file = { arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) } as File;
  const vendors = await parseDOCX(file);
  expect(vendors).toHaveLength(1);
  expect(vendors[0]).toMatchObject({ name: 'Acme HVAC', phone: '555-123-4567', address: '123 Main Street' });
});
