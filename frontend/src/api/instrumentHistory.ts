import { apiRequest } from "./client";

export type InstrumentHistoryReport = {
  _id: string;
  reportNumber: string;
  testDate: string;
  status: string;
  overallResult: string;
};

type HistoryResponse = {
  success: boolean;
  message?: string;
  data: {
    reports: InstrumentHistoryReport[];
  };
};

export async function getInstrumentHistory(
  instrumentId: string,
): Promise<InstrumentHistoryReport[]> {
  const response = await apiRequest<HistoryResponse>(
    `/test-report-repository/instrument/${instrumentId}/history`,
  );

  return response.data.reports;
}
