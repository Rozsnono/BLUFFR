"use client";

import React, { useState } from "react";
import { User, Glasses, HelpCircle, CheckCircle2, AlertCircle } from "lucide-react";

interface Player {
    id: string;
    name: string;
    submittedWord: string;
    isEliminated: boolean;
    hasVoted: boolean;
}

interface VotingScreenProps {
    players: Player[];
    currentPlayerId: string;
    currentVoteId: string | null;
    hasVoted: boolean;
    isEliminated: boolean;
    onVote: (targetId: string) => void;
}

export default function VotingScreen({
    players,
    currentPlayerId,
    currentVoteId,
    hasVoted,
    isEliminated,
    onVote,
}: VotingScreenProps) {

    const [isVoting, setIsVoting] = useState(false);

    function onVoting(targetId: string) {
        onVote(targetId);
        setIsVoting(true);
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-950 text-white p-6 justify-between select-none font-sans">

            {/* Header */}
            <div className="text-center mt-6 space-y-1">
                <span className="text-xs font-black uppercase text-rose-500 tracking-widest block">Szavazás</span>
                <h1 className="text-3xl font-black">Ki az Imposztor?</h1>
            </div>

            {/* Main List */}
            <div className="my-6 max-w-md w-full mx-auto flex-1 flex flex-col justify-center space-y-4">
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {players
                        .filter((p) => !p.isEliminated)
                        .map((p) => {
                            const isSelf = p.id === currentPlayerId;
                            const isSelected = currentVoteId === p.id;

                            return (
                                <button
                                    key={p.id}
                                    disabled={hasVoted || isSelf || isEliminated || isVoting}
                                    onClick={() => onVote(p.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 text-left ${isSelected
                                        ? "bg-rose-500/10 border-rose-500 shadow-lg shadow-rose-500/5"
                                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                                        }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0 pr-4">
                                        <div className="p-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-400">
                                            <User size={18} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-100 truncate">{p.name}</span>
                                                {isSelf && (
                                                    <span className="text-[9px] uppercase font-bold text-indigo-400 bg-indigo-400/10 px-1.5 py-0.5 rounded">Te</span>
                                                )}
                                            </div>
                                            <span className="text-xs text-indigo-400 font-semibold mt-0.5 block truncate">
                                                Körszó: {p.submittedWord || "—"}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        {p.hasVoted ? (
                                            <CheckCircle2 size={18} className="text-emerald-400" />
                                        ) : (
                                            <span className="text-[9px] bg-slate-950 text-slate-600 font-bold px-2 py-1 rounded-lg border border-slate-800/60 uppercase tracking-wider">
                                                Vár...
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                </div>

                {/* Dynamic "Not Sure" Voting Option */}
                <div className="border-t border-slate-800/80 pt-4">
                    <button
                        disabled={hasVoted || isEliminated || isVoting}
                        onClick={() => onVote("NOT_SURE")}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 text-left ${currentVoteId === "NOT_SURE"
                            ? "bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/5"
                            : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                                <HelpCircle size={18} />
                            </div>
                            <div>
                                <p className="font-black text-slate-100 text-sm">Nem vagyunk biztosak benne</p>
                                <p className="text-[10px] text-amber-400 font-semibold mt-0.5">Új kör indítása a jelenlegi szóval</p>
                            </div>
                        </div>
                        {currentVoteId === "NOT_SURE" && (
                            <CheckCircle2 size={18} className="text-amber-400" />
                        )}
                    </button>
                </div>
            </div>

            {/* Action Footer */}
            <div className="max-w-md w-full mx-auto pb-4 text-center">
                {isEliminated ? (
                    <div className="flex items-center justify-center gap-2 w-full py-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold">
                        <AlertCircle size={14} />
                        Kiestél! Csak nézőként követed a szavazást.
                    </div>
                ) : hasVoted ? (
                    <div className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-bold animate-pulse">
                        <CheckCircle2 size={14} />
                        Szavazat elmentve! Várakozás a többiekre...
                    </div>
                ) : (
                    <p className="text-xs text-slate-500 font-medium">Válassz egy játékost vagy bökj a bizonytalanságra.</p>
                )}
            </div>
        </div>
    );
}