
import React from "react";
import { ChevronDown, ChevronRight, MapPin, Plus } from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocationWithChildren } from "@/services/locationService";
import { Link } from "react-router-dom";

interface LocationHierarchyViewProps {
  locations: LocationWithChildren[];
  isLoading: boolean;
  onAddSubLocation: (parentId: string) => void;
}

export const LocationHierarchyView: React.FC<LocationHierarchyViewProps> = ({ 
  locations,
  isLoading,
  onAddSubLocation
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-10 bg-gray-100 rounded-md mb-2"></div>
            <div className="h-10 bg-gray-100 rounded-md ml-6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!locations || locations.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg border">
        <MapPin className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No locations found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Start by adding locations to organize your assets.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <h2 className="text-lg font-medium mb-4">Location Hierarchy</h2>
      <Accordion type="multiple" className="w-full">
        {locations.map((location) => (
          <LocationNode 
            key={location.id} 
            location={location} 
            level={0} 
            onAddSubLocation={onAddSubLocation}
          />
        ))}
      </Accordion>
    </div>
  );
};

interface LocationNodeProps {
  location: LocationWithChildren;
  level: number;
  onAddSubLocation: (parentId: string) => void;
}

const LocationNode: React.FC<LocationNodeProps> = ({ 
  location, 
  level, 
  onAddSubLocation 
}) => {
  const hasChildren = location.children && location.children.length > 0;
  const paddingLeft = `${level * 0.5}rem`;
  
  return (
    <AccordionItem value={location.id} className="border-b">
      <div style={{ paddingLeft }} className="transition-all">
        <div className="flex items-center">
          {hasChildren ? (
            <AccordionTrigger className="hover:no-underline py-2 flex-grow">
              <div className="flex flex-grow items-center">
                <MapPin className="h-4 w-4 text-primary mr-2" />
                <span className="font-medium text-gray-900">{location.name}</span>
                {location.description && (
                  <span className="ml-3 text-gray-500 text-sm">
                    {location.description}
                  </span>
                )}
                <div className="ml-auto flex items-center gap-2">
                  <Badge variant="outline">
                    {location.children?.length || 0} sublocation(s)
                  </Badge>
                </div>
              </div>
            </AccordionTrigger>
          ) : (
            <div className="py-2 flex flex-grow items-center">
              <MapPin className="h-4 w-4 text-primary mr-2" />
              <span className="font-medium text-gray-900">{location.name}</span>
              {location.description && (
                <span className="ml-3 text-gray-500 text-sm">
                  {location.description}
                </span>
              )}
            </div>
          )}
          <div className="flex items-center gap-2 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddSubLocation(location.id)}
              className="text-primary hover:text-primary/80"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Sub
            </Button>
            <Link 
              to={`/assets?location_id=${location.id}`} 
              className="text-sm text-primary hover:underline"
            >
              View Assets
            </Link>
          </div>
        </div>
      </div>
      {hasChildren && (
        <AccordionContent className="pl-4">
          {location.children.map((child) => (
            <LocationNode 
              key={child.id} 
              location={child} 
              level={level + 1} 
              onAddSubLocation={onAddSubLocation}
            />
          ))}
        </AccordionContent>
      )}
    </AccordionItem>
  );
};
