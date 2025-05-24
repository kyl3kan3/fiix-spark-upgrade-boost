
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NoCompanyInfoProps {
  setupCompleted: boolean;
}

export const NoCompanyInfo: React.FC<NoCompanyInfoProps> = ({ setupCompleted }) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
        <CardDescription>
          {setupCompleted 
            ? "Your company information is incomplete" 
            : "Set up your company profile"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Building2 className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {setupCompleted 
              ? "Company information needs to be completed" 
              : "No company information found"}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {setupCompleted 
              ? "Please complete your company profile to enhance your MaintenEase experience."
              : "Set up your company profile to customize your MaintenEase experience and help your team identify your organization."}
          </p>
          <Button onClick={() => navigate('/setup')}>
            {setupCompleted ? "Complete Setup" : "Set Up Company"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
