import { GameState, GameStateConfig } from "./GameState";
import { WorldMap, WorldMapConfig } from "./WorldMap";

export interface GameEngineConfig {
  worldMap: WorldMapConfig;
  gameState: GameStateConfig;
}


export class GameEngine {
  #map: WorldMap;
  #state: GameState;

  constructor(config: GameEngineConfig) {
    this.#map = new WorldMap(config.worldMap);
    this.#state = new GameState(config.gameState);
  }

  // ACTION: Move to a different Node
  moveTo(targetId: string) {
    if (!this.#state.isDiscovered(targetId)) {
      throw new Error("You don't know how to get there yet.");
    }
    if (!this.#map.isValidMove(this.state.currentLocationId, targetId)) {
      throw new Error("Those locations are not directly connected.");
    }

    this.#state.moveTo(targetId);
    return this.getCurrentSceneData();
  }

  // ACTION: Actively search the current Hub/POI
  exploreCurrentRegion() {
    const currentRegion = getRegion(this.#state.currentLocationId);
    const newlyDiscovered = [];

    const current

    // Check all connected spokes
    for (const connectedId of currentNode.connectedIds) {
      if (!this.#state.isDiscovered(connectedId)) {
        // Here you could check a stat, or just unlock it automatically
        this.state.discover(connectedId);
        newlyDiscovered.push(this.map.getNode(connectedId));
      }
    }

    return {
      message: newlyDiscovered.length > 0
        ? `Through careful exploration, you discovered: ${newlyDiscovered.map(n => n.name).join(", ")}`
        : "You look around but find nothing new.",
      discovered: newlyDiscovered
    };
  }

  // Package everything the Frontend needs to render the screen
  getCurrentSceneData() {
    const node = this.map.getNode(this.state.currentLocationId);

    // Filter connections so the player only sees buttons for places they actually KNOW exist
    const visibleConnections = node.connectedIds
      .filter(id => this.state.isDiscovered(id))
      .map(id => ({ id, name: this.map.getNode(id).name }));

    return {
      location: node,
      availableTravelDestinations: visibleConnections,
      playerState: this.state.getSnapshot()
    };
  }
}