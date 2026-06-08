import { LocationNode, LocationNodeConfig } from "./LocationNode";

export type WorldMapConfig = LocationNodeConfig[];

export class WorldMap {
  #data: Map<string, LocationNode>;

  constructor(config: WorldMapConfig) {
    this.#data = new Map();

    this.#loadMap(config);
  }

  #loadMap(data: WorldMapConfig) {
    for (const nodeData of data) {
      this.#data.set(nodeData.id, new LocationNode(nodeData));
    }
  }

  getNode(id: string) {
    return this.#data.get(id);
  }

  // Verifies if a move is actually valid on the graph
  isValidMove(fromId: string, toId: string) {
    const fromNode = this.getNode(fromId);
    return fromNode ? fromNode.connectedIds.includes(toId) : false;
  }

  toJSON(): WorldMapConfig {
    return Array.from(this.#data.values()).map(node => node.toJSON());
  }
      
}