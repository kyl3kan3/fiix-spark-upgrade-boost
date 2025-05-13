
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CompanyInfoLoading } from "./company/CompanyInfoLoading";
import { NoCompanyInfo } from "./company/NoCompanyInfo";
import { CompanyDetails } from "./company/CompanyDetails";
import { useCompanyInfo } from "./company/useCompanyInfo";

const CompanyInformation: React.FC = () => {
  const { companyInfo, isLoading, setupCompleted } = useCompanyInfo();
  const navigate = useNavigate();

  const handleEditClick = () => {
    navigate('/setup');
    toast.info("You can update your company information here");
  };

  if (isLoading) {
    return <CompanyInfoLoading />;
  }

  // Handle case when there's no company info or it's incomplete
  if (!companyInfo || !companyInfo.companyName) {
    return <NoCompanyInfo setupCompleted={setupCompleted} />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Details of your organization</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleEditClick}>
          Edit
        </Button>
      </CardHeader>
      <CardContent>
        <CompanyDetails 
          companyInfo={companyInfo} 
          handleEditClick={handleEditClick} 
        />
      </CardContent>
    </Card>
  );
};

export default CompanyInformation;
