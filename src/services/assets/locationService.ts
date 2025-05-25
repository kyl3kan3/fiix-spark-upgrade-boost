
import { getAllLocations as getLocationsFromService, createLocation as createLocationService } from "../locationService";

// Function to get all unique locations (updated to use new locations table)
export async function getAllLocations() {
  return getLocationsFromService();
}

// Function to create a new location (updated to use new location service)
export async function createLocation(locationName: string) {
  return createLocationService({ name: locationName });
}
