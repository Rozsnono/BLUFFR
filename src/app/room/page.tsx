"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import GameRoomClient from "@/components/GameRoomClient";

function RoomContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || "";

  if (!code) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6 text-center">
        <h2 className="text-2xl font-bold text-rose-500 mb-4">Hiba</h2>
        <p className="text-slate-300 mb-6">A szobakód nem található vagy érvénytelen.</p>
        <button
          onClick={() => window.location.href = "/"}
          className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl font-bold hover:bg-slate-800 transition"
        >
          Vissza a főmenübe
        </button>
      </div>
    );
  }

  return <GameRoomClient roomCode={code.toUpperCase()} />;
}

export default function RoomPage() {
  return (
    // Wrap client search param hooks in a Suspense boundary to prevent build-time static generation warnings
    <Suspense 
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
          <div className="w-12 h-12 border-4 border-t-indigo-500 border-indigo-950 rounded-full animate-spin mb-4" />
          <p className="text-slate-400 text-sm font-medium font-sans">Betöltés...</p>
        </div>
      }
    >
      <RoomContent />
    </Suspense>
  );
}