
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface ImportSaveButtonProps {
  vendorCount: number;
  onSave: () => void;
}

export const ImportSaveButton: React.FC<ImportSaveButtonProps> = ({
  vendorCount,
  onSave,
}) => {
  return (
    <div className="mt-6 flex justify-end">
      <Button
        onClick={onSave}
        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
      >
        <Save className="h-4 w-4" />
        Save {vendorCount} Vendors to Database
      </Button>
    </div>
  );
};
