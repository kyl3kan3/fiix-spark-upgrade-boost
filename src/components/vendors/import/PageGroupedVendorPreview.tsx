
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { VendorFormData } from "@/services/vendorService";
import { Edit3, Save, X, ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface PageGroupedVendorPreviewProps {
  parsedData: VendorFormData[];
  onDataChange: (data: VendorFormData[]) => void;
}

interface VendorGroup {
  pageNumber: number;
  vendors: VendorFormData[];
  pageText: string;
}

const PageGroupedVendorPreview: React.FC<PageGroupedVendorPreviewProps> = ({
  parsedData,
  onDataChange,
}) => {
  const [editingVendor, setEditingVendor] = useState<string | null>(null);
  const [editData, setEditData] = useState<VendorFormData | null>(null);
  const [expandedPages, setExpandedPages] = useState<number[]>([1]);

  // Group vendors by page
  const vendorsByPage: VendorGroup[] = React.useMemo(() => {
    const pageMap = new Map<number, VendorFormData[]>();
    
    parsedData.forEach(vendor => {
      const pageNum = (vendor as any).pageNumber || 1;
      if (!pageMap.has(pageNum)) {
        pageMap.set(pageNum, []);
      }
      pageMap.get(pageNum)!.push(vendor);
    });

    return Array.from(pageMap.entries()).map(([pageNumber, vendors]) => ({
      pageNumber,
      vendors,
      pageText: vendors[0]?.sourceText || ''
    })).sort((a, b) => a.pageNumber - b.pageNumber);
  }, [parsedData]);

  const startEdit = (vendorId: string, vendor: VendorFormData) => {
    setEditingVendor(vendorId);
    setEditData({ ...vendor });
  };

  const saveEdit = () => {
    if (editingVendor && editData) {
      const newData = parsedData.map(vendor => 
        (vendor as any).id === editingVendor ? editData : vendor
      );
      onDataChange(newData);
      setEditingVendor(null);
      setEditData(null);
    }
  };

  const cancelEdit = () => {
    setEditingVendor(null);
    setEditData(null);
  };

  const removeVendor = (vendorId: string) => {
    const newData = parsedData.filter(vendor => (vendor as any).id !== vendorId);
    onDataChange(newData);
  };

  const addVendor = (pageNumber: number) => {
    const newVendor: VendorFormData = {
      name: '',
      email: '',
      phone: '',
      contact_person: '',
      contact_title: '',
      vendor_type: 'service',
      status: 'active',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      website: '',
      description: '',
      rating: null,
      pageNumber,
      id: `new-${Date.now()}`
    } as any;
    
    onDataChange([...parsedData, newVendor]);
  };

  const updateField = (field: keyof VendorFormData, value: any) => {
    if (editData) {
      setEditData({ ...editData, [field]: value });
    }
  };

  const togglePageExpansion = (pageNumber: number) => {
    setExpandedPages(prev => 
      prev.includes(pageNumber) 
        ? prev.filter(p => p !== pageNumber)
        : [...prev, pageNumber]
    );
  };

  const getVendorId = (vendor: VendorFormData, index: number) => {
    return (vendor as any).id || `vendor-${index}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Vendors Grouped by Page</span>
          <Badge variant="secondary">{parsedData.length} total vendors</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {vendorsByPage.map(pageGroup => (
          <Card key={pageGroup.pageNumber} className="border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={() => togglePageExpansion(pageGroup.pageNumber)}
                  className="flex items-center gap-2 p-0 h-auto"
                >
                  {expandedPages.includes(pageGroup.pageNumber) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span className="font-medium">
                    Page {pageGroup.pageNumber} ({pageGroup.vendors.length} vendors)
                  </span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addVendor(pageGroup.pageNumber)}
                >
                  Add Vendor
                </Button>
              </div>
            </CardHeader>
            
            {expandedPages.includes(pageGroup.pageNumber) && (
              <CardContent className="space-y-3">
                {pageGroup.vendors.map((vendor, vendorIndex) => {
                  const vendorId = getVendorId(vendor, vendorIndex);
                  const isEditing = editingVendor === vendorId;
                  
                  return (
                    <Card key={vendorId} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        {isEditing ? (
                          // Edit Mode
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h5 className="font-medium">Editing Vendor</h5>
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
                                <Label>Company Name *</Label>
                                <Input
                                  value={editData?.name || ''}
                                  onChange={(e) => updateField('name', e.target.value)}
                                  placeholder="Company name"
                                />
                              </div>
                              
                              <div>
                                <Label>Vendor Type</Label>
                                <Select
                                  value={editData?.vendor_type || 'service'}
                                  onValueChange={(value) => updateField('vendor_type', value)}
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
                              
                              <div>
                                <Label>Email</Label>
                                <Input
                                  value={editData?.email || ''}
                                  onChange={(e) => updateField('email', e.target.value)}
                                  placeholder="Email address"
                                />
                              </div>
                              
                              <div>
                                <Label>Phone</Label>
                                <Input
                                  value={editData?.phone || ''}
                                  onChange={(e) => updateField('phone', e.target.value)}
                                  placeholder="Phone number"
                                />
                              </div>
                              
                              <div>
                                <Label>Contact Person</Label>
                                <Input
                                  value={editData?.contact_person || ''}
                                  onChange={(e) => updateField('contact_person', e.target.value)}
                                  placeholder="Contact person"
                                />
                              </div>
                              
                              <div>
                                <Label>Contact Title</Label>
                                <Input
                                  value={editData?.contact_title || ''}
                                  onChange={(e) => updateField('contact_title', e.target.value)}
                                  placeholder="Contact title"
                                />
                              </div>
                              
                              <div className="md:col-span-2">
                                <Label>Address</Label>
                                <Input
                                  value={editData?.address || ''}
                                  onChange={(e) => updateField('address', e.target.value)}
                                  placeholder="Full address"
                                />
                              </div>
                              
                              <div>
                                <Label>City</Label>
                                <Input
                                  value={editData?.city || ''}
                                  onChange={(e) => updateField('city', e.target.value)}
                                  placeholder="City"
                                />
                              </div>
                              
                              <div>
                                <Label>State</Label>
                                <Input
                                  value={editData?.state || ''}
                                  onChange={(e) => updateField('state', e.target.value)}
                                  placeholder="State"
                                />
                              </div>
                              
                              <div>
                                <Label>ZIP Code</Label>
                                <Input
                                  value={editData?.zip_code || ''}
                                  onChange={(e) => updateField('zip_code', e.target.value)}
                                  placeholder="ZIP code"
                                />
                              </div>
                              
                              <div>
                                <Label>Website</Label>
                                <Input
                                  value={editData?.website || ''}
                                  onChange={(e) => updateField('website', e.target.value)}
                                  placeholder="Website URL"
                                />
                              </div>
                              
                              <div className="md:col-span-2">
                                <Label>Description</Label>
                                <Textarea
                                  value={editData?.description || ''}
                                  onChange={(e) => updateField('description', e.target.value)}
                                  placeholder="Description"
                                  rows={2}
                                />
                              </div>
                            </div>
                            
                            {/* Source text display */}
                            <Collapsible>
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-full justify-between">
                                  <span>View Source Text</span>
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="mt-2 p-3 bg-muted rounded text-sm font-mono">
                                  {(vendor as any).sourceText || 'No source text available'}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        ) : (
                          // View Mode
                          <div>
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                <h5 className="font-medium text-lg">
                                  {vendor.name || 'Unnamed Vendor'}
                                </h5>
                                <Badge variant="outline">{vendor.vendor_type}</Badge>
                                {(!vendor.name || vendor.name.length < 3) && (
                                  <Badge variant="destructive" className="text-xs">Needs Attention</Badge>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => startEdit(vendorId, vendor)}>
                                  <Edit3 className="h-4 w-4 mr-1" /> Edit
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => removeVendor(vendorId)}>
                                  <X className="h-4 w-4 mr-1" /> Remove
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-muted-foreground">Contact:</span>
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
                            
                            {vendor.description && (
                              <div className="mt-3 pt-3 border-t">
                                <span className="font-medium text-muted-foreground">Description:</span>
                                <p className="text-sm mt-1">{vendor.description}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            )}
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

export default PageGroupedVendorPreview;
