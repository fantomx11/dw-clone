// src/app/page.tsx
'use client';

import GameViewport from '@/components/GameViewport';
import SceneDisplay from '@/components/SceneDisplay';
import { useGameScene } from '@/hooks/useGameScene';

export default function Home() {
  const { currentLocation, conversation, interactWithNpc, selectChoice } = useGameScene();

  // For diagnostic testing, simulate talking to King Lorik on load
  const triggerKingDialogueDebug = () => {
    interactWithNpc('king_lorik');
  };

  return (
    <GameViewport>
      {/* Background and Active Character Rendering */}
      <SceneDisplay 
        backgroundImage={currentLocation?.backgroundImage ?? 'assets/bg/fallback.png'} 
        activeNpcImage={conversation.isInConversation ? `assets/npc/king_lorik.png` : undefined}
      />

      {/* Retro Dialogue UI Window Overlay Overlay */}
      <div className="absolute bottom-0 inset-x-0 p-6 z-10">
        <div className="bg-neutral-950 border-4 border-white p-4 font-mono text-white text-lg rounded-sm shadow-2xl min-h-[160px] flex flex-col justify-between">
          
          {!conversation.isInConversation ? (
            <div className="flex flex-col gap-2 items-center justify-center h-full my-auto">
              <p className="text-neutral-400">Standing inside: {currentLocation?.name ?? "Unknown Zone"}</p>
              <button 
                onClick={triggerKingDialogueDebug}
                className="px-4 py-2 bg-white text-black font-bold hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                Talk to King Lorik
              </button>
            </div>
          ) : (
            <>
              {/* Speaker Header & Dialogue Body text */}
              <div>
                <span className="block text-yellow-400 font-bold tracking-wide mb-1">
                  [{conversation.speakerName}]
                </span>
                <p className="leading-relaxed">{conversation.dialogueText}</p>
              </div>

              {/* Dynamic Choice Buttons Panel */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                {conversation.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => selectChoice(index)}
                    className="w-full text-left p-2 border-2 border-neutral-700 bg-neutral-900 hover:border-white hover:bg-neutral-800 transition-all text-sm flex items-center gap-2 group cursor-pointer"
                  >
                    <span className="text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity">▶</span>
                    {choice.text}
                  </button>
                ))}
              </div>
            </>
          )}
          
        </div>
      </div>
    </GameViewport>
  );
}