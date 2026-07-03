import { useTranslation } from "react-i18next";
import { useAppStore, Screen, NavTab } from "../store/useAppStore";
import { AlertBadge, BadgeLevel } from "../components/AlertBadge";
import { motion } from "motion/react";
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
      textColor: "text-[#1E8A5F]",
      bgColor: "bg-[#1E8A5F]/15"
    },
    {
      icon: MapPin,
      labelKey: "ghostTitle",
      subKey: "ghostTap",
      screen: "ghost" as Screen,
      tab: "map" as NavTab,
      textColor: "text-[#E8B95C]",
      bgColor: "bg-[#E8B95C]/15"
    },
    {
      icon: Users,
      labelKey: "socialTitle",
      subKey: "socialQ",
      screen: "social" as Screen,
      tab: "reports" as NavTab,
      textColor: "text-[#3B82F6]",
      bgColor: "bg-[#3B82F6]/15"
    },
    {
      icon: AlertOctagon,
      labelKey: "contraTitle",
      subKey: "contraFilter",
      screen: "contradiction" as Screen,
      tab: "reports" as NavTab,
      textColor: "text-[#E3433D]",
      bgColor: "bg-[#E3433D]/15"
    },
    {
      icon: FileText,
      labelKey: "foiTitle",
      subKey: "foiLabel",
      screen: "foi" as Screen,
      tab: "reports" as NavTab,
      textColor: "text-[#A78BFA]",
      bgColor: "bg-[#A78BFA]/15"
    },
    {
      icon: Radio,
      labelKey: "reportTitle",
      subKey: "reportCategory",
      screen: "reporter" as Screen,
      tab: "reports" as NavTab,
      textColor: "text-[#F97316]",
      bgColor: "bg-[#F97316]/15"
    },
    {
      icon: Award,
      labelKey: "profileScore",
      subKey: "profilePromises",
      screen: "profile" as Screen,
      tab: "profile" as NavTab,
      textColor: "text-[#E8B95C]",
      bgColor: "bg-[#E8B95C]/15"
    },
    {
      icon: Shield,
      labelKey: "AI Audit Labs",
      subKey: "50 Premium Features",
      screen: "labs" as Screen,
      tab: "profile" as NavTab,
      textColor: "text-[#1E8A5F]",
      bgColor: "bg-[#1E8A5F]/15"
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

  // Framer Motion Container Variant for staggering animations
  const listContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const listItem = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="pb-6 px-4 space-y-5 fade-in">
      {/* Premium Animated Hero Card */}
      <div className="mt-4 rounded-2xl overflow-hidden border border-white/[0.07] relative bg-[#090C10] shadow-xl h-[260px] flex flex-col justify-end">
        {/* Animated Grid & Glowing background */}
        <div className="absolute inset-0 grid-bg-hero opacity-15 animate-grid-move pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,138,95,0.18),transparent_70%)] animate-glow-pulse pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E1116] via-transparent to-transparent opacity-90 pointer-events-none" />

        <div className="relative p-5 z-10 space-y-2.5">
          <div className="flex items-center gap-2">
            <span
              className="bg-[#E3433D]/25 border border-[#E3433D]/45 text-[#FF6B65] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-dm-mono"
            >
              LIVE · {t("verified")}
            </span>
          </div>
          <div>
            <p className="text-[#8B949E] text-xs font-semibold">{t("greeting")}</p>
            <h1
              className="text-[#E8EDF2] text-lg font-bold leading-tight font-sora mt-0.5"
            >
              {t("heroStat")}
            </h1>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1 bg-[#161B22]/90 backdrop-blur-sm rounded-xl p-2.5 border border-white/[0.06]">
              <p className="text-[#E3433D] text-base font-bold tabular-nums font-dm-mono">
                9.81%
              </p>
              <p className="text-[#8B949E] text-[9px] font-medium">utilized</p>
            </div>
            <div className="flex-1 bg-[#161B22]/90 backdrop-blur-sm rounded-xl p-2.5 border border-white/[0.06]">
              <p className="text-[#E8B95C] text-base font-bold tabular-nums font-dm-mono">
                ₦14.43B
              </p>
              <p className="text-[#8B949E] text-[9px] font-medium">unaccounted</p>
            </div>
          </div>

          <button
            onClick={() => handleNavigate("budget", "budget")}
            className="w-full bg-[#1E8A5F] hover:bg-[#26A674] text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md shadow-[#1E8A5F]/20 font-sora"
          >
            {t("ctaPrimary")}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Quick Tools Access Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2
            className="text-[#E8EDF2] text-xs font-bold uppercase tracking-wider font-sora"
          >
            {t("quickFeatures")}
          </h2>
          <span
            className="text-[#8B949E] text-[10px] font-bold font-dm-mono"
          >
            {features.length} tools
          </span>
        </div>
        
        {/* Animated Staggered Grid */}
        <motion.div 
          variants={listContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-2.5"
        >
          {features.map((f, i) => (
            <motion.button
              variants={listItem}
              whileTap={{ scale: 0.95 }}
              whileHover={{ y: -2, borderColor: "rgba(255,255,255,0.15)" }}
              key={i}
              onClick={() => handleNavigate(f.screen, f.tab)}
              className="bg-[#161B22] border border-white/[0.07] rounded-xl p-3.5 flex flex-col gap-2.5 text-left transition-all hover:bg-[#1C2128]"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-inner ${f.bgColor}`}
              >
                <f.icon size={16} className={f.textColor} />
              </div>
              <div>
                <p
                  className="text-[#E8EDF2] text-xs font-semibold leading-tight font-sora"
                >
                  {t(f.labelKey)}
                </p>
                <p className="text-[#8B949E] text-[9px] mt-0.5 leading-snug truncate">
                  {t(f.subKey)}
                </p>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Recent Alerts Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2
            className="text-[#E8EDF2] text-xs font-bold uppercase tracking-wider font-sora"
          >
            {t("recentAlerts")}
          </h2>
          <button
            onClick={() => handleNavigate("contradiction", "reports")}
            className="text-[#1E8A5F] hover:text-[#26B07A] text-[10px] font-bold flex items-center gap-0.5 font-dm-mono"
          >
            {t("viewAll")} <ChevronRight size={12} />
          </button>
        </div>
        
        <div className="space-y-2">
          {recentAlerts.map((a) => (
            <motion.button
              whileTap={{ scale: 0.99 }}
              key={a.id}
              onClick={() => handleNavigate("contradiction", "reports")}
              className="w-full bg-[#161B22] border border-white/[0.07] hover:border-white/[0.15] rounded-xl p-3 text-left flex items-start gap-3 transition-all hover:bg-[#1C2128]"
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
                    className="text-[#8B949E] text-[10px] font-dm-mono"
                  >
                    {a.location}
                  </span>
                  <span className="text-white/10 text-[10px]">·</span>
                  <span
                    className="text-[#E3433D] text-[10px] font-bold tabular-nums font-dm-mono"
                  >
                    {a.gap} gap
                  </span>
                </div>
              </div>
              <ChevronRight size={14} className="text-[#8B949E] shrink-0 mt-2" />
            </motion.button>
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
