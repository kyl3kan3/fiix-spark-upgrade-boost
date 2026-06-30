import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import GoogleAdsPanel from "@/components/admin/GoogleAdsPanel";
import GoogleAnalyticsPanel from "@/components/admin/GoogleAnalyticsPanel";
import { useAdminAnalytics } from "@/components/admin/analytics/useAdminAnalytics";
import { AnalyticsHeader } from "@/components/admin/analytics/AnalyticsHeader";
import { AnalyticsKpis } from "@/components/admin/analytics/AnalyticsKpis";
import { AnalyticsCharts } from "@/components/admin/analytics/AnalyticsCharts";
import { AnalyticsTables } from "@/components/admin/analytics/AnalyticsTables";

const AdminAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, data, loading, error, days, setDays, refresh } = useAdminAnalytics();

  if (isSuperAdmin === null) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isSuperAdmin) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-xl py-16 text-center">
          <h1 className="text-2xl font-semibold mb-2">Super admin access required</h1>
          <p className="text-muted-foreground mb-6">
            Only the platform super admin can view site analytics.
          </p>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Helmet>
        <title>Admin Analytics | MaintenEase</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="mx-auto w-full max-w-7xl px-4 py-6">
        <AnalyticsHeader
          days={days}
          setDays={setDays}
          loading={loading}
          generatedAt={data?.generatedAt}
          onRefresh={refresh}
        />

        {error && (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading && !data && (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {data && (
          <>
            <AnalyticsKpis data={data} days={days} />
            <AnalyticsCharts data={data} days={days} />
            <AnalyticsTables data={data} days={days} />
          </>
        )}

        <div className="mt-6 space-y-6">
          <GoogleAnalyticsPanel />
          <GoogleAdsPanel />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalyticsPage;
