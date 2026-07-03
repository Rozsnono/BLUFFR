"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, LogIn, PlusCircle, ArrowRight, Sparkles, HelpCircle } from "lucide-react";

export default function MainLandingPage() {
  const router = useRouter();
  const [playerId, setPlayerId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [roomCode, setRoomCode] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"JOIN" | "CREATE">("JOIN");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize and load saved credentials from local storage
  useEffect(() => {
    let savedId = localStorage.getItem("impostor_player_id");
    let savedName = localStorage.getItem("impostor_player_name") || "";
    if (!savedId) {
      savedId = crypto.randomUUID();
      localStorage.setItem("impostor_player_id", savedId);
    }
    setPlayerId(savedId);
    setName(savedName);
  }, []);

  const updateSavedName = (val: string) => {
    setName(val);
    localStorage.setItem("impostor_player_name", val.trim());
  };

  const handleCreateRoom = async () => {
    if (!name.trim()) {
      setError("Kérlek, adj meg egy becenevet az indítás előtt!");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, name: name.trim() }),
      });

      if (!response.ok) {
        throw new Error("Nem sikerült a szoba létrehozása.");
      }

      const data = await response.json();
      router.push(`/room?code=${data.roomCode}`);
    } catch (err: any) {
      setError(err.message || "Hálózati hiba történt.");
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!name.trim()) {
      setError("Kérlek, adj meg egy becenevet a csatlakozás előtt!");
      return;
    }
    if (!roomCode.trim() || roomCode.length !== 6) {
      setError("Kérlek, írj be egy érvényes 6 jegyű szobakódot!");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const formattedCode = roomCode.trim().toUpperCase();
      const response = await fetch("/api/room/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          roomCode: formattedCode, 
          playerId, 
          name: name.trim() 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Sikertelen csatlakozás.");
      }

      router.push(`/room?code=${formattedCode}`);
    } catch (err: any) {
      setError(err.message || "Hálózati hiba.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen justify-between p-6 select-none font-sans max-w-5xl mx-auto">
      
      {/* 1. Header Hero Panel */}
      <div className="text-center mt-8 space-y-3">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full text-indigo-400">
          <Sparkles size={14} className="animate-pulse" />
          <span className="text-[10px] font-black tracking-widest uppercase">Körök mód • Nincs ismétlés</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-rose-500 to-indigo-500">
          IMPOSZTOR
        </h1>
        <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
          Ki az? • Party Játék
        </p>
      </div>

      {/* 2. Interactive Control Dashboard */}
      <div className="my-8 max-w-3xl w-full mx-auto space-y-6">
        
        {/* Persistent Nickname Input Card */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-5 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider block">
                Saját Profil
              </span>
              <p className="text-xs text-slate-400">Add meg a beceneved a játék indítása előtt</p>
            </div>
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <User size={18} />
              </div>
              <input
                type="text"
                maxLength={16}
                placeholder="Beceneved..."
                value={name}
                onChange={(e) => updateSavedName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800/80 focus:border-indigo-500 text-white font-bold py-4 pl-12 pr-5 rounded-2xl focus:outline-none transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* --- MOBILE VIEW: Segmented Tab Controller --- */}
        <div className="block md:hidden bg-slate-900/40 border border-slate-800 p-1.5 rounded-2xl">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setActiveTab("JOIN")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black tracking-wider uppercase transition ${
                activeTab === "JOIN"
                  ? "bg-cyan-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LogIn size={14} />
              Csatlakozás
            </button>
            <button
              onClick={() => setActiveTab("CREATE")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black tracking-wider uppercase transition ${
                activeTab === "CREATE"
                  ? "bg-rose-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <PlusCircle size={14} />
              Létrehozás
            </button>
          </div>
        </div>

        {/* --- DESKTOP VIEW: Side-by-Side Dual Panels --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Column/Tab 1: Lobby Selection (Csatlakozás) */}
          <div className={`bg-slate-900/60 backdrop-blur-md border rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-2xl transition-all duration-300 ${
            activeTab === "JOIN" ? "border-cyan-500/30" : "border-slate-800 md:border-slate-800"
          } ${activeTab !== "JOIN" ? "hidden md:flex" : "flex"}`}>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400">
                  <LogIn size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-100">Lobby Választás</h3>
                  <p className="text-xs text-slate-400">Csatlakozz egy meglévő játékhoz szobakóddal</p>
                </div>
              </div>

              <div className="pt-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="SZOBÁK KÓDJA"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 text-cyan-400 tracking-widest font-black py-4 px-5 rounded-2xl text-center focus:outline-none placeholder:text-slate-850 transition-all duration-200"
                />
              </div>
            </div>

            <button
              onClick={handleJoinRoom}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-teal-500 hover:opacity-95 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/5 transition duration-200 disabled:opacity-50"
            >
              Csatlakozás Szobához
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Column/Tab 2: Lobby Creation (Létrehozás) */}
          <div className={`bg-slate-900/60 backdrop-blur-md border rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-2xl transition-all duration-300 ${
            activeTab === "CREATE" ? "border-rose-500/30" : "border-slate-800 md:border-slate-800"
          } ${activeTab !== "CREATE" ? "hidden md:flex" : "flex"}`}>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400">
                  <PlusCircle size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-100">Lobby Létrehozás</h3>
                  <p className="text-xs text-slate-400">Indíts új meccset és legyél te a házigazda</p>
                </div>
              </div>

              <div className="bg-slate-950/50 border border-slate-800/40 p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-indigo-400">
                  <HelpCircle size={12} />
                  <span>Játékinformáció</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A szoba létrehozása után kapsz egy 6 jegyű kódot. Ezt oszd meg a barátaiddal, hogy csatlakozhassanak. Minimum 3 játékos szükséges.
                </p>
              </div>
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-rose-500 to-purple-600 hover:opacity-95 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-rose-500/10 transition duration-200 disabled:opacity-50"
            >
              Szoba Létrehozása
              <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </div>

      {/* 3. Global Footer controls */}
      <div className="max-w-md w-full mx-auto space-y-4 text-center pb-6">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold py-3.5 px-4 rounded-xl text-center">
            {error}
          </div>
        )}
        <p className="text-[10px] text-slate-600 font-medium">
          Helyezd magad kényelembe, alkossatok csapatot, és leplezzétek le az imposztort.
        </p>
      </div>
    </div>
  );
}