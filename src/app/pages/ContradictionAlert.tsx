import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../store/useAppStore";
import { CivicCard } from "../components/CivicCard";
import { AlertBadge, BadgeLevel } from "../components/AlertBadge";
import { motion } from "motion/react";
import {
  AlertOctagon, Eye, EyeOff, ShieldAlert, ArrowRightLeft, BookOpen, UserCheck, Scale
} from "lucide-react";

interface Discrepancy {
  id: number;
  title: string;
  category: string;
  source1: string;
  source2: string;
  val1: string;
  val2: string;
  severity: BadgeLevel;
  narrative: string;
  isAudited: boolean;
}

const contradictionData: Discrepancy[] = [
  {
    id: 1,
    title: "Delta State COVID Fund Allocation",
    category: "Health Fund",
    source1: "Delta State Govt",
    source2: "CivicPulse Audit",
    val1: "₦12.5B spent",
    val2: "₦1.2B verified",
    severity: "critical",
    narrative: "Federal payout records declare 100% completion of health infrastructure upgrades. Direct citizen verification and procurement logs audit show only 3 of 45 facilities were completed.",
    isAudited: true
  },
  {
    id: 2,
    title: "Lagos-Badagry Rail Project Progress",
    category: "Infrastructure",
    source1: "Ministry of Transport",
    source2: "Independent Media",
    val1: "95% completed",
    val2: "62% completed",
    severity: "high",
    narrative: "Official report claims final signaling and test runs are ongoing. Investigative reports confirm 8km of rail track remain unlaid, with 2 stations abandoned by contractors.",
    isAudited: false
  },
  {
    id: 3,
    title: "National Primary Health Borehole Project",
    category: "Water Supply",
    source1: "Federal Budget Office",
    source2: "NGO Reality Index",
    val1: "200 boreholes built",
    val2: "14 functional",
    severity: "critical",
    narrative: "Budget office reported full disbursement and construction of 200 clean water points. Field audit verified only 14 are operational, with the rest dry or never constructed.",
    isAudited: true
  }
];

export function ContradictionAlert() {
  const { t } = useTranslation();
  const { activeFilter, setActiveFilter } = useAppStore();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredData = contradictionData.filter((item) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "audited") return item.isAudited;
    return !item.isAudited;
  });

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const listContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const listItem = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="p-4 space-y-4 fade-in">
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#E3433D]/15 rounded-lg flex items-center justify-center border border-[#E3433D]/30">
          <AlertOctagon size={16} className="text-[#E3433D]" />
        </div>
        <div>
          <h3 className="text-[#E8EDF2] text-sm font-semibold font-sora">
            {t("contraTitle")}
          </h3>
          <p className="text-[#8B949E] text-[10px]">{t("contraSubtitle")}</p>
        </div>
      </div>

      {/* Tabs Filter Selector */}
      <div className="flex bg-[#1C2128] rounded-xl p-1 border border-white/[0.06]">
        {[
          { key: "all", label: "All Alerts" },
          { key: "audited", label: "Audited Ledger" },
          { key: "unaudited", label: "Pending Verification" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key as any)}
            className={`flex-1 text-center py-2 text-[10px] font-bold rounded-lg transition-all font-dm-mono uppercase tracking-wider ${
              activeFilter === tab.key
                ? "bg-[#1E8A5F] text-white shadow-sm"
                : "text-[#8B949E] hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Alerts List */}
      <motion.div 
        variants={listContainer}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {filteredData.length === 0 ? (
          <div className="text-center py-10 text-[#8B949E] text-xs bg-[#161B22] rounded-xl border border-white/[0.06]">
            No discrepancies found in this category.
          </div>
        ) : (
          filteredData.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <motion.div
                variants={listItem}
                key={item.id}
              >
                <CivicCard className="p-4 space-y-3" severity={item.severity}>
                  {/* Header info */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="text-[#E8EDF2] text-xs font-semibold leading-snug font-sora">
                        {item.title}
                      </h4>
                      <p className="text-[#8B949E] text-[9px] uppercase tracking-wider font-mono mt-0.5">
                        {item.category}
                      </p>
                    </div>
                    <AlertBadge level={item.severity} label={t(`severity_${item.severity.substring(0, 3)}`)} />
                  </div>

                  {/* Side-by-side sources discrepancy comparators */}
                  <div className="grid grid-cols-2 gap-3.5 bg-white/[0.01] p-3 rounded-xl border border-white/[0.04]">
                    <div>
                      <div className="flex items-center gap-1.5 text-[#8B949E] text-[9px] uppercase font-mono tracking-wider">
                        <BookOpen size={10} />
                        <span className="truncate">{item.source1}</span>
                      </div>
                      <p className="text-[#C4C9D0] text-xs font-bold mt-1 font-dm-mono">{item.val1}</p>
                    </div>

                    <div className="border-l border-white/[0.06] pl-3.5">
                      <div className="flex items-center gap-1.5 text-[#E8B95C] text-[9px] uppercase font-mono tracking-wider">
                        <ArrowRightLeft size={10} />
                        <span className="truncate">{item.source2}</span>
                      </div>
                      <p className="text-[#FF6B65] text-xs font-bold mt-1 font-dm-mono">{item.val2}</p>
                    </div>
                  </div>

                  {/* Read narrative details drawer toggle button */}
                  <div className="flex justify-between items-center pt-2.5 border-t border-white/[0.04] text-[10px]">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider font-dm-mono ${
                          item.isAudited
                            ? "bg-[#1E8A5F]/10 border-[#1E8A5F]/35 text-[#26B07A]"
                            : "bg-[#E8B95C]/10 border-[#E8B95C]/35 text-[#FCD34D]"
                        }`}
                      >
                        {item.isAudited ? "Audited" : "Pending Audit"}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="flex items-center gap-1 text-[#1E8A5F] hover:underline"
                    >
                      {isExpanded ? (
                        <>
                          <EyeOff size={11} /> Hide breakdown
                        </>
                      ) : (
                        <>
                          <Eye size={11} /> View discrepancy analysis
                        </>
                      )}
                    </button>
                  </div>

                  {/* Narrative details drawer */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-white/[0.04] space-y-3 slide-up">
                      <p className="text-[#8B949E] text-[10px] leading-relaxed">
                        {item.narrative}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-[9px] text-[#8B949E] font-dm-mono">
                        <div className="flex items-center gap-1">
                          <UserCheck size={11} className="text-[#1E8A5F]" />
                          <span>Auditor Assigned</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Scale size={11} className="text-[#E8B95C]" />
                          <span>Legal Infraction Check</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CivicCard>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Discrepancy warning footer badge info */}
      <div className="p-3.5 bg-[#1C2128] rounded-xl border border-white/[0.06] flex items-start gap-2.5">
        <ShieldAlert size={14} className="text-[#E3433D] shrink-0 mt-0.5" />
        <p className="text-[#8B949E] text-[10px] leading-relaxed">
          Discrepancy Alerts automatically triggers FOI letters to the respective State MDAs.
        </p>
      </div>
    </div>
  );
}
