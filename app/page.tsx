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
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [response, setResponse] = useState("");

  const speak = (text: string, callback?: () => void) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.pitch = 1.2;
    utterance.rate = 1;

    // coba cari suara cewek
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(
      (v) => v.lang === "id-ID" && v.name.toLowerCase().includes("female"),
    );
    if (femaleVoice) utterance.voice = femaleVoice;

    utterance.onend = () => callback && callback();
    window.speechSynthesis.speak(utterance);
  };

  const sendToESP = async (text: string) => {
    try {
      const res = await fetch("http://192.168.1.13:80/voice", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: text,
      });

      const result = await res.text();

      if (!res.ok) {
        setError(result || "Perintah gagal diproses");
        return;
      }

      setResponse(result);
      speak(result);
    } catch (e) {}
  };

  const startListening = () => {
    setError("");
    setResponse("");

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("❌ Browser tidak mendukung Voice Recognition");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
      setTranscript("");
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);

      // Alexa ngomong dulu, baru fetch
      speak("oke laksanakan", () => {
        setTimeout(() => {
          sendToESP(text);
        }, 200); // delay 0.8 detik
      });
    };

    recognition.onerror = () => {
      setError("❌ Gagal mendeteksi suara");
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center">
      {/* Mic */}
      <div className="w-40 h-40 rounded-full bg-sky-600/20 flex items-center justify-center">
        <div
          className={`w-24 h-24 rounded-full bg-sky-600 ${
            listening ? "animate-pulse" : ""
          }`}
        />
      </div>

      <h2 className="text-xl font-semibold">Voice Control</h2>

      <button
        onClick={startListening}
        disabled={listening}
        className={`px-8 py-3 rounded-full text-lg font-medium transition
          ${
            listening
              ? "bg-slate-600 cursor-not-allowed"
              : "bg-sky-600 hover:opacity-90"
          }`}
      >
        🎤 {listening ? "Listening..." : "Start Listening"}
      </button>

      {transcript && (
        <div className="bg-slate-800 p-4 rounded-lg max-w-md">
          <p className="text-slate-400 text-xs mb-1">Kamu bilang:</p>
          <p className="text-sky-400 font-medium">"{transcript}"</p>
        </div>
      )}

      {response && (
        <p className="text-emerald-400 text-sm font-medium">{response}</p>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
