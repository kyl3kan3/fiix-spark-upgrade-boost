
import { useState } from 'react';
import { parseFile } from '../services/fileParsingService';
import { supabase } from '@/integrations/supabase/client';
import { logger } from "@/lib/logger";

export const useVendorImport = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const clearResults = () => {
    logger.log('🧹 Clearing all import results');
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
    logger.log('🚀 STARTING FRESH FILE PROCESSING');
    logger.log('⏰ Processing timestamp:', timestamp || 'Not provided');
    
    setError('');
    setVendors([]);
    setLoading(true);
    
    const file = e.target.files?.[0];
    if (!file) {
      logger.log('❌ No file selected');
      return setLoading(false);
    }

    logger.log('📁 Processing file:', file.name, 'Size:', file.size);
    logger.log('📋 Expected count:', expectedCount);
    logger.log('📝 Instructions:', instructions || 'None provided');

    try {
      // Add cache busting by creating a unique file identifier
      const fileId = `${file.name}_${file.size}_${file.lastModified}_${timestamp || Date.now()}`;
      logger.log('🆔 Unique file identifier:', fileId);
      
      const rows = await parseFile(file, expectedCount, instructions);
      
      logger.log('✅ File parsing completed successfully');
      logger.log('📊 Results:', rows.length, 'vendors found');
      
      setVendors(rows);
      
      // Show warning if parsed count differs significantly from expected
      if (expectedCount && rows.length > 0) {
        const difference = Math.abs(rows.length - expectedCount);
        const percentDiff = (difference / expectedCount) * 100;
        
        if (percentDiff > 50) {
          const warningMsg = `Warning: Found ${rows.length} vendors but expected ${expectedCount}. The parsing might need adjustment.`;
          logger.log('⚠️', warningMsg);
          setError(warningMsg);
        }
      }
    } catch (e) {
      const errorMsg = 'Parsing failed: ' + String(e);
      console.error('❌ PARSING ERROR:', errorMsg);
      setError(errorMsg);
    }
    
    setLoading(false);
    logger.log('🏁 File processing completed');
  };

  const saveToSupabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be signed in to import vendors.');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id, role')
        .eq('id', user.id)
        .maybeSingle();
      if (profileError) throw profileError;
      if (!profile?.company_id) {
        throw new Error('Your account is not linked to a company.');
      }
      if (!['administrator', 'manager'].includes((profile.role || '').toLowerCase())) {
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
