import { useTranslation } from "react-i18next";
import { useAppStore, Screen, NavTab } from "../store/useAppStore";
import { AlertBadge, BadgeLevel } from "../components/AlertBadge";
import {
  BarChart2, MapPin, Users, AlertOctagon, FileText, Radio, Award, ArrowRight, Shield, ChevronRight
} from "lucide-react";

export function Dashboard() {
  const { t } = useTranslation();
  const { setScreen, setTab } = useAppStore();

  const features = [
    {
      icon: BarChart2,
      labelKey: "budgetTitle",
      subKey: "budgetUpload",
      screen: "budget" as Screen,
      tab: "budget" as NavTab,
      color: "#1E8A5F"
    },
    {
      icon: MapPin,
      labelKey: "ghostTitle",
      subKey: "ghostTap",
      screen: "ghost" as Screen,
      tab: "map" as NavTab,
      color: "#E8B95C"
    },
    {
      icon: Users,
      labelKey: "socialTitle",
      subKey: "socialQ",
      screen: "social" as Screen,
      tab: "reports" as NavTab,
      color: "#3B82F6"
    },
    {
      icon: AlertOctagon,
      labelKey: "contraTitle",
      subKey: "contraFilter",
      screen: "contradiction" as Screen,
      tab: "reports" as NavTab,
      color: "#E3433D"
    },
    {
      icon: FileText,
      labelKey: "foiTitle",
      subKey: "foiLabel",
      screen: "foi" as Screen,
      tab: "reports" as NavTab,
      color: "#A78BFA"
    },
    {
      icon: Radio,
      labelKey: "reportTitle",
      subKey: "reportCategory",
      screen: "reporter" as Screen,
      tab: "reports" as NavTab,
      color: "#F97316"
    },
    {
      icon: Award,
      labelKey: "profileScore",
      subKey: "profilePromises",
      screen: "profile" as Screen,
      tab: "profile" as NavTab,
      color: "#E8B95C"
    }
  ];

  const recentAlerts = [
    {
      id: 1,
      title: "Delta State COVID Fund — 90.2% unspent",
      location: "Delta State",
      severity: "critical" as BadgeLevel,
      gap: "90.2%"
    },
    {
      id: 2,
      title: "FCT Ghost Project — Centre Never Built",
      location: "Abuja, FCT",
      severity: "critical" as BadgeLevel,
      gap: "~90%"
    },
    {
      id: 3,
      title: "Kano Water Treatment — Funds Diverted",
      location: "Kano State",
      severity: "high" as BadgeLevel,
      gap: "74%"
    }
  ];

  const handleNavigate = (screen: Screen, tab: NavTab) => {
    setScreen(screen);
    setTab(tab);
  };

  return (
    <div className="pb-6 px-4 space-y-5 fade-in">
      {/* Flagship Hero Card */}
      <div className="mt-4 rounded-2xl overflow-hidden border border-white/[0.07] relative bg-[#0A1A12] shadow-xl">
        {/* Ledger grid background */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(30,138,95,0.15) 24px, rgba(30,138,95,0.15) 25px), repeating-linear-gradient(90deg, transparent, transparent 24px, rgba(30,138,95,0.15) 24px, rgba(30,138,95,0.15) 25px)"
          }}
        />
        
        <div className="relative p-5">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="bg-[#E3433D]/25 border border-[#E3433D]/45 text-[#FF6B65] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              LIVE · {t("verified")}
            </span>
          </div>
          <p className="text-[#8B949E] text-xs mb-1 font-medium">{t("greeting")}</p>
          <h1
            className="text-[#E8EDF2] text-xl font-bold leading-tight mb-2"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {t("heroStat")}
          </h1>
          <p className="text-[#8B949E] text-sm mb-4 leading-snug">{t("heroStatSub")}</p>
          
          <div className="flex gap-2.5 mb-4">
            <div className="flex-1 bg-[#161B22] rounded-xl p-3 border border-white/[0.06]">
              <p
                className="text-[#E3433D] text-lg font-bold tabular-nums"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                9.81%
              </p>
              <p className="text-[#8B949E] text-[10px] mt-0.5 font-medium">utilized</p>
            </div>
            <div className="flex-1 bg-[#161B22] rounded-xl p-3 border border-white/[0.06]">
              <p
                className="text-[#E8B95C] text-lg font-bold tabular-nums"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                ₦14.43B
              </p>
              <p className="text-[#8B949E] text-[10px] mt-0.5 font-medium">unaccounted</p>
            </div>
          </div>

          <button
            onClick={() => handleNavigate("budget", "budget")}
            className="w-full bg-[#1E8A5F] hover:bg-[#26A674] text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md shadow-[#1E8A5F]/20"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {t("ctaPrimary")}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Quick Tools Access Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2
            className="text-[#E8EDF2] text-sm font-semibold uppercase tracking-wider"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {t("quickFeatures")}
          </h2>
          <span
            className="text-[#8B949E] text-[10px] font-bold"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {features.length} tools
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {features.map((f, i) => (
            <button
              key={i}
              onClick={() => handleNavigate(f.screen, f.tab)}
              className="bg-[#161B22] border border-white/[0.07] hover:border-white/[0.15] rounded-xl p-3.5 flex flex-col gap-2.5 text-left active:scale-[0.97] transition-all hover:bg-[#1C2128]"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shadow-inner"
                style={{ background: `${f.color}15` }}
              >
                <f.icon size={16} style={{ color: f.color }} />
              </div>
              <div>
                <p
                  className="text-[#E8EDF2] text-xs font-semibold leading-tight"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  {t(f.labelKey)}
                </p>
                <p className="text-[#8B949E] text-[9px] mt-0.5 leading-snug truncate">
                  {t(f.subKey)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Alerts Feed */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2
            className="text-[#E8EDF2] text-sm font-semibold uppercase tracking-wider"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {t("recentAlerts")}
          </h2>
          <button
            onClick={() => handleNavigate("contradiction", "reports")}
            className="text-[#1E8A5F] hover:text-[#26B07A] text-[10px] font-bold flex items-center gap-0.5"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {t("viewAll")} <ChevronRight size={12} />
          </button>
        </div>
        <div className="space-y-2">
          {recentAlerts.map((a) => (
            <button
              key={a.id}
              onClick={() => handleNavigate("contradiction", "reports")}
              className="w-full bg-[#161B22] border border-white/[0.07] hover:border-white/[0.15] rounded-xl p-3 text-left flex items-start gap-3 active:scale-[0.99] transition-all hover:bg-[#1C2128]"
            >
              <div className="mt-2 shrink-0">
                <AlertBadge level={a.severity} label={t(`severity_${a.severity.substring(0, 3)}`)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#E8EDF2] text-xs font-medium leading-snug truncate">
                  {a.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-[#8B949E] text-[10px]"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {a.location}
                  </span>
                  <span className="text-white/10 text-[10px]">·</span>
                  <span
                    className="text-[#E3433D] text-[10px] font-bold tabular-nums"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {a.gap} gap
                  </span>
                </div>
              </div>
              <ChevronRight size={14} className="text-[#8B949E] shrink-0 mt-2" />
            </button>
          ))}
        </div>
      </div>

      {/* Shield Source Disclaimer */}
      <div className="p-3.5 bg-[#1C2128] rounded-xl border border-white/[0.06] flex items-start gap-3">
        <Shield size={14} className="text-[#1E8A5F] shrink-0 mt-0.5" />
        <p className="text-[#8B949E] text-[10px] leading-relaxed">
          {t("appName")} uses official federal/state budgets, investigative reports from ICIR and Premium Times, and verified crowdsourced data. All entries are subject to strict cross-referencing.
        </p>
      </div>
    </div>
  );
}
