import React from "react";
import { Database } from "lucide-react";

interface ChartWrapperProps {
  isLoading?: boolean;
  isEmpty?: boolean;
  title?: string;
  children: React.ReactNode;
}

export function ChartWrapper({ isLoading, isEmpty, title, children }: ChartWrapperProps) {
  const widths = ["w-[85%]", "w-[55%]", "w-[72%]", "w-[42%]", "w-[65%]"];

  return (
    <div className="bg-[#161B22] rounded-xl border border-white/[0.07] p-4">
      {title && (
        <p
          className="text-[#8B949E] text-[10px] font-medium mb-3 uppercase tracking-widest font-dm-mono"
        >
          {title}
        </p>
      )}

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {widths.map((wClass, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-14 h-3 bg-[#21262D] rounded" />
              <div
                className={`h-5 bg-[#21262D] rounded flex-1 ${wClass}`}
              />
            </div>
          ))}
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-10 text-[#8B949E]">
          <Database size={24} className="mb-2 opacity-30" />
          <p className="text-xs">No chart data available</p>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
