
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Package, AlertTriangle, TrendingUp } from "lucide-react";

interface LocationAnalyticsCardsProps {
  totalLocations: number;
  rootLocations: number;
  emptyLocations: number;
  maxDepth: number;
}

export const LocationAnalyticsCards: React.FC<LocationAnalyticsCardsProps> = ({
  totalLocations,
  rootLocations,
  emptyLocations,
  maxDepth,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <MapPin className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Locations</p>
              <p className="text-2xl font-bold">{totalLocations}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Root Locations</p>
              <p className="text-2xl font-bold">{rootLocations}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Empty Locations</p>
              <p className="text-2xl font-bold">{emptyLocations}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Max Depth</p>
              <p className="text-2xl font-bold">{maxDepth}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
