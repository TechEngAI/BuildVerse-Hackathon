import { XCircle, CheckCircle } from "lucide-react";

interface MapPinProps {
  flagged: boolean;
  onClick?: () => void;
  className?: string;
  amount?: string;
}

export function MapPin({ flagged, onClick, className = "", amount }: MapPinProps) {
  return (
    <button
      onClick={onClick}
      className={`relative transform -translate-x-1/2 -translate-y-full active:scale-115 transition-transform z-10 focus:outline-none ${className}`}
    >
      <div className="relative flex flex-col items-center">
        {amount && (
          <div className="absolute -top-6 bg-[#0E1116] border border-white/[0.1] rounded px-1.5 py-0.5 text-[8px] font-bold text-white whitespace-nowrap shadow-md pointer-events-none" style={{ fontFamily: "'DM Mono', monospace" }}>
            {amount}
          </div>
        )}
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-lg transition-all ${
            flagged
              ? "bg-[#E3433D] border-[#FF6B65] pin-pulse"
              : "bg-[#1E8A5F] border-[#26B07A]"
          }`}
        >
          {flagged ? (
            <XCircle size={12} className="text-white shrink-0" />
          ) : (
            <CheckCircle size={12} className="text-white shrink-0" />
          )}
        </div>
        <div
          className={`w-1 h-2 rounded-b-full shadow-inner ${
            flagged ? "bg-[#E3433D]" : "bg-[#1E8A5F]"
          }`}
        />
      </div>
    </button>
  );
}
