
import React from 'react';
import VendorTable from '../VendorTable';
import { Button } from '@/components/ui/button';

interface ImportResultsProps {
  vendors: any[];
  onSave: () => void;
}

const ImportResults: React.FC<ImportResultsProps> = ({ vendors, onSave }) => {
  if (vendors.length === 0) return null;

  return (
    <div className="space-y-4">
      <VendorTable vendors={vendors} />
      <Button
        onClick={onSave}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        Save to Supabase
      </Button>
    </div>
  );
};

export default ImportResults;
