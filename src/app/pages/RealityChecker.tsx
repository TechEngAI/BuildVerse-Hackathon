import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../store/useAppStore";
import { CivicCard } from "../components/CivicCard";
import { ChartWrapper } from "../components/ChartWrapper";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Users, Check, AlertOctagon, HelpCircle } from "lucide-react";

export function RealityChecker() {
  const { t } = useTranslation();
  const { isOffline, citizenPollStats, addCitizenPoll } = useAppStore();
  const [hasVoted, setHasVoted] = useState(false);
  const [votedOption, setVotedOption] = useState<string | null>(null);

  const handleVote = async (option: "yes" | "no" | "partial") => {
    setVotedOption(option);
    setHasVoted(true);
    
    // Save report to IndexedDB / Zustand
    await addCitizenPoll("TraderMoni / Market Hawker Fund", option);
  };

  const totalVotes = citizenPollStats.yes + citizenPollStats.no + citizenPollStats.partial;
  const matchPercentage = totalVotes > 0 ? (citizenPollStats.yes / totalVotes) * 100 : 0;

  // Recharts representation
  const comparisonData = [
    { name: "Official claim", percentage: 100, fill: "#1E8A5F" },
    { name: "Citizen reality", percentage: Math.round(matchPercentage), fill: "#E3433D" }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1C2128] border border-white/[0.1] rounded-lg p-2 text-xs shadow-xl font-mono">
          <p className="text-[#E8EDF2] font-semibold">{payload[0]?.name}</p>
          <p className="text-white font-bold mt-0.5">{payload[0]?.value}% reach</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 space-y-4 fade-in">
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#3B82F6]/15 rounded-lg flex items-center justify-center border border-[#3B82F6]/30">
          <Users size={16} className="text-[#3B82F6]" />
        </div>
        <div>
          <h3 className="text-[#E8EDF2] text-sm font-semibold" style={{ fontFamily: "'Sora', sans-serif" }}>
            {t("socialTitle")}
          </h3>
          <p className="text-[#8B949E] text-[10px]">Crowdsourced disbursement auditor</p>
        </div>
      </div>

      {/* Program Details */}
      <CivicCard className="p-4">
        <p className="text-[#8B949E] text-[9px] uppercase tracking-widest font-mono">Auditing Program</p>
        <h4 className="text-[#E8EDF2] text-sm font-bold mt-0.5 leading-snug" style={{ fontFamily: "'Sora', sans-serif" }}>
          {t("socialProgram")}
        </h4>
        <p className="text-[#8B949E] text-[10px] mt-1.5 leading-relaxed">
          Federal Gov't declared 100% payout completion (₦12.5B) for micro-loans targeting hawkers and petty traders.
        </p>
      </CivicCard>

      {/* Poll Section */}
      <CivicCard className="p-4" severity={hasVoted ? "neutral" : "warning"}>
        {!hasVoted ? (
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <HelpCircle size={14} className="text-[#E8B95C]" />
              <p className="text-[#E8EDF2] text-xs font-semibold">{t("socialQ")}</p>
            </div>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleVote("yes")}
                className="w-full bg-[#1C2128] hover:bg-[#1E8A5F] hover:text-white border border-white/[0.06] text-[#C4C9D0] text-xs font-semibold py-3 rounded-xl transition-all active:scale-[0.98]"
              >
                {t("socialYes")}
              </button>
              <button
                onClick={() => handleVote("no")}
                className="w-full bg-[#1C2128] hover:bg-[#E3433D] hover:text-white border border-white/[0.06] text-[#C4C9D0] text-xs font-semibold py-3 rounded-xl transition-all active:scale-[0.98]"
              >
                {t("socialNo")}
              </button>
              <button
                onClick={() => handleVote("partial")}
                className="w-full bg-[#1C2128] hover:bg-[#E8B95C] hover:text-[#0E1116] border border-white/[0.06] text-[#C4C9D0] text-xs font-semibold py-3 rounded-xl transition-all active:scale-[0.98]"
              >
                {t("socialPartial")}
              </button>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center space-y-3 slide-up">
            <div className="w-9 h-9 rounded-full bg-[#1E8A5F]/15 border border-[#1E8A5F]/30 flex items-center justify-center mx-auto">
              <Check size={18} className="text-[#1E8A5F]" />
            </div>
            <div>
              <p className="text-[#E8EDF2] text-xs font-bold">{t("socialThank")}</p>
              <p className="text-[#8B949E] text-[10px] mt-1">
                {isOffline
                  ? t("reportOffline")
                  : "Report synced! Your feedback updates the official reality score in real-time."}
              </p>
            </div>
          </div>
        )}
      </CivicCard>

      {/* Comparative Charts */}
      <div className="space-y-4">
        <ChartWrapper title={`${t("socialScore")} (reach comparison)`}>
          <div className="h-[180px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} barCategoryGap="40%">
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#8B949E", fontSize: 10, fontFamily: "'Sora', sans-serif" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#8B949E", fontSize: 10, fontFamily: "'DM Mono', monospace" }}
                  axisLine={false}
                  tickLine={false}
                  width={20}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="percentage" radius={[3, 3, 0, 0]} fill="#1E8A5F">
                  {comparisonData.map((entry, index) => (
                    <Bar key={`cell-${index}`} fill={entry.fill} dataKey="percentage" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartWrapper>

        {/* Crowdsourced Metrics */}
        <CivicCard className="p-4" severity="critical">
          <div className="flex items-center gap-2 mb-3">
            <AlertOctagon size={14} className="text-[#E3433D]" />
            <p className="text-[#E3433D] text-[10px] font-bold uppercase tracking-wider" style={{ fontFamily: "'DM Mono', monospace" }}>
              Crowdsourced Discrepancy
            </p>
          </div>
          <p className="text-[#8B949E] text-[10px] leading-relaxed mb-4">
            Only <strong className="text-[#FF6B65] font-bold">{Math.round(matchPercentage)}%</strong> of audited citizens confirm receiving loans. The remaining respondents report partial or zero payments.
          </p>

          <div className="grid grid-cols-3 gap-2 text-center pt-3.5 border-t border-white/[0.05]">
            <div>
              <p className="text-[#8B949E] text-[8px] uppercase tracking-widest font-mono">Confirmed</p>
              <p className="text-[#1E8A5F] text-xs font-bold mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>
                {citizenPollStats.yes}
              </p>
            </div>
            <div>
              <p className="text-[#8B949E] text-[8px] uppercase tracking-widest font-mono">Unreceived</p>
              <p className="text-[#E3433D] text-xs font-bold mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>
                {citizenPollStats.no}
              </p>
            </div>
            <div>
              <p className="text-[#8B949E] text-[8px] uppercase tracking-widest font-mono">Partial</p>
              <p className="text-[#E8B95C] text-xs font-bold mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>
                {citizenPollStats.partial}
              </p>
            </div>
          </div>
        </CivicCard>
      </div>
    </div>
  );
}
