
import { useState } from 'react';
import { parseFile } from '../services/fileParsingService';
import { supabase } from '@/integrations/supabase/client';

export const useVendorImport = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>, expectedCount?: number) => {
    console.log('🚀 Starting file import process');
    setError('');
    setVendors([]);
    setLoading(true);
    
    const file = e.target.files?.[0];
    if (!file) {
      console.log('❌ No file selected');
      setLoading(false);
      return;
    }

    console.log('📁 File selected:', {
      name: file.name,
      size: file.size,
      type: file.type,
      expectedCount
    });

    try {
      console.log('⏳ Starting file parsing...');
      const rows = await parseFile(file, expectedCount);
      
      console.log('✅ File parsing completed:', {
        rowsFound: rows.length,
        rows: rows
      });
      
      if (rows.length === 0) {
        console.warn('⚠️ No vendors extracted from file');
        setError('No vendors could be extracted from this file. Please check the file format and content.');
      } else {
        setVendors(rows);
        
        // Show warning if parsed count differs significantly from expected
        if (expectedCount && rows.length > 0) {
          const difference = Math.abs(rows.length - expectedCount);
          const percentDiff = (difference / expectedCount) * 100;
          
          if (percentDiff > 50) {
            const warningMessage = `Warning: Found ${rows.length} vendors but expected ${expectedCount}. The parsing might need adjustment.`;
            console.warn('⚠️', warningMessage);
            setError(warningMessage);
          }
        }
      }
    } catch (e) {
      const errorMessage = 'Parsing failed: ' + String(e);
      console.error('❌ File parsing error:', e);
      setError(errorMessage);
    }
    
    setLoading(false);
    console.log('🏁 File import process completed');
  };

  const saveToSupabase = async () => {
    console.log('💾 Starting save to Supabase:', vendors.length, 'vendors');
    
    try {
      for (const vendor of vendors) {
        console.log('💾 Saving vendor:', vendor.name);
        const { error } = await supabase.from('vendors').insert([vendor]);
        if (error) {
          console.error('❌ Error saving vendor:', vendor.name, error);
          throw error;
        }
      }
      console.log('✅ All vendors saved successfully');
      alert('Vendors saved!');
    } catch (error) {
      console.error('❌ Error saving vendors:', error);
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
