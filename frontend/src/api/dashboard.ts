import { apiRequest } from "./client";

export type DashboardData = {
  overview: {
    totalInstruments: number;
    activeInstruments: number;
    totalReports: number;
    passedReports: number;
    failedReports: number;
    pendingReports: number;
    completedReports: number;
    totalLabs: number;
  };

  workflow: {
    draft: number;
    submitted: number;
    underReview: number;
    approved: number;
    completed: number;
  };

  instrumentStatus: {
    _id: string;
    count: number;
  }[];

  recentReports: {
    _id: string;
    reportNumber: string;
    instrument?: {
      instrumentName: string;
      modelNumber: string;
      serialNumber: string;
    };
    lab?: {
      name: string;
      code: string;
    };
    testDate: string;
    status: string;
    overallResult: string;
  }[];

  reportActivity: {
    _id: string;
    count: number;
  }[];
};

export type DashboardResponse = {
  success: boolean;
  message: string;
  data: DashboardData;
};

export async function getDashboard(): Promise<DashboardResponse> {
  return apiRequest<DashboardResponse>("/dashboard");
}
