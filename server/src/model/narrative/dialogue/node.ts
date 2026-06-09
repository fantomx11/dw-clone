import { Choice } from "./choice";
import { Effect } from "./effect";

export interface NodeConfig {
  id: string;
  text: string;
  choices: Choice[];
  onEnterEffects?: Effect[];
}

export class Node {
  #data: NodeConfig;

  constructor({ choices, onEnterEffects, ...config }: NodeConfig) {
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

  toJSON(): NodeConfig {
    return {
      ...this.#data,
      choices: this.#data.choices.map(choice => ({
        ...choice,
        nextNodeId: choice.nextNodeId === null ? null : choice.nextNodeId
      })),
      onEnterEffects: this.#data.onEnterEffects?.map(onEnterEffect => ({ ...onEnterEffect }))
    };
  }
}
