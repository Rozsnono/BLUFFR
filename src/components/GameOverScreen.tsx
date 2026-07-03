"use client";

import React from "react";
import { Trophy, Clock, ArrowLeft, Users, Glasses, FileText, Check } from "lucide-react";

interface EndPlayer {
  id: string;
  name: string;
  role: "CIVIL" | "IMPOSTOR" | "ELIMINATED";
  submittedWord: string;
}

interface GameOverScreenProps {
  winner: "CIVILIANS" | "IMPOSTORS";
  secretWord: string;
  playtime: string;
  efficiency: string;
  players: EndPlayer[];
  isHost: boolean;
  rounds: any;
  onRestart: () => void;
  onExit: () => void;
}

export default function GameOverScreen({
  winner,
  secretWord,
  playtime,
  efficiency,
  players,
  isHost,
  rounds,
  onRestart,
  onExit,
}: GameOverScreenProps) {
  const isCivWin = winner === "CIVILIANS";

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white p-6 justify-between select-none font-sans">

      {/* Title */}
      <div className="text-center mt-6 space-y-2">
        <div className="flex justify-center">
          <div className={`p-3 rounded-full border ${isCivWin ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"}`}>
            <Trophy size={28} />
          </div>
        </div>
        <div>
          <span className="text-xs font-black uppercase text-slate-400 tracking-widest block">Összegzés</span>
          <h1 className={`text-3xl font-black mt-1 leading-tight ${isCivWin ? "text-cyan-400" : "text-rose-500"}`}>
            {isCivWin ? "A Civilek Nyertek!" : "Az Imposztor Nyert!"}
          </h1>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            A titkos szó a(z) <span className="text-white font-extrabold">{secretWord}</span> volt.
          </p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="max-w-md w-full mx-auto my-6 space-y-4 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-2 gap-3">

          {/* Playtime */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 text-center flex flex-col items-center justify-center space-y-1">
            <Clock size={16} className="text-cyan-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
              Játékidő
            </span>
            <span className="text-xl font-black text-slate-200">{playtime}</span>
          </div>

          {/* Efficiency */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 text-center flex flex-col items-center justify-center space-y-1">
            <Trophy size={16} className="text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
              Eredményesség
            </span>
            <span className="text-xl font-black text-slate-200">{efficiency}</span>
          </div>
        </div>

        {/* Player Word Clue Breakdown */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 flex-1 flex flex-col min-h-60">
          <div className="flex items-center gap-2 mb-3 border-b border-slate-800/60 pb-2 text-slate-400">
            <FileText size={14} />
            <h3 className="text-xs font-black uppercase tracking-widest">
              Ki milyen szót használt?
            </h3>
          </div>

          <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 max-h-56">
            {players.map((p) => (
              <div key={p.id} className="flex justify-between items-center bg-slate-950/60 p-3 rounded-2xl border border-slate-800/40">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-lg ${p.role === "IMPOSTOR" ? "bg-rose-500/10 text-rose-400" : "bg-cyan-500/10 text-cyan-400"}`}>
                    {p.role === "IMPOSTOR" ? <Glasses size={14} /> : <Users size={14} />}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-sm text-slate-200 block truncate">{p.name}</span>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">
                      {p.role === "IMPOSTOR" ? "Imposztor" : "Civil"}
                    </span>
                  </div>
                </div>
                <div className="text-right pl-3">
                  <span className="text-xs font-black text-slate-200 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800/60 inline-block max-w-28 truncate">
                    {p.submittedWord ? `${p.submittedWord}` : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Button Controls */}
      <div className="max-w-md w-full mx-auto space-y-3 pb-4">
        {isHost ? (
          <button
            onClick={onRestart}
            className="w-full py-4 bg-gradient-to-r from-cyan-400 to-indigo-500 hover:opacity-95 text-slate-950 font-black rounded-2xl shadow-lg flex items-center justify-center gap-2 transition duration-200"
          >
            <Check size={18} />
            Új Játék
          </button>
        ) : (
          <button
            onClick={onExit}
            className="w-full py-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition duration-200"
          >
            <ArrowLeft size={18} />
            Kilépés a főmenübe
          </button>
        )}
      </div>
    </div>
  );
}