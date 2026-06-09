import { EventBus, EventType } from "../core/EventBus";
import { createRegistry } from "../core/Registry";
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
  #data: DialogueNodeConfig;

  constructor({ choices, onEnterEffects, ...config }: DialogueNodeConfig) {
    this.#data = {
      ...config,
      choices: choices.map(({ effects, nextNodeId, ...choice }) => ({
        ...choice,
        nextNodeId: nextNodeId || null,
        effects: effects?.map(effect => ({ ...effect }))
      })),
      onEnterEffects: onEnterEffects?.map(onEnterEffect => ({ ...onEnterEffect }))
    };
  }

  get id(): string {
    return this.#data.id;
  }

  get text(): string {
    return this.#data.text;
  }
}

interface NPCConfig {
  id: string;
  name: string;
  initialNodeId: string;
  dialogueTree: DialogueNodeConfig[];
}

export class NPC {
  #data: Override<NPCConfig, { dialogueTree: Map<string, DialogueNode> }>;

  constructor({ dialogueTree, ...config }: NPCConfig) {
    this.#data = {
      ...config,
      dialogueTree: new Map(dialogueTree.map(dialogueNodeConfig => [dialogueNodeConfig.id, new DialogueNode(dialogueNodeConfig)]))
    };
    registerNPC(this);
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
    return { ...this.#data.dialogueTree };
  }
}

const {
  clear: clearNPCs,
  get: getNPC,
  getAll: getNPCs,
  register: registerNPC
} = createRegistry<NPC>();

export {
  clearNPCs,
  getNPC,
  getNPCs
}