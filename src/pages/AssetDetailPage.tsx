import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Pencil, ArrowLeft, Package, MapPin } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAssetById } from "@/services/assets/assetQueries";
import AssetNotFound from "@/components/assets/AssetNotFound";

const AssetDetailPage = () => {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();

  const { data: asset, isLoading, error } = useQuery({
    queryKey: ["asset", assetId],
    queryFn: () => getAssetById(assetId as string),
    enabled: !!assetId,
    retry: false,
  });

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

  return (
    <DashboardLayout>
      <div className="px-4 md:px-6 lg:px-8 pt-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/assets")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Equipment
        </Button>
      </div>
      <PageHeader
        title={asset.name}
        description={asset.description || "Equipment details"}
        actions={
          <Button asChild variant="accent">
            <Link to={`/assets/${asset.id}/edit`} aria-label="Edit asset">
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </Link>
          </Button>
        }
      />
      <div className="px-4 md:px-6 lg:px-8 py-6">
        <Card className="p-6 max-w-2xl">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="space-y-2 flex-1">
              <h2 className="font-semibold text-lg">{asset.name}</h2>
              {asset.location && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" /> {asset.location}
                </div>
              )}
              <dl className="grid grid-cols-2 gap-3 text-sm pt-2">
                <div><dt className="text-muted-foreground">Status</dt><dd className="font-medium capitalize">{asset.status}</dd></div>
                {asset.model && <div><dt className="text-muted-foreground">Model</dt><dd className="font-medium">{asset.model}</dd></div>}
                {asset.serial_number && <div><dt className="text-muted-foreground">Serial</dt><dd className="font-medium">{asset.serial_number}</dd></div>}
                {asset.purchase_date && <div><dt className="text-muted-foreground">Purchased</dt><dd className="font-medium">{asset.purchase_date}</dd></div>}
              </dl>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AssetDetailPage;