
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VendorFormData } from "@/services/vendorService";
import { AlertTriangle, Edit3, Save, X } from "lucide-react";
import VendorExportButtons from "./VendorExportButtons";
import ImportProgressStats from "./ImportProgressStats";

interface EnhancedVendorPreviewProps {
  parsedData: VendorFormData[];
  onDataChange: (data: VendorFormData[]) => void;
  processingWarnings?: string[];
  overallConfidence?: number;
}

const EnhancedVendorPreview: React.FC<EnhancedVendorPreviewProps> = ({
  parsedData,
  onDataChange,
  processingWarnings = [],
  overallConfidence = 1.0
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<VendorFormData | null>(null);

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditData({ ...parsedData[index] });
  };

  const saveEdit = () => {
    if (editingIndex !== null && editData) {
      const newData = [...parsedData];
      newData[editingIndex] = editData;
      onDataChange(newData);
      setEditingIndex(null);
      setEditData(null);
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditData(null);
  };

  const removeVendor = (index: number) => {
    const newData = parsedData.filter((_, i) => i !== index);
    onDataChange(newData);
  };

  const lowConfidenceCount = parsedData.filter(v => !v.name || v.name.length < 3).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            Preview & Edit Vendors
            <Badge variant="secondary">{parsedData.length} found</Badge>
          </CardTitle>
          <VendorExportButtons vendors={parsedData} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Processing Statistics */}
        <ImportProgressStats
          vendorsExtracted={parsedData.length}
          lowConfidenceCount={lowConfidenceCount}
          overallConfidence={overallConfidence}
          warningsCount={processingWarnings.length}
        />

        {/* Warnings */}
        {processingWarnings.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Processing Warnings:</strong>
              <ul className="mt-2 space-y-1">
                {processingWarnings.slice(0, 3).map((warning, index) => (
                  <li key={index} className="text-sm">• {warning}</li>
                ))}
                {processingWarnings.length > 3 && (
                  <li className="text-sm text-gray-500">... and {processingWarnings.length - 3} more</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Vendor List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {parsedData.map((vendor, index) => (
            <Card key={index} className="border">
              <CardContent className="p-4">
                {editingIndex === index ? (
                  /* Edit Mode */
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Editing Vendor #{index + 1}</h4>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit}>
                          <Save className="h-4 w-4 mr-1" /> Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          <X className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`name-${index}`}>Company Name *</Label>
                        <Input
                          id={`name-${index}`}
                          value={editData?.name || ''}
                          onChange={(e) => setEditData(prev => prev ? {...prev, name: e.target.value} : null)}
                          placeholder="Company name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`phone-${index}`}>Phone</Label>
                        <Input
                          id={`phone-${index}`}
                          value={editData?.phone || ''}
                          onChange={(e) => setEditData(prev => prev ? {...prev, phone: e.target.value} : null)}
                          placeholder="Phone number"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`email-${index}`}>Email</Label>
                        <Input
                          id={`email-${index}`}
                          value={editData?.email || ''}
                          onChange={(e) => setEditData(prev => prev ? {...prev, email: e.target.value} : null)}
                          placeholder="Email address"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`contact-${index}`}>Contact Person</Label>
                        <Input
                          id={`contact-${index}`}
                          value={editData?.contact_person || ''}
                          onChange={(e) => setEditData(prev => prev ? {...prev, contact_person: e.target.value} : null)}
                          placeholder="Contact person"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label htmlFor={`address-${index}`}>Address</Label>
                        <Input
                          id={`address-${index}`}
                          value={editData?.address || ''}
                          onChange={(e) => setEditData(prev => prev ? {...prev, address: e.target.value} : null)}
                          placeholder="Full address"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`city-${index}`}>City</Label>
                        <Input
                          id={`city-${index}`}
                          value={editData?.city || ''}
                          onChange={(e) => setEditData(prev => prev ? {...prev, city: e.target.value} : null)}
                          placeholder="City"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`state-${index}`}>State</Label>
                        <Input
                          id={`state-${index}`}
                          value={editData?.state || ''}
                          onChange={(e) => setEditData(prev => prev ? {...prev, state: e.target.value} : null)}
                          placeholder="State"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`website-${index}`}>Website</Label>
                        <Input
                          id={`website-${index}`}
                          value={editData?.website || ''}
                          onChange={(e) => setEditData(prev => prev ? {...prev, website: e.target.value} : null)}
                          placeholder="Website URL"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`type-${index}`}>Vendor Type</Label>
                        <Select
                          value={editData?.vendor_type || 'service'}
                          onValueChange={(value) => setEditData(prev => prev ? {...prev, vendor_type: value as any} : null)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="service">Service</SelectItem>
                            <SelectItem value="supplier">Supplier</SelectItem>
                            <SelectItem value="contractor">Contractor</SelectItem>
                            <SelectItem value="consultant">Consultant</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-lg">
                          {vendor.name || 'Unnamed Vendor'}
                        </h4>
                        {(!vendor.name || vendor.name.length < 3) && (
                          <Badge variant="destructive" className="text-xs">Low Quality</Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(index)}>
                          <Edit3 className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => removeVendor(index)}>
                          <X className="h-4 w-4 mr-1" /> Remove
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-500">Contact:</span>
                        <p>{vendor.contact_person || 'Not specified'}</p>
                        <p>{vendor.phone || 'No phone'}</p>
                        <p>{vendor.email || 'No email'}</p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-500">Location:</span>
                        <p>{vendor.address || 'No address'}</p>
                        <p>{vendor.city && vendor.state ? `${vendor.city}, ${vendor.state}` : 'No city/state'}</p>
                        <p>{vendor.zip_code || ''}</p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-500">Details:</span>
                        <p>Type: {vendor.vendor_type}</p>
                        <p>Status: {vendor.status}</p>
                        {vendor.website && (
                          <p className="truncate">
                            <a href={vendor.website} target="_blank" rel="noopener noreferrer" 
                               className="text-blue-600 hover:underline">
                              {vendor.website}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedVendorPreview;
