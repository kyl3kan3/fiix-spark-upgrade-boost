
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
    <Card className="bg-card border border-border rounded-lg shadow-sm">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="font-headline text-xl text-foreground">Company Information</CardTitle>
        <CardDescription className="text-muted-foreground">
          {setupCompleted
            ? "Your company information is incomplete"
            : "Set up your company profile"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {setupCompleted
              ? "Company information needs to be completed"
              : "No company information found"}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md text-sm">
            {setupCompleted
              ? "Please complete your company profile to enhance your MaintenEase experience."
              : "Set up your company profile to customize your MaintenEase experience and help your team identify your organization."}
          </p>
          <Button
            onClick={() => navigate("/setup")}
            className="bg-primary hover:bg-primary-variant text-primary-foreground uppercase tracking-wide text-xs font-semibold"
          >
            {setupCompleted ? "Complete Setup" : "Set Up Company"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
