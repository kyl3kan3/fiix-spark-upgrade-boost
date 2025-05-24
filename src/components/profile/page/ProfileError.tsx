
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ProfileErrorProps {
  error: string;
  onRefresh: () => void;
}

export const ProfileError: React.FC<ProfileErrorProps> = ({ error, onRefresh }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
        <p className="mt-4 text-red-600">{error}</p>
        <Button onClick={onRefresh} className="mt-4">
          Try Again
        </Button>
      </div>
    </div>
  );
};
