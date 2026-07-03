import React from "react";

type Severity = "neutral" | "warning" | "critical";

interface CivicCardProps {
  children: React.ReactNode;
  severity?: Severity;
  className?: string;
  onClick?: () => void;
}

export function CivicCard({ children, severity = "neutral", className = "", onClick }: CivicCardProps) {
  const borderStyles = {
    neutral: "border-white/[0.07]",
    warning: "border-[#E8B95C]/40",
    critical: "border-[#E3433D]/50"
  };

  const accentStyles = {
    neutral: "",
    warning: "border-l-4 border-l-[#E8B95C]",
    critical: "border-l-4 border-l-[#E3433D]"
  };

  const cursorClass = onClick ? "cursor-pointer active:scale-[0.99] transition-transform" : "";

  return (
    <div
      onClick={onClick}
      className={`bg-[#161B22] rounded-xl border ${borderStyles[severity]} ${accentStyles[severity]} ${cursorClass} ${className}`}
    >
      {children}
    </div>
  );
}
