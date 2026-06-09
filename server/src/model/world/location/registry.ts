import { createRegistry, EventBus, EventType } from "@/core";
import { Location } from "./location";

let currentLocationId: string | null = null;

export const Registry = {
  ...createRegistry<Location>(),

  getAllForRegion(regionId: string) {
    return Array.from(this.getAll()).filter(poi => poi.regionId === regionId);
  },

  get currentLocation(): Location | null {
    const currentLocation = this.get(currentLocationId!);
    
    if (!currentLocation || currentLocationId === null) return null;
    return currentLocation;
  },

  set current(locationId: string | null) {
    if (currentLocationId !== locationId && (locationId === null || this.get(locationId))) {
      currentLocationId = locationId;
      EventBus.fireEvent(EventType.LocationChanged, { locationId: locationId });
    }
  }
}