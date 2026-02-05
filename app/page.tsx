"use client";

import { useState, ReactNode } from "react";

type TabType = "control" | "voice";

export default function Home() {
  const [tab, setTab] = useState<TabType>("control");

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="p-5 text-center">
        <h1 className="text-2xl font-bold">Smart Home ESP32</h1>
        <p className="text-slate-400 text-sm">
          Control your home devices easily
        </p>
      </header>

      {/* Tabs */}
      <div className="flex justify-center gap-2 px-4">
        <TabButton active={tab === "control"} onClick={() => setTab("control")}>
          Control
        </TabButton>
        <TabButton active={tab === "voice"} onClick={() => setTab("voice")}>
          Voice
        </TabButton>
      </div>

      {/* Content */}
      <main className="p-6 max-w-4xl mx-auto">
        {tab === "control" ? <ControlPanel /> : <VoicePanel />}
      </main>
    </div>
  );
}

/* ===================== TYPES ===================== */

type TabButtonProps = {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
};

type ControlCardProps = {
  title: string;
  endpoint: string;
  color: string;
};

/* ===================== COMPONENTS ===================== */

function TabButton({ children, active, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-full text-sm transition-all
        ${active ? "bg-sky-600 shadow-lg" : "bg-slate-700 hover:bg-slate-600"} cursor-pointer`}
    >
      {children}
    </button>
  );
}

function ControlPanel() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <ControlCard
        title="All Lamp"
        endpoint="http://192.168.1.13:80/all-on"
        color="bg-emerald-600"
      />
      <ControlCard
        title="Ruang Tamu"
        endpoint="http://192.168.1.13:80/ruang-tamu"
        color="bg-sky-600"
      />
      <ControlCard
        title="Kamar"
        endpoint="http://192.168.1.13:80/kamar"
        color="bg-violet-600"
      />
      <ControlCard
        title="Dapur"
        endpoint="http://192.168.1.13:80/dapur"
        color="bg-orange-500"
      />
    </div>
  );
}

function ControlCard({ title, endpoint, color }: ControlCardProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleToggle = async () => {
    try {
      setLoading(true);
      setStatus(null);

      const res = await fetch(endpoint, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to hit ESP32");
      }

      const text = await res.text();
      setStatus(text);
    } catch (err) {
      setStatus("❌ ESP32 tidak merespon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-5 shadow-md hover:shadow-xl transition">
      <h2 className="text-lg font-semibold mb-1">{title}</h2>
      <p className="text-slate-400 text-xs mb-3 break-all">{endpoint}</p>

      <button
        onClick={handleToggle}
        disabled={loading}
        className={`${color} w-full py-3 rounded-lg font-medium transition
          ${loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}
      >
        {loading ? "Processing..." : "Toggle"}
      </button>

      {status && (
        <p className="mt-3 text-sm text-center text-slate-300">{status}</p>
      )}
    </div>
  );
}

function VoicePanel() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center">
      <div className="w-40 h-40 rounded-full bg-sky-600/20 flex items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-sky-600 animate-pulse" />
      </div>

      <h2 className="text-xl font-semibold">Voice Control</h2>
      <p className="text-slate-400 max-w-sm">
        Tap the microphone and say commands like:
        <br />
        <span className="italic text-sky-400">"Turn on living room light"</span>
      </p>

      <button
        className="bg-sky-600 px-8 py-3 rounded-full text-lg font-medium opacity-60 cursor-not-allowed"
        disabled
      >
        🎤 Listening...
      </button>

      <p className="text-xs text-slate-500">
        Voice logic will be implemented later
      </p>
    </div>
  );
}
