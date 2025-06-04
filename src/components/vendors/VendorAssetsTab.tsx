
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Unlink, Package } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getVendorAssets } from "@/services/vendorService";
import { getAllAssets } from "@/services/assetService";

interface VendorAssetsTabProps {
  vendorId: string;
}

const VendorAssetsTab: React.FC<VendorAssetsTabProps> = ({ vendorId }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState("");
  const [relationshipType, setRelationshipType] = useState("service");
  const queryClient = useQueryClient();

  const { data: vendorAssets, isLoading } = useQuery({
    queryKey: ["vendor-assets", vendorId],
    queryFn: () => getVendorAssets(vendorId),
  });

  const { data: allAssets } = useQuery({
    queryKey: ["assets"],
    queryFn: getAllAssets,
  });

  const getRelationshipColor = (type: string) => {
    switch (type) {
      case "service":
        return "bg-blue-100 text-blue-800";
      case "supply":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Associated Assets</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Link Asset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Link Asset to Vendor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Asset</label>
                <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {allAssets?.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Relationship Type</label>
                <Select value={relationshipType} onValueChange={setRelationshipType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">Service Provider</SelectItem>
                    <SelectItem value="supply">Supplier</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setIsDialogOpen(false)}>Link Asset</Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {vendorAssets && vendorAssets.length > 0 ? (
        <div className="grid gap-4">
          {vendorAssets.map((vendorAsset) => (
            <Card key={vendorAsset.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Package className="h-8 w-8 text-gray-400" />
                    <div>
                      <h4 className="font-medium">{vendorAsset.asset?.name}</h4>
                      <p className="text-sm text-gray-500">{vendorAsset.asset?.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRelationshipColor(vendorAsset.relationship_type)}>
                      {vendorAsset.relationship_type}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Unlink className="h-4 w-4 mr-1" />
                      Unlink
                    </Button>
                  </div>
                </div>
                {vendorAsset.notes && (
                  <p className="text-sm text-gray-600 mt-3">{vendorAsset.notes}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No assets linked to this vendor</p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Link First Asset</Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorAssetsTab;
