
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUnifiedCompanyStatus } from "@/hooks/company/useUnifiedCompanyStatus";
import { LoadingDisplay } from "./company-required/LoadingDisplay";

interface CompanyRequiredWrapperProps {
 children: React.ReactNode;
}

const CompanyRequiredWrapper: React.FC<CompanyRequiredWrapperProps> = ({ children }) => {
 const navigate = useNavigate();
 const {
 isLoading,
 isAuthenticated,
 setupComplete,
 companyId,
 } = useUnifiedCompanyStatus();
  const [bannerDismissed, setBannerDismissed] = useState(false);

 // Redirect to auth if not authenticated
 useEffect(() => {
 if (!isLoading && !isAuthenticated) {
 navigate("/auth");
 }
 }, [isLoading, isAuthenticated, navigate]);

 // Show loading while checking status
 if (isLoading) {
 return <LoadingDisplay message="Loading company information..." />;
 }

 // Redirect if not authenticated
 if (!isAuthenticated) {
 return <LoadingDisplay message="Redirecting to login..." />;
 }

  const needsCompany = !setupComplete || !companyId;

  return (
    <>
      {needsCompany && !bannerDismissed && (
        <div className="sticky top-0 z-40 bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800">
          <div className="px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-amber-900 dark:text-amber-100">
              <Building2 className="h-4 w-4 shrink-0" />
              <span>
                You're exploring MaintenEase. Set up your company to start creating work orders, assets, and inviting your team.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => navigate("/company-setup")}
              >
                Set up company
              </Button>
              <button
                aria-label="Dismiss"
                onClick={() => setBannerDismissed(true)}
                className="p-1 text-amber-900 dark:text-amber-100 hover:opacity-70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
};

export default CompanyRequiredWrapper;
