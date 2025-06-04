
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const VendorListError: React.FC = () => {
  return (
    <Card>
      <CardContent className="text-center py-8">
        <p className="text-red-500">Failed to load vendors. Please try again.</p>
      </CardContent>
    </Card>
  );
};

export default VendorListError;
