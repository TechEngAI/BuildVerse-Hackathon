import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CivicCard } from "../components/CivicCard";
import { motion } from "motion/react";
import {
  FileText, Copy, Send, Check, ShieldAlert, AlertCircle, Mail, Clock
} from "lucide-react";
import { apiFetch } from "../store/useAppStore";

type FoiCategory = "road" | "health" | "education" | "budget" | "default";

export function FoiGenerator() {
  const { t } = useTranslation();
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState<FoiCategory>("default");
  
  const [showLetter, setShowLetter] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [localError, setLocalError] = useState("");

  const [foiResponse, setFoiResponse] = useState<{
    letter: string;
    agencyName: string;
    agencyEmail: string;
    dueDate: string;
    requestId: string;
  } | null>(null);

  const getFallbackLetter = () => {
    return `THE FREEDOM OF INFORMATION ACT, 2011

Date: ${new Date().toLocaleDateString()}
To: The Director-General / Head of Agency,
Public Works Department / Relevant LGA Authority,
Federal Republic of Nigeria.

RE: FREEDOM OF INFORMATION (FOI) REQUEST REGARDING PUBLIC EXPENDITURE

Dear Sir/Ma,

This request is made pursuant to the provisions of the Freedom of Information Act 2011, which guarantees the right of citizens to access official records and documents held by government agencies.

Specifically, I am requesting full access to, and certified true copies of, procurement files, payment vouchers, bank disbursement slips, and completion metrics relating to:

"${topic}"

Please note that public institutions have a statutory obligation under Section 4 of the FOI Act 2011 to respond to requests within seven (7) working days of receipt.

Should you refuse this request, you are required under Section 7 of the Act to notify me in writing, stating the specific exemption codes relied upon.

Sincerely,
Auditor Citizen (via CivicPulse Platform)
(Contact details registered on submission file)`;
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    if (topic.length < 10 || topic.length > 1000) {
      setLocalError("Request prompt must be between 10 and 1000 characters.");
      return;
    }

    setGenerating(true);
    setLocalError("");
    setCopied(false);
    setSent(false);

    try {
      const res = await apiFetch("/foi/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question: topic,
          category: category
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to generate FOI request.");
      }
      setFoiResponse({
        letter: data.letter || getFallbackLetter(),
        agencyName: data.agency_name || "Relevant LGA / Public Works Department",
        agencyEmail: data.agency_email || "contact@gov.ng",
        dueDate: data.due_date || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split("T")[0],
        requestId: data.request_id || ""
      });
      setShowLetter(true);
    } catch (err: any) {
      console.warn("Generating with local template fallback:", err);
      setFoiResponse({
        letter: getFallbackLetter(),
        agencyName: "Relevant LGA / Public Works Department",
        agencyEmail: "contact@gov.ng",
        dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split("T")[0],
        requestId: ""
      });
      setShowLetter(true);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!foiResponse) return;
    navigator.clipboard.writeText(foiResponse.letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const renderDeadlineRing = (days: number, total: number) => {
    const r = 24;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - days / total);
    return (
      <svg width="60" height="60" viewBox="0 0 60 60" className="shrink-0">
        <circle cx="30" cy="30" r={r} fill="none" stroke="#1C2128" strokeWidth="5" />
        <circle
          cx="30"
          cy="30"
          r={r}
          fill="none"
          stroke="#E8B95C"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 30 30)"
        />
        <text x="30" y="27" textAnchor="middle" fill="#E8B95C" fontSize="12" fontWeight="700" className="font-dm-mono">
          {days}
        </text>
        <text x="30" y="40" textAnchor="middle" fill="#8B949E" fontSize="7" className="font-inter">
          days
        </text>
      </svg>
    );
  };

  return (
    <div className="p-4 space-y-4 fade-in">
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#A78BFA]/15 rounded-lg flex items-center justify-center border border-[#A78BFA]/30">
          <FileText size={16} className="text-[#A78BFA]" />
        </div>
        <div>
          <h3 className="text-[#E8EDF2] text-sm font-semibold font-sora">
            {t("foiTitle")}
          </h3>
          <p className="text-[#8B949E] text-[10px]">Freedom of Information Act automated requests</p>
        </div>
      </div>

      {!showLetter ? (
        <CivicCard className="p-4 space-y-4">
          {localError && (
            <div className="bg-[#E3433D]/10 border border-[#E3433D]/30 text-[#FF6B65] text-xs rounded-xl p-3 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{localError}</span>
            </div>
          )}

          {/* Category Select Input */}
          <div className="space-y-1.5">
            <label className="text-[#8B949E] text-[10px] uppercase tracking-widest font-mono font-dm-mono font-bold block">
              Project Category
            </label>
            <select
              id="category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as FoiCategory)}
              title="Project Category"
              aria-label="Project Category"
              className="w-full bg-[#1C2128] border border-white/[0.07] rounded-xl px-3 py-2 text-xs text-[#E8EDF2] focus:outline-none focus:border-[#1E8A5F]"
            >
              <option value="default">Default / General Audit</option>
              <option value="road">Road Infrastructure</option>
              <option value="health">Healthcare Facilities</option>
              <option value="education">Schools & Education</option>
              <option value="budget">Budget Discrepancies</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[#8B949E] text-[10px] uppercase tracking-widest font-mono font-dm-mono font-bold block">
              {t("foiLabel")}
            </label>
            <textarea
              required
              rows={4}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t("foiPlaceholder")}
              className="w-full bg-[#1C2128] border border-white/[0.07] rounded-xl px-3 py-2.5 text-xs text-[#E8EDF2] focus:outline-none focus:border-[#1E8A5F] placeholder-white/20 resize-none leading-relaxed"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!topic.trim() || topic.length < 10 || topic.length > 1000 || generating}
            className="w-full bg-[#1E8A5F] disabled:opacity-40 disabled:pointer-events-none text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all shadow-md shadow-[#1E8A5F]/15"
          >
            <FileText size={16} />
            {generating ? "Generating legal letter..." : t("foiGenerate")}
          </button>
        </CivicCard>
      ) : (
        <div className="space-y-4 slide-up">
          {/* Action Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowLetter(false)}
              className="text-[#8B949E] hover:text-white text-xs font-semibold"
            >
              Edit request prompt
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[10px] bg-[#1C2128] border border-white/[0.06] text-[#E8EDF2] hover:text-white px-2.5 py-1.5 rounded-lg active:scale-95 transition-all"
              >
                {copied ? <Check size={11} className="text-[#1E8A5F]" /> : <Copy size={11} />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleSend}
                className="flex items-center gap-1 text-[10px] bg-[#1E8A5F] text-white px-2.5 py-1.5 rounded-lg active:scale-95 transition-all"
              >
                {sent ? <Check size={11} /> : <Send size={11} />}
                {sent ? "Sent!" : "Send"}
              </button>
            </div>
          </div>

          {/* Target Agency and Contact Info Card */}
          {foiResponse && (
            <CivicCard className="p-4 space-y-2">
              <p className="text-[#8B949E] text-[9px] uppercase tracking-widest font-mono font-dm-mono">Target Authority</p>
              <h4 className="text-[#E8EDF2] text-xs font-bold leading-snug font-sora">
                {foiResponse.agencyName}
              </h4>
              <div className="flex items-center gap-1.5 text-[#8B949E] text-[10px]">
                <Mail size={12} className="text-[#1E8A5F]" />
                <span className="font-mono">{foiResponse.agencyEmail}</span>
              </div>
            </CivicCard>
          )}

          {/* Legal Deadline Card */}
          <div className="bg-[#E8B95C]/5 border border-[#E8B95C]/35 rounded-xl p-3.5 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[#E8B95C] text-xs font-bold font-sora">
                {t("foiDeadline")}
              </p>
              <p className="text-[#8B949E] text-[10px] leading-snug">
                Under the FOI Act 2011, public institutions must reply within <strong>7 working days</strong>.
              </p>
              {foiResponse && (
                <div className="flex items-center gap-1.5 text-[9px] text-[#8B949E] font-mono pt-1">
                  <Clock size={11} className="text-[#E8B95C]" />
                  <span>Reply Due: {foiResponse.dueDate}</span>
                </div>
              )}
            </div>
            {renderDeadlineRing(7, 7)}
          </div>

          {/* Generated Formal Letter Layout */}
          <CivicCard className="p-5 font-mono text-[11px] leading-relaxed text-[#C4C9D0] overflow-y-auto max-h-[300px] border border-white/[0.08] shadow-inner select-text whitespace-pre-line">
            <div id="foi-letter-body" className="space-y-4">
              {foiResponse?.letter}
            </div>
          </CivicCard>
          
          <div className="p-3.5 bg-[#1C2128] rounded-xl border border-white/[0.06] flex items-start gap-2.5">
            <ShieldAlert size={14} className="text-[#1E8A5F] shrink-0 mt-0.5" />
            <p className="text-[#8B949E] text-[10px] leading-relaxed">
              If an agency fails to reply within 7 days, it represents a "deemed refusal." CivicPulse automatically registers this infraction in our public Politician Scorecard to lower their transparency rating.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
