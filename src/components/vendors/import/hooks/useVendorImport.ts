
import { useState } from 'react';
import { parseFile } from '../services/fileParsingService';
import { supabase } from '@/integrations/supabase/client';

export const useVendorImport = () => {
 const [vendors, setVendors] = useState<any[]>([]);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 const clearResults = () => {
 setVendors([]);
 setError('');
 setLoading(false);
 };

 const handleFile = async (
 e: React.ChangeEvent<HTMLInputElement>, 
 expectedCount?: number, 
 instructions?: string
 ) => {
 setError('');
 setVendors([]);
 setLoading(true);
 
 const file = e.target.files?.[0];
 if (!file) {
 return setLoading(false);
 }

 try {
 const rows = await parseFile(file, expectedCount, instructions);
 
 setVendors(rows);
 
 // Show warning if parsed count differs significantly from expected
 if (expectedCount && rows.length > 0) {
 const difference = Math.abs(rows.length - expectedCount);
 const percentDiff = (difference / expectedCount) * 100;
 
 if (percentDiff > 50) {
 const warningMsg = `Warning: Found ${rows.length} vendors but expected ${expectedCount}. The parsing might need adjustment.`;
 setError(warningMsg);
 }
 }
 } catch (e) {
 const errorMsg = 'Parsing failed: ' + String(e);
 console.error('❌ PARSING ERROR:', errorMsg);
 setError(errorMsg);
 }
 
 setLoading(false);
 };

 const saveToSupabase = async () => {
 try {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) throw new Error('You must be signed in to import vendors.');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .maybeSingle();
      if (profileError) throw profileError;
      if (!profile?.company_id) {
        throw new Error('Your account is not linked to a company.');
      }
      // Authoritative role check uses user_roles (matches server-side has_role()).
      const { data: roleRows, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      if (rolesError) throw rolesError;
      const roles = new Set((roleRows ?? []).map((r) => String(r.role).toLowerCase()));
      if (!roles.has('administrator') && !roles.has('manager')) {
        throw new Error('Only administrators or managers can import vendors.');
      }

 for (const vendor of vendors) {
 const { error } = await supabase
 .from('vendors')
 .insert([{ ...vendor, company_id: profile.company_id }]);
 if (error) throw error;
 }
 alert('Vendors saved!');
 } catch (error) {
 console.error('Error saving vendors:', error);
 setError('Failed to save vendors: ' + String(error));
 }
 };

 return {
 vendors,
 loading,
 error,
 handleFile,
 saveToSupabase,
 clearResults,
 };
};
