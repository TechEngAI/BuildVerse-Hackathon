import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CivicCard } from "../components/CivicCard";
import { ChartWrapper } from "../components/ChartWrapper";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { BarChart2, Upload, XCircle, Zap, RefreshCw } from "lucide-react";

const budgetData = [
  { cat: "Roads", allocated: 16.0, actual: 1.57 },
  { cat: "Health", allocated: 8.2, actual: 5.1 },
  { cat: "Education", allocated: 12.0, actual: 9.8 },
  { cat: "Water", allocated: 4.5, actual: 0.8 },
  { cat: "Security", allocated: 6.0, actual: 5.2 }
];

export function BudgetTracker() {
  const { t } = useTranslation();
  const [state, setState] = useState<"upload" | "analyzing" | "results">("upload");
  const [progress, setProgress] = useState(0);

  const handleUpload = () => {
    setState("analyzing");
    setProgress(0);
  };

  useEffect(() => {
    if (state !== "analyzing") return;
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setState("results");
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [state]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1C2128] border border-white/[0.1] rounded-lg p-2.5 text-xs shadow-xl">
          <p className="text-[#E8EDF2] font-semibold mb-1">{payload[0]?.payload?.cat}</p>
          {payload.map((p: any, i: number) => (
            <p 
              key={i} 
              className="tabular-nums font-medium font-dm-mono" 
              style={{ color: p.fill } as React.CSSProperties}
            >
              {p.name}: ₦{p.value}B
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 space-y-4 fade-in">
      <AnimatePresence mode="wait">
        {state === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <CivicCard className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-[#1E8A5F]/15 rounded-lg flex items-center justify-center border border-[#1E8A5F]/30">
                  <BarChart2 size={16} className="text-[#1E8A5F]" />
                </div>
                <div>
                  <h3 className="text-[#E8EDF2] text-sm font-semibold font-sora">
                    {t("budgetTitle")}
                  </h3>
                  <p className="text-[#8B949E] text-[10px]">{t("budgetExtract")}</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleUpload}
                className="w-full border-2 border-dashed border-[#1E8A5F]/30 rounded-xl p-8 flex flex-col items-center gap-3 text-center bg-[#1E8A5F]/[0.03] transition-all hover:border-[#1E8A5F]/60"
              >
                <div className="w-12 h-12 bg-[#1E8A5F]/15 rounded-xl flex items-center justify-center border border-[#1E8A5F]/20">
                  <Upload size={22} className="text-[#1E8A5F]" />
                </div>
                <div>
                  <p className="text-[#E8EDF2] text-sm font-medium font-sora">
                    {t("budgetUpload")}
                  </p>
                  <p className="text-[#8B949E] text-xs mt-1">{t("budgetDrag")}</p>
                </div>
                <span
                  className="text-[10px] text-[#8B949E] bg-[#21262D] px-3 py-1 rounded-full border border-white/[0.06] font-dm-mono"
                >
                  PDF · max 50MB
                </span>
              </motion.button>
            </CivicCard>

            <CivicCard className="p-4">
              <p className="text-[#8B949E] text-[10px] uppercase tracking-widest mb-3 font-dm-mono">
                How CivicPulse AI analyzes budgets:
              </p>
              {[
                "Extract all ledger/table structures from PDF",
                "Isolate Allocated vs Spent figures per line-item",
                "Calculate deviation percentages automatically",
                "Flag deviations exceeding the 25% threshold"
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3 mb-2.5 last:mb-0">
                  <div className="w-5 h-5 rounded-full bg-[#1E8A5F]/15 border border-[#1E8A5F]/35 flex items-center justify-center shrink-0">
                    <span className="text-[#1E8A5F] text-[9px] font-bold font-dm-mono">
                      {i + 1}
                    </span>
                  </div>
                  <p className="text-[#C4C9D0] text-xs font-medium">{step}</p>
                </div>
              ))}
            </CivicCard>
          </motion.div>
        )}

        {state === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <CivicCard className="p-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 bg-[#1E8A5F]/10 rounded-full flex items-center justify-center border border-[#1E8A5F]/20 relative">
                  <div className="absolute inset-0 border-2 border-[#1E8A5F] border-t-transparent rounded-full animate-spin" />
                  <BarChart2 size={20} className="text-[#1E8A5F]" />
                </div>
                <div>
                  <h3 className="text-[#E8EDF2] text-sm font-semibold mb-1 font-sora">
                    {t("budgetAnalyzing")}
                  </h3>
                  <p className="text-[#8B949E] text-xs">{t("budgetExtract")}</p>
                </div>
                <div className="w-full bg-[#21262D] rounded-full h-2 overflow-hidden border border-white/[0.04]">
                  <div
                    className="bg-[#1E8A5F] h-full rounded-full transition-all duration-100 w-[var(--progress-width)]"
                    style={{ "--progress-width": `${progress}%` } as React.CSSProperties}
                  />
                </div>
                <p className="text-[#8B949E] text-[10px] tabular-nums font-dm-mono">
                  {progress}% completed
                </p>
              </div>
            </CivicCard>
            <ChartWrapper isLoading title="Extracting Chart Data" children={null} />
          </motion.div>
        )}

        {state === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Irregularity Warning Panel */}
            <div className="bg-[#E3433D]/10 border border-[#E3433D]/40 rounded-xl p-3.5 flex items-start gap-3 shadow-md">
              <XCircle size={18} className="text-[#E3433D] shrink-0 mt-0.5" />
              <div>
                <p className="text-[#E3433D] text-xs font-bold mb-1 font-sora">
                  {t("budgetAlert")}
                </p>
                <p className="text-[#8B949E] text-[10px] leading-snug">
                  Road construction deviation has triggered a critical financial irregularity warning.
                </p>
              </div>
            </div>

            {/* Recharts chart */}
            <ChartWrapper title={t("budgetTitle") + " (₦ Billion)"}>
              <div className="h-[200px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetData} barGap={3} barCategoryGap="25%">
                    <XAxis
                      dataKey="cat"
                      tick={{ fill: "#8B949E", fontSize: 10, fontFamily: "'DM Mono', monospace" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#8B949E", fontSize: 10, fontFamily: "'DM Mono', monospace" }}
                      axisLine={false}
                      tickLine={false}
                      width={25}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                    <Bar dataKey="allocated" name={t("budgetAllocated")} fill="#1E8A5F" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="actual" name={t("budgetActual")} fill="#E8B95C" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex items-center gap-4 mt-2 px-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#1E8A5F]" />
                  <span className="text-[#8B949E] text-[10px] font-medium">{t("budgetAllocated")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#E8B95C]" />
                  <span className="text-[#8B949E] text-[10px] font-medium">{t("budgetActual")}</span>
                </div>
              </div>
            </ChartWrapper>

            {/* Deviation Table Grid */}
            <CivicCard className="overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.06] bg-white/[0.01]">
                <p className="text-[#8B949E] text-[10px] uppercase tracking-widest font-dm-mono">
                  {t("budgetDeviation")} analysis
                </p>
              </div>
              {budgetData.map((d, i) => {
                const dev = Math.abs(((d.allocated - d.actual) / d.allocated) * 100);
                const isCritical = dev > 25;
                return (
                  <div
                    key={i}
                    className={`px-4 py-3 border-b border-white/[0.04] last:border-0 flex items-center gap-3 ${
                      isCritical ? "bg-[#E3433D]/[0.04]" : ""
                    }`}
                  >
                    <span className="text-[#C4C9D0] text-xs font-semibold w-20 shrink-0">{d.cat}</span>
                    <div className="flex-1">
                      <div className="h-1.5 bg-[#21262D] rounded-full overflow-hidden border border-white/[0.03]">
                        <div
                          className={`h-full rounded-full w-[var(--progress-width)] ${isCritical ? "bg-[#E3433D]" : "bg-[#1E8A5F]"}`}
                          style={{ "--progress-width": `${(d.actual / d.allocated) * 100}%` } as React.CSSProperties}
                        />
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold tabular-nums w-12 text-right ${
                        isCritical ? "text-[#E3433D]" : "text-[#8B949E]"
                      } font-dm-mono`}
                    >
                      {dev.toFixed(1)}%
                    </span>
                    {isCritical && <XCircle size={13} className="text-[#E3433D] shrink-0" />}
                  </div>
                );
              })}
            </CivicCard>

            {/* AI Ledger Summary */}
            <CivicCard severity="critical" className="p-4">
              <div className="flex items-center gap-2 mb-2.5">
                <Zap size={14} className="text-[#E8B95C]" />
                <p className="text-[#E8B95C] text-[10px] font-bold uppercase tracking-wider font-dm-mono">
                  AI Analysis Ledger
                </p>
              </div>
              <p className="text-[#C4C9D0] text-xs leading-relaxed font-medium">
                {t("budgetSummary")}
              </p>
              <p className="text-[#8B949E] text-[10px] mt-3.5 pt-3 border-t border-white/[0.06] font-medium font-dm-mono">
                {t("budgetSrc")}
              </p>
            </CivicCard>

            <button
              onClick={() => setState("upload")}
              className="w-full bg-[#1C2128] hover:bg-[#21262D] border border-white/[0.07] text-[#8B949E] hover:text-white text-sm py-3 rounded-xl font-semibold active:opacity-70 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} />
              Upload Another Document
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
