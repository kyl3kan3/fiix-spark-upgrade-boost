
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface NoCompanyInfoProps {
  setupCompleted: boolean;
}

export const NoCompanyInfo: React.FC<NoCompanyInfoProps> = ({ setupCompleted }) => {
  const navigate = useNavigate();
  const buttonText = setupCompleted ? "Update Company Information" : "Complete Setup";

  const handleEditClick = () => {
    navigate('/setup');
    toast.info("You can update your company information here");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
        <CardDescription>
          {setupCompleted ? "Company information incomplete" : "No company information available"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          {setupCompleted
            ? "Your company information is incomplete. Please update your company details."
            : "You haven't completed the company setup process yet. Complete the setup to add your company details."}
        </p>
        <Button onClick={handleEditClick}>
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};
