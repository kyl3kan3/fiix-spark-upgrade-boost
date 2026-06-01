import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { getAssetById } from "@/services/assets/assetQueries";
import AssetNotFound from "@/components/assets/AssetNotFound";
import { useSignedAssetImageUrl } from "@/lib/storage/signedAssetImage";
import { MaterialIcon } from "@/components/ui/material-icon";

function getStatusConfig(status: string) {
  switch (status?.toLowerCase()) {
    case "operational":
    case "active":
      return { label: "Operational", className: "bg-success/20 text-success px-2 py-1 rounded text-label-sm font-label-sm uppercase tracking-wide border border-success/30" };
    case "maintenance":
    case "under_maintenance":
      return { label: "Maintenance", className: "bg-warning/20 text-warning px-2 py-1 rounded text-label-sm font-label-sm uppercase tracking-wide border border-warning/30" };
    default:
      return {
        label: status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown",
        className: "bg-surface-container text-secondary px-2 py-1 rounded text-label-sm font-label-sm uppercase tracking-wide border border-outline-variant/30",
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
        <div className="flex items-center justify-center h-64 text-sm font-semibold text-on-surface-variant">
          Loading…
        </div>
      </DashboardLayout>
    );
  }

  if (error || !asset) {
    return <AssetNotFound />;
  }

  const statusConfig = getStatusConfig(asset.status);

  return (
    <DashboardLayout>
      <Helmet>
        <title>{asset.name} | MaintenEase</title>
        <meta name="description" content={asset.description || `Asset detail for ${asset.name}`} />
      </Helmet>

      {/* Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 p-4 md:p-8 pb-0">
        <div>
          <div className="flex items-center gap-2 text-label-sm font-label-sm text-secondary mb-1">
            <button onClick={() => navigate("/assets")} className="hover:text-primary transition-colors">Assets</button>
            <MaterialIcon name="chevron_right" className="text-[16px]" />
            <span className="text-on-surface">{asset.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface tracking-tight">{asset.name}</h2>
            <span className={statusConfig.className}>{statusConfig.label}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            to={`/assets/${asset.id}/edit`}
            className="text-primary font-label-md text-label-md hover:underline flex items-center gap-1 bg-transparent px-2 py-1"
          >
            <MaterialIcon name="edit" className="text-[20px]" /> Edit Details
          </Link>
          <Link
            to={`/work-orders/new?asset_id=${asset.id}`}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md uppercase tracking-wider hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2"
          >
            <MaterialIcon name="handyman" className="text-[20px]" />
            Create Work Order
          </Link>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 md:p-8 pt-4">
        {/* Col 1 & 2: Primary Specs & Image */}
        <div className="md:col-span-2 space-y-6">
          {/* Asset Hero Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-transparent hover:border-primary/10 transition-colors overflow-hidden flex flex-col sm:flex-row">
            <div className="w-full sm:w-1/3 bg-surface-variant relative min-h-[200px]">
              {heroImage ? (
                <img
                  alt={asset.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  src={heroImage}
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <MaterialIcon name="precision_manufacturing" className="text-[64px] text-on-surface-variant/20" />
                </div>
              )}
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Technical Specifications</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 mt-4">
                  <div>
                    <p className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Status</p>
                    <p className="font-body-md text-body-md text-on-surface font-medium capitalize">{asset.status}</p>
                  </div>
                  {asset.model && (
                    <div>
                      <p className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Model</p>
                      <p className="font-body-md text-body-md text-on-surface font-medium">{asset.model}</p>
                    </div>
                  )}
                  {asset.serial_number && (
                    <div>
                      <p className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Serial Number</p>
                      <p className="font-body-md text-body-md text-on-surface font-medium font-mono">{asset.serial_number}</p>
                    </div>
                  )}
                  {asset.purchase_date && (
                    <div>
                      <p className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Install Date</p>
                      <p className="font-body-md text-body-md text-on-surface font-medium">{asset.purchase_date}</p>
                    </div>
                  )}
                  {asset.location && (
                    <div>
                      <p className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Location</p>
                      <p className="font-body-md text-body-md text-on-surface font-medium flex items-center gap-1">
                        <MaterialIcon name="location_on" className="text-[16px] text-primary" /> {asset.location}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Timeline */}
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-transparent p-6 card-hover">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-headline-md text-on-surface">Maintenance History</h3>
              <Link
                to={`/work-orders?asset_id=${asset.id}`}
                className="text-primary font-label-md text-label-md hover:underline flex items-center gap-1 bg-transparent"
              >
                View Full Log <MaterialIcon name="arrow_forward" className="text-[18px]" />
              </Link>
            </div>
            <div className="relative pl-6 border-l-2 border-surface-container-high space-y-8">
              <div className="relative">
                <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-surface-container-lowest border-2 border-primary"></span>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Preventive Maintenance</p>
                    <p className="font-body-md text-body-md text-secondary mt-1">Regular scheduled maintenance completed.</p>
                  </div>
                  <span className="font-label-sm text-label-sm text-secondary whitespace-nowrap bg-surface-container-low px-2 py-1 rounded">—</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Col 3: Side Panel */}
        <div className="space-y-6">
          {/* Health & Metrics Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-transparent p-6 text-center">
            <h3 className="font-label-md text-label-md text-secondary uppercase tracking-wider mb-4 text-left">Asset Health</h3>
            {/* Circular Progress */}
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="none" r="45" stroke="#e5eeff" strokeWidth="8"></circle>
                <circle
                  className="transition-all duration-1000 ease-out"
                  cx="50" cy="50" fill="none" r="45"
                  stroke={asset.status === "operational" || asset.status === "active" ? "#10B981" : "#F59E0B"}
                  strokeDasharray="283"
                  strokeDashoffset={asset.status === "operational" || asset.status === "active" ? "42" : "141"}
                  strokeWidth="8"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display-lg text-display-lg text-on-surface">
                  {asset.status === "operational" || asset.status === "active" ? "85" : "50"}
                  <span className="text-headline-md">%</span>
                </span>
              </div>
            </div>
            <p className="font-body-md text-body-md text-secondary">
              {asset.status === "operational" || asset.status === "active"
                ? "Asset is operating within normal parameters."
                : "Asset requires attention."}
            </p>
            <div className="grid grid-cols-2 gap-4 border-t border-outline-variant/20 mt-6 pt-4">
              <div className="text-left">
                <p className="font-label-sm text-label-sm text-secondary uppercase">Status</p>
                <p className="font-headline-md text-headline-md text-on-surface capitalize">{asset.status}</p>
              </div>
              <div className="text-left border-l border-outline-variant/20 pl-4">
                <p className="font-label-sm text-label-sm text-secondary uppercase">Uptime</p>
                <p className="font-headline-md text-headline-md text-on-surface">
                  {asset.status === "operational" || asset.status === "active" ? "99" : "—"}
                  <span className="text-body-md text-secondary">%</span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-transparent p-0 overflow-hidden">
            <div className="p-4 border-b border-outline-variant/20 bg-surface-container-low flex justify-between items-center">
              <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-2">
              <Link
                to={`/work-orders/new?asset_id=${asset.id}`}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-container transition-colors cursor-pointer border border-transparent hover:border-outline-variant/30"
              >
                <MaterialIcon name="handyman" className="text-primary mt-0.5" />
                <div>
                  <p className="font-label-md text-label-md text-on-surface">Create Work Order</p>
                  <p className="font-body-md text-body-md text-secondary text-sm mt-1">Log a new maintenance task for this asset.</p>
                </div>
              </Link>
              <Link
                to={`/assets/${asset.id}/edit`}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-container transition-colors cursor-pointer border border-transparent hover:border-outline-variant/30"
              >
                <MaterialIcon name="edit" className="text-primary mt-0.5" />
                <div>
                  <p className="font-label-md text-label-md text-on-surface">Edit Asset Details</p>
                  <p className="font-body-md text-body-md text-secondary text-sm mt-1">Update specifications and metadata.</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Documentation & QR */}
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-transparent p-6">
            <h3 className="font-label-md text-label-md text-secondary uppercase tracking-wider mb-4">Resources</h3>
            {/* QR Code Section */}
            <div className="bg-surface-container p-4 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-label-md text-label-md text-on-surface">Field Identification</p>
                <p className="font-label-sm text-label-sm text-secondary">Scan for quick mobile access.</p>
              </div>
              <div className="w-16 h-16 bg-white p-1 rounded shadow-sm flex items-center justify-center">
                <MaterialIcon name="qr_code" className="text-[40px] text-primary/60" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssetDetailPage;
