import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CivicCard } from "../components/CivicCard";
import {
  Award, ShieldAlert, CheckCircle, Clock, XCircle, ThumbsUp, ThumbsDown, Link, Globe
} from "lucide-react";

const promises = [
  { id: 1, title: "Complete Lagos–Asaba Expressway", status: "failed", evidence: "road.ng/lagos-asaba-2023", agree: 1204, disagree: 89, date: "10 Apr 2019" },
  { id: 2, title: "Build 200 new primary schools across Delta", status: "partial", evidence: "stateedu.gov.ng/schools", agree: 567, disagree: 234, date: "10 Apr 2019" },
  { id: 3, title: "Clear all civil servant salary arrears", status: "delivered", evidence: "deltastate.gov.ng/payroll", agree: 892, disagree: 156, date: "15 Jan 2020" },
  { id: 4, title: "Construct 500 boreholes in rural communities", status: "failed", evidence: "waterboard.ng/delta", agree: 1567, disagree: 43, date: "10 Apr 2019" },
  { id: 5, title: "Install solar streetlights in all LGAs", status: "partial", evidence: "deltastatepower.gov.ng", agree: 344, disagree: 198, date: "20 May 2019" }
];

export function PoliticianProfile() {
  const { t } = useTranslation();
  const [promiseList, setPromiseList] = useState(promises);

  const handleVote = (id: number, type: "agree" | "disagree") => {
    setPromiseList((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            agree: type === "agree" ? p.agree + 1 : p.agree,
            disagree: type === "disagree" ? p.disagree + 1 : p.disagree
          };
        }
        return p;
      })
    );
  };

  // Accountability Score Ring rendering
  const renderScoreRing = (score: number) => {
    const r = 40;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    
    // Crimson red for low score, Gold for medium, Green for high
    const color = score >= 70 ? "#1E8A5F" : score >= 40 ? "#E8B95C" : "#E3433D";

    return (
      <svg width="100" height="100" viewBox="0 0 100 100" className="shrink-0 drop-shadow-md">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1C2128" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <text x="50" y="47" textAnchor="middle" fill={color} fontSize="20" fontWeight="700" style={{ fontFamily: "'DM Mono', monospace" }}>
          {score}
        </text>
        <text x="50" y="63" textAnchor="middle" fill="#8B949E" fontSize="8" style={{ fontFamily: "'Inter', sans-serif" }}>
          / 100
        </text>
      </svg>
    );
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "delivered":
        return { color: "text-[#26B07A]", bg: "bg-[#1E8A5F]/10", border: "border-[#1E8A5F]/20", label: t("profileDelivered"), Icon: CheckCircle };
      case "partial":
        return { color: "text-[#FCD34D]", bg: "bg-[#E8B95C]/10", border: "border-[#E8B95C]/20", label: t("profilePartial"), Icon: Clock };
      default:
        return { color: "text-[#FF6B65]", bg: "bg-[#E3433D]/10", border: "border-[#E3433D]/20", label: t("profileFailed"), Icon: XCircle };
    }
  };

  return (
    <div className="p-4 space-y-4 fade-in">
      {/* Politician Profile Summary */}
      <CivicCard className="p-4 flex gap-4 items-center" severity="critical">
        {renderScoreRing(47)}
        
        <div className="flex-1 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[#8B949E] text-[9px] uppercase tracking-widest font-mono">Executive Audit</span>
          </div>
          <h3 className="text-[#E8EDF2] text-sm font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
            Governor Ifeanyi Okowa
          </h3>
          <p className="text-[#8B949E] text-[10px]">Former Governor, Delta State</p>
          <div className="pt-2 flex items-center gap-1.5">
            <span className="bg-[#E3433D]/25 border border-[#E3433D]/30 text-[#FF6B65] text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
              Convicted 2022
            </span>
          </div>
        </div>
      </CivicCard>

      {/* Preservation Warning */}
      <div className="p-3 bg-[#1C2128] rounded-xl border border-white/[0.06] flex items-start gap-2.5">
        <ShieldAlert size={14} className="text-[#E3433D] shrink-0 mt-0.5" />
        <p className="text-[#8B949E] text-[10px] leading-relaxed">
          {t("profileHistory")}
        </p>
      </div>

      {/* Promises Tracker ledger */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-[#E8EDF2] text-[11px] uppercase tracking-widest" style={{ fontFamily: "'DM Mono', monospace" }}>
            Campaign Promises Ledger
          </h4>
          <span className="text-[#8B949E] text-[10px]" style={{ fontFamily: "'DM Mono', monospace" }}>
            {promiseList.length} total
          </span>
        </div>

        <div className="space-y-3">
          {promiseList.map((p) => {
            const cfg = getStatusConfig(p.status);
            const StatusIcon = cfg.Icon;
            return (
              <CivicCard key={p.id} className="p-4 space-y-3">
                {/* Header */}
                <div className="flex justify-between items-start gap-3">
                  <p className="text-[#E8EDF2] text-xs font-semibold leading-snug">
                    {p.title}
                  </p>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider flex items-center gap-1 shrink-0 ${cfg.bg} ${cfg.border} ${cfg.color}`} style={{ fontFamily: "'DM Mono', monospace" }}>
                    <StatusIcon size={9} />
                    {cfg.label}
                  </span>
                </div>

                {/* Evidence and verification voting */}
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.04] text-[10px]">
                  <a
                    href={`https://${p.evidence}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[#1E8A5F] hover:underline"
                  >
                    <Link size={10} />
                    <span>Evidence link</span>
                  </a>

                  {/* Citizen Verification voting */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVote(p.id, "agree")}
                      className="flex items-center gap-1 text-[#8B949E] hover:text-[#1E8A5F] transition-colors"
                      title="Citizen confirms this claim"
                    >
                      <ThumbsUp size={11} />
                      <span className="tabular-nums font-mono text-[9px]">{p.agree}</span>
                    </button>
                    <span className="text-white/10">|</span>
                    <button
                      onClick={() => handleVote(p.id, "disagree")}
                      className="flex items-center gap-1 text-[#8B949E] hover:text-[#E3433D] transition-colors"
                      title="Citizen disputes this claim"
                    >
                      <ThumbsDown size={11} />
                      <span className="tabular-nums font-mono text-[9px]">{p.disagree}</span>
                    </button>
                  </div>
                </div>
              </CivicCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
