import { RequireOnlyOptional } from "../types";
import { clearLocations, getLocation, getLocations, Location, LocationConfigSerialized } from "./Location";
import { clearRegions, getRegion, getRegions, Region, RegionConfigSerialized } from "./Region";
import { clearNPCs, getNPC, getNPCs, NPC, NPCSerialized } from "./NPC";

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
  npcs: NPCSerialized[];
};

const DefaultGameStateConfig: RequireOnlyOptional<GameStateConfig> = {
  currentLocationId: null,
  currentSubNodeId: null,
  inventory: [],
  flags: {},
}

export class GameState {
  #data: GameStateConfig;

  constructor({ regions, locations, npcs, ...config }: GameStateConfigSerialized) {
    clearRegions();
    clearLocations();
    clearNPCs();

    this.#data = {
      ...DefaultGameStateConfig,
      ...config
    };

    regions.forEach(region => Region.fromConfig(region));
    locations.forEach(location => Location.fromConfig(location));
    npcs.forEach(npc => NPC.fromConfig(npc));
  }

  get currentRegionId(): string {
    return this.#data.currentRegionId;
  }

  get currentLocationId(): string | null {
    return this.#data.currentLocationId ?? null;
  }

  get currentSubNodeId(): string | null {
    return this.#data.currentSubNodeId ?? null;
  }

  get inventory(): string[] {
    return [...this.#data.inventory ?? []];
  }

  get flags(): Record<string, boolean> {
    return { ...this.#data.flags };
  }

  get discoveredLocations() {
    return new Set(getLocations().filter(location => location.isDiscovered));
  }

  get currentRegion() {
    return getRegion(this.#data.currentRegionId);
  }

  moveTo(locationId: string | null, subNodeId: string | null = null): void {
    this.#data.currentLocationId = locationId;
    this.#data.currentSubNodeId = subNodeId;
  }

  discover(locationId: string) {
    getLocation(locationId)?.discover();
  }

  isDiscovered(locationId: string) {
    return getLocation(locationId)?.isDiscovered || false;
  }

  toJSON(): GameStateConfigSerialized {
    const { inventory, ...rest } = this.#data;

    return {
      ...rest,
      inventory: inventory && inventory.length > 0 ? inventory : undefined,
      regions: Array.from(getRegions()).map(region => region.toJSON()),
      locations: Array.from(getLocations()).map(location => location.toJSON()),
      npcs: Array.from(getNPCs()).map(npc => npc.toJSON())
    };
  }
}