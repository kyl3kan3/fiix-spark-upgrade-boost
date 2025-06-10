
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye } from 'lucide-react';
import { VendorImportData } from '@/services/vendorService';
import PageGroupedVendorPreview from '../PageGroupedVendorPreview';
import VendorTable from '../../VendorTable';
import { SavePreviewTab } from './SavePreviewTab';

interface ImportResultsTabsProps {
  vendors: VendorImportData[];
  onDataChange: (vendors: VendorImportData[]) => void;
}

export const ImportResultsTabs: React.FC<ImportResultsTabsProps> = ({
  vendors,
  onDataChange,
}) => {
  return (
    <Tabs defaultValue="edit" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="edit" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Edit by Page
        </TabsTrigger>
        <TabsTrigger value="table" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Table View
        </TabsTrigger>
        <TabsTrigger value="preview" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Save Preview
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="edit" className="mt-4">
        <PageGroupedVendorPreview 
          parsedData={vendors}
          onDataChange={onDataChange}
        />
      </TabsContent>
      
      <TabsContent value="table" className="mt-4">
        <VendorTable vendors={vendors} />
      </TabsContent>
      
      <TabsContent value="preview" className="mt-4">
        <SavePreviewTab vendors={vendors} />
      </TabsContent>
    </Tabs>
  );
};
