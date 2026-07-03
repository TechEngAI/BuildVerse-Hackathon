import { useTranslation } from "react-i18next";
import { CivicCard } from "../components/CivicCard";
import { AlertBadge } from "../components/AlertBadge";
import { ChartWrapper } from "../components/ChartWrapper";
import { MapPin } from "../components/MapPin";
import { Layers } from "lucide-react";

export function ComponentLibrary() {
  const { t } = useTranslation();

  const colorTokens = [
    { name: "Background (Deep Charcoal)", hex: "#0E1116", description: "Default ground of the application." },
    { name: "Primary (Civic Green)", hex: "#1E8A5F", description: "Nigeria national brand nod." },
    { name: "Accent (Warm Gold)", hex: "#E8B95C", description: "highlights, CTAs, caution states." },
    { name: "Destructive (Hard Red)", hex: "#E3433D", description: "Fraud and contradiction highlights ONLY." },
    { name: "Card Background", hex: "#161B22", description: "Panels and surfaces." }
  ];

  return (
    <div className="p-4 space-y-6 fade-in pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-white/[0.06]">
        <div className="w-8 h-8 bg-[#E8B95C]/15 rounded-lg flex items-center justify-center border border-[#E8B95C]/30">
          <Layers size={16} className="text-[#E8B95C]" />
        </div>
        <div>
          <h3 className="text-[#E8EDF2] text-sm font-semibold font-sora">
            {t("compTitle")}
          </h3>
          <p className="text-[#8B949E] text-[10px]">{t("compSubtitle")}</p>
        </div>
      </div>

      {/* Design Colors Tokens section */}
      <div className="space-y-3">
        <p className="text-[#8B949E] text-[9px] uppercase tracking-widest font-mono font-dm-mono">
          Design Tokens & Palette
        </p>
        
        <div className="space-y-2">
          {colorTokens.map((token, i) => (
            <div key={i} className="flex items-center gap-3 bg-[#161B22] p-2.5 rounded-xl border border-white/[0.06]">
              <div
                className="w-10 h-10 rounded-lg shrink-0 border border-white/[0.1] shadow-inner bg-[var(--token-bg)]"
                style={{ "--token-bg": token.hex } as React.CSSProperties}
              />
              <div className="min-w-0">
                <p className="text-[#E8EDF2] text-xs font-bold font-sora">{token.name}</p>
                <p className="text-[10px] text-[#8B949E] mt-0.5 leading-snug">{token.description}</p>
              </div>
              <span className="ml-auto text-[10px] text-[#8B949E] font-mono font-dm-mono">
                {token.hex}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Shared primitive elements section */}
      <div className="space-y-3.5">
        <p className="text-[#8B949E] text-[9px] uppercase tracking-widest font-mono font-dm-mono">
          Components Showcase
        </p>

        {/* Cards */}
        <div className="space-y-2">
          <p className="text-[#8B949E] text-[10px] font-semibold">CivicCard Panels (Neutral, Warning, Critical)</p>
          <CivicCard className="p-3.5 text-xs text-[#C4C9D0]">
            Default Card (Neutral border accent)
          </CivicCard>
          <CivicCard className="p-3.5 text-xs text-[#C4C9D0]" severity="warning">
            Warning Card (Gold left-border accent)
          </CivicCard>
          <CivicCard className="p-3.5 text-xs text-[#C4C9D0]" severity="critical">
            Critical Card (Red left-border accent)
          </CivicCard>
        </div>

        {/* Severity Badges */}
        <div className="space-y-2">
          <p className="text-[#8B949E] text-[10px] font-semibold">AlertBadge Severity Levels</p>
          <div className="flex flex-wrap gap-2 bg-[#161B22] p-3 rounded-xl border border-white/[0.06]">
            <AlertBadge level="low" label="LOW PRIORITY" />
            <AlertBadge level="medium" label="MEDIUM PRIORITY" />
            <AlertBadge level="high" label="HIGH PRIORITY" />
            <AlertBadge level="critical" label="CRITICAL ALERT" />
          </div>
        </div>

        {/* Map Pins */}
        <div className="space-y-2">
          <p className="text-[#8B949E] text-[10px] font-semibold">MapPin Vector Markers</p>
          <div className="flex justify-around items-center bg-[#080B10] py-8 rounded-xl border border-white/[0.06] relative overflow-hidden">
            <div className="flex flex-col items-center gap-1">
              <MapPin flagged={false} amount="₦2.1B" />
              <span className="text-[9px] text-[#8B949E] mt-3">Verified Pin</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <MapPin flagged={true} amount="₦45.2M" />
              <span className="text-[9px] text-[#8B949E] mt-3">Flagged Pin</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-2">
          <p className="text-[#8B949E] text-[10px] font-semibold">ChartWrapper Loading Skeleton States</p>
          <ChartWrapper isLoading title="System design chart skeleton placeholder" children={null} />
        </div>
      </div>
    </div>
  );
}
