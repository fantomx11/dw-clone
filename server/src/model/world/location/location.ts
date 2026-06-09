import { MenuLocationConfig } from "./menuLocation";
import { NodeLocationConfig } from "./nodeLocation";

export enum Type {
  Menu = "menu",
  Node = "node"
}

export interface LocationConfig {
  regionId: string;
  id: string;
  name: string;
  type: Type;
  isDiscovered: boolean;
  backgroundImage: string;
}

export abstract class Location {
  #data: LocationConfig;

  static fromConfig(config: LocationConfigSerialized): void {
    switch (config.type) {
      case Type.Menu: new MenuLocation(config); break;
      case Type.Node: new NodeLocation(config); break;
      default:
        throw new Error(`Unknown location type.`);
    }
  }

  constructor(config: LocationConfig) {
    this.#data = config;
    registerLocation(this);
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

export type LocationConfigSerialized = MenuLocationConfig | NodeLocationConfig;