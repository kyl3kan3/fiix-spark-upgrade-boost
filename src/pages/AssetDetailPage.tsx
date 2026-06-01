import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Pencil, ArrowLeft, Cog, MapPin, QrCode, Wrench } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { getAssetById } from "@/services/assets/assetQueries";
import AssetNotFound from "@/components/assets/AssetNotFound";
import ImageGallery from "@/components/common/ImageGallery";
import { useSignedAssetImageUrl } from "@/lib/storage/signedAssetImage";

function getStatusConfig(status: string) {
  switch (status?.toLowerCase()) {
    case "operational":
    case "active":
      return { label: "Operational", className: "bg-success/15 text-success border border-success/30" };
    case "maintenance":
    case "under_maintenance":
      return { label: "Maintenance", className: "bg-warning/15 text-warning border border-warning/30" };
    default:
      return {
        label: status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown",
        className: "bg-muted text-muted-foreground border border-border",
      };
  }
}

const AssetDetailPage = () => {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();

  const { data: asset, isLoading, error } = useQuery({
    queryKey: ["asset", assetId],
    queryFn: () => getAssetById(assetId as string),
    enabled: !!assetId,
    retry: false,
  });
  const heroImage = useSignedAssetImageUrl((asset as any)?.image_url ?? null);

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeader title="Loading equipment…" />
        <div className="px-4 md:px-6 lg:px-8 py-6 text-sm text-muted-foreground">Loading…</div>
      </DashboardLayout>
    );
  }

  if (error || !asset) {
    return <AssetNotFound />;
  }

  const statusConfig = getStatusConfig(asset.status);

  return (
    <DashboardLayout>
      {/* Back + breadcrumb */}
      <div className="px-4 md:px-6 lg:px-8 pt-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/assets")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Equipment
        </Button>
      </div>

      <PageHeader
        title={asset.name}
        description={asset.description || "Equipment details"}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to={`/assets/${asset.id}/edit`} aria-label="Edit asset">
                <Pencil className="h-4 w-4 mr-1" /> Edit Details
              </Link>
            </Button>
            <Button asChild variant="accent">
              <Link to={`/work-orders/new?asset_id=${asset.id}`}>
                <Wrench className="h-4 w-4 mr-1" /> Create Work Order
              </Link>
            </Button>
          </div>
        }
      />

      <div className="px-4 md:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
          {/* ── Col 1-2: hero + specs ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero / Specs card */}
            <div className="surface-card rounded-lg overflow-hidden flex flex-col sm:flex-row">
              {heroImage ? (
                <div className="w-full sm:w-2/5 min-h-[200px] bg-muted overflow-hidden">
                  <img
                    src={heroImage}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="w-full sm:w-2/5 min-h-[180px] bg-primary/5 flex items-center justify-center">
                  <Cog className="h-16 w-16 text-primary/20" strokeWidth={1} />
                </div>
              )}

              <div className="p-6 flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-headline font-semibold text-lg text-foreground">Technical Specifications</h3>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${statusConfig.className}`}>
                    {statusConfig.label}
                  </span>
                </div>

                <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <dt className="label-eyebrow mb-0.5">Status</dt>
                    <dd className="text-sm font-medium text-foreground capitalize">{asset.status}</dd>
                  </div>
                  {asset.model && (
                    <div>
                      <dt className="label-eyebrow mb-0.5">Model</dt>
                      <dd className="text-sm font-medium text-foreground">{asset.model}</dd>
                    </div>
                  )}
                  {asset.serial_number && (
                    <div>
                      <dt className="label-eyebrow mb-0.5">Serial Number</dt>
                      <dd className="text-sm font-mono font-medium text-foreground">{asset.serial_number}</dd>
                    </div>
                  )}
                  {asset.purchase_date && (
                    <div>
                      <dt className="label-eyebrow mb-0.5">Purchased</dt>
                      <dd className="text-sm font-medium text-foreground">{asset.purchase_date}</dd>
                    </div>
                  )}
                  {asset.location && (
                    <div className="col-span-2">
                      <dt className="label-eyebrow mb-0.5">Location</dt>
                      <dd className="text-sm font-medium text-foreground flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-secondary shrink-0" />
                        {asset.location}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Photo gallery */}
            <div className="surface-card rounded-lg p-6">
              <ImageGallery entityType="asset" entityId={asset.id} title="Photos" />
            </div>
          </div>

          {/* ── Col 3: side panel ── */}
          <div className="space-y-6">
            {/* Status summary card */}
            <div className="surface-card rounded-lg p-6">
              <h3 className="label-eyebrow mb-5">Asset Summary</h3>
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Cog className="h-5 w-5 text-primary" />
                </div>
                <p className="font-headline font-semibold text-xl text-foreground mb-1">{asset.name}</p>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusConfig.className}`}>
                  {statusConfig.label}
                </span>
                {asset.location && (
                  <div className="flex items-center gap-1.5 mt-3 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-secondary shrink-0" />
                    <span>{asset.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="surface-card rounded-lg p-6">
              <h3 className="label-eyebrow mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start gap-2">
                  <Link to={`/work-orders/new?asset_id=${asset.id}`}>
                    <Wrench className="h-4 w-4 text-secondary" />
                    Create Work Order
                  </Link>
                </Button>
              </div>
            </div>

            {/* Field ID / QR */}
            <div className="surface-card rounded-lg p-6">
              <h3 className="label-eyebrow mb-4">Field Identification</h3>
              <div className="bg-muted rounded-lg p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-card rounded-lg flex items-center justify-center border border-border shrink-0">
                  <QrCode className="h-7 w-7 text-primary/60" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">QR Code</p>
                  <p className="text-xs text-muted-foreground">Scan for quick mobile access</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssetDetailPage;
