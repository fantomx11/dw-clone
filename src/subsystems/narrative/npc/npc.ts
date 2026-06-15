import { createRegistry } from "@/core";
import { Override } from "@/types";
import { Node, NodeConfig } from "./dialogue";

interface NPCConfig {
  id: string;
  name: string;
  initialNodeId: string;
  dialogueTree: NodeConfig[];
}

export class NPC {
  #data: Override<NPCConfig, { dialogueTree: Map<string, Node> }>;

  static fromConfig(config: NPCSerialized): void {
    new NPC(config);
  }

  constructor({ dialogueTree, ...config }: NPCConfig) {
    this.#data = {
      ...config,
      dialogueTree: new Map(dialogueTree.map(dialogueNodeConfig => [dialogueNodeConfig.id, new Node(dialogueNodeConfig)]))
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
    return new Map(this.#data.dialogueTree);
  }

  toJSON(): NPCSerialized {
    return {
      ...this.#data,
      dialogueTree: Array.from(this.#data.dialogueTree.values()).map(dialogueNode => dialogueNode.toJSON())
    };
  }
}