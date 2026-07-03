import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { AuthScreen } from "./AuthScreen";
import { CivicCard } from "../components/CivicCard";
import { useAppStore } from "../store/useAppStore";
import { FileText, Map, Shield, Landmark, LogIn, ChevronRight } from "lucide-react";

export function LandingPage() {
  const { t } = useTranslation();
  
  // App store triggers for PWA installability
  const { isInstallable, triggerInstall } = useAppStore();

  // Splash Screen States
  const [showSplash, setShowSplash] = useState(true);
  const [splashProgress, setSplashProgress] = useState(0);
  const [splashLog, setSplashLog] = useState("Initializing CivicPulse client...");

  // Navigation / Login overlay triggers
  const [showAuthFlow, setShowAuthFlow] = useState(false);

  // Splash Log sequence handler
  useEffect(() => {
    if (!showSplash) return;
    
    const progressInterval = setInterval(() => {
      setSplashProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setShowSplash(false), 500);
          return 100;
        }
        
        const next = prev + 4;
        
        // Dynamic logging logs
        if (next < 25) {
          setSplashLog("Connecting to Supabase auth client...");
        } else if (next < 50) {
          setSplashLog("Scanning community project coordinates database...");
        } else if (next < 75) {
          setSplashLog("Decrypting federal allocation files...");
        } else {
          setSplashLog("Initializing reality check survey ledger...");
        }
        
        return next;
      });
    }, 80);

    return () => clearInterval(progressInterval);
  }, [showSplash]);

  if (showSplash) {
    return (
      <div className="min-h-screen bg-[#0E1116] flex flex-col justify-center px-8 relative overflow-hidden font-inter">
        {/* Ambient Grid overlay */}
        <div className="absolute inset-0 grid-bg-hero opacity-10 pointer-events-none" />
        
        <div className="text-center space-y-6 relative z-10 max-w-[280px] mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <img 
              src="/logo.jpg" 
              alt="CivicPulse Logo" 
              className="w-16 h-16 rounded-2xl mx-auto border border-[#1E8A5F]/40 shadow-xl object-cover"
            />
          </motion.div>
          
          <div className="space-y-1">
            <h2 className="text-[#E8EDF2] text-xl font-bold font-sora tracking-tight">CivicPulse</h2>
            <p className="text-[#8B949E] text-xs uppercase tracking-widest font-mono font-dm-mono">Nigeria Audit Ledgers</p>
          </div>

          <div className="w-full bg-[#1C2128] rounded-full h-1.5 overflow-hidden border border-white/[0.04] mt-2">
            <div 
              className="bg-[#1E8A5F] h-full rounded-full transition-all duration-75"
              style={{ width: `${splashProgress}%` }}
            />
          </div>

          <div className="h-6 flex items-center justify-center">
            <p className="text-[#8B949E] text-[10px] uppercase font-bold tracking-wider font-dm-mono animate-pulse">
              {splashLog}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E1116] flex flex-col relative overflow-hidden font-inter">
      {/* Local Background Video Stream */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-[0.22] mix-blend-screen pointer-events-none"
      >
        <source 
          src="/PixVerse_V6_Image_Text_540P_Futuristic_hologra.mp4" 
          type="video/mp4" 
        />
      </video>

      {/* Backup CSS Grid Overlay */}
      <div className="absolute inset-0 grid-bg-hero opacity-15 animate-grid-move pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#1E8A5F]/10 blur-3xl pointer-events-none animate-glow-pulse" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0E1116] via-transparent to-transparent opacity-90 pointer-events-none" />

      {/* Main Container Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 relative z-10 flex flex-col justify-between max-w-[375px] mx-auto">
        <AnimatePresence mode="wait">
          {!showAuthFlow ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-6 flex-1 flex flex-col justify-between"
            >
              {/* Header bar */}
              <div className="flex justify-between items-center bg-[#161B22]/50 backdrop-blur-sm px-3.5 py-2.5 rounded-2xl border border-white/[0.05]">
                <div className="flex items-center gap-1.5">
                  <img src="/logo.jpg" alt="Logo" className="w-6 h-6 rounded-md object-cover" />
                  <span className="text-sm font-bold text-[#E8EDF2] font-sora">CivicPulse</span>
                </div>
                <button
                  onClick={() => setShowAuthFlow(true)}
                  className="flex items-center gap-1 text-[#E8B95C] hover:text-white text-xs font-semibold font-sora bg-[#E8B95C]/10 border border-[#E8B95C]/25 px-2.5 py-1.5 rounded-lg active:scale-95 transition-all"
                >
                  <LogIn size={12} /> Log In
                </button>
              </div>

              {/* Hero Presentation */}
              <div className="space-y-3 pt-4">
                <h1 className="text-[#E8EDF2] text-xl font-bold font-sora leading-tight uppercase tracking-tight">
                  Audit Nigerian Projects. <br />
                  <span className="text-[#1E8A5F]">Expose the reality.</span>
                </h1>
                <p className="text-[#8B949E] text-xs leading-relaxed font-medium">
                  We use AI vision analysis and ledger matching to cross-check contractor claims against what is actually on the ground. No more "ghost" programs.
                </p>
              </div>

              {/* Metrics counter ledger */}
              <div className="grid grid-cols-3 gap-2.5">
                <CivicCard className="p-3 text-center border-l-2 border-l-[#E3433D]/70 bg-white/[0.01]">
                  <p className="text-[#E3433D] text-xs font-bold font-dm-mono">₦2.4T+</p>
                  <p className="text-[#8B949E] text-[8px] uppercase tracking-wider mt-1 font-bold">Deviation</p>
                </CivicCard>
                <CivicCard className="p-3 text-center border-l-2 border-l-[#E8B95C]/70 bg-white/[0.01]">
                  <p className="text-[#E8B95C] text-xs font-bold font-dm-mono">1,290+</p>
                  <p className="text-[#8B949E] text-[8px] uppercase tracking-wider mt-1 font-bold">Verifications</p>
                </CivicCard>
                <CivicCard className="p-3 text-center border-l-2 border-l-[#1E8A5F]/70 bg-white/[0.01]">
                  <p className="text-[#1E8A5F] text-xs font-bold font-dm-mono">82%</p>
                  <p className="text-[#8B949E] text-[8px] uppercase tracking-wider mt-1 font-bold">Accuracy</p>
                </CivicCard>
              </div>

              {/* Install PWA Prompt Banner */}
              {isInstallable && (
                <div className="bg-[#E8B95C]/10 border border-[#E8B95C]/35 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-md animate-fade-in">
                  <div className="text-left space-y-0.5">
                    <p className="text-[#E8B95C] text-xs font-bold font-sora">Install CivicPulse App</p>
                    <p className="text-[#8B949E] text-[10px] leading-snug">Add to your Home Screen for faster offline audits.</p>
                  </div>
                  <button
                    onClick={triggerInstall}
                    className="bg-[#E8B95C] text-[#0E1116] text-[10px] font-bold px-3 py-1.5 rounded-lg font-sora shrink-0 active:scale-95 transition-all shadow-md shadow-[#E8B95C]/20"
                  >
                    Install Now
                  </button>
                </div>
              )}

              {/* Feature Previews */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1">
                  <Shield size={11} className="text-[#1E8A5F]" />
                  <span className="text-[#8B949E] text-[9px] uppercase tracking-widest font-mono font-dm-mono font-bold">Core Capabilities</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  <div className="flex items-center gap-3 p-3 bg-[#161B22]/70 backdrop-blur-sm rounded-xl border border-white/[0.05]">
                    <div className="w-8 h-8 rounded-lg bg-[#E3433D]/10 border border-[#E3433D]/25 flex items-center justify-center text-[#E3433D]">
                      <Landmark size={15} />
                    </div>
                    <div className="text-left">
                      <p className="text-[#E8EDF2] text-xs font-bold font-sora">Budget Deviation Tracker</p>
                      <p className="text-[#8B949E] text-[9.5px]">PDF auditing extracts allocation vs real spent logs.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-[#161B22]/70 backdrop-blur-sm rounded-xl border border-white/[0.05]">
                    <div className="w-8 h-8 rounded-lg bg-[#1E8A5F]/10 border border-[#1E8A5F]/25 flex items-center justify-center text-[#1E8A5F]">
                      <Map size={15} />
                    </div>
                    <div className="text-left">
                      <p className="text-[#E8EDF2] text-xs font-bold font-sora">Ghost Project Mapping</p>
                      <p className="text-[#8B949E] text-[9.5px]">GPS matching links evidence photos to contracts.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-[#161B22]/70 backdrop-blur-sm rounded-xl border border-white/[0.05]">
                    <div className="w-8 h-8 rounded-lg bg-[#A78BFA]/10 border border-[#A78BFA]/25 flex items-center justify-center text-[#A78BFA]">
                      <FileText size={15} />
                    </div>
                    <div className="text-left">
                      <p className="text-[#E8EDF2] text-xs font-bold font-sora">FOI Letter Constructor</p>
                      <p className="text-[#8B949E] text-[9.5px]">Translates citizen issues into official legal drafts.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom CTA Action Button */}
              <div className="pt-3">
                <button
                  onClick={() => setShowAuthFlow(true)}
                  className="w-full bg-[#1E8A5F] hover:bg-[#26A674] text-white text-xs font-semibold py-3.5 rounded-xl transition-all shadow-md shadow-[#1E8A5F]/15 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Get Started
                  <ChevronRight size={14} />
                </button>
                <p className="text-[#8B949E] text-[9px] text-center mt-2 opacity-50">
                  Secured by Supabase Authentication & Supabase DB
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="auth"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="flex-1 flex flex-col justify-center"
            >
              {/* Back to landing screen control */}
              <div className="mb-2">
                <button
                  type="button"
                  onClick={() => setShowAuthFlow(false)}
                  className="text-[#8B949E] hover:text-white text-[11px] font-semibold flex items-center gap-1 px-1 py-1"
                >
                  ← Return to Landing Page
                </button>
              </div>
              <AuthScreen />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
