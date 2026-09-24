import { apiRequest } from "./client";

export type ReportStatus =
  | "draft"
  | "in_progress"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "completed";

export type OverallResult = "pending" | "pass" | "fail";

export type ReportInstrument = {
  _id: string;
  instrumentName: string;
  instrumentType?: string;
  modelNumber?: string;
  serialNumber?: string;
  capacity?: number;
  capacityUnit?: string;
  scaleInterval?: number;
  scaleIntervalUnit?: string;
  accuracyClass?: string;
};

export type ReportLab = {
  _id: string;
  name: string;
  code: string;
  city?: string;
  state?: string;
};

export type ReportTester = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

export type TestReport = {
  _id: string;
  reportNumber: string;
  instrument: ReportInstrument;
  lab: ReportLab;
  testedBy: ReportTester;
  testDate: string;
  status: ReportStatus;
  overallResult: OverallResult;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateTestReportInput = {
  reportNumber: string;
  instrument: string;
  lab: string;
  testDate: string;
  remarks?: string;
};

type TestReportsResponse = {
  success: boolean;
  message?: string;
  data: {
    reports: TestReport[];
  };
};

type CreateTestReportResponse = {
  success: boolean;
  message?: string;
  data: {
    report: TestReport;
  };
};

/* =========================================================
   INSTRUMENT TEST HISTORY
   ========================================================= */

export type InstrumentTestHistory = {
  _id: string;
  reportNumber: string;
  testDate: string;
  status: ReportStatus;
  overallResult: OverallResult;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;

  instrument?: ReportInstrument;
  lab?: ReportLab;
  testedBy?: ReportTester;
};

/*
 * The backend history endpoint returns:
 *
 * {
 *   success: true,
 *   data: {
 *     instrument: {...},
 *     ...
 *   }
 *
 * The history collection may be exposed as `history`
 * or `reports` depending on the backend version.
 *
 * Supporting both here keeps the frontend compatible
 * with the existing backend response.
 */
type InstrumentHistoryResponse = {
  success: boolean;
  message?: string;
  data: {
    instrument?: ReportInstrument;

    history?: InstrumentTestHistory[];

    reports?: InstrumentTestHistory[];
  };
};

/* =========================================================
   GET ALL TEST REPORTS
   ========================================================= */

export async function getTestReports(): Promise<TestReport[]> {
  const response = await apiRequest<TestReportsResponse>("/test-reports");

  return response.data.reports;
}

/* =========================================================
   CREATE TEST REPORT
   ========================================================= */

export async function createTestReport(
  input: CreateTestReportInput,
): Promise<TestReport> {
  const response = await apiRequest<CreateTestReportResponse>("/test-reports", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.data.report;
}

/* =========================================================
   GET TEST HISTORY FOR AN INSTRUMENT
   ========================================================= */

export async function getInstrumentTestHistory(
  instrumentId: string,
): Promise<InstrumentTestHistory[]> {
  const response = await apiRequest<InstrumentHistoryResponse>(
    `/test-report-repository/instrument/${instrumentId}/history`,
  );

  return response.data.history ?? response.data.reports ?? [];
}
