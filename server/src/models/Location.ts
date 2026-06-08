import { EventBus, EventType } from "../core/EventBus";
import { Override } from "../types";
import { LocationNode, LocationNodeConfig } from "./LocationNode";

export enum LocationType {
  Menu = "menu",
  Node = "node"
}

export interface LocationConfig {
  regionId: string;
  id: string;
  name: string;
  type: LocationType;
  isDiscovered: boolean;
  backgroundImage: string;
}

export abstract class Location {
  #data: LocationConfig;

  static fromConfig(config: LocationConfigSerialized): void {
    switch (config.type) {
      case LocationType.Menu: new MenuLocation(config); break;
      case LocationType.Node: new NodeLocation(config); break;
      default:
        throw new Error(`Unknown location type.`);
    }
  }

  constructor(config: LocationConfig) {
    this.#data = config;
    locations.set(config.id, this);
  }

  get isDiscovered() { return this.#data.isDiscovered; }
  get regionId() { return this.#data.regionId; }
  get id() { return this.#data.id; }
  get name() { return this.#data.name; }
  get type() { return this.#data.type; }
  get backgroundImage() { return this.#data.backgroundImage; }

  discover() {
    this.#data.isDiscovered = true;
  }

  abstract toJSON(): LocationConfigSerialized;
}

export interface MenuLocationConfig extends LocationConfig {
  type: LocationType.Menu;
  npcs?: string[];
  interactables?: string[];
}

export class MenuLocation extends Location {
  #data: MenuLocationConfig;

  constructor(config: MenuLocationConfig) {
    super(config);
    this.#data = config;
  }

  get npcs() { return [...this.#data.npcs || []]; }
  get interactables() { return [...this.#data.interactables || []]; }

  toJSON(): MenuLocationConfig {
    return {
      ...this.#data
    };
  }
}

export interface NodeLocationConfig extends LocationConfig {
  type: LocationType.Node;
  startingSubNodeId: string;
  subNodes: Record<string, LocationNodeConfig>;
}

export class NodeLocation extends Location {
  #data: Override<NodeLocationConfig, { subNodes: Map<string, LocationNode> }>;

  constructor({ subNodes, ...config }: NodeLocationConfig) {
    super(config);

    this.#data = {
      ...config,
      subNodes: new Map(Object.entries(subNodes).map(([id, config]) => [id, new LocationNode(config)]))
    }
  }

  get startingSubNodeId() { return this.#data.startingSubNodeId; }
  get subNodes() { return new Map(this.#data.subNodes); }

  toJSON(): NodeLocationConfig {
    return {
      ...this.#data,
      subNodes: Object.fromEntries(Array.from(this.#data.subNodes.entries()).map(([id, node]) => [id, node.toJSON()]))
    };
  }
}

export type LocationConfigSerialized = MenuLocationConfig | NodeLocationConfig;

const locations: Map<string, Location> = new Map();

export function getLocation(id: string) {
  return locations.get(id);
}

export function getLocationsForRegion(regionId: string) {
  return Array.from(locations.values()).filter(poi => poi.regionId === regionId);
}

export function getLocations(): Location[] {
  return Array.from(locations.values());
}

let currentLocationId: string | null = null;

export function getCurrentLocation() {
  if (!currentLocationId) return null;
  return getLocation(currentLocationId!);
}

export function setCurrentLocation(locationId: string | null) {
  if(currentLocationId !== locationId && (locationId === null || getLocation(locationId))) {
    currentLocationId = locationId;
    EventBus.fireEvent(EventType.LocationChanged, {locationId: locationId});
  }
}