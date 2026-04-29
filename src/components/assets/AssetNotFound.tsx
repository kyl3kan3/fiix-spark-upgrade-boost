import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";

const AssetNotFound: React.FC = () => (
  <DashboardLayout>
    <PageHeader title="Equipment not found" description="We couldn't find this asset. It may have been deleted or the link is incorrect." />
    <div className="px-4 md:px-6 lg:px-8 py-6">
      <Button asChild variant="accent">
        <Link to="/assets">Back to Equipment</Link>
      </Button>
    </div>
  </DashboardLayout>
);

export default AssetNotFound;