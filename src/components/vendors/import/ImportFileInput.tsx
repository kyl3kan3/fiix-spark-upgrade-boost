
import React from 'react';
import { Input } from '@/components/ui/input';

interface ImportFileInputProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImportFileInput: React.FC<ImportFileInputProps> = ({ onChange }) => {
  return (
    <div>
      <Input
        type="file"
        accept=".csv,.xlsx,.xls,.docx,.pdf"
        onChange={onChange}
        className="mb-4"
      />
    </div>
  );
};

export default ImportFileInput;
