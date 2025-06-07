
import React from 'react';
import { useVendorImport } from './import/hooks/useVendorImport';
import ImportFileInput from './import/ImportFileInput';
import ImportStatus from './import/ImportStatus';
import ImportResults from './import/ImportResults';

const VendorImport: React.FC = () => {
  const { vendors, loading, error, handleFile, saveToSupabase } = useVendorImport();

  return (
    <div className="space-y-4">
      <ImportFileInput onChange={handleFile} />
      <ImportStatus loading={loading} error={error} />
      <ImportResults vendors={vendors} onSave={saveToSupabase} />
    </div>
  );
};

export default VendorImport;
