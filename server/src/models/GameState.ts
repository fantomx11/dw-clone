import { RequireOnlyOptional } from "../types";
import { getLocation, getLocations, Location, LocationConfigSerialized } from "./Location";
import { getRegion, getRegions, Region, RegionConfigSerialized } from "./Region";

export interface GameStateConfig {
  currentRegionId: string;

  currentLocationId?: string | null;
  currentSubNodeId?: string | null;

  inventory?: string[];
  flags?: Record<string, boolean>;
}

type GameStateConfigSerialized = GameStateConfig & {
  regions: RegionConfigSerialized[];
  locations: LocationConfigSerialized[];
};

const DefaultGameStateConfig: RequireOnlyOptional<GameStateConfig> = {
  currentLocationId: null,
  currentSubNodeId: null,
  inventory: [],
  flags: {},
}

export class GameState {
  #data: GameStateConfig;

  constructor({regions, locations, ...config }: GameStateConfigSerialized) {
    this.#data = {
      ...DefaultGameStateConfig,
      ...config
    };

    regions.forEach(region => Region.fromConfig(region));
    locations.forEach(location => Location.fromConfig(location));
  }

  get currentLocationId(): string | null {
    return this.#data.currentLocationId ?? null;
  }

  get inventory(): string[] {
    return [...this.#data.inventory ?? []];
  }

  get flags(): Record<string, boolean> {
    return { ...this.#data.flags };
  }

  get discoveredLocatons() {
    return new Set(getLocations().filter(location => location.isDiscovered));
  }

  get currentRegion() {
    return getRegion(this.#data.currentRegionId);
  }

  moveTo(locationId: string): void {
    this.#data.currentLocationId = locationId;
  }

  discover(locationId: string) {
    getLocation(locationId)?.discover();
  }

  isDiscovered(locationId: string) {
    return getLocation(locationId)?.isDiscovered || false
  }

  toJSON(): GameStateConfigSerialized {
    const { inventory, ...rest } = this.#data;

    return {
      ...rest,
      inventory: inventory && inventory.length > 0 ? inventory : undefined,
      regions: Array.from(getRegions()).map(region => region.toJSON()),
      locations: Array.from(getLocations()).map(location => location.toJSON())
    };
  }
}