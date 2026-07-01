import { create } from "zustand";
import i18n from "../../i18n";
import { db, OfflineIssue, CitizenReport } from "../lib/db";

export type Language = "pidgin" | "english" | "yoruba" | "hausa";
export type Screen = "home" | "budget" | "ghost" | "social" | "contradiction" | "foi" | "reporter" | "profile" | "components";
export type NavTab = "home" | "budget" | "map" | "reports" | "profile";

interface AppState {
  lang: Language;
  screen: Screen;
  tab: NavTab;
  isOffline: boolean;
  isSyncing: boolean;
  offlineIssues: OfflineIssue[];
  citizenReports: CitizenReport[];
  
  // Citizen poll statistics (Reality score)
  citizenPollStats: {
    yes: number;
    no: number;
    partial: number;
  };

  // Actions
  setLang: (lang: Language) => void;
  setScreen: (screen: Screen) => void;
  setTab: (tab: NavTab) => void;
  setIsOffline: (isOffline: boolean) => void;
  loadOfflineData: () => Promise<void>;
  addIssue: (category: string, description: string, photo?: string, gps?: string) => Promise<void>;
  addCitizenPoll: (program: string, received: "yes" | "no" | "partial") => Promise<void>;
  syncOfflineQueue: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  lang: "english",
  screen: "home",
  tab: "home",
  isOffline: false,
  isSyncing: false,
  offlineIssues: [],
  citizenReports: [],
  citizenPollStats: {
    yes: 124,   // Crowdsourced baseline
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
    // Proactively trigger sync when going online
    if (!isOffline) {
      get().syncOfflineQueue();
    }
  },

  loadOfflineData: async () => {
    const issues = await db.getAllIssues();
    const reports = await db.getAllCitizenReports();
    
    // Recalculate stats based on local reports
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

  addIssue: async (category, description, photo, gps = "9.0820°N, 7.4130°E") => {
    const issue: OfflineIssue = {
      category,
      description,
      photo,
      gps,
      timestamp: Date.now(),
      synced: !get().isOffline
    };

    // Save to IndexedDB
    const id = await db.saveIssue(issue);

    // If online, simulate immediately pushing to Abdulhammed's FastAPI endpoint
    if (!get().isOffline) {
      // TODO: connect to Abdulhammed's FastAPI endpoint
      // fetch('https://api.civicpulse.org/issues', { method: 'POST', body: JSON.stringify(issue) })
      await db.markIssueSynced(id);
    }

    await get().loadOfflineData();
  },

  addCitizenPoll: async (program, received) => {
    const report: CitizenReport = {
      program,
      received,
      timestamp: Date.now(),
      synced: !get().isOffline
    };

    // Save to IndexedDB
    const id = await db.saveCitizenReport(report);

    // If online, simulate pushing to FastAPI endpoint
    if (!get().isOffline) {
      // TODO: connect to Abdulhammed's FastAPI endpoint
      // fetch('https://api.civicpulse.org/reality-checker', { method: 'POST', body: JSON.stringify(report) })
      await db.markCitizenReportSynced(id);
    }

    await get().loadOfflineData();
  },

  syncOfflineQueue: async () => {
    const unsyncedIssues = await db.getUnsyncedIssues();
    const unsyncedReports = await db.getUnsyncedCitizenReports();

    if (unsyncedIssues.length === 0 && unsyncedReports.length === 0) return;

    set({ isSyncing: true });

    // Simulate batch upload / synchronization delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // TODO: connect to Abdulhammed's FastAPI endpoint
    // Loop and sync issues
    for (const issue of unsyncedIssues) {
      if (issue.id) {
        await db.markIssueSynced(issue.id);
      }
    }

    // Loop and sync reports
    for (const report of unsyncedReports) {
      if (report.id) {
        await db.markCitizenReportSynced(report.id);
      }
    }

    set({ isSyncing: false });
    await get().loadOfflineData();
  }
}));
