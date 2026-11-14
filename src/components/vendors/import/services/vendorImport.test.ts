import { describe, expect, it } from 'vitest';
import { analyzeAndCategorizeText } from './textAnalysisService';
import { extractAddress, extractWebsite, extractEmail } from './textExtractors';
import { normalizeVendorImport, vendorInsertData } from './vendorImportData';
import { parseDocxText } from '../parsers/docxParser';
import { processMultipleVendors, processSingleVendor, processGptResult } from '../parsers/pdf/pdfProcessor';
import { splitTextIntoSections } from '../parsers/pdf/pdfTextSplitter';

describe('vendor import regressions', () => {
  it('finds an ordinary address without backtracking through adversarial documents', () => {
    expect(extractAddress('Acme HVAC\n123 Main Street\nChicago IL 60601')).toBe('123 Main Street');
    const start = performance.now();
    expect(extractAddress('123 abc '.repeat(100_000))).toBeUndefined();
    expect(extractAddress('1'.repeat(500_000))).toBeUndefined();
    expect(extractWebsite('a'.repeat(500_000))).toBeUndefined();
    expect(extractEmail('a'.repeat(500_000))).toBeUndefined();
    expect(performance.now() - start).toBeLessThan(2500);
  });
  it('preserves names, contacts, and notes in unlabeled input', () => {
    const result = analyzeAndCategorizeText('Acme HVAC\n555-123-4567\nRooftop repair');
    expect(result.companyName).toBe('Acme HVAC');
    expect(result.phone).toBe('555-123-4567');
    expect(result.services?.join(' ') || result.notes).toContain('Rooftop repair');
    expect(analyzeAndCategorizeText('Construction Services LLC').companyName).toBe('Construction Services LLC');
    expect(analyzeAndCategorizeText('Composite Services\nPart Number: ABC-4\nJob Site: Warehouse').companyName).toBe('Composite Services');
    expect(analyzeAndCategorizeText('Composite Services\nPart Number: ABC-4\nJob Site: Warehouse').phone).toBeUndefined();
    expect(analyzeAndCategorizeText('Composite Services\nPart Number: ABC-4\nJob Site: Warehouse').website).toBeUndefined();
  });
  it('retains explicitly labeled data', () => {
    expect(parseDocxText('Company: Acme HVAC\nContact Person: Jane Doe\nEmail: sales@acme.example')).toHaveLength(1);
    expect(parseDocxText('IBM\nGE').map(v => v.name)).toEqual(['IBM', 'GE']);
    expect(analyzeAndCategorizeText('Company : Acme HVAC\nPhone: 555-123-4567\nWebsite: acme.example')).toMatchObject({ companyName: 'Acme HVAC', phone: '555-123-4567', website: 'https://acme.example' });
  });
  it('keeps short DOCX lists separate and rejects blank/product records', () => {
    expect(parseDocxText('Vendor A\nVendor B').map(v => v.name)).toEqual(['Vendor A', 'Vendor B']);
    for (const text of ['', '  \n ', '12 PIPE FITTINGS', 'PIPE FITTINGS', '123456', '[]', 'Unnamed Vendor']) {
      expect(parseDocxText(text)).toEqual([]);
      expect(processSingleVendor(text)).toEqual([]);
    }
    expect(parseDocxText('Acme HVAC\n555-123-4567')[0]).toMatchObject({ name: 'Acme HVAC', phone: '555-123-4567' });
  });
  it('processes each PDF page once and keeps useful OCR output', () => {
    const pages = Array.from({ length: 40 }, (_, i) => `Vendor ${i} Services LLC\n555-123-4567\nRepair and maintenance services available weekdays`);
    expect(processMultipleVendors(pages.join('\n\n'), pages)).toHaveLength(40);
    const recovered = processMultipleVendors('Acme HVAC\n555-123-4567', ['', ''], 2);
    expect(recovered).toHaveLength(1);
    expect(recovered[0].name).toBe('Acme HVAC');
    expect(processMultipleVendors('', ['', ''], 2)).toEqual([]);
  });
  it('distinguishes a valid empty AI result from malformed output', () => {
    expect(processGptResult('[]')).toEqual([]);
    expect(() => processGptResult('{}')).toThrow();
    expect(() => processGptResult('not json')).toThrow();
  });
  it('applies supported line/page instructions', () => {
    expect(splitTextIntoSections('Acme\nBeta', [], undefined, 'one vendor per line')).toEqual(['Acme', 'Beta']);
    const rows = processMultipleVendors('Acme\n\nBeta', ['Acme\n\nBeta'], undefined, 'one vendor per page');
    expect(rows).toHaveLength(1);
    expect(parseDocxText('Acme\nBeta', undefined, 'one vendor per line')).toHaveLength(2);
  });
  it('normalizes unsafe preview shapes and projects only database columns', () => {
    const row = normalizeVendorImport({ name: ' Edited company ', address: { city: 'X' }, phone: 123, description: ['bad'], id: 'vendor-preview-id', pageNumber: 3, raw_text: 'source', company_id: 'injected' });
    expect(row).toMatchObject({ name: 'Edited company', address: '', phone: '123', description: '' });
    const insert = vendorInsertData(row);
    expect(insert.name).toBe('Edited company');
    for (const key of ['id', 'raw_text', 'sourceText', 'pageNumber', 'company_id']) expect(insert).not.toHaveProperty(key);
    expect(() => vendorInsertData({ name: { nested: 'bad' } })).toThrow();
  });
});
