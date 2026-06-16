// src/hooks/useGameScene.ts
import { useEffect, useState, useMemo } from 'react';
import { GameState } from '@/subsystems/state/gameState';
import { DialogueEngine } from '@/subsystems/narrative/dialogueEngine';
import { Registry as LocationRegistry } from '@/subsystems/world/location/registry';
import { Registry as NpcRegistry } from '@/subsystems/narrative/npc/registry';
import { EventBus, EventType } from '@/core/eventBus';
import alefgardData from 'data/alefgard.dw';

// Instantiate your orchestrating engines outside the React render loops
const gameStateInstance = new GameState(alefgardData as any);
const dialogueEngineInstance = new DialogueEngine(gameStateInstance);

export function useGameScene() {
  const [currentLocation, setCurrentLocation] = useState(LocationRegistry.currentLocation);
  const [conversation, setConversation] = useState({
    isInConversation: dialogueEngineInstance.isInConversation,
    speakerName: dialogueEngineInstance.activeNpc?.name ?? null,
    dialogueText: dialogueEngineInstance.currentNode?.text ?? null,
    choices: dialogueEngineInstance.currentNode?.choices ?? []
  });

  useEffect(() => {
    // Sync location mutations
    const unsubLocation = EventBus.subscribe(EventType.LocationChanged, () => {
      setCurrentLocation(LocationRegistry.currentLocation);
    });

    // Sync narrative engine transitions
    const unsubDialogue = EventBus.subscribe(EventType.DialogueUpdated, () => {
      setConversation({
        isInConversation: dialogueEngineInstance.isInConversation,
        speakerName: dialogueEngineInstance.activeNpc?.name ?? null,
        dialogueText: dialogueEngineInstance.currentNode?.text ?? null,
        choices: dialogueEngineInstance.currentNode?.choices ?? []
      });
    });

    return () => {
      unsubLocation();
      unsubDialogue();
    };
  }, []);

  return {
    currentLocation,
    conversation,
    // Provide safe access methods to your core gameplay systems
    interactWithNpc: (npcId: string) => {
      const npc = NpcRegistry.get(npcId);
      if (npc) dialogueEngineInstance.startConversation(npc);
    },
    selectChoice: (index: number) => dialogueEngineInstance.selectChoice(index)
  };
}