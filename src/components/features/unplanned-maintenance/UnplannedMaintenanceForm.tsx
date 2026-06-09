
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2 } from "lucide-react";
import { getAllAssets } from "@/services/assets/assetQueries";
import { UnplannedMaintenanceFormData } from "./types";

interface UnplannedMaintenanceFormProps {
 onSubmit: (data: UnplannedMaintenanceFormData) => void;
 isSubmitting?: boolean;
}

const EMPTY_FORM: UnplannedMaintenanceFormData = {
 title: "",
 description: "",
 assetId: "",
 urgency: "medium",
 estimatedDowntime: "",
 notes: ""
};

const UnplannedMaintenanceForm: React.FC<UnplannedMaintenanceFormProps> = ({ onSubmit, isSubmitting }) => {
 const [formData, setFormData] = useState<UnplannedMaintenanceFormData>(EMPTY_FORM);

 const { data: assets, isLoading: assetsLoading } = useQuery({
 queryKey: ["assets"],
 queryFn: getAllAssets,
 });

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!formData.title || !formData.description || !formData.assetId) {
 return;
 }
 onSubmit(formData);
 setFormData(EMPTY_FORM);
 };

 const urgencyOptions = [
 { value: "critical", label: "Critical", color: "text-destructive" },
 { value: "high", label: "High", color: "text-warning" },
 { value: "medium", label: "Medium", color: "text-warning" },
 { value: "low", label: "Low", color: "text-success" }
 ];

 return (
 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <Label htmlFor="title">Issue Title</Label>
 <Input
 id="title"
 value={formData.title}
 onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
 placeholder="Brief description of the issue"
 required
 />
 </div>

 <div>
 <Label htmlFor="asset">Affected Asset</Label>
 <Select
 value={formData.assetId}
 onValueChange={(value) => setFormData(prev => ({ ...prev, assetId: value }))}
 disabled={assetsLoading}
 >
 <SelectTrigger>
 <SelectValue placeholder={assetsLoading ? "Loading assets…" : "Select affected asset"} />
 </SelectTrigger>
 <SelectContent>
 {(assets || []).map((asset) => (
 <SelectItem key={asset.id} value={asset.id}>
 {asset.name}
 </SelectItem>
 ))}
 {!assetsLoading && (assets || []).length === 0 && (
 <div className="px-2 py-1.5 text-sm text-muted-foreground">
 No assets yet — add one under Assets first.
 </div>
 )}
 </SelectContent>
 </Select>
 </div>

 <div>
 <Label htmlFor="urgency">Urgency Level</Label>
 <Select 
 value={formData.urgency} 
 onValueChange={(value: any) => setFormData(prev => ({ ...prev, urgency: value }))}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {urgencyOptions.map(option => (
 <SelectItem key={option.value} value={option.value}>
 <span className={option.color}>{option.label}</span>
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div>
 <Label htmlFor="description">Description</Label>
 <Textarea
 id="description"
 value={formData.description}
 onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
 placeholder="Detailed description of the issue"
 rows={3}
 required
 />
 </div>

 <div>
 <Label htmlFor="estimatedDowntime">Estimated Downtime</Label>
 <Input
 id="estimatedDowntime"
 value={formData.estimatedDowntime}
 onChange={(e) => setFormData(prev => ({ ...prev, estimatedDowntime: e.target.value }))}
 placeholder="e.g., 2-4 hours"
 />
 </div>

 <div>
 <Label htmlFor="notes">Additional Notes</Label>
 <Textarea
 id="notes"
 value={formData.notes}
 onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
 placeholder="Any additional information"
 rows={2}
 />
 </div>

 <Button
 type="submit"
 className="w-full bg-destructive hover:bg-destructive text-white"
 disabled={isSubmitting || !formData.title || !formData.description || !formData.assetId}
 >
 {isSubmitting ? (
 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
 ) : (
 <AlertTriangle className="mr-2 h-4 w-4" />
 )}
 {isSubmitting ? "Reporting…" : "Report Issue"}
 </Button>
 </form>
 );
};

export default UnplannedMaintenanceForm;
