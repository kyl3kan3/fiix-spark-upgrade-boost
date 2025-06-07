
import { useState } from 'react';
import { parseFile } from '../services/fileParsingService';
import { supabase } from '@/integrations/supabase/client';

export const useVendorImport = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setVendors([]);
    setLoading(true);
    const file = e.target.files?.[0];
    if (!file) return setLoading(false);

    try {
      const rows = await parseFile(file);
      setVendors(rows);
    } catch (e) {
      setError('Parsing failed: ' + String(e));
    }
    setLoading(false);
  };

  const saveToSupabase = async () => {
    try {
      for (const vendor of vendors) {
        const { error } = await supabase.from('vendors').insert([vendor]);
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
  };
};
