import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Upload, Trash2, Building2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import PageContainer from "@/components/shell/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFloorPlans, useFloorPlanMarkers } from "@/hooks/useFloorPlans";
import { getFloorPlanUrl } from "@/services/floorPlanService";
import FloorPlanViewer from "@/components/floorPlans/FloorPlanViewer";

const BuildingViewerPage = () => {
  const { plans, assets, isLoading, upload, remove } = useFloorPlans();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [planName, setPlanName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedId && plans.length > 0) setSelectedId(plans[0].id);
    if (selectedId && !plans.some((p) => p.id === selectedId)) setSelectedId(plans[0]?.id ?? null);
  }, [plans, selectedId]);

  const selectedPlan = plans.find((p) => p.id === selectedId) ?? null;
  const { markers, add, remove: removeMarker } = useFloorPlanMarkers(selectedId);

  const { data: imageUrl, isLoading: urlLoading } = useQuery({
    queryKey: ["floor-plans", "url", selectedPlan?.storage_path],
    queryFn: () => getFloorPlanUrl(selectedPlan!.storage_path),
    enabled: !!selectedPlan,
  });

  const onFile = (file: File | undefined) => {
    if (!file) return;
    upload.mutate(
      { file, name: planName || file.name },
      { onSuccess: () => setPlanName("") },
    );
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <DashboardLayout>
      <PageHeader
        code="BLD · 001"
        title="Building Viewer"
        description="Upload a floor plan and pin your equipment onto it, then tilt and rotate it into a 3D view to see your assets in their physical space."
      />
      <PageContainer>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4 flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Floor plan name</Label>
                <Input
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g. Plant floor 1"
                  className="h-9 w-48"
                />
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
              <Button onClick={() => fileRef.current?.click()} disabled={upload.isPending}>
                <Upload className="h-4 w-4 mr-2" />
                {upload.isPending ? "Uploading…" : "Upload floor plan"}
              </Button>

              {plans.length > 0 && (
                <div className="space-y-1 ml-auto">
                  <Label className="text-xs">Current plan</Label>
                  <div className="flex items-center gap-2">
                    <Select value={selectedId ?? undefined} onValueChange={setSelectedId}>
                      <SelectTrigger aria-label="Current plan" className="h-9 w-56">
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedPlan && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove.mutate(selectedPlan)}
                        disabled={remove.isPending}
                        aria-label="Delete floor plan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {isLoading ? (
            <Skeleton className="h-[460px] w-full" />
          ) : plans.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No floor plans yet</h3>
                  <p className="text-muted-foreground max-w-md mt-1">
                    Upload a floor-plan image (PNG/JPG) to start pinning your equipment and viewing it in 3D.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : urlLoading || !imageUrl ? (
            <Skeleton className="h-[460px] w-full" />
          ) : (
            <FloorPlanViewer
              imageUrl={imageUrl}
              assets={assets}
              markers={markers}
              isBusy={add.isPending || removeMarker.isPending}
              onAddMarker={(x, y, assetId, label) =>
                selectedId &&
                add.mutate({ floor_plan_id: selectedId, asset_id: assetId, label, x, y })
              }
              onDeleteMarker={(id) => removeMarker.mutate(id)}
            />
          )}
        </div>
      </PageContainer>
    </DashboardLayout>
  );
};

export default BuildingViewerPage;
