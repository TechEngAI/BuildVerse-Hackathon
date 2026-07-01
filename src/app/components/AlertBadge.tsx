import { Info, AlertTriangle, AlertOctagon, XCircle } from "lucide-react";

export type BadgeLevel = "low" | "medium" | "high" | "critical";

interface AlertBadgeProps {
  level: BadgeLevel;
  label: string;
}

export function AlertBadge({ level, label }: AlertBadgeProps) {
  const configs = {
    low: {
      bg: "bg-[#0EA5E9]/15",
      text: "text-[#38BDF8]",
      border: "border-[#0EA5E9]/30",
      Icon: Info
    },
    medium: {
      bg: "bg-[#F59E0B]/15",
      text: "text-[#FCD34D]",
      border: "border-[#F59E0B]/30",
      Icon: AlertTriangle
    },
    high: {
      bg: "bg-[#F97316]/20",
      text: "text-[#FB923C]",
      border: "border-[#F97316]/40",
      Icon: AlertOctagon
    },
    critical: {
      bg: "bg-[#E3433D]/20",
      text: "text-[#FF6B65]",
      border: "border-[#E3433D]/50",
      Icon: XCircle
    }
  };

  const cfg = configs[level] || configs.low;
  const BadgeIcon = cfg.Icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${cfg.bg} ${cfg.text} ${cfg.border} font-dm-mono letter-spacing-mono`}
    >
      <BadgeIcon size={9} />
      {label}
    </span>
  );
}
