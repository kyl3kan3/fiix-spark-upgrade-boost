// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ insert: vi.fn(), from: vi.fn(), getUser: vi.fn(), parseFile: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { auth: { getUser: mocks.getUser }, from: mocks.from } }));
vi.mock('../services/fileParsingService', () => ({ parseFile: mocks.parseFile }));
import { useVendorImport } from './useVendorImport';

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('alert', vi.fn());
  mocks.getUser.mockResolvedValue({ data: { user: { id: 'user' } } });
  mocks.from.mockImplementation((table: string) => {
    if (table === 'profiles') return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { company_id: 'trusted-company' }, error: null }) }) }) };
    if (table === 'user_roles') return { select: () => ({ eq: async () => ({ data: [{ role: 'manager' }], error: null }) }) };
    if (table === 'vendors') return { insert: mocks.insert };
    throw new Error(`Unexpected table: ${table}`);
  });
  mocks.insert.mockResolvedValue({ error: null });
});

it('saves edited, removed and added preview rows in one atomic column-filtered insert', async () => {
  mocks.parseFile.mockResolvedValue([{ name: 'Original', raw_text: 'private source' }, { name: 'Removed' }]);
  const { result } = renderHook(() => useVendorImport());
  await act(async () => result.current.handleFile({ target: { files: [{ name: 'list.csv', size: 1, lastModified: 1 }] } } as any));
  expect(result.current.vendors.every(row => typeof row.id === 'string')).toBe(true);
  expect(new Set(result.current.vendors.map(row => row.id)).size).toBe(2);
  await act(async () => result.current.saveToSupabase([{ name: 'Edited', id: 'preview-id', raw_text: 'source', company_id: 'attacker' }, { name: 'Added' }]));
  expect(mocks.insert).toHaveBeenCalledTimes(1);
  const rows = mocks.insert.mock.calls[0][0];
  expect(rows.map((row: any) => row.name)).toEqual(['Edited', 'Added']);
  expect(rows.every((row: any) => row.company_id === 'trusted-company')).toBe(true);
  expect(rows[0]).not.toHaveProperty('raw_text');
  expect(rows[0]).not.toHaveProperty('id');
});
it('validates the full batch before any database insert', async () => {
  const { result } = renderHook(() => useVendorImport());
  await act(async () => result.current.saveToSupabase([{ name: 'Valid' }, { name: '' }]));
  expect(mocks.insert).not.toHaveBeenCalled();
  expect(result.current.error).toContain('valid company name');
});
