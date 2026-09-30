import { TestObservation } from "../models/test-observation.model.js";

export type OverallResult = "pending" | "pass" | "fail";

export interface ReportComplianceResult {
  totalObservations: number;
  pendingObservations: number;
  passedObservations: number;
  failedObservations: number;
  overallResult: OverallResult;
}

export const calculateReportCompliance = async (
  testReportId: string,
): Promise<ReportComplianceResult> => {
  const observations = await TestObservation.find({
    testReport: testReportId,
  }).select("result");

  const totalObservations = observations.length;

  const pendingObservations = observations.filter(
    (observation) => observation.result === "pending",
  ).length;

  const passedObservations = observations.filter(
    (observation) => observation.result === "pass",
  ).length;

  const failedObservations = observations.filter(
    (observation) => observation.result === "fail",
  ).length;

  let overallResult: OverallResult = "pending";

  if (failedObservations > 0) {
    overallResult = "fail";
  } else if (totalObservations > 0 && pendingObservations === 0) {
    overallResult = "pass";
  }

  return {
    totalObservations,
    pendingObservations,
    passedObservations,
    failedObservations,
    overallResult,
  };
};
