import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Package, Wrench, Calendar, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import {
  getLocationById,
  getLocationPath,
  getAssetsByLocationId,
  getSubLocationsByParentId,
  getWorkOrderCountByLocationId,
} from "@/services/locationService";
import ImageGallery from "@/components/common/ImageGallery";

function getAssetStatusConfig(status: string) {
  switch (status?.toLowerCase()) {
    case "active":
    case "operational":
      return "bg-success/15 text-success border border-success/30";
    case "maintenance":
    case "under_maintenance":
      return "bg-warning/15 text-warning border border-warning/30";
    default:
      return "bg-muted text-muted-foreground border border-border";
  }
}

const LocationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: location, isLoading: locationLoading } = useQuery({
    queryKey: ["location", id],
    queryFn: () => getLocationById(id!),
    enabled: !!id,
  });

  const { data: locationPath, isLoading: pathLoading } = useQuery({
    queryKey: ["locationPath", id],
    queryFn: () => getLocationPath(id!),
    enabled: !!id,
  });

  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ["locationAssets", id],
    queryFn: () => getAssetsByLocationId(id!),
    enabled: !!id,
  });

  const { data: workOrderCount = 0, isLoading: workOrdersLoading } = useQuery({
    queryKey: ["locationWorkOrders", id],
    queryFn: () => getWorkOrderCountByLocationId(id!),
    enabled: !!id,
  });

  const { data: subLocations = [], isLoading: subLocationsLoading } = useQuery({
    queryKey: ["subLocations", id],
    queryFn: () => getSubLocationsByParentId(id!),
    enabled: !!id,
  });

  const isLoading = locationLoading || pathLoading || assetsLoading || workOrdersLoading || subLocationsLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeader title="Loading location…" />
        <div className="px-4 md:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-4 max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-muted rounded-lg" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-muted rounded-lg" />
              <div className="h-64 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!location) {
    return (
      <DashboardLayout>
        <div className="px-4 md:px-6 lg:px-8 pt-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/locations")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Locations
          </Button>
        </div>
        <div className="px-4 md:px-6 lg:px-8 py-16 text-center">
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="font-headline text-xl font-semibold mb-2">Location not found</h2>
          <Link to="/locations" className="text-sm text-primary hover:underline">Back to locations</Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Back */}
      <div className="px-4 md:px-6 lg:px-8 pt-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/locations")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Locations
        </Button>
      </div>

      <PageHeader
        title={location.name}
        description={locationPath ? `Path: ${locationPath}` : location.description || "Location details"}
        actions={
          <Button asChild>
            <Link to={`/locations/${id}/edit`}>
              <Edit className="h-4 w-4 mr-1" /> Edit Location
            </Link>
          </Button>
        }
      />

      <div className="px-4 md:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl">
          <div className="surface-card rounded-lg p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="label-eyebrow">Assets</p>
              <p className="text-2xl font-bold text-foreground">{assets.length}</p>
            </div>
          </div>

          <div className="surface-card rounded-lg p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
              <Wrench className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="label-eyebrow">Work Orders</p>
              <p className="text-2xl font-bold text-foreground">{workOrderCount}</p>
            </div>
          </div>

          <div className="surface-card rounded-lg p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="label-eyebrow">Sub-locations</p>
              <p className="text-2xl font-bold text-foreground">{subLocations.length}</p>
            </div>
          </div>

          <div className="surface-card rounded-lg p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="label-eyebrow">Created</p>
              <p className="text-sm font-bold text-foreground">
                {new Date(location.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl">
          {/* Assets */}
          <div className="surface-card rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-4 w-4 text-secondary" />
              <h2 className="font-headline font-semibold text-lg text-foreground">
                Assets ({assets.length})
              </h2>
            </div>

            {assets.length > 0 ? (
              <div className="space-y-3">
                {assets.slice(0, 5).map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between p-3 bg-muted/40 border border-border rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">{asset.name}</p>
                      {asset.description && (
                        <p className="text-xs text-muted-foreground truncate">{asset.description}</p>
                      )}
                    </div>
                    <span className={`ml-3 shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${getAssetStatusConfig(asset.status)}`}>
                      {asset.status}
                    </span>
                  </div>
                ))}
                {assets.length > 5 && (
                  <Link
                    to={`/assets?location_id=${id}`}
                    className="block text-center text-sm text-primary hover:underline py-2"
                  >
                    View all {assets.length} assets
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No assets in this location</p>
            )}
          </div>

          {/* Sub-locations */}
          <div className="surface-card rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-secondary" />
              <h2 className="font-headline font-semibold text-lg text-foreground">
                Sub-locations ({subLocations.length})
              </h2>
            </div>

            {subLocations.length > 0 ? (
              <div className="space-y-3">
                {subLocations.map((subLocation) => (
                  <Link
                    key={subLocation.id}
                    to={`/locations/${subLocation.id}`}
                    className="block p-3 bg-muted/40 border border-border rounded-lg hover:bg-muted/70 transition-colors"
                  >
                    <p className="font-medium text-foreground">{subLocation.name}</p>
                    {subLocation.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{subLocation.description}</p>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No sub-locations</p>
            )}
          </div>
        </div>

        {/* Photo gallery */}
        <div className="surface-card rounded-lg p-6 max-w-6xl">
          <ImageGallery entityType="location" entityId={id!} title="Location Photos" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LocationDetailPage;
