
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
 const { companyInfo, isLoading, setupCompleted, updateCompanyInfo } = useCompanyInfo();
 const navigate = useNavigate();

 const handleEditClick = () => {
 if (companyInfo) {
 // Store current info in session storage so the setup page can access it
 sessionStorage.setItem('edit_company_info', JSON.stringify(companyInfo));
 }
 
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
    <Card className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
        <div>
          <CardTitle className="font-headline text-xl text-foreground">Company Information</CardTitle>
          <CardDescription className="text-muted-foreground">Details of your organization</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleEditClick}
          className="border-border text-primary hover:bg-primary/5"
        >
          Edit
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        <CompanyDetails
          companyInfo={companyInfo}
          handleEditClick={handleEditClick}
        />
      </CardContent>
    </Card>
  );
};

export default CompanyInformation;
