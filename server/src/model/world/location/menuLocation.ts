import { LocationConfig, Type, Location } from "./location";


export interface MenuLocationConfig extends LocationConfig {
  type: Type.Menu;
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