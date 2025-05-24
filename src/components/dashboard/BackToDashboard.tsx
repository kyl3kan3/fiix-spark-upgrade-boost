
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const BackToDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Button 
      onClick={() => navigate('/dashboard')} 
      variant="ghost" 
      className="mb-6"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back to Dashboard
    </Button>
  );
};

export default BackToDashboard;
