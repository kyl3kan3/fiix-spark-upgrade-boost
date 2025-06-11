
import { useState } from 'react';
import { parseFile } from '../services/fileParsingService';
import { supabase } from '@/integrations/supabase/client';

export const useVendorImport = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const clearResults = () => {
    console.log('🧹 Clearing all import results');
    setVendors([]);
    setError('');
    setLoading(false);
  };

  const handleFile = async (
    e: React.ChangeEvent<HTMLInputElement>, 
    expectedCount?: number, 
    instructions?: string,
    timestamp?: number
  ) => {
    console.log('🚀 STARTING FRESH FILE PROCESSING');
    console.log('⏰ Processing timestamp:', timestamp || 'Not provided');
    
    setError('');
    setVendors([]);
    setLoading(true);
    
    const file = e.target.files?.[0];
    if (!file) {
      console.log('❌ No file selected');
      return setLoading(false);
    }

    console.log('📁 Processing file:', file.name, 'Size:', file.size);
    console.log('📋 Expected count:', expectedCount);
    console.log('📝 Instructions:', instructions || 'None provided');

    try {
      // Add cache busting by creating a unique file identifier
      const fileId = `${file.name}_${file.size}_${file.lastModified}_${timestamp || Date.now()}`;
      console.log('🆔 Unique file identifier:', fileId);
      
      const rows = await parseFile(file, expectedCount, instructions);
      
      console.log('✅ File parsing completed successfully');
      console.log('📊 Results:', rows.length, 'vendors found');
      
      setVendors(rows);
      
      // Show warning if parsed count differs significantly from expected
      if (expectedCount && rows.length > 0) {
        const difference = Math.abs(rows.length - expectedCount);
        const percentDiff = (difference / expectedCount) * 100;
        
        if (percentDiff > 50) {
          const warningMsg = `Warning: Found ${rows.length} vendors but expected ${expectedCount}. The parsing might need adjustment.`;
          console.log('⚠️', warningMsg);
          setError(warningMsg);
        }
      }
    } catch (e) {
      const errorMsg = 'Parsing failed: ' + String(e);
      console.error('❌ PARSING ERROR:', errorMsg);
      setError(errorMsg);
    }
    
    setLoading(false);
    console.log('🏁 File processing completed');
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
    clearResults,
  };
};
