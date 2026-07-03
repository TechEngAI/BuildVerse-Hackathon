import { useTranslation } from "react-i18next";
import { useAppStore, Language, Screen, NavTab } from "../store/useAppStore";
import {
  Home, BarChart2, Map, FileText, User, Bell, Layers, Wifi, WifiOff, ChevronLeft, LogOut, Download
} from "lucide-react";

interface NavBarProps {
  onBack?: () => void;
  showBack?: boolean;
}

export function TopBar({ onBack, showBack }: NavBarProps) {
  const { t } = useTranslation();
  const {
    lang, setLang, screen, setScreen, isOffline, setIsOffline, logout, isInstallable, triggerInstall
  } = useAppStore();

  const languages: { key: Language; label: string }[] = [
    { key: "pidgin", label: "Pid" },
    { key: "english", label: "En" },
    { key: "yoruba", label: "Yor" },
    { key: "hausa", label: "Hau" }
  ];

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#0E1116] border-b border-white/[0.06] sticky top-0 z-50">
      <div className="flex items-center gap-2">
        {showBack || screen !== "home" ? (
          <button
            onClick={onBack || (() => setScreen("home"))}
            className="flex items-center gap-1 text-[#8B949E] active:text-white transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-xs">{t("back")}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setScreen("home")}>
            <img 
              src="/logo.jpg" 
              className="w-6 h-6 rounded-md object-cover border border-[#1E8A5F]/40" 
              alt="CivicPulse Logo"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-sm font-bold text-[#E8EDF2] font-sora">
              {t("appName")}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        {/* Connection Offline/Online Simulator Trigger */}
        <button
          onClick={() => setIsOffline(!isOffline)}
          className={`p-1.5 rounded transition-colors ${
            isOffline ? "bg-[#E3433D]/10 text-[#E3433D]" : "bg-white/[0.04] text-[#8B949E] hover:text-white"
          }`}
          title={isOffline ? "Simulator: Offline (click to go online)" : "Simulator: Online (click to go offline)"}
        >
          {isOffline ? <WifiOff size={14} /> : <Wifi size={14} />}
        </button>

        {/* Multi-language Selector */}
        <div className="flex bg-[#1C2128] rounded-lg p-0.5 border border-white/[0.06]">
          {languages.map((l) => (
            <button
              key={l.key}
              onClick={() => setLang(l.key)}
              className={`px-2 py-0.5 rounded text-[10px] transition-all font-medium font-dm-mono ${
                lang === l.key
                  ? "bg-[#1E8A5F] text-white"
                  : "text-[#8B949E] hover:text-white"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Component Library Trigger */}
        <button
          onClick={() => setScreen("components")}
          className={`p-1 transition-colors ${
            screen === "components" ? "text-[#E8B95C]" : "text-[#8B949E] hover:text-white"
          }`}
          title="Component Library"
        >
          <Layers size={15} />
        </button>

        {/* PWA Install Trigger Shortcut */}
        {isInstallable && (
          <button
            onClick={triggerInstall}
            className="p-1 text-[#E8B95C] hover:text-[#26B07A] transition-colors"
            title="Install Mobile App"
          >
            <Download size={15} className="animate-bounce" />
          </button>
        )}

        <button className="p-1 text-[#8B949E] hover:text-white transition-colors relative">
          <Bell size={15} />
          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-[#E3433D] rounded-full" />
        </button>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="p-1 text-[#8B949E] hover:text-[#E3433D] transition-colors"
          title="Log Out"
        >
          <LogOut size={15} />
        </button>
      </div>
    </div>
  );
}

export function BottomNav() {
  const { t } = useTranslation();
  const { tab, setTab, setScreen } = useAppStore();

  const navItems: { key: NavTab; screen: Screen; icon: any; labelKey: string }[] = [
    { key: "home", screen: "home", icon: Home, labelKey: "navHome" },
    { key: "budget", screen: "budget", icon: BarChart2, labelKey: "navBudget" },
    { key: "map", screen: "ghost", icon: Map, labelKey: "navMap" },
    { key: "reports", screen: "contradiction", icon: FileText, labelKey: "navReports" },
    { key: "profile", screen: "profile", icon: User, labelKey: "navProfile" }
  ];

  return (
    <div className="flex items-center justify-around bg-[#0E1116] border-t border-white/[0.06] pb-safe pt-2 pb-3 sticky bottom-0 z-50">
      {navItems.map(({ key, screen: targetScreen, icon: Icon, labelKey }) => {
        const active = tab === key;
        return (
          <button
            key={key}
            onClick={() => {
              setTab(key);
              setScreen(targetScreen);
            }}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all active:scale-95"
          >
            <div className={`p-1.5 rounded-lg transition-all ${active ? "bg-[#1E8A5F]/20" : ""}`}>
              <Icon
                size={20}
                className={active ? "text-[#1E8A5F]" : "text-[#8B949E]"}
                strokeWidth={active ? 2.2 : 1.5}
              />
            </div>
            <span
              className={`text-[10px] font-medium font-dm-mono ${active ? "text-[#1E8A5F]" : "text-[#8B949E]"}`}
            >
              {t(labelKey)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
