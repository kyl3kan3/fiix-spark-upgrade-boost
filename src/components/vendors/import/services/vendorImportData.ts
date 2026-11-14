import { isProductHeading } from './textClassifiers';
import type { VendorFormData, VendorImportData } from '@/services/vendorService';

const textFields = ['name', 'email', 'phone', 'website', 'address', 'city', 'state',
  'zip_code', 'contact_person', 'contact_title', 'description'] as const;

export function normalizeVendorImport(value: unknown): VendorImportData {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const result: Record<string, unknown> = {};
  for (const key of textFields) {
    const field = source[key];
    // Objects and arrays have no unambiguous representation as vendor fields.
    result[key] = typeof field === 'string' ? field.trim() : typeof field === 'number' && Number.isFinite(field) ? String(field) : '';
  }
  result.vendor_type = ['service', 'supplier', 'contractor', 'consultant'].includes(String(source.vendor_type)) ? source.vendor_type : 'service';
  result.status = ['active', 'inactive', 'suspended'].includes(String(source.status)) ? source.status : 'active';
  if (typeof source.rating === 'number' && Number.isFinite(source.rating)) result.rating = source.rating;
  for (const key of ['id', 'sourceText', 'raw_text']) {
    if (typeof source[key] === 'string') result[key] = source[key];
  }
  if (typeof source.pageNumber === 'number' && Number.isInteger(source.pageNumber)) result.pageNumber = source.pageNumber;
  return result as unknown as VendorImportData;
}

export function hasVendorName(value: { name?: unknown }): boolean {
  return typeof value.name === 'string' && value.name.trim().length >= 2 &&
    /[\p{L}]/u.test(value.name) && !isProductHeading(value.name) && !/^(?:unnamed|unknown) vendor$/i.test(value.name.trim()) &&
    !/^\d+\s+(?:pipe|parts?|fittings?|items?|products?|materials?|equipment)\b/i.test(value.name.trim());
}

export function vendorInsertData(value: unknown): VendorFormData {
  const normalized = normalizeVendorImport(value);
  if (!hasVendorName(normalized)) throw new Error('Every vendor must have a valid company name.');
  const { id: _id, raw_text: _raw, sourceText: _source, pageNumber: _page, ...columns } = normalized;
  return columns;
}
