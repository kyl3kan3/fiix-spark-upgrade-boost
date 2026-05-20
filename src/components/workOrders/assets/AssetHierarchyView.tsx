
import React from "react";
import { ChevronRight, ChevronDown, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AssetWithChildren } from "@/services/assetService";

interface AssetHierarchyViewProps {
 assets: AssetWithChildren[];
 onAddSubAsset: (parentId: string) => void;
 onEditAsset: (asset: AssetWithChildren) => void;
 onDeleteAsset: (assetId: string) => void;
}

interface AssetNodeProps {
 asset: AssetWithChildren;
 level: number;
 onAddSubAsset: (parentId: string) => void;
 onEditAsset: (asset: AssetWithChildren) => void;
 onDeleteAsset: (assetId: string) => void;
}

const AssetNode: React.FC<AssetNodeProps> = ({
 asset,
 level,
 onAddSubAsset,
 onEditAsset,
 onDeleteAsset
}) => {
 const [isExpanded, setIsExpanded] = React.useState(true);
 const hasChildren = asset.children && asset.children.length > 0;

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'active':
 return 'bg-green-100 text-green-800';
 case 'inactive':
 return 'bg-muted text-foreground';
 case 'maintenance':
 return 'bg-yellow-100 text-yellow-800';
 case 'retired':
 return 'bg-red-100 text-red-800';
 default:
 return 'bg-muted text-foreground';
 }
 };

 return (
 <div className="border rounded-lg bg-card dark:bg-card">
 <div 
 className="flex items-center justify-between p-4 hover:bg-muted dark:hover:bg-card cursor-pointer"
 style={{ paddingLeft: `${level * 20 + 16}px` }}
 >
 <div className="flex items-center space-x-3">
 {hasChildren && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => setIsExpanded(!isExpanded)}
 className="h-6 w-6 p-0"
 >
 {isExpanded ? (
 <ChevronDown className="h-4 w-4" />
 ) : (
 <ChevronRight className="h-4 w-4" />
 )}
 </Button>
 )}
 
 <div className="flex-1">
 <h3 className="font-semibold text-foreground dark:text-muted-foreground">
 {asset.name}
 </h3>
 {asset.description && (
 <p className="text-sm text-foreground dark:text-muted-foreground">
 {asset.description}
 </p>
 )}
 <div className="flex items-center space-x-2 mt-1">
 <Badge className={getStatusColor(asset.status)}>
 {asset.status}
 </Badge>
 {asset.model && (
 <span className="text-xs text-muted-foreground">
 Model: {asset.model}
 </span>
 )}
 {asset.serial_number && (
 <span className="text-xs text-muted-foreground">
 S/N: {asset.serial_number}
 </span>
 )}
 </div>
 </div>
 </div>

 <div className="flex items-center space-x-2">
 <Button
 variant="outline"
 size="sm"
 onClick={() => onAddSubAsset(asset.id)}
 >
 <Plus className="h-4 w-4 mr-1" />
 Add Sub-Asset
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => onEditAsset(asset)}
 >
 <Edit className="h-4 w-4" />
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => onDeleteAsset(asset.id)}
 className="text-red-600 hover:text-red-700"
 >
 <Trash2 className="h-4 w-4" />
 </Button>
 </div>
 </div>

 {hasChildren && isExpanded && (
 <div className="border-t">
 {asset.children!.map((child) => (
 <AssetNode
 key={child.id}
 asset={child}
 level={level + 1}
 onAddSubAsset={onAddSubAsset}
 onEditAsset={onEditAsset}
 onDeleteAsset={onDeleteAsset}
 />
 ))}
 </div>
 )}
 </div>
 );
};

export const AssetHierarchyView: React.FC<AssetHierarchyViewProps> = ({
 assets,
 onAddSubAsset,
 onEditAsset,
 onDeleteAsset
}) => {
 if (!assets || assets.length === 0) {
 return (
 <div className="text-center py-8 text-muted-foreground">
 No assets found. Create your first asset to get started.
 </div>
 );
 }

 return (
 <div className="space-y-4">
 {assets.map((asset) => (
 <AssetNode
 key={asset.id}
 asset={asset}
 level={0}
 onAddSubAsset={onAddSubAsset}
 onEditAsset={onEditAsset}
 onDeleteAsset={onDeleteAsset}
 />
 ))}
 </div>
 );
};
