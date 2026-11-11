import { supabase } from '@/integrations/supabase/client';
import { normalizeVendorImport, hasVendorName } from './vendorImportData';

export async function callGptVision(base64Image: string, instructions?: string): Promise<unknown[]> {
  const { data, error } = await supabase.functions.invoke('gpt-vision', { body: { base64Image, instructions } });
  if (error) throw error;
  const content = data?.result;
  const parsed: unknown = typeof content === 'string' ? JSON.parse(content.replace(/^```(?:json)?\s*|\s*```$/g, '').trim()) : content;
  if (!Array.isArray(parsed)) throw new Error('Image analysis did not return a vendor array.');
  return parsed.map(value => {
    const vendor = value && typeof value === 'object' ? value as Record<string, unknown> : {};
    return normalizeVendorImport({ ...vendor, name: vendor.name || vendor.company_name,
      contact_person: vendor.contact_person || vendor.contact, zip_code: vendor.zip_code || vendor.zipCode,
      description: vendor.description || vendor.notes });
  }).filter(hasVendorName);
}
