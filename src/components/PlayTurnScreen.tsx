"use client";

import React, { useState } from "react";

interface Player {
  id: string;
  name: string;
  submittedWord: string;
}

interface PlayTurnScreenProps {
  players: Player[];
  activePlayerId: string;
  currentPlayerId: string;
  category: string;
  secretWord: string | null; // Null if player is the Impostor
  onSubmitWord: (word: string) => void;
}

export default function PlayTurnScreen({
  players,
  activePlayerId,
  currentPlayerId,
  category,
  secretWord,
  onSubmitWord,
}: PlayTurnScreenProps) {
  const [wordInput, setWordInput] = useState("");
  const activePlayer = players.find((p) => p.id === activePlayerId);
  const isMyTurn = activePlayerId === currentPlayerId;

  const handleSubmit = () => {
    if (!wordInput.trim()) return;
    onSubmitWord(wordInput.trim());
    setWordInput("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white p-6 justify-between font-sans">

      {/* Main Container */}
      <div className="my-6 max-w-md w-full mx-auto flex-1 flex flex-col justify-center">
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="text-center">
            {isMyTurn ? (
              <div className="animate-pulse space-y-1">
                <span className="text-xs font-black uppercase text-emerald-400 tracking-widest block">Te következel!</span>
                <h2 className="text-xl font-bold">Adj meg egy asszociációs szót</h2>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 tracking-wider block">Gondolkodik</span>
                <h2 className="text-xl font-black text-indigo-300">{activePlayer?.name || "Játékos"}...</h2>
              </div>
            )}
          </div>

          {/* Submissions Word Board */}
          <div className="border-t border-slate-800/80 pt-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Tippek ebben a körben:</h3>
            <div className="grid grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
              {players.map((p) => (
                <div key={p.id} className="bg-slate-950/40 border border-slate-800/60 p-3 rounded-2xl flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold truncate">{p.name}</span>
                  <span className="text-sm font-black tracking-wide text-slate-200 mt-1">
                    {p.submittedWord ? p.submittedWord : "Vár..."}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Input Action Panel */}
      <div className="max-w-md w-full mx-auto pb-4">
        {isMyTurn ? (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Írd be a szavad ide..."
              value={wordInput}
              onChange={(e) => setWordInput(e.target.value)}
              maxLength={20}
              className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-white font-bold py-4 px-5 rounded-2xl text-center focus:outline-none transition-all duration-200"
            />
            <button
              onClick={handleSubmit}
              className="w-full py-4 bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black rounded-2xl shadow-lg shadow-emerald-500/10 transition duration-200"
            >
              Szó Beküldése
            </button>
          </div>
        ) : (
          <div className="w-full text-center py-4 bg-slate-900/20 border border-slate-800/60 rounded-2xl text-slate-500 text-xs font-semibold">
            Várj, amíg a sorodra kerülsz...
          </div>
        )}
      </div>
    </div>
  );
}