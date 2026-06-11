import { RequireOnlyOptional } from "@/types";
import { Registry as LocationRegistry } from "../location";
import { Registry } from "./registry";
import { ExplorationResult, ExplorationResultType } from "../exploration";

export interface RegionConfig {
  id: string;
  name: string;
  monsterIds: string[];
  isDiscovered?: boolean;
  explorationRates: {
    locationRevealChance: number;
    encounterChance: number;
    noEventChance: number;
  };
}

const DefaultLocationConfig: RequireOnlyOptional<RegionConfig> = {
  isDiscovered: false
};

export class Region {
  #data: RegionConfig;

  static fromConfig(config: RegionConfigSerialized): void {
    new Region(config);
  }

  constructor(config: RegionConfig) {
    this.#data = {...DefaultLocationConfig, ...config};
    Registry.register(this);
  }

  get id() { return this.#data.id; }
  get name() { return this.#data.name; }
  get explorationRates() { return {...this.#data.explorationRates}; }
  get locations() { return LocationRegistry.getAllForRegion(this.id); }
  get isDiscovered() { return this.#data.isDiscovered; }

  explore(): ExplorationResult {
    const undiscoveredLocations = this.locations.filter(location => !location.isDiscovered);

    const useLocations = undiscoveredLocations.length > 0;

    const {encounterChance, locationRevealChance, noEventChance} = this.explorationRates;

    const totalChance = encounterChance + 
      noEventChance + 
      (useLocations ? locationRevealChance : 0);

    const random = Math.random() * totalChance;

    if(random < encounterChance) {
      return {
        type: ExplorationResultType.Encounter,
        monsterId: this.#data.monsterIds[Math.floor(Math.random() * this.#data.monsterIds.length)]
      };
    } else if(useLocations && random < encounterChance + locationRevealChance) {
      return {
        type: ExplorationResultType.LocationRevealed,
        locationId: undiscoveredLocations[Math.floor(Math.random() * undiscoveredLocations.length)].id
      }
    } else {
      return {
        type: ExplorationResultType.NoEvent
      };
    }
  }

  toJSON() {
    return {...this.#data, explorationRates: {...this.#data.explorationRates}};
  }
}

export type RegionConfigSerialized = RegionConfig;
