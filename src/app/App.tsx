import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "./store/useAppStore";
import { TopBar, BottomNav } from "./components/NavBar";
import { Dashboard } from "./pages/Dashboard";
import { BudgetTracker } from "./pages/BudgetTracker";
import { GhostTracker } from "./pages/GhostTracker";
import { ContradictionAlert } from "./pages/ContradictionAlert";
import { RealityChecker } from "./pages/RealityChecker";
import { IssueReporter } from "./pages/IssueReporter";
import { FoiGenerator } from "./pages/FoiGenerator";
import { PoliticianProfile } from "./pages/PoliticianProfile";
import { ComponentLibrary } from "./pages/ComponentLibrary";
import { LandingPage } from "./pages/LandingPage";
import { RefreshCw, WifiOff } from "lucide-react";

export default function App() {
  const { t } = useTranslation();
  const {
    screen,
    setScreen,
    isOffline,
    setIsOffline,
    isSyncing,
    syncOfflineQueue,
    loadOfflineData,
    accessToken
  } = useAppStore();

  // Listen to network status events and initialize IndexedDB offline store on mount
  useEffect(() => {
    loadOfflineData();

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    if (!navigator.onLine) {
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Auth gating: Lock application views if not logged in
  if (!accessToken) {
    return (
      <div className="flex flex-col min-h-screen max-w-[375px] mx-auto bg-[#0E1116] border-x border-white/[0.06] shadow-2xl relative">
        <LandingPage />
      </div>
    );
  }

  const renderActiveScreen = () => {
    switch (screen) {
      case "home":
        return <Dashboard />;
      case "budget":
        return <BudgetTracker />;
      case "ghost":
        return <GhostTracker />;
      case "contradiction":
        return <ContradictionAlert />;
      case "social":
        return <RealityChecker />;
      case "reporter":
        return <IssueReporter />;
      case "foi":
        return <FoiGenerator />;
      case "profile":
        return <PoliticianProfile />;
      case "components":
        return <ComponentLibrary />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-[375px] mx-auto bg-[#0E1116] border-x border-white/[0.06] shadow-2xl relative animate-fade-in">
      {/* Top Header Bar */}
      <TopBar 
        showBack={screen !== "home"} 
        onBack={() => setScreen("home")} 
      />

      {/* Offline Status sub-header info banner */}
      {isOffline && (
        <div className="bg-[#21262D] border-b border-[#E8B95C]/20 px-4 py-2 flex items-center justify-between animate-fade-in shrink-0">
          <div className="flex items-center gap-2">
            <WifiOff size={13} className="text-[#E8B95C]" />
            <span className="text-[10px] text-[#E8B95C] font-semibold font-dm-mono">
              {t("offline")}
            </span>
          </div>
          {!isOffline && (
            <button 
              onClick={syncOfflineQueue}
              disabled={isSyncing}
              className="flex items-center gap-1 text-[10px] text-[#8B949E] active:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw size={11} className={isSyncing ? "animate-spin" : ""} />
              Sync
            </button>
          )}
        </div>
      )}

      {/* Core Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        {renderActiveScreen()}
      </div>

      {/* Bottom Layout footer navigation bar */}
      <BottomNav />
    </div>
  );
}
