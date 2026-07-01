import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../store/useAppStore";
import { CivicCard } from "../components/CivicCard";
import {
  Radio, Camera, Navigation, WifiOff, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck
} from "lucide-react";

export function IssueReporter() {
  const { t } = useTranslation();
  const { isOffline, offlineIssues, addIssue, syncOfflineQueue, isSyncing, loadOfflineData } = useAppStore();

  const [category, setCategory] = useState("Roads");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [gps, setGps] = useState("9.0820°N, 7.4130°E");
  
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadOfflineData();
  }, []);

  const handleCapturePhoto = () => {
    // Mock base64 photo
    setPhoto("data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    await addIssue(category, description, photo || undefined, gps);
    
    // Clear form
    setDescription("");
    setPhoto(null);
    setShowSuccess(true);
    
    // Auto-clear success message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 4000);
  };

  return (
    <div className="p-4 space-y-4 fade-in">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#F97316]/15 rounded-lg flex items-center justify-center border border-[#F97316]/30">
            <Radio size={16} className="text-[#F97316]" />
          </div>
          <div>
            <h3 className="text-[#E8EDF2] text-sm font-semibold" style={{ fontFamily: "'Sora', sans-serif" }}>
              {t("reportTitle")}
            </h3>
            <p className="text-[#8B949E] text-[10px]">Direct-action citizen audits</p>
          </div>
        </div>

        {/* Sync Trigger manually */}
        {!isOffline && (
          <button
            onClick={syncOfflineQueue}
            disabled={isSyncing}
            className="flex items-center gap-1 text-[10px] bg-[#1C2128] border border-white/[0.06] text-[#8B949E] hover:text-white px-2.5 py-1 rounded-lg active:scale-95 transition-all disabled:opacity-40"
          >
            <RefreshCw size={11} className={isSyncing ? "animate-spin" : ""} />
            Sync
          </button>
        )}
      </div>

      {/* Network Alert Notification */}
      {isOffline && (
        <div className="bg-[#21262D] border border-[#E8B95C]/20 rounded-xl p-3 flex items-start gap-2.5 shadow-md">
          <WifiOff size={15} className="text-[#E8B95C] shrink-0 mt-0.5" />
          <div>
            <p className="text-[#E8B95C] text-[11px] font-bold uppercase tracking-wider font-mono">
              Offline Mode Enabled
            </p>
            <p className="text-[#8B949E] text-[10px] leading-snug mt-0.5">
              {t("reportOffline")}
            </p>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showSuccess && (
        <div className="bg-[#1E8A5F]/15 border border-[#1E8A5F]/40 text-[#26B07A] rounded-xl p-3.5 flex items-start gap-2.5 shadow-md slide-up">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-[#26B07A] text-xs font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
              {isOffline ? "Report Queued Locally" : t("reportSynced")}
            </p>
            <p className="text-[#8B949E] text-[10px] leading-snug mt-0.5">
              {isOffline
                ? "Your audit has been safely encrypted and saved. It will sync automatically when you go online."
                : "Thank you! Your verified audit has been registered in the CivicPulse blockchain ledger."}
            </p>
          </div>
        </div>
      )}

      {/* Form Card */}
      <CivicCard className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[#8B949E] text-[10px] uppercase tracking-widest font-mono font-bold block">
              {t("reportCategory")}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#1C2128] border border-white/[0.07] rounded-xl px-3 py-2.5 text-xs text-[#E8EDF2] focus:outline-none focus:border-[#1E8A5F]"
            >
              {["Roads", "Health", "Education", "Water", "Security", "Power"].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description Textarea */}
          <div className="space-y-1.5">
            <label className="text-[#8B949E] text-[10px] uppercase tracking-widest font-mono font-bold block">
              {t("reportDesc")}
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. The contractor abandoned the health post. The roof has caved in..."
              className="w-full bg-[#1C2128] border border-white/[0.07] rounded-xl px-3 py-2.5 text-xs text-[#E8EDF2] focus:outline-none focus:border-[#1E8A5F] placeholder-white/20 resize-none leading-relaxed"
            />
          </div>

          {/* Photo Capture Zone */}
          <div className="space-y-1.5">
            <label className="text-[#8B949E] text-[10px] uppercase tracking-widest font-mono font-bold block">
              {t("reportPhoto")}
            </label>
            
            {photo ? (
              <div className="relative rounded-xl overflow-hidden aspect-video bg-[#0E1116] border border-white/[0.06] flex items-center justify-center">
                <div className="absolute inset-0 bg-cover bg-center filter saturate-50" style={{ backgroundImage: `url(${photo})` }} />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <CheckCircle2 size={24} className="text-[#1E8A5F]" />
                </div>
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="absolute top-2 right-2 bg-[#E3433D] hover:bg-[#ff5550] text-white rounded-full p-1 text-[9px] font-bold"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCapturePhoto}
                className="w-full py-4 border border-dashed border-white/[0.1] rounded-xl flex items-center justify-center gap-2 bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
              >
                <Camera size={14} className="text-[#8B949E]" />
                <span className="text-[11px] text-[#8B949E] font-medium">Capture Evidence Camera</span>
              </button>
            )}
          </div>

          {/* GPS Coordinates */}
          <div className="space-y-1.5">
            <label className="text-[#8B949E] text-[10px] uppercase tracking-widest font-mono font-bold block">
              {t("reportGPS")}
            </label>
            <div className="bg-[#1C2128] border border-white/[0.07] rounded-xl px-3 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation size={12} className="text-[#1E8A5F]" />
                <span className="text-[#8B949E] text-[10px] font-mono">{gps}</span>
              </div>
              <span className="text-[#1E8A5F] text-[9px] font-bold uppercase tracking-wider">
                Captured ✓
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#1E8A5F] hover:bg-[#26A674] text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all shadow-md shadow-[#1E8A5F]/15"
          >
            <ShieldCheck size={16} />
            {t("reportSubmit")}
          </button>
        </form>
      </CivicCard>

      {/* Reported Local Issues Queue list */}
      <div className="space-y-2.5">
        <p className="text-[#8B949E] text-[10px] uppercase tracking-widest px-1" style={{ fontFamily: "'DM Mono', monospace" }}>
          Your Audit Ledger ({offlineIssues.length} entries)
        </p>

        {offlineIssues.length === 0 ? (
          <div className="text-center py-6 text-[#8B949E] text-[10px] bg-[#161B22] rounded-xl border border-white/[0.06]">
            No reports created yet.
          </div>
        ) : (
          <div className="space-y-2">
            {offlineIssues.map((issue) => (
              <CivicCard key={issue.id} className="p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#E8EDF2] text-xs font-bold">{issue.category}</span>
                  <span
                    className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                      issue.synced
                        ? "bg-[#1E8A5F]/10 border-[#1E8A5F]/30 text-[#26B07A]"
                        : "bg-[#E8B95C]/10 border-[#E8B95C]/30 text-[#FCD34D]"
                    }`}
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {issue.synced ? "Synced" : "Offline"}
                  </span>
                </div>
                <p className="text-[#C4C9D0] text-xs leading-relaxed truncate">
                  {issue.description}
                </p>
                <div className="flex justify-between items-center pt-2 border-t border-white/[0.04] text-[9px] text-[#8B949E] font-mono">
                  <span>{new Date(issue.timestamp).toLocaleTimeString()}</span>
                  <span>{issue.gps}</span>
                </div>
              </CivicCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
