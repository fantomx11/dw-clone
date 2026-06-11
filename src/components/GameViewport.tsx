import React from 'react';

export default function GameViewport({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white font-mono select-none">
      <div className="relative w-full max-w-4xl aspect-[4/3] bg-neutral-950 border-4 border-neutral-800 overflow-hidden shadow-2xl">
        {children}
      </div>
    </div>
  );
}