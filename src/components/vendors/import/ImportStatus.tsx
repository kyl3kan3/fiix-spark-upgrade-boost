
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImportStatusProps {
  loading: boolean;
  error: string;
}

const ImportStatus: React.FC<ImportStatusProps> = ({ loading, error }) => {
  if (loading) {
    return (
      <Alert>
        <AlertDescription>Parsing file...</AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default ImportStatus;
