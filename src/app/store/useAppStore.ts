import { create } from "zustand";
import i18n from "../../i18n";
import { db, OfflineIssue, CitizenReport } from "../lib/db";

export type Language = "pidgin" | "english" | "yoruba" | "hausa";
export type Screen = "home" | "budget" | "ghost" | "social" | "contradiction" | "foi" | "reporter" | "profile" | "components";
export type NavTab = "home" | "budget" | "map" | "reports" | "profile";

export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function parseGps(gpsString: string): { lat: number; lng: number } {
  const matches = gpsString.match(/[+-]?([0-9]*[.])?[0-9]+/g);
  if (matches && matches.length >= 2) {
    return {
      lat: parseFloat(matches[0]),
      lng: parseFloat(matches[1])
    };
  }
  return { lat: 9.0820, lng: 7.4130 };
}

// Convert Base64 DataURL to a Blob
export function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

interface AppState {
  lang: Language;
  screen: Screen;
  tab: NavTab;
  isOffline: boolean;
  isSyncing: boolean;
  offlineIssues: OfflineIssue[];
  citizenReports: CitizenReport[];
  
  // Auth State
  user: { id: string; email: string; user_metadata: any } | null;
  accessToken: string | null;
  refreshToken: string | null;
  authLoading: boolean;
  authError: string | null;

  // Citizen poll statistics (Reality score)
  citizenPollStats: {
    yes: number;
    no: number;
    partial: number;
  };
  activeFilter: "all" | "audited" | "unaudited";

  // Actions
  setLang: (lang: Language) => void;
  setScreen: (screen: Screen) => void;
  setTab: (tab: NavTab) => void;
  setIsOffline: (isOffline: boolean) => void;
  setActiveFilter: (filter: "all" | "audited" | "unaudited") => void;
  loadOfflineData: () => Promise<void>;
  
  // Auth Actions
  signup: (email: string, password: string, fullName: string) => Promise<string>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  refreshSession: () => Promise<string | null>;
  logout: () => void;
  clearAuthError: () => void;

  // Data Actions
  addIssue: (category: string, description: string, photo?: string, gps?: string) => Promise<void>;
  addCitizenPoll: (program: string, received: "yes" | "no" | "partial") => Promise<void>;
  syncOfflineQueue: () => Promise<void>;
}

// Wrapper for API fetch requests that attaches Authorization headers and handles token refreshing
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const store = useAppStore.getState();
  const headers = new Headers(options.headers || {});
  
  if (store.accessToken) {
    headers.set("Authorization", `Bearer ${store.accessToken}`);
  }
  
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers
  });
  
  // Handle Token Expiration and Auto Refresh session
  if (response.status === 401 && store.refreshToken) {
    try {
      const newAccessToken = await store.refreshSession();
      if (newAccessToken) {
        headers.set("Authorization", `Bearer ${newAccessToken}`);
        return await fetch(`${BASE_URL}${path}`, {
          ...options,
          headers
        });
      }
    } catch (e) {
      console.error("Session refresh expired:", e);
      store.logout();
    }
  }
  
  return response;
}

export const useAppStore = create<AppState>((set, get) => ({
  lang: "english",
  screen: "home",
  tab: "home",
  isOffline: false,
  isSyncing: false,
  offlineIssues: [],
  citizenReports: [],
  activeFilter: "all",

  // Load initial Auth state from local storage
  user: (() => {
    const raw = localStorage.getItem("civicpulse_user");
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  })(),
  accessToken: localStorage.getItem("civicpulse_access_token"),
  refreshToken: localStorage.getItem("civicpulse_refresh_token"),
  authLoading: false,
  authError: null,

  citizenPollStats: {
    yes: 124,
    no: 820,
    partial: 236
  },

  setLang: (lang) => {
    i18n.changeLanguage(lang);
    set({ lang });
  },

  setScreen: (screen) => set({ screen }),

  setTab: (tab) => set({ tab }),

  setIsOffline: (isOffline) => {
    set({ isOffline });
    if (!isOffline) {
      get().syncOfflineQueue();
    }
  },

  setActiveFilter: (activeFilter) => set({ activeFilter }),

  loadOfflineData: async () => {
    const issues = await db.getAllIssues();
    const reports = await db.getAllCitizenReports();
    
    const yesCount = reports.filter(r => r.received === "yes").length;
    const noCount = reports.filter(r => r.received === "no").length;
    const partialCount = reports.filter(r => r.received === "partial").length;

    set({
      offlineIssues: issues,
      citizenReports: reports,
      citizenPollStats: {
        yes: 124 + yesCount,
        no: 820 + noCount,
        partial: 236 + partialCount
      }
    });
  },

  // Auth Operations
  signup: async (email, password, fullName) => {
    set({ authLoading: true, authError: null });
    try {
      const res = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Signup failed.");
      }
      set({ authLoading: false });
      return data.message || "Signup successful. Verification code sent.";
    } catch (err: any) {
      set({ authLoading: false, authError: err.message });
      throw err;
    }
  },

  verifyOtp: async (email, token) => {
    set({ authLoading: true, authError: null });
    try {
      const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, type: "signup" })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "OTP verification failed.");
      }
      
      localStorage.setItem("civicpulse_access_token", data.access_token);
      localStorage.setItem("civicpulse_refresh_token", data.refresh_token);
      localStorage.setItem("civicpulse_user", JSON.stringify(data.user));

      set({
        authLoading: false,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        user: data.user
      });
    } catch (err: any) {
      set({ authLoading: false, authError: err.message });
      throw err;
    }
  },

  login: async (email, password) => {
    set({ authLoading: true, authError: null });
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Login failed.");
      }

      localStorage.setItem("civicpulse_access_token", data.access_token);
      localStorage.setItem("civicpulse_refresh_token", data.refresh_token);
      localStorage.setItem("civicpulse_user", JSON.stringify(data.user));

      set({
        authLoading: false,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        user: data.user
      });
    } catch (err: any) {
      set({ authLoading: false, authError: err.message });
      throw err;
    }
  },

  forgotPassword: async (email) => {
    set({ authLoading: true, authError: null });
    try {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      set({ authLoading: false });
      return data.message || "Password reset email sent.";
    } catch (err: any) {
      set({ authLoading: false, authError: err.message });
      throw err;
    }
  },

  refreshSession: async () => {
    const { refreshToken } = get();
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Could not refresh token");

      localStorage.setItem("civicpulse_access_token", data.access_token);
      localStorage.setItem("civicpulse_refresh_token", data.refresh_token);

      set({
        accessToken: data.access_token,
        refreshToken: data.refresh_token
      });

      return data.access_token;
    } catch (e) {
      get().logout();
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem("civicpulse_access_token");
    localStorage.removeItem("civicpulse_refresh_token");
    localStorage.removeItem("civicpulse_user");

    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      authError: null
    });
  },

  clearAuthError: () => set({ authError: null }),

  // Data Operations
  addIssue: async (category, description, photo, gps = "9.0820°N, 7.4130°E") => {
    const issue: OfflineIssue = {
      category,
      description,
      photo,
      gps,
      timestamp: Date.now(),
      synced: false
    };

    const id = await db.saveIssue(issue);

    if (!get().isOffline) {
      try {
        const formData = new FormData();
        const { lat, lng } = parseGps(gps);
        formData.append("lat", lat.toString());
        formData.append("lng", lng.toString());
        
        if (photo) {
          const blob = dataURLtoBlob(photo);
          formData.append("file", blob, "evidence.jpg");
        } else {
          // Send an empty placeholder blob if no photo is captured but endpoint demands file multipart
          const emptyBlob = new Blob([""], { type: "image/jpeg" });
          formData.append("file", emptyBlob, "evidence.jpg");
        }

        const res = await apiFetch("/ghost/analyze-photo", {
          method: "POST",
          body: formData
        });

        if (res.ok) {
          await db.markIssueSynced(id);
        }
      } catch (e) {
        console.error("Failed to sync issue on creation:", e);
      }
    }

    await get().loadOfflineData();
  },

  addCitizenPoll: async (program, received) => {
    const report: CitizenReport = {
      program,
      received,
      timestamp: Date.now(),
      synced: false
    };

    const id = await db.saveCitizenReport(report);

    if (!get().isOffline) {
      try {
        const res = await apiFetch("/reality/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            program_name: program,
            received: received === "yes" || (received === "partial" ? true : false),
            partial: received === "partial"
          })
        });

        if (res.ok) {
          await db.markCitizenReportSynced(id);
        }
      } catch (e) {
        console.error("Failed to sync poll on creation:", e);
      }
    }

    await get().loadOfflineData();
  },

  syncOfflineQueue: async () => {
    const unsyncedIssues = await db.getUnsyncedIssues();
    const unsyncedReports = await db.getUnsyncedCitizenReports();

    if (unsyncedIssues.length === 0 && unsyncedReports.length === 0) return;

    set({ isSyncing: true });

    // Sync Issues to /ghost/analyze-photo
    for (const issue of unsyncedIssues) {
      try {
        const formData = new FormData();
        const { lat, lng } = parseGps(issue.gps);
        formData.append("lat", lat.toString());
        formData.append("lng", lng.toString());
        
        if (issue.photo) {
          const blob = dataURLtoBlob(issue.photo);
          formData.append("file", blob, "evidence.jpg");
        } else {
          const emptyBlob = new Blob([""], { type: "image/jpeg" });
          formData.append("file", emptyBlob, "evidence.jpg");
        }

        const res = await apiFetch("/ghost/analyze-photo", {
          method: "POST",
          body: formData
        });

        if (res.ok && issue.id) {
          await db.markIssueSynced(issue.id);
        }
      } catch (e) {
        console.error("Error syncing issue queue:", e);
      }
    }

    // Sync social program verifications to /reality/report
    for (const report of unsyncedReports) {
      try {
        const res = await apiFetch("/reality/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            program_name: report.program,
            received: report.received === "yes" || (report.received === "partial" ? true : false),
            partial: report.received === "partial"
          })
        });

        if (res.ok && report.id) {
          await db.markCitizenReportSynced(report.id);
        }
      } catch (e) {
        console.error("Error syncing report queue:", e);
      }
    }

    set({ isSyncing: false });
    await get().loadOfflineData();
  }
}));
