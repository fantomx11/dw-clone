import { Override, RequireOnlyOptional } from "../types";
import { getLocation, getLocations } from "./Location";
import { getRegion } from "./Region";

export interface GameStateConfig {
  currentRegionId: string;

  currentLocationId?: string | null;
  currentSubNodeId?: string | null;

  inventory?: string[];
  flags?: Record<string, boolean>;
}

const DefaultGameStateConfig: RequireOnlyOptional<GameStateConfig> = {
  currentLocationId: null,
  currentSubNodeId: null,
  inventory: [],
  flags: {},
}

export class GameState {
  #data: GameStateConfig;

  constructor({ ...config }: GameStateConfig) {
    this.#data = {
      ...DefaultGameStateConfig,
      ...config
    };
  }

  get currentLocationId(): string {
    return this.#data.currentLocationId;
  }

  get inventory(): string[] {
    return [...this.#data.inventory];
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

  toJSON() {
    const { discoveredNodes, inventory, ...rest } = this.#data;

    return {
      ...rest,
      inventory: inventory.length > 0 ? inventory : undefined,
      discoveredNodes: Array.from(discoveredNodes)
    };
  }
}