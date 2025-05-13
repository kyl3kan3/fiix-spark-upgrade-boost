
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const CompanyInfoLoading: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
        <CardDescription>Loading company details...</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-6 bg-gray-100 rounded animate-pulse"></div>
        <div className="h-6 bg-gray-100 rounded animate-pulse"></div>
        <div className="h-6 bg-gray-100 rounded animate-pulse"></div>
      </CardContent>
    </Card>
  );
};
