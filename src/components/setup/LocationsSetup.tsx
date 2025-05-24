import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { SetupStepComponentProps } from "./SetupContent";

interface Location {
  id: string;
  name: string;
  address?: string;
}

const LocationsSetup: React.FC<SetupStepComponentProps> = ({ data, onUpdate }) => {
  const [locations, setLocations] = useState<Location[]>(
    data?.locations || [
      { id: "main", name: "Main Facility", address: "" },
      { id: "secondary", name: "Secondary Location", address: "" }
    ]
  );
  
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationAddress, setNewLocationAddress] = useState("");

  const handleAddLocation = () => {
    if (!newLocationName.trim()) return;
    
    const newLocation: Location = {
      id: `location-${Date.now()}`,
      name: newLocationName,
      address: newLocationAddress
    };
    
    const updatedLocations = [...locations, newLocation];
    setLocations(updatedLocations);
    onUpdate({ locations: updatedLocations });
    
    // Reset input fields
    setNewLocationName("");
    setNewLocationAddress("");
  };
  
  const handleUpdateLocation = (id: string, field: keyof Location, value: string) => {
    const updatedLocations = locations.map(location => {
      if (location.id === id) {
        return { ...location, [field]: value };
      }
      return location;
    });
    
    setLocations(updatedLocations);
    onUpdate({ locations: updatedLocations });
  };
  
  const handleDeleteLocation = (id: string) => {
    const updatedLocations = locations.filter(location => location.id !== id);
    setLocations(updatedLocations);
    onUpdate({ locations: updatedLocations });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MapPin className="h-6 w-6 text-maintenease-600" />
        <h2 className="text-xl font-semibold">Facility Locations</h2>
      </div>
      
      <p className="text-muted-foreground">
        Set up the locations where your assets and equipment are located. This will help organize your maintenance tasks.
      </p>
      
      <div className="space-y-4">
        {locations.map((location) => (
          <div 
            key={location.id} 
            className="flex flex-col md:flex-row gap-3 p-4 border rounded-md dark:border-gray-700"
          >
            <div className="flex-grow space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-grow">
                  <label htmlFor={`location-name-${location.id}`} className="text-sm font-medium">
                    Location Name
                  </label>
                  <Input 
                    id={`location-name-${location.id}`}
                    value={location.name}
                    onChange={(e) => handleUpdateLocation(location.id, "name", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex-grow">
                  <label htmlFor={`location-address-${location.id}`} className="text-sm font-medium">
                    Address (Optional)
                  </label>
                  <Input 
                    id={`location-address-${location.id}`}
                    value={location.address || ""}
                    onChange={(e) => handleUpdateLocation(location.id, "address", e.target.value)}
                    className="mt-1"
                    placeholder="Enter address"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleDeleteLocation(location.id)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        <div className="border-t pt-4 mt-6 dark:border-gray-700">
          <h3 className="text-md font-medium mb-3">Add New Location</h3>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-grow">
              <Input 
                placeholder="Location Name"
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
              />
            </div>
            <div className="flex-grow">
              <Input 
                placeholder="Address (Optional)"
                value={newLocationAddress}
                onChange={(e) => setNewLocationAddress(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleAddLocation}
              disabled={!newLocationName.trim()}
              className="self-end"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Location
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationsSetup;
