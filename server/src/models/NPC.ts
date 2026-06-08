import { Override, RequireOnlyOptional } from "../types";

export enum EffectType {
  AddItem = "ADD_ITEM",
  RemoveItem = "REMOVE_ITEM",
  DiscoverLocation = "DISCOVER_LOCATION",
  Teleport = "TELEPORT",
  SetFlag = "SET_FLAG",
  TriggerEncounter = "TRIGGER_ENCOUNTER"
}

interface EffectPayloads {
  [EffectType.AddItem]: { itemId: string; count?: number };
  [EffectType.RemoveItem]: { itemId: string; count?: number };
  [EffectType.DiscoverLocation]: { locationId: string; };
  [EffectType.Teleport]: { locationId: string; subNodeId?: string; };
  [EffectType.SetFlag]: { flagKey: string; value: boolean | string | number; };
  [EffectType.TriggerEncounter]: { monsterId: string; };
}

type Effect = {
  [K in EffectType]: { type: K } & EffectPayloads[K]
}[EffectType];

export interface DialogueChoice {
  text: string;
  nextNodeId: string | null; // null signifies that this choice ends the conversation
  effects?: Effect[]
}

export interface DialogueNodeConfig {
  id: string;
  text: string;
  choices: DialogueChoice[];
  onEnterEffects?: Effect[];
}

class DialogueNode {
  #data: DialogueNodeConfig
}

interface NPCConfig {
  id: string;
  name: string;
  initialNodeId: string;
  dialogueTree: DialogueNodeConfig[];
}

export class NPC {
  #data: Override<NPCConfig, {dialogueTree: Map<string, DialogueNode>}>;

  constructor({dialogueTree, ...config}: NPCConfig) {
    this.#data = { 
      ...config, 
      dialogueTree: new Map(dialogueTree.map(dialogueNodeConfig => [dialogueNodeConfig.id, new DialogueNode(dialogueNodeConfig)]))
    };
  }

  get id(): string {
    return this.#data.id;
  }

  get name(): string {
    return this.#data.name;
  }

  get initialNodeId(): string {
    return this.#data.initialNodeId;
  }

  get dialogueTree() {
    return {...this.#data.dialogueTree};
  }
}



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