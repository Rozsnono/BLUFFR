"use client";

import React from "react";
import { Users, Glasses, CheckCircle2, Clock, HatGlasses } from "lucide-react";

interface PlayerSummary {
    id: string;
    name: string;
    isReady: boolean;
}

interface RoleRevealScreenProps {
    playerName: string;
    role: "CIVIL" | "IMPOSTOR";
    wordOrHint: string;
    category: string;
    players: PlayerSummary[];
    currentPlayerId: string;
    onToggleReady: () => void;
}

export default function RoleRevealScreen({
    playerName,
    role,
    wordOrHint,
    category,
    players,
    currentPlayerId,
    onToggleReady,
}: RoleRevealScreenProps) {
    const isImpostor = role === "IMPOSTOR";
    const me = players.find(p => p.id === currentPlayerId);
    const myReadyStatus = me ? me.isReady : false;

    // Calculate the total number of ready players
    const readyCount = players.filter(p => p.isReady).length;

    return (
        <div className="flex flex-col min-h-screen bg-slate-950 text-white p-6 justify-between select-none font-sans animate-fade-in">

            {/* Title */}
            <div className="text-center mt-6">
                <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
                    {isImpostor ? (
                        <>
                            Találd ki <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">
                                a titkos szót
                            </span>
                        </>
                    ) : (
                        <>
                            Találd meg <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">
                                az imposztort
                            </span>
                        </>
                    )}
                </h1>
            </div>

            {/* Role Card */}
            <div className="max-w-md w-full mx-auto my-4 px-2">
                <div className={`relative bg-slate-900/40 backdrop-blur-md border rounded-3xl p-6 pt-10 shadow-2xl text-center transition-all ${isImpostor ? "border-rose-500/30" : "border-cyan-500/30"
                    }`}>

                    {/* Top Player Label Pill */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className={`text-xs font-black uppercase tracking-wider px-6 py-2 rounded-full border shadow-md inline-block ${isImpostor
                                ? "bg-rose-500 text-white border-rose-400"
                                : "bg-cyan-500 text-white border-cyan-400"
                            }`}>
                            {playerName}
                        </span>
                    </div>

                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center border-2 ${isImpostor
                                ? "bg-rose-950/40 border-rose-500/40 text-rose-400"
                                : "bg-cyan-950/40 border-cyan-500/40 text-cyan-400"
                            }`}>
                            {isImpostor ? <HatGlasses size={42} /> : <Users size={42} />}
                        </div>
                    </div>

                    {/* Role Text */}
                    <h2 className={`text-3xl font-black uppercase tracking-widest mb-6 ${isImpostor ? "text-rose-500" : "text-cyan-400"
                        }`}>
                        {isImpostor ? "Imposztor" : "Civil"}
                    </h2>

                    {/* Secret Word Box */}
                    <div className="relative bg-slate-950/80 rounded-2xl p-6 border border-slate-800/60 inline-block w-full">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className={`text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full text-white ${isImpostor ? "bg-rose-500" : "bg-cyan-500"
                                }`}>
                                {isImpostor ? "Tipp" : "Titkos Szó"}
                            </span>
                        </div>
                        <span className="text-3xl font-black tracking-wider text-slate-100 block mt-2">
                            {wordOrHint}
                        </span>
                    </div>

                    {/* Category Label */}
                    <div className="mt-6">
                        <span className="inline-block bg-slate-950 text-slate-400 border border-slate-800 px-5 py-2 rounded-xl text-xs font-semibold tracking-wide">
                            Kategória: {category}
                        </span>
                    </div>
                </div>

                {/* Real-time Ready Player Status Tally */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 mt-4 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            Játékosok állapota
                        </span>
                        <span className="text-xs font-black text-indigo-400">
                            {readyCount} / {players.length} Kész
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {players.map((p) => (
                            <span
                                key={p.id}
                                className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border transition-all duration-300 ${p.isReady
                                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold"
                                        : "bg-slate-950/60 border-slate-800/80 text-slate-500"
                                    }`}
                            >
                                {p.name}
                                {p.isReady ? <CheckCircle2 size={12} /> : <Clock size={12} className="animate-pulse" />}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Button and Instruction Controls */}
            <div className="max-w-md w-full mx-auto space-y-4 text-center pb-4">
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    {isImpostor
                        ? "Tudod a tippet. Használd első asszociációként a körben."
                        : "Jegyezd meg a szót. Ne használd a töredékeit vagy nyilvánvaló definíciókat."}
                </p>

                <button
                    onClick={onToggleReady}
                    className={`w-full py-4 font-black rounded-2xl shadow-lg transition-all duration-300 ${myReadyStatus
                            ? "bg-slate-800 text-rose-400 border border-rose-500/30 hover:bg-slate-750"
                            : "bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 hover:opacity-95 shadow-emerald-500/10"
                        }`}
                >
                    {myReadyStatus ? "Mégsem vagyok kész" : "Kész vagyok"}
                </button>
            </div>
        </div>
    );
}