import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore, apiFetch, parseGps, dataURLtoBlob } from "../store/useAppStore";
import { CivicCard } from "../components/CivicCard";
import { MapPin } from "../components/MapPin";
import { Loader } from "@googlemaps/js-api-loader";
import { motion, AnimatePresence } from "motion/react";
import {
  Map as MapIcon, XCircle, CheckCircle, Camera, Navigation, Check, AlertTriangle, Info, AlertCircle
} from "lucide-react";

const mapPins = [
  { id: 1, name: "FCT Community Centre", lat: 45, lon: 42, flagged: true, amount: "₦45.2M", contractor: "Zenith Construction Ltd", date: "Dec 2023", gap: 90, officialStatus: "Completed", actualProgress: "Foundation only" },
  { id: 2, name: "Lagos–Ibadan Expressway", lat: 75, lon: 32, flagged: false, amount: "₦2.1B", contractor: "Julius Berger", date: "Nov 2023", gap: 8, officialStatus: "Completed", actualProgress: "Completed (92% quality match)" },
  { id: 3, name: "Kano Water Treatment Plant", lat: 22, lon: 48, flagged: true, amount: "₦180M", contractor: "AquaBuild NG", date: "Sep 2023", gap: 74, officialStatus: "Completed", actualProgress: "Non-operational pump house" },
  { id: 4, name: "PH Ring Road Phase 2", lat: 86, lon: 36, flagged: false, amount: "₦890M", contractor: "Dantata & Sawoe", date: "Jan 2024", gap: 12, officialStatus: "In Progress", actualProgress: "Ongoing construction" },
  { id: 5, name: "Enugu State Hospital Annex", lat: 72, lon: 46, flagged: true, amount: "₦62M", contractor: "MedBuild Ltd", date: "Oct 2023", gap: 65, officialStatus: "Completed", actualProgress: "Unfinished shell structure" },
  { id: 6, name: "Maiduguri Solar Street Lights", lat: 26, lon: 84, flagged: true, amount: "₦28M", contractor: "SolarTech NG", date: "Aug 2023", gap: 88, officialStatus: "Completed", actualProgress: "No lights installed" }
];

export function GhostTracker() {
  const { t } = useTranslation();
  const { isOffline, addIssue } = useAppStore();
  
  const [selectedPin, setSelectedPin] = useState<typeof mapPins[0] | null>(null);
  const [subView, setSubView] = useState<"map" | "upload" | "uploaded">("map");
  const [photo, setPhoto] = useState<string | null>(null);
  const [isUsingGoogleMap, setIsUsingGoogleMap] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [evidenceError, setEvidenceError] = useState("");
  const [analyzedResult, setAnalyzedResult] = useState<{
    matched_contract?: {
      name: string;
      contractor: string;
      amount: string;
      officialStatus: string;
      actualProgress: string;
    };
    contradiction?: {
      narrative: string;
      gap: number;
    };
  } | null>(null);

  const nigeriaPath = "2.5,0 19,2 44,1 77.5,5 98,10 100,40 94,60 86,75 61,85 48,97 28,97 11,90 0,75 0,50 7,30 2.5,0";

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
    
    if (apiKey && mapRef.current) {
      const loader = new Loader({
        apiKey: apiKey,
        version: "weekly",
        libraries: ["places"]
      });

      loader.load().then((google) => {
        setIsUsingGoogleMap(true);
        const map = new google.maps.Map(mapRef.current!, {
          center: { lat: 9.0820, lng: 7.4130 },
          zoom: 6,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#0E1116" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#0E1116" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#8B949E" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#080B10" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#161B22" }] }
          ]
        });

        mapPins.forEach((pin) => {
          const latOffset = 9.0820 + (50 - pin.lat) * 0.12;
          const lngOffset = 7.4130 + (pin.lon - 50) * 0.12;

          const marker = new google.maps.Marker({
            position: { lat: latOffset, lng: lngOffset },
            map,
            title: pin.name,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: pin.flagged ? "#E3433D" : "#1E8A5F",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 2
            }
          });

          marker.addListener("click", () => {
            setSelectedPin(pin);
            setSubView("map");
          });
        });
      }).catch((e) => {
        console.warn("Google Maps failed to load, falling back to SVG vector ledger.", e);
        setIsUsingGoogleMap(false);
      });
    }
  }, []);

  const handleTriggerUpload = () => {
    setSubView("upload");
    setPhoto(null);
    setEvidenceError("");
  };

  const handleCapturePhoto = () => {
    setPhoto("data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=");
  };

  const handleSubmitEvidence = async () => {
    if (!selectedPin) return;
    
    setEvidenceError("");
    setEvidenceLoading(true);

    try {
      if (isOffline) {
        // Offline: save report to IndexedDB
        await addIssue(
          "Ghost Project Verification",
          `Citizen report on ${selectedPin.name}. Contractor claim: ${selectedPin.officialStatus}. Citizen reality: ${photo ? "Photo evidence supplied." : "Empty plot observed."}`,
          photo || undefined,
          "9.0820°N, 7.4130°E"
        );
        setSubView("uploaded");
        return;
      }

      // Online: call POST /ghost/analyze-photo
      const formData = new FormData();
      const gpsString = "9.0820°N, 7.4130°E";
      const { lat, lng } = parseGps(gpsString);

      formData.append("lat", lat.toString());
      formData.append("lng", lng.toString());
      
      if (photo) {
        const blob = dataURLtoBlob(photo);
        formData.append("file", blob, "evidence.jpg");
      } else {
        const emptyBlob = new Blob([""], { type: "image/jpeg" });
        formData.append("file", emptyBlob, "evidence.jpg");
      }

      const res = await apiFetch("/ghost/analyze-photo", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Photo/GPS analysis failed.");
      }

      setAnalyzedResult({
        matched_contract: data.matched_contract,
        contradiction: data.contradiction
      });
      setSubView("uploaded");
    } catch (err: any) {
      console.error(err);
      setEvidenceError(err.message || "An error occurred during submission.");
    } finally {
      setEvidenceLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full fade-in">
      {/* Interactive Map Section */}
      <div 
        ref={mapRef}
        className="relative mx-0 h-[280px] bg-[#080B10] border-b border-white/[0.06] overflow-hidden shrink-0 grid-bg-map"
      >
        {!isUsingGoogleMap && (
          <>
            {/* Interactive Vector Fallback Map of Nigeria */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full opacity-80">
              <polygon points={nigeriaPath} fill="rgba(30,138,95,0.03)" stroke="rgba(30,138,95,0.15)" strokeWidth="0.5" />
            </svg>

            {/* Custom Interactive Pins */}
            {mapPins.map((pin) => (
              <div
                key={pin.id}
                className="absolute left-[var(--pin-left)] top-[var(--pin-top)]"
                style={{ "--pin-left": `${pin.lon}%`, "--pin-top": `${pin.lat}%` } as React.CSSProperties}
              >
                <MapPin
                  flagged={pin.flagged}
                  amount={pin.amount}
                  onClick={() => {
                    setSelectedPin(pin);
                    setSubView("map");
                  }}
                />
              </div>
            ))}

            {/* Map Guidance Overlay */}
            <div className="absolute bottom-3 left-3 bg-[#0E1116]/80 backdrop-blur-sm border border-white/[0.06] rounded-lg px-2.5 py-1.5 pointer-events-none flex items-center gap-1.5">
              <Info size={11} className="text-[#8B949E]" />
              <span className="text-[9px] text-[#8B949E] font-medium uppercase tracking-wider font-dm-mono">
                {t("ghostTap")}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Main Details Panel */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="wait">
          {selectedPin ? (
            <motion.div
              key={selectedPin.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Project Header details */}
              <CivicCard className="p-4" severity={selectedPin.flagged ? "critical" : "neutral"}>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <h3 className="text-[#E8EDF2] text-sm font-semibold font-sora">
                      {selectedPin.name}
                    </h3>
                    <p className="text-[#8B949E] text-[10px] font-mono mt-0.5">{selectedPin.contractor}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider font-dm-mono ${
                      selectedPin.flagged
                        ? "bg-[#E3433D]/15 border-[#E3433D]/40 text-[#FF6B65]"
                        : "bg-[#1E8A5F]/15 border-[#1E8A5F]/40 text-[#26B07A]"
                    }`}
                  >
                    {selectedPin.flagged ? t("ghostMismatch") : t("verified")}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/[0.05] text-left">
                  <div>
                    <p className="text-[#8B949E] text-[8px] uppercase tracking-widest font-mono">Contract Sum</p>
                    <p className="text-[#E8EDF2] text-xs font-bold mt-0.5 font-dm-mono">{selectedPin.amount}</p>
                  </div>
                  <div>
                    <p className="text-[#8B949E] text-[8px] uppercase tracking-widest font-mono">Date Awarded</p>
                    <p className="text-[#E8EDF2] text-xs font-bold mt-0.5 font-dm-mono">{selectedPin.date}</p>
                  </div>
                  <div>
                    <p className="text-[#8B949E] text-[8px] uppercase tracking-widest font-mono">Irregularity Gap</p>
                    <p className={`text-xs font-bold mt-0.5 font-dm-mono ${selectedPin.flagged ? "text-[#E3433D]" : "text-[#1E8A5F]"}`}>
                      {selectedPin.gap}%
                    </p>
                  </div>
                </div>
              </CivicCard>

              {/* Sub-view router inside details drawer */}
              {subView === "map" && (
                <div className="space-y-4">
                  {/* Official vs Reality comparison */}
                  <CivicCard className="overflow-hidden">
                    <div className="px-4 py-2.5 bg-white/[0.01] border-b border-white/[0.06] flex items-center justify-between">
                      <p className="text-[#8B949E] text-[10px] uppercase tracking-widest font-dm-mono">
                        Reality Audit
                      </p>
                    </div>
                    
                    <div className="divide-y divide-white/[0.04]">
                      <div className="px-4 py-3 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <CheckCircle size={13} className="text-[#1E8A5F]" />
                          <span className="text-[#8B949E] text-xs">{t("ghostOfficial")}</span>
                        </div>
                        <span className="text-[#E8EDF2] text-xs font-semibold">{selectedPin.officialStatus}</span>
                      </div>

                      <div className="px-4 py-3 flex justify-between items-center bg-[#E3433D]/[0.02]">
                        <div className="flex items-center gap-2">
                          <XCircle size={13} className="text-[#E3433D]" />
                          <span className="text-[#8B949E] text-xs">{t("ghostCitizen")}</span>
                        </div>
                        <span className="text-[#FF6B65] text-xs font-semibold">{selectedPin.actualProgress}</span>
                      </div>
                    </div>
                  </CivicCard>

                  {/* AI Audited photo analysis ledger if flagged */}
                  {selectedPin.flagged && (
                    <CivicCard severity="critical" className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={13} className="text-[#E8B95C]" />
                        <p className="text-[#E8B95C] text-[10px] font-bold uppercase tracking-wider font-dm-mono">
                          AI Visual Verification
                        </p>
                      </div>
                      <p className="text-[#C4C9D0] text-xs leading-relaxed">
                        {t("ghostAnalysis")}
                      </p>
                    </CivicCard>
                  )}

                  {/* Upload Verification CTA */}
                  <motion.button
                    whileTap={{ scale: 0.99 }}
                    onClick={handleTriggerUpload}
                    className="w-full bg-[#1C2128] hover:bg-[#21262D] border border-white/[0.07] text-[#E8EDF2] font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 active:opacity-80 transition-opacity"
                  >
                    <Camera size={16} className="text-[#E8B95C]" />
                    {t("ghostPhoto")}
                  </motion.button>
                </div>
              )}

              {subView === "upload" && (
                <div className="space-y-4">
                  {evidenceError && (
                    <div className="bg-[#E3433D]/10 border border-[#E3433D]/30 text-[#FF6B65] text-xs rounded-xl p-3 flex items-start gap-2">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <span>{evidenceError}</span>
                    </div>
                  )}

                  <CivicCard className="p-4">
                    <p className="text-[#E8EDF2] text-xs font-semibold mb-3">{t("ghostPhoto")}</p>
                    
                    {photo ? (
                      <div className="relative rounded-xl overflow-hidden aspect-video bg-[#0E1116] border border-white/[0.06] flex items-center justify-center">
                        <div 
                          className="absolute inset-0 bg-cover bg-center filter saturate-50 brightness-75 bg-[var(--bg-photo-url)]" 
                          style={{ "--bg-photo-url": `url(${photo})` } as React.CSSProperties}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <CheckCircle size={28} className="text-[#1E8A5F] drop-shadow-md" />
                        </div>
                        <button
                          type="button"
                          onClick={() => setPhoto(null)}
                          className="absolute top-2 right-2 bg-[#E3433D] text-white px-2 py-0.5 rounded-md text-[9px]"
                        >
                          Clear
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleCapturePhoto}
                        className="w-full h-36 border border-dashed border-white/[0.1] rounded-xl flex flex-col items-center justify-center gap-2.5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
                      >
                        <div className="w-10 h-10 bg-white/[0.04] rounded-full flex items-center justify-center border border-white/[0.05]">
                          <Camera size={18} className="text-[#8B949E]" />
                        </div>
                        <span className="text-xs text-[#8B949E]">{t("ghostPhotoUpload")}</span>
                      </button>
                    )}

                    {/* GPS Locator */}
                    <div className="mt-4 p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Navigation size={13} className="text-[#1E8A5F]" />
                        <span className="text-[#8B949E] text-[10px] font-mono font-dm-mono">{t("ghostGPS")}</span>
                      </div>
                      <span className="text-[#1E8A5F] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 font-dm-mono">
                        <Check size={11} /> {t("ghostConfirmGPS")}
                      </span>
                    </div>
                  </CivicCard>

                  {/* Submission options */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSubView("map")}
                      className="flex-1 bg-[#161B22] border border-white/[0.06] text-[#8B949E] py-3 rounded-xl text-sm font-semibold active:opacity-80"
                    >
                      {t("cancel")}
                    </button>
                    <button
                      onClick={handleSubmitEvidence}
                      disabled={!photo || evidenceLoading}
                      className="flex-1 bg-[#1E8A5F] disabled:opacity-40 disabled:pointer-events-none text-white py-3 rounded-xl text-sm font-semibold active:opacity-80 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#1E8A5F]/10"
                    >
                      <CheckCircle size={16} />
                      {evidenceLoading ? "Analyzing photo..." : t("submit")}
                    </button>
                  </div>
                </div>
              )}

              {subView === "uploaded" && (
                <CivicCard className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#1E8A5F]/15 border border-[#1E8A5F]/30 flex items-center justify-center mx-auto">
                    <Check size={24} className="text-[#1E8A5F]" />
                  </div>
                  <div>
                    <h4 className="text-[#E8EDF2] text-sm font-semibold">{t("ghostUploaded")}</h4>
                    
                    {analyzedResult?.contradiction && (
                      <div className="mt-4 p-3.5 bg-[#E3433D]/10 border border-[#E3433D]/30 rounded-xl text-left space-y-2">
                        <p className="text-[#FF6B65] text-xs font-bold font-sora">
                          Contradiction Identified!
                        </p>
                        <p className="text-[#8B949E] text-[10px] leading-relaxed">
                          {analyzedResult.contradiction.narrative}
                        </p>
                        <p className="text-[#8B949E] text-[10px] font-dm-mono">
                          Deviation Gap: {analyzedResult.contradiction.gap}%
                        </p>
                      </div>
                    )}

                    <p className="text-[#8B949E] text-[10px] mt-3 leading-relaxed">
                      {isOffline
                        ? t("reportOffline")
                        : "Verification completed successfully. This report has been linked to the contract records."}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSubView("map");
                      setAnalyzedResult(null);
                    }}
                    className="w-full bg-[#1C2128] border border-white/[0.07] text-[#E8EDF2] py-2.5 rounded-xl text-xs font-semibold"
                  >
                    Return to Project Map
                  </button>
                </CivicCard>
              )}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-[#8B949E] text-center space-y-3 px-6">
              <div className="w-12 h-12 bg-white/[0.02] border border-white/[0.06] rounded-full flex items-center justify-center">
                <MapIcon size={20} className="opacity-40 text-[#8B949E]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#E8EDF2] uppercase tracking-wider font-dm-mono">{t("ghostTitle")}</p>
                <p className="text-[10px] text-[#8B949E] mt-1 leading-relaxed">
                  Nigerian states contain over ₦2.4T in "completed" projects that only exist on paper. Select any pin on the map to audit contract documents and citizen realities.
                </p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
