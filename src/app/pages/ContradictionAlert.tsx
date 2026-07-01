import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore, Screen, NavTab } from "../store/useAppStore";
import { CivicCard } from "../components/CivicCard";
import { AlertBadge, BadgeLevel } from "../components/AlertBadge";
import {
  AlertTriangle, Filter, ChevronRight, Share2, FileText, ArrowRight, ShieldCheck, HelpCircle
} from "lucide-react";

const alerts = [
  { id: 1, title: "Delta State COVID Fund — 90.2% unspent", location: "Delta State", date: "15 Mar 2024", severity: "critical" as BadgeLevel, summary: "Official: ₦16B disbursed to vulnerable citizens. Beneficiary records: <2% confirmed receipt.", gap: "90.2%", sources: 5 },
  { id: 2, title: "FCT Ghost Project — Centre Never Built", location: "Abuja, FCT", date: "12 Mar 2024", severity: "critical" as BadgeLevel, summary: "Contractor paid ₦45.2M for community centre. Physical inspection: empty plot with foundation only.", gap: "~90%", sources: 4 },
  { id: 3, title: "Kano Water Treatment — Funds Diverted", location: "Kano State", date: "10 Mar 2024", severity: "high" as BadgeLevel, summary: "₦180M allocated for treatment upgrade. Citizens report: water still untreated, plant non-operational.", gap: "74%", sources: 3 },
  { id: 4, title: "Lagos Road Contract Overpayment", location: "Lagos State", date: "8 Mar 2024", severity: "medium" as BadgeLevel, summary: "Road widening paid at 3x market rate. International benchmarks confirm significant cost inflation.", gap: "31%", sources: 3 },
  { id: 5, title: "Ogun School Feeding Shortfall", location: "Ogun State", date: "6 Mar 2024", severity: "medium" as BadgeLevel, summary: "Government: 100% of pupils fed daily. School records: feeding stopped after 3 months.", gap: "62%", sources: 2 }
];

const sourceComparisons = [
  { src: "contraGovt", claim: "₦16.8B disbursed to 2.4M beneficiaries", reliability: "Unverified", status: "warning" },
  { src: "contraIntl", claim: "World Bank: programme reached 340K verified beneficiaries", reliability: "High", status: "ok" },
  { src: "contraMedia", claim: "Multiple states report empty distribution centres (Punch, Aug 2022)", reliability: "Moderate", status: "ok" },
  { src: "contraBench", claim: "Similar programmes in Kenya, Ghana: avg 78% reach rate", reliability: "High", status: "ok" },
  { src: "contraCitizen", claim: "CivicPulse reports: 12.4% confirmed receipt (n=8,204)", reliability: "Crowdsourced", status: "warning" }
];

export function ContradictionAlert() {
  const { t } = useTranslation();
  const { setScreen, setTab } = useAppStore();
  const [filter, setFilter] = useState<"all" | "critical" | "high" | "medium">("all");
  const [selectedAlert, setSelectedAlert] = useState<typeof alerts[0] | null>(null);

  const filteredAlerts = alerts.filter((a) => {
    if (filter === "all") return true;
    return a.severity === filter;
  });

  const getReliabilityStyles = (rel: string) => {
    switch (rel) {
      case "High":
        return "bg-[#1E8A5F]/15 border-[#1E8A5F]/30 text-[#26B07A]";
      case "Moderate":
        return "bg-[#3B82F6]/15 border-[#3B82F6]/30 text-[#60A5FA]";
      case "Crowdsourced":
        return "bg-[#E8B95C]/15 border-[#E8B95C]/30 text-[#FCD34D]";
      default:
        return "bg-[#E3433D]/15 border-[#E3433D]/30 text-[#FF6B65]";
    }
  };

  const handleRouteToFoi = () => {
    setScreen("foi");
    setTab("reports");
  };

  return (
    <div className="p-4 space-y-4 fade-in">
      {!selectedAlert ? (
        <div className="space-y-4">
          {/* Feed Title */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[#E8EDF2] text-sm font-semibold" style={{ fontFamily: "'Sora', sans-serif" }}>
                {t("contraTitle")}
              </h3>
              <p className="text-[#8B949E] text-[10px]">AI-identified mismatch records</p>
            </div>
            <div className="w-8 h-8 bg-white/[0.03] border border-white/[0.06] rounded-lg flex items-center justify-center text-[#8B949E]">
              <AlertTriangle size={15} />
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none">
            <div className="text-[#8B949E] shrink-0 mr-1.5 flex items-center gap-1">
              <Filter size={11} />
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Filter</span>
            </div>
            {(["all", "critical", "high", "medium"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border shrink-0 ${
                  filter === f
                    ? "bg-[#1E8A5F] text-white border-[#1E8A5F]"
                    : "bg-[#161B22] border-white/[0.06] text-[#8B949E] hover:text-white"
                }`}
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Alert List */}
          <div className="space-y-2.5">
            {filteredAlerts.map((a) => (
              <CivicCard
                key={a.id}
                severity={a.severity === "critical" ? "critical" : a.severity === "high" ? "warning" : "neutral"}
                onClick={() => setSelectedAlert(a)}
                className="p-3"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className="text-[#E8EDF2] text-xs font-semibold leading-snug truncate">
                      {a.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[#8B949E] text-[10px] font-mono">{a.location}</span>
                      <span className="text-white/10 text-[10px]">·</span>
                      <span className="text-[#E3433D] text-[10px] font-bold tabular-nums" style={{ fontFamily: "'DM Mono', monospace" }}>
                        {a.gap} Gap
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={15} className="text-[#8B949E] mt-1 shrink-0" />
                </div>
              </CivicCard>
            ))}
          </div>
        </div>
      ) : (
        /* Detailed Source Comparison view */
        <div className="space-y-4 slide-up">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <button
              onClick={() => setSelectedAlert(null)}
              className="text-[#8B949E] hover:text-white text-xs font-semibold flex items-center gap-1"
            >
              Back to Alert Feed
            </button>
            <div className="flex items-center gap-1.5">
              <Share2 size={13} className="text-[#8B949E] cursor-pointer hover:text-white" />
            </div>
          </div>

          {/* Alert Overview */}
          <CivicCard severity={selectedAlert.severity === "critical" ? "critical" : "neutral"} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <AlertBadge level={selectedAlert.severity} label={selectedAlert.severity.toUpperCase()} />
              <span className="text-[#8B949E] text-[9px] font-mono">{selectedAlert.date}</span>
            </div>
            <h2 className="text-[#E8EDF2] text-sm font-bold leading-snug" style={{ fontFamily: "'Sora', sans-serif" }}>
              {selectedAlert.title}
            </h2>
            <p className="text-[#8B949E] text-[10px] mt-2 leading-relaxed">
              {selectedAlert.summary}
            </p>
          </CivicCard>

          {/* Source Comparison ledger */}
          <div className="space-y-2.5">
            <p className="text-[#8B949E] text-[10px] uppercase tracking-widest px-1" style={{ fontFamily: "'DM Mono', monospace" }}>
              {t("contraDetail")} (5 sources matched)
            </p>

            <div className="space-y-2">
              {sourceComparisons.map((c, i) => (
                <div key={i} className="bg-[#161B22] border border-white/[0.06] rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#E8EDF2] text-[10px] font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
                      {t(c.src)}
                    </span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getReliabilityStyles(c.reliability)}`} style={{ fontFamily: "'DM Mono', monospace" }}>
                      {c.reliability}
                    </span>
                  </div>
                  <p className="text-[#C4C9D0] text-xs leading-relaxed font-medium">
                    "{c.claim}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Audit / FOI CTA */}
          <CivicCard className="p-4" severity="warning">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={14} className="text-[#E8B95C]" />
              <p className="text-[#E8B95C] text-[10px] font-bold uppercase tracking-wider" style={{ fontFamily: "'DM Mono', monospace" }}>
                Official Discrepancy Found
              </p>
            </div>
            <p className="text-[#8B949E] text-[10px] leading-relaxed mb-3.5">
              The deviation between government declarations and third-party/crowdsourced audits exceeds the standard 15% tolerance. You can demand official audits by sending a legal Freedom of Information request.
            </p>
            <button
              onClick={handleRouteToFoi}
              className="w-full bg-[#1E8A5F] hover:bg-[#26A674] text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all shadow-md shadow-[#1E8A5F]/15"
            >
              <FileText size={14} />
              Generate Legal FOI Letter
              <ArrowRight size={12} />
            </button>
          </CivicCard>
        </div>
      )}
    </div>
  );
}
