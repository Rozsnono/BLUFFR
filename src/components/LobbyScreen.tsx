"use client";

import React from "react";

interface Player {
    id: string;
    name: string;
    isHost: boolean;
}

interface LobbyScreenProps {
    roomCode: string;
    players: Player[];
    currentPlayerId: string;
    isHost: boolean;
    onStartGame: () => void;
    onLeaveRoom: () => void;
}

export default function LobbyScreen({
    roomCode,
    players,
    currentPlayerId,
    isHost,
    onStartGame,
    onLeaveRoom,
}: LobbyScreenProps) {
    return (
        <div className="flex flex-col min-h-screen bg-slate-950 text-white p-6 justify-between select-none">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onLeaveRoom}
                    className="p-3 bg-slate-900 border border-slate-800 rounded-full hover:bg-slate-800 transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
                <div className="text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Szobakód</p>
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 tracking-wider">
                        {roomCode}
                    </h2>
                </div>
                <div className="w-11 h-11" /> {/* Spacer */}
            </div>

            {/* Main Box containing players */}
            <div className="my-6 flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
                        <h3 className="text-lg font-bold tracking-tight text-slate-200">Csatlakozott Játékosok</h3>
                        <span className="text-xs font-bold px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                            {players.length} / 99
                        </span>
                    </div>

                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                        {players.map((player) => (
                            <div
                                key={player.id}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${player.id === currentPlayerId
                                        ? "bg-indigo-500/10 border-indigo-500/50"
                                        : "bg-slate-950/40 border-slate-800/60"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${player.id === currentPlayerId ? "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]" : "bg-slate-600"}`} />
                                    <span className={`font-semibold tracking-wide ${player.id === currentPlayerId ? "text-indigo-200" : "text-slate-300"}`}>
                                        {player.name}
                                    </span>
                                    {player.id === currentPlayerId && (
                                        <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-400/10 px-1.5 py-0.5 rounded">Te</span>
                                    )}
                                </div>
                                {player.isHost && (
                                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider scale-90">
                                        Host
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer controls */}
            <div className="max-w-md mx-auto w-full space-y-3">
                {isHost ? (
                    <button
                        onClick={onStartGame}
                        disabled={players.length < 3}
                        className="w-full py-4 px-6 font-bold rounded-2xl text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:opacity-95 disabled:opacity-30 disabled:pointer-events-none transition-all duration-300 shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                    >
                        {players.length < 3 ? "Legalább 3 játékos szükséges" : "Játék Indítása"}
                    </button>
                ) : (
                    <div className="w-full text-center py-4 px-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-slate-400 text-sm animate-pulse font-medium">
                        Várakozás a host indítására...
                    </div>
                )}
            </div>
        </div>
    );
}