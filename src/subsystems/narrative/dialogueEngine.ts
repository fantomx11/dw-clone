import { NPC } from "./npc";
import { Node } from "./dialogue";
import { evaluateCondition } from "./condition";
import { GameState } from "../state/gameState";
import { EventBus, EventType } from "@/core/eventBus";

export class DialogueEngine {
  #gameState: GameState;
  #activeNpc: NPC | null = null;
  #currentNode: Node | null = null;

  constructor(gameState: GameState) {
    this.#gameState = gameState;
  }

  get activeNpc() { return this.#activeNpc; }
  get currentNode() { return this.#currentNode; }
  get isInConversation() { return this.#activeNpc !== null && this.#currentNode !== null; }

  /**
   * Evaluates conditional route rules to find an NPC's active dialogue node and starts a conversation.
   */
  startConversation(npc: NPC): void {
    this.#activeNpc = npc;
    
    // Evaluate choices from your compiled initialNodeId rule arrays in alefgard.json
    let targetNodeId: string | null = null;
    for (const rule of npc.initialNodeIdRules) {
      if (!rule.condition || evaluateCondition(rule.condition, this.#gameState)) {
        targetNodeId = rule.nodeId;
        break;
      }
    }

    if (targetNodeId) {
      this.goToNode(targetNodeId);
    } else {
      this.endConversation();
    }
  }

  /**
   * Advances the conversation thread to a target node.
   */
  goToNode(nodeId: string): void {
    if (!this.#activeNpc) return;
    
    const node = this.#activeNpc.dialogueTree.get(nodeId);
    if (!node) {
      console.error(`Dialogue node "${nodeId}" not found on NPC "${this.#activeNpc.id}"`);
      this.endConversation();
      return;
    }

    this.#currentNode = node;

    // Process immediately triggered entry events
    if (node.onEnterEffects) {
      node.onEnterEffects.forEach(effect => this.executeEffect(effect));
    }

    // Notify UI state observers to re-render dialogue text windows
    EventBus.fireEvent(EventType.DialogueUpdated, { 
      npcId: this.#activeNpc.id, 
      nodeId: node.id 
    });
  }

  /**
   * Processes player choices, executes mutations on state, and advances branches.
   */
  selectChoice(choiceIndex: number): void {
    if (!this.#currentNode) return;
    const choice = this.#currentNode.choices[choiceIndex];
    if (!choice) return;

    // Process choice side effects (e.g., ADD_ITEM, SET_FLAG)
    if (choice.effects) {
      choice.effects.forEach(effect => this.executeEffect(effect));
    }

    if (choice.nextNodeId) {
      this.goToNode(choice.nextNodeId);
    } else {
      this.endConversation();
    }
  }

  endConversation(): void {
    this.#activeNpc = null;
    this.#currentNode = null;
    EventBus.fireEvent(EventType.DialogueUpdated, { npcId: null, nodeId: null });
  }

  /**
   * Executes script side-effects on state systems, keeping logic separate from the UI.
   */
  private executeEffect(effect: any): void {
    switch (effect.type) {
      case "SET_FLAG":
        this.#gameState.setFlag(effect.flagKey, effect.value);
        break;
      case "ADD_ITEM":
        this.#gameState.addItem(effect.itemId, effect.count ?? 1);
        break;
      default:
        console.warn(`Unhandled narrative script instruction effect type: ${effect.type}`);
    }
  }
}