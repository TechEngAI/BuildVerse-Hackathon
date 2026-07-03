import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CivicCard } from "../components/CivicCard";
import { useAppStore } from "../store/useAppStore";
import { motion, AnimatePresence } from "motion/react";
import {
  Award, Trophy, CheckCircle, Zap, ShieldAlert, Cpu, Radio, Sparkles, Map, Volume2, Battery, RefreshCw, Bookmark, Share2, Award as AwardIcon, Check, FileText
} from "lucide-react";

export function AuditLabs() {
  const { t } = useTranslation();
  const { isOffline } = useAppStore();

  const [activeCategory, setActiveCategory] = useState<"ux" | "visuals" | "gaming" | "pwa" | "ai">("ux");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Feature state simulation variables
  const [pidginVoice, setPidginVoice] = useState(false);
  const [streakCount, setStreakCount] = useState(7);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [batteryLevel, setBatteryLevel] = useState(88);
  const [cacheSize, setCacheSize] = useState("4.2 MB");
  const [confidenceScore, setConfidenceScore] = useState(94.2);
  const [speechText, setSpeechText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Trigger Toast Simulation
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Simulate Speech to Text (Pidgin Dialect)
  const startRecordingSim = () => {
    setIsRecording(true);
    setSpeechText("Listening to Pidgin voice report...");
    setTimeout(() => {
      setSpeechText("Contractor run away leaving secondary school blocks unfinished for Anaocha LGA...");
      setIsRecording(false);
      triggerToast("Pidgin speech transcribed successfully!");
    }, 2500);
  };

  // Simulate AI News Summarizer
  const generateSummarySim = () => {
    setLoadingSummary(true);
    setAiSummary("");
    setTimeout(() => {
      setAiSummary("• LGA Audit: Anambra Anaocha secondary school project abandoned since Jan 2024.\n• Deviation: Contract value allocated was ₦145M, actual site inspection reveals zero completion.\n• AI Verdict: High mismatch probability verified. Recommendation: Issue immediate FOI request.");
      setLoadingSummary(false);
    }, 1500);
  };

  return (
    <div className="pb-8 px-4 space-y-5 fade-in relative">
      {/* Toast Notification HUD */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-4 right-4 bg-[#1E8A5F] border border-[#26B07A] text-white py-3 px-4 rounded-xl shadow-2xl flex items-center gap-2.5 z-50 text-xs font-sora font-semibold"
          >
            <Sparkles size={14} className="shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header bar */}
      <div className="flex items-center gap-3 mt-4">
        <div className="w-8 h-8 bg-[#E8B95C]/15 rounded-lg flex items-center justify-center border border-[#E8B95C]/35">
          <Cpu size={16} className="text-[#E8B95C]" />
        </div>
        <div>
          <h3 className="text-[#E8EDF2] text-sm font-semibold font-sora">
            CivicPulse AI Audit Labs
          </h3>
          <p className="text-[#8B949E] text-[10px]">Interactive prototype demonstrating all 50 sprint enhancements</p>
        </div>
      </div>

      {/* Quick category filter tags */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {[
          { key: "ux", label: "UI & UX" },
          { key: "visuals", label: "Visuals & Diff" },
          { key: "gaming", label: "Gamify & Streaks" },
          { key: "pwa", label: "PWA & Offline" },
          { key: "ai", label: "Speech & AI ML" }
        ].map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key as any)}
            className={`px-3 py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider font-dm-mono shrink-0 transition-all ${
              activeCategory === cat.key
                ? "bg-[#1E8A5F] border-[#1E8A5F] text-white shadow-md shadow-[#1E8A5F]/15"
                : "bg-[#161B22] border-white/[0.06] text-[#8B949E]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Category Card Modules */}
      <AnimatePresence mode="wait">
        {activeCategory === "ux" && (
          <motion.div
            key="ux"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Interactive map zoom & pidgin toggle */}
            <CivicCard className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Map size={14} className="text-[#1E8A5F]" />
                <h4 className="text-xs font-bold text-[#E8EDF2] uppercase tracking-wider font-sora">Map Zoom & i18n Pidgin (Suggestions 1 & 2)</h4>
              </div>
              <p className="text-[#8B949E] text-[10px] leading-relaxed">
                Experience simulated double-tap vector map scale changes and Pidgin spoken assistance playback toggle.
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => triggerToast("Map Zoom Level changed: 250% focus on Anaocha")}
                  className="flex-1 bg-[#161B22] border border-white/[0.06] text-[#C4C9D0] font-semibold py-2.5 rounded-xl text-[10px] active:scale-[0.98] transition-all font-sora text-center"
                >
                  Map Zoom Trigger
                </button>
                <button
                  onClick={() => {
                    setPidginVoice(!pidginVoice);
                    triggerToast(pidginVoice ? "Pidgin voice guide disabled" : "How far, make we audit this project! (Pidgin guide live)");
                  }}
                  className={`flex-1 border font-semibold py-2.5 rounded-xl text-[10px] active:scale-[0.98] transition-all font-sora text-center flex items-center justify-center gap-1.5 ${
                    pidginVoice
                      ? "bg-[#1E8A5F] border-[#1E8A5F] text-white"
                      : "bg-[#161B22] border-white/[0.06] text-[#C4C9D0]"
                  }`}
                >
                  <Volume2 size={12} /> {pidginVoice ? "Voice: Active" : "Pidgin Voice"}
                </button>
              </div>
            </CivicCard>

            {/* Pardon warnings & Sync circulars */}
            <CivicCard className="p-4 space-y-4" severity="warning">
              <div className="flex items-center gap-2">
                <ShieldAlert size={14} className="text-[#E8B95C]" />
                <h4 className="text-xs font-bold text-[#E8EDF2] uppercase tracking-wider font-sora">Pardon Cards & Queue Syncer (Suggestions 3 & 4)</h4>
              </div>
              
              <div className="p-3 bg-[#E8B95C]/5 border border-[#E8B95C]/25 rounded-xl text-left space-y-1">
                <p className="text-[#E8B95C] text-[10px] font-bold uppercase tracking-wider font-dm-mono">Politician Warning Card</p>
                <p className="text-[#8B949E] text-[10px] leading-relaxed">
                  Hon. Obinna K. — <strong>Pardoned/Indicted (Dec 2022)</strong>. Current project matching triggers visual flags.
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                <span className="text-[#8B949E] text-[10px]">Circular Sync Queue Indicator</span>
                <div className="w-6 h-6 border-2 border-dashed border-[#1E8A5F] rounded-full animate-spin flex items-center justify-center">
                  <span className="text-[7px] text-[#1E8A5F] font-bold font-dm-mono">Q</span>
                </div>
              </div>
            </CivicCard>

            {/* Toast Test & Onboarding */}
            <CivicCard className="p-4 space-y-3">
              <h4 className="text-xs font-bold text-[#E8EDF2] uppercase tracking-wider font-sora">Toasts & Guides (Suggestions 5 & 9)</h4>
              <p className="text-[#8B949E] text-[10px] leading-relaxed">
                Run onboarding walkthrough highlight guide and test custom glassmorphic screen notifications.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => triggerToast("New report verified for Kano site")}
                  className="flex-1 bg-[#1C2128] border border-white/[0.06] text-[#E8EDF2] py-2 rounded-xl text-[10px] font-semibold"
                >
                  Test Custom Toast
                </button>
                <button
                  onClick={() => triggerToast("Step 1: Upload site photo. Step 2: Input GPS location logs.")}
                  className="flex-1 bg-[#1E8A5F] text-white py-2 rounded-xl text-[10px] font-semibold"
                >
                  Start Guide Walk
                </button>
              </div>
            </CivicCard>
          </motion.div>
        )}

        {activeCategory === "visuals" && (
          <motion.div
            key="visuals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Sector comparisons & Anomaly charts */}
            <CivicCard className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#E8EDF2] uppercase tracking-wider font-sora">Sector Deviation Rank (Suggestion 13)</h4>
                <span className="text-[9px] text-[#8B949E] uppercase tracking-wider font-dm-mono">Worst Sector Mismatch</span>
              </div>

              <div className="space-y-2">
                {[
                  { name: "Power Grid Infrastructures", rating: 92.4, color: "bg-[#E3433D]" },
                  { name: "Healthcare & LGA Clinics", rating: 74.8, color: "bg-[#E8B95C]" },
                  { name: "Primary School Blocks", rating: 65.2, color: "bg-[#E8B95C]" },
                  { name: "Road Repair Works", rating: 12.0, color: "bg-[#1E8A5F]" }
                ].map((sec, i) => (
                  <div key={i} className="space-y-1 text-left">
                    <div className="flex justify-between text-[9.5px]">
                      <span className="text-[#E8EDF2] font-semibold">{sec.name}</span>
                      <span className="text-[#8B949E] font-mono">{sec.rating}% Deviation</span>
                    </div>
                    <div className="w-full bg-[#1C2128] h-1.5 rounded-full overflow-hidden border border-white/[0.04]">
                      <div className={`h-full rounded-full ${sec.color}`} style={{ width: `${sec.rating}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CivicCard>

            {/* Detailed PDF extraction diff */}
            <CivicCard className="p-4 space-y-3">
              <h4 className="text-xs font-bold text-[#E8EDF2] uppercase tracking-wider font-sora">PDF Extraction Diff Preview (Suggestion 15)</h4>
              <p className="text-[#8B949E] text-[10px] leading-relaxed">
                Interactive preview highlighting discrepancy diffs between official papers and scanned PDF pages.
              </p>
              
              <div className="p-3 bg-[#0E1116] border border-white/[0.07] rounded-xl font-mono text-[9px] space-y-1 text-left">
                <p className="text-[#E3433D]">- Budget Allocation: ₦145.2M Ministry Records</p>
                <p className="text-[#1E8A5F]">+ Contractor Release Voucher: ₦12.5M Actual Disbursed</p>
                <p className="text-[#E8B95C] font-bold">! Discrepancy Found: 91.4% Mismatch Deviation</p>
              </div>
            </CivicCard>

            {/* Audit Logs & Share widgets */}
            <CivicCard className="p-4 space-y-3">
              <h4 className="text-xs font-bold text-[#E8EDF2] uppercase tracking-wider font-sora">Share triggers & Logs (Suggestions 16 & 20)</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => triggerToast("Sharing link copied: Exposing ₦2.4T in Abuja Road discrepancies")}
                  className="flex-1 bg-[#161B22] border border-white/[0.06] text-[#E8EDF2] py-2 rounded-xl text-[10px] font-semibold flex items-center justify-center gap-1.5"
                >
                  <Share2 size={12} /> Tweet Deviation
                </button>
                <button
                  onClick={() => triggerToast("Audit logs: 1,290 verified citizen checkpoints loaded")}
                  className="flex-1 bg-[#1C2128] border border-white/[0.06] text-[#C4C9D0] py-2 rounded-xl text-[10px] font-semibold"
                >
                  Load Audit Logs
                </button>
              </div>
            </CivicCard>
          </motion.div>
        )}

        {activeCategory === "gaming" && (
          <motion.div
            key="gaming"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Gamification streaks & badges */}
            <CivicCard className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <Trophy size={14} className="text-[#E8B95C]" />
                  <h4 className="text-xs font-bold text-[#E8EDF2] uppercase tracking-wider font-sora">Gamified Scoreboard (Suggestions 21 & 27)</h4>
                </div>
                <span className="text-[10px] text-[#E8B95C] font-bold font-dm-mono">{streakCount} Day Streak 🔥</span>
              </div>

              {/* Citizen badges unlocked */}
              <div className="grid grid-cols-2 gap-2 text-left">
                <div className="p-3 bg-[#1C2128] border border-white/[0.06] rounded-xl flex items-center gap-2">
                  <AwardIcon size={16} className="text-[#1E8A5F] shrink-0" />
                  <div>
                    <p className="text-[#E8EDF2] text-[10px] font-bold">Watchdog Level 2</p>
                    <p className="text-[#8B949E] text-[8px]">12 site photos uploaded</p>
                  </div>
                </div>
                <div className="p-3 bg-[#1C2128] border border-white/[0.06] rounded-xl flex items-center gap-2">
                  <Zap size={16} className="text-[#E8B95C] shrink-0" />
                  <div>
                    <p className="text-[#E8EDF2] text-[10px] font-bold">Ledger Sentinel</p>
                    <p className="text-[#8B949E] text-[8px]">Delta PDF deviation run</p>
                  </div>
                </div>
              </div>
            </CivicCard>

            {/* LGA Leaderboard */}
            <CivicCard className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#E8EDF2] uppercase tracking-wider font-sora">LGA Rankings (Suggestion 22)</h4>
                <span className="text-[9px] text-[#8B949E] font-mono">Top Audit Counts</span>
              </div>

              <div className="divide-y divide-white/[0.04] text-xs">
                {[
                  { rank: 1, name: "Anaocha LGA (Anambra)", points: 412 },
                  { rank: 2, name: "Ikeja LGA (Lagos)", points: 289 },
                  { rank: 3, name: "Gwale LGA (Kano)", points: 194 }
                ].map((lga, idx) => (
                  <div key={idx} className="py-2 flex justify-between items-center text-left">
                    <span className="text-[#8B949E] w-5">#{lga.rank}</span>
                    <span className="text-[#E8EDF2] font-medium flex-1">{lga.name}</span>
                    <span className="text-[#1E8A5F] font-bold font-dm-mono">{lga.points} audits</span>
                  </div>
                ))}
              </div>
            </CivicCard>

            {/* Civic education quiz */}
            <CivicCard className="p-4 space-y-3">
              <h4 className="text-xs font-bold text-[#E8EDF2] uppercase tracking-wider font-sora">Civic Quiz Challenge (Suggestion 29)</h4>
              <p className="text-[#8B949E] text-[10px] leading-relaxed">
                What is the legal deadline for a public body to respond to an FOI request in Nigeria?
              </p>
              
              <div className="space-y-2">
                {[
                  { label: "A. 3 Working Days", correct: false },
                  { label: "B. 7 Working Days", correct: true },
                  { label: "C. 14 Working Days", correct: false }
                ].map((ans, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (ans.correct) {
                        setQuizScore(100);
                        triggerToast("Correct! Section 4 of the FOI Act 2011 limits reply periods to 7 days.");
                      } else {
                        triggerToast("Incorrect answer. Read our FOI guide card again!");
                      }
                    }}
                    className="w-full text-left bg-[#161B22] border border-white/[0.06] hover:border-white/[0.12] rounded-xl px-3 py-2 text-[10.5px] text-[#C4C9D0] active:scale-99 transition-all"
                  >
                    {ans.label}
                  </button>
                ))}
              </div>
            </CivicCard>
          </motion.div>
        )}

        {activeCategory === "pwa" && (
          <motion.div
            key="pwa"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Battery status and cache analyzer */}
            <CivicCard className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Battery size={14} className="text-[#1E8A5F]" />
                <h4 className="text-xs font-bold text-[#E8EDF2] uppercase tracking-wider font-sora">Watchdog & Cache Stats (Suggestions 32 & 38)</h4>
              </div>
              <p className="text-[#8B949E] text-[10px] leading-relaxed">
                Check local IndexedDB memory sizes and battery levels to manage background upload operations.
              </p>

              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3 bg-[#1C2128] border border-white/[0.06] rounded-xl">
                  <p className="text-[#8B949E] text-[8px] uppercase tracking-wider font-mono">Offline Storage</p>
                  <p className="text-[#E8EDF2] text-xs font-bold font-dm-mono mt-1">{cacheSize}</p>
                </div>
                <div className="p-3 bg-[#1C2128] border border-white/[0.06] rounded-xl">
                  <p className="text-[#8B949E] text-[8px] uppercase tracking-wider font-mono">Device Battery</p>
                  <p className="text-[#1E8A5F] text-xs font-bold font-dm-mono mt-1">{batteryLevel}% charged</p>
                </div>
              </div>
            </CivicCard>

            {/* Offline tutorial banners & backoffs */}
            <CivicCard className="p-4 space-y-3" severity="neutral">
              <h4 className="text-xs font-bold text-[#E8EDF2] uppercase tracking-wider font-sora">Offline Tutorial Mode (Suggestion 37)</h4>
              <p className="text-[#8B949E] text-[10px] leading-relaxed">
                <strong>No connection?</strong> Submit reports normally. They save to local IndexedDB storage and sync automatically when internet becomes active.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => triggerToast("Sync retry started with backoff delay: 10s")}
                  className="w-full bg-[#161B22] border border-white/[0.06] text-[#E8EDF2] py-2 rounded-xl text-[10px] font-semibold"
                >
                  Force Syncer Retry
                </button>
              </div>
            </CivicCard>
          </motion.div>
        )}

        {activeCategory === "ai" && (
          <motion.div
            key="ai"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Vision confidence scores */}
            <CivicCard className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#E8EDF2] uppercase tracking-wider font-sora">Vision Confidence Gauge (Suggestion 41)</h4>
                <span className="text-[#1E8A5F] text-[10px] font-bold font-dm-mono">{confidenceScore}%</span>
              </div>
              <p className="text-[#8B949E] text-[10px] leading-relaxed">
                Visually displays confidence percentages on contractor evidence reviews.
              </p>

              <div className="w-full bg-[#1C2128] h-2 rounded-full overflow-hidden border border-white/[0.04]">
                <div className="h-full bg-gradient-to-r from-[#E8B95C] to-[#1E8A5F] rounded-full" style={{ width: `${confidenceScore}%` }} />
              </div>
            </CivicCard>

            {/* Pidgin Speech Dictator */}
            <CivicCard className="p-4 space-y-3.5">
              <div className="flex items-center gap-1.5">
                <Radio size={14} className="text-[#E3433D]" />
                <h4 className="text-xs font-bold text-[#E8EDF2] uppercase tracking-wider font-sora">Pidgin Speech to Text (Suggestion 43)</h4>
              </div>
              <p className="text-[#8B949E] text-[10px] leading-relaxed">
                Dictate reports using local dialect. AI transcribes and structures input parameters.
              </p>

              <button
                type="button"
                onClick={startRecordingSim}
                disabled={isRecording}
                className={`w-full py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md ${
                  isRecording 
                    ? "bg-[#E3433D]/25 border border-[#E3433D]/45 text-[#FF6B65]" 
                    : "bg-[#E3433D] hover:bg-[#F2524B] text-white"
                }`}
              >
                <Radio size={14} className={isRecording ? "animate-pulse" : ""} />
                {isRecording ? "Transcribing speech..." : "Speak Report (Pidgin Translator)"}
              </button>

              {speechText && (
                <div className="p-3.5 bg-[#0E1116] border border-white/[0.07] rounded-xl text-left">
                  <p className="text-[#8B949E] text-[9px] uppercase tracking-wider font-mono">Transcribed Transcript</p>
                  <p className="text-[#E8EDF2] text-xs font-semibold leading-relaxed mt-1">{speechText}</p>
                </div>
              )}
            </CivicCard>

            {/* AI News Feed Summarizer */}
            <CivicCard className="p-4 space-y-3.5 text-left">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-[#A78BFA]" />
                <h4 className="text-xs font-bold text-[#E8EDF2] uppercase tracking-wider font-sora">AI News Bullet Generator (Suggestion 49)</h4>
              </div>
              <p className="text-[#8B949E] text-[10px] leading-relaxed">
                Synthesize scanned PDF records and investigative alerts into actionable bullet outlines.
              </p>

              <button
                onClick={generateSummarySim}
                disabled={loadingSummary}
                className="w-full bg-[#1C2128] hover:bg-[#21262D] border border-white/[0.07] text-[#E8EDF2] font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                {loadingSummary ? "Generating bullets..." : "Generate AI Bullet Outline"}
              </button>

              {aiSummary && (
                <div className="p-3.5 bg-[#0E1116] border border-white/[0.07] rounded-xl space-y-2 whitespace-pre-line text-xs font-mono text-[#C4C9D0]">
                  {aiSummary}
                </div>
              )}
            </CivicCard>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => {
          const store = useAppStore.getState();
          store.setScreen("home");
        }}
        className="w-full bg-[#161B22] border border-white/[0.07] text-[#8B949E] hover:text-white py-3 rounded-xl text-xs font-semibold"
      >
        Return to Main Dashboard
      </button>
    </div>
  );
}
