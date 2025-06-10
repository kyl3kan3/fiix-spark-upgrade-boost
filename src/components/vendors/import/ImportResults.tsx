
import React, { useState } from 'react';
import VendorTable from '../VendorTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Save, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PageGroupedVendorPreview from './PageGroupedVendorPreview';
import { VendorImportData } from '@/services/vendorService';

interface ImportResultsProps {
  vendors: VendorImportData[];
  onSave: () => void;
  expectedCount?: number;
}

const ImportResults: React.FC<ImportResultsProps> = ({ vendors, onSave, expectedCount }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [editableVendors, setEditableVendors] = useState(vendors);

  React.useEffect(() => {
    setEditableVendors(vendors);
  }, [vendors]);

  if (vendors.length === 0) return null;

  const formatVendorForSave = (vendor: VendorImportData) => {
    return {
      name: vendor.name || 'Unnamed Vendor',
      email: vendor.email || null,
      phone: vendor.phone || null,
      contact_person: vendor.contact_person || null,
      contact_title: vendor.contact_title || null,
      vendor_type: vendor.vendor_type || 'service',
      status: vendor.status || 'active',
      address: vendor.address || null,
      city: vendor.city || null,
      state: vendor.state || null,
      zip_code: vendor.zip_code || null,
      website: vendor.website || null,
      description: vendor.description || null,
      rating: vendor.rating || null,
    };
  };

  const formattedVendors = editableVendors.map(formatVendorForSave);

  // Check if count differs significantly from expected
  const showCountWarning = expectedCount && editableVendors.length > 0 && 
    Math.abs(editableVendors.length - expectedCount) > Math.max(1, expectedCount * 0.3);

  const handleSaveEditedVendors = () => {
    // Update the vendors state and then save
    onSave();
  };

  return (
    <div className="space-y-4">
      {showCountWarning && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Found {editableVendors.length} vendors but expected {expectedCount}. 
            You may want to adjust your file format or expected count.
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Import Results</span>
            <div className="flex items-center gap-2">
              {expectedCount && (
                <Badge variant="outline">
                  Expected: {expectedCount}
                </Badge>
              )}
              <Badge variant="secondary">{editableVendors.length} vendors found</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                parsedData={editableVendors}
                onDataChange={setEditableVendors}
              />
            </TabsContent>
            
            <TabsContent value="table" className="mt-4">
              <VendorTable vendors={editableVendors} />
            </TabsContent>
            
            <TabsContent value="preview" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Database Save Preview</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-2"
                  >
                    {showPreview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {showPreview ? 'Hide' : 'Show'} JSON Preview
                  </Button>
                </div>
                
                {showPreview && (
                  <Card>
                    <CardContent className="p-4">
                      <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-96">
                        {JSON.stringify(formattedVendors, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}
                
                <div className="grid gap-4">
                  {formattedVendors.map((vendor, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-lg">
                            {vendor.name}
                          </h5>
                          <Badge variant="outline">{vendor.vendor_type}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-muted-foreground">Contact Info:</span>
                            <p>{vendor.contact_person || 'Not specified'}</p>
                            <p>{vendor.phone || 'No phone'}</p>
                            <p>{vendor.email || 'No email'}</p>
                          </div>
                          
                          <div>
                            <span className="font-medium text-muted-foreground">Location:</span>
                            <p>{vendor.address || 'No address'}</p>
                            <p>{vendor.city && vendor.state ? `${vendor.city}, ${vendor.state}` : 'No city/state'}</p>
                            <p>{vendor.zip_code || ''}</p>
                          </div>
                          
                          <div>
                            <span className="font-medium text-muted-foreground">Details:</span>
                            <p>Status: {vendor.status}</p>
                            <p>Type: {vendor.vendor_type}</p>
                            {vendor.website && (
                              <p className="truncate">
                                Website: {vendor.website}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {vendor.description && (
                          <div className="mt-3 pt-3 border-t">
                            <span className="font-medium text-muted-foreground">Description:</span>
                            <p className="text-sm mt-1">{vendor.description}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSaveEditedVendors}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save {editableVendors.length} Vendors to Database
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportResults;
