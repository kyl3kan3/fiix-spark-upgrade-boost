
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { VendorImportData } from "@/services/vendorService";
import { Save, X, ChevronDown } from "lucide-react";

interface VendorEditFormProps {
  editData: VendorImportData;
  sourceText?: string;
  onSave: () => void;
  onCancel: () => void;
  onFieldUpdate: (field: keyof VendorImportData, value: any) => void;
}

export const VendorEditForm: React.FC<VendorEditFormProps> = ({
  editData,
  sourceText,
  onSave,
  onCancel,
  onFieldUpdate,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h5 className="font-medium">Editing Vendor</h5>
        <div className="flex gap-2">
          <Button size="sm" onClick={onSave}>
            <Save className="h-4 w-4 mr-1" /> Save
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" /> Cancel
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>Company Name *</Label>
          <Input
            value={editData?.name || ''}
            onChange={(e) => onFieldUpdate('name', e.target.value)}
            placeholder="Company name"
          />
        </div>
        
        <div>
          <Label>Vendor Type</Label>
          <Select
            value={editData?.vendor_type || 'service'}
            onValueChange={(value) => onFieldUpdate('vendor_type', value)}
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
            onChange={(e) => onFieldUpdate('email', e.target.value)}
            placeholder="Email address"
          />
        </div>
        
        <div>
          <Label>Phone</Label>
          <Input
            value={editData?.phone || ''}
            onChange={(e) => onFieldUpdate('phone', e.target.value)}
            placeholder="Phone number"
          />
        </div>
        
        <div>
          <Label>Contact Person</Label>
          <Input
            value={editData?.contact_person || ''}
            onChange={(e) => onFieldUpdate('contact_person', e.target.value)}
            placeholder="Contact person"
          />
        </div>
        
        <div>
          <Label>Contact Title</Label>
          <Input
            value={editData?.contact_title || ''}
            onChange={(e) => onFieldUpdate('contact_title', e.target.value)}
            placeholder="Contact title"
          />
        </div>
        
        <div className="md:col-span-2">
          <Label>Address</Label>
          <Input
            value={editData?.address || ''}
            onChange={(e) => onFieldUpdate('address', e.target.value)}
            placeholder="Full address"
          />
        </div>
        
        <div>
          <Label>City</Label>
          <Input
            value={editData?.city || ''}
            onChange={(e) => onFieldUpdate('city', e.target.value)}
            placeholder="City"
          />
        </div>
        
        <div>
          <Label>State</Label>
          <Input
            value={editData?.state || ''}
            onChange={(e) => onFieldUpdate('state', e.target.value)}
            placeholder="State"
          />
        </div>
        
        <div>
          <Label>ZIP Code</Label>
          <Input
            value={editData?.zip_code || ''}
            onChange={(e) => onFieldUpdate('zip_code', e.target.value)}
            placeholder="ZIP code"
          />
        </div>
        
        <div>
          <Label>Website</Label>
          <Input
            value={editData?.website || ''}
            onChange={(e) => onFieldUpdate('website', e.target.value)}
            placeholder="Website URL"
          />
        </div>
        
        <div className="md:col-span-2">
          <Label>Description</Label>
          <Textarea
            value={editData?.description || ''}
            onChange={(e) => onFieldUpdate('description', e.target.value)}
            placeholder="Description"
            rows={2}
          />
        </div>
      </div>
      
      {sourceText && (
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span>View Source Text</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 p-3 bg-muted rounded text-sm font-mono">
              {sourceText || 'No source text available'}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};
