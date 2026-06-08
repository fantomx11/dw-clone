import { RequireOnlyOptional } from "../types";

export interface LocationNodeConfig {
  id: string;
  name: string;
  type: string;
  backgroundImage: string;
  connectedIds?: string[];
  npcs?: string[];
  interactables?: string[];
}

const DefaultLocationConfig: RequireOnlyOptional<LocationNodeConfig> = {
  connectedIds: [],
  npcs: [],
  interactables: []
};

export class LocationNode {
  #data: Required<LocationNodeConfig>;

  constructor(config: LocationNodeConfig) {
    this.#data = { ...DefaultLocationConfig, ...config };
  }

  get id(): string {
    return this.#data.id;
  }

  get name(): string {
    return this.#data.name;
  }

  get type(): string {
    return this.#data.type;
  }

  get backgroundImage(): string {
    return this.#data.backgroundImage;
  }

  get connectedIds(): string[] {
    return [...this.#data.connectedIds];
  }

  get npcs(): string[] {
    return [...this.#data.npcs];
  }

  get interactables(): string[] {
    return [...this.#data.interactables];
  }

  toJSON(): LocationNodeConfig {
    let { connectedIds, npcs, interactables, ...rest } = this.#data;

    return {
      ...rest,
      connectedIds: connectedIds.length > 0 ? connectedIds : undefined,
      npcs: npcs.length > 0 ? npcs : undefined,
      interactables: interactables.length > 0 ? interactables : undefined
    };
  }
}