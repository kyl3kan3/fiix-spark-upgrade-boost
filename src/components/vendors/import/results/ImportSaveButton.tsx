
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
    <div className="flex justify-end pt-2">
      <Button
        onClick={onSave}
        className="uppercase tracking-wide font-semibold text-xs px-8 gap-2 shadow-sm"
      >
        <Save className="h-4 w-4" />
        Save {vendorCount} Vendors to Database
      </Button>
    </div>
  );
};
