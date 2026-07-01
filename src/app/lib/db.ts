import { openDB, DBSchema, IDBPDatabase } from "idb";

export interface OfflineIssue {
  id?: string;
  category: string;
  description: string;
  photo?: string; // base64 representation
  gps: string;
  timestamp: number;
  synced: boolean;
}

export interface CitizenReport {
  id?: string;
  program: string;
  received: string; // "yes" | "no" | "partial"
  timestamp: number;
  synced: boolean;
}

interface CivicPulseDB extends DBSchema {
  offline_issues: {
    key: string;
    value: OfflineIssue;
  };
  citizen_reports: {
    key: string;
    value: CitizenReport;
  };
}

let dbPromise: Promise<IDBPDatabase<CivicPulseDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<CivicPulseDB>("CivicPulseDB", 1, {
      upgrade(db) {
        db.createObjectStore("offline_issues", { keyPath: "id" });
        db.createObjectStore("citizen_reports", { keyPath: "id" });
      },
    });
  }
  return dbPromise;
}

export const db = {
  // Offline Issues Operations
  async saveIssue(issue: OfflineIssue): Promise<string> {
    const database = await getDB();
    const id = issue.id || Math.random().toString(36).substring(2, 9);
    const newIssue = { ...issue, id };
    await database.put("offline_issues", newIssue);
    return id;
  },

  async getUnsyncedIssues(): Promise<OfflineIssue[]> {
    const database = await getDB();
    const all = await database.getAll("offline_issues");
    return all.filter((item) => !item.synced);
  },

  async markIssueSynced(id: string): Promise<void> {
    const database = await getDB();
    const issue = await database.get("offline_issues", id);
    if (issue) {
      issue.synced = true;
      await database.put("offline_issues", issue);
    }
  },

  async deleteIssue(id: string): Promise<void> {
    const database = await getDB();
    await database.delete("offline_issues", id);
  },

  async getAllIssues(): Promise<OfflineIssue[]> {
    const database = await getDB();
    return database.getAll("offline_issues");
  },

  // Citizen Reports Operations (Reality Checker Polls)
  async saveCitizenReport(report: CitizenReport): Promise<string> {
    const database = await getDB();
    const id = report.id || Math.random().toString(36).substring(2, 9);
    const newReport = { ...report, id };
    await database.put("citizen_reports", newReport);
    return id;
  },

  async getUnsyncedCitizenReports(): Promise<CitizenReport[]> {
    const database = await getDB();
    const all = await database.getAll("citizen_reports");
    return all.filter((item) => !item.synced);
  },

  async markCitizenReportSynced(id: string): Promise<void> {
    const database = await getDB();
    const report = await database.get("citizen_reports", id);
    if (report) {
      report.synced = true;
      await database.put("citizen_reports", report);
    }
  },

  async getAllCitizenReports(): Promise<CitizenReport[]> {
    const database = await getDB();
    return database.getAll("citizen_reports");
  }
};
