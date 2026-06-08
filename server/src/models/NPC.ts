import { RequireOnlyOptional } from "../types";

export interface DialogueChoice {
  text: string;
  nextNodeId: string | null; // null signifies that this choice ends the conversation
  effects?: Record<string, any>; // e.g., { give_item: "iron_key", reputation: +1 }
}

export interface DialogueNode {
  id: string;
  text: string;
  choices: DialogueChoice[];
  onEnterEffects?: Record<string, any>;
}

interface NPCConfig {
  id: string;
  name: string;
  initialNodeId: string;
  dialogueTree: Record<string, DialogueNode>; // Maps node IDs to their content
}

const DefaultNPCConfig: RequireOnlyOptional<NPCConfig> = {
  initialNodeId: "start",
  dialogueTree: {}
};


export class NPC {
  #data: Required<NPCConfig>;

  constructor(config: NPCConfig) {
    // Deep clone the incoming dialogue tree to protect the core configuration from leaks
    const clonedTree = JSON.parse(JSON.stringify(config.dialogueTree || {}));
    
    this.#data = { 
      ...DefaultNPCConfig, 
      ...config, 
      dialogueTree: clonedTree 
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

  /**
   * Safely fetches a specific dialogue node out of the tree.
   * Returns a defensive copy so external layers cannot modify the tree at runtime.
   */
  getDialogueNode(nodeId: string): DialogueNode | undefined {
    const node = this.#data.dialogueTree[nodeId];
    if (!node) return undefined;

    return {
      id: node.id,
      text: node.text,
      choices: node.choices.map(choice => ({ ...choice, effects: choice.effects ? { ...choice.effects } : undefined }))
    };
  }
}