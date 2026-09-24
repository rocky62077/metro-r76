import { apiRequest } from "./client";

export type ObservationResult = "pending" | "pass" | "fail";

export type TestDefinition = {
  _id: string;
  code: string;
  name: string;
  category?: string;
  standardReference?: string;
  version?: string;
};

export type TestObservation = {
  _id: string;

  testReport:
    | string
    | {
        _id: string;
        reportNumber: string;
        instrument?: string;
        lab?: string;
        status?: string;
        overallResult?: string;
      };

  testDefinition: string | TestDefinition;

  observationNumber: number;

  inputValue?: number;
  inputUnit?: string;

  indicatedValue?: number;
  indicatedUnit?: string;

  errorValue?: number;
  errorUnit?: string;

  toleranceValue?: number;
  toleranceUnit?: string;

  result: ObservationResult;

  rawData?: Record<string, unknown>;

  remarks?: string;

  enteredBy?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };

  calculatedAt?: string;

  createdAt?: string;
  updatedAt?: string;
};

export type CreateTestObservationInput = {
  testReport: string;
  testDefinition: string;
  observationNumber: number;

  inputValue?: number;
  inputUnit?: string;

  indicatedValue?: number;
  indicatedUnit?: string;

  remarks?: string;

  rawData?: Record<string, unknown>;
};

export type CalculationResult = {
  actualError: number;
  maximumPermissibleError: number;
  lowerLimit: number;
  upperLimit: number;
  verificationIntervals: number;
  result: ObservationResult;
};

type TestObservationsResponse = {
  success: boolean;
  message?: string;
  data: {
    observations: TestObservation[];
  };
};

type CreateTestObservationResponse = {
  success: boolean;
  message?: string;
  data: {
    observation: TestObservation;
  };
};

type CalculateObservationResponse = {
  success: boolean;
  message?: string;
  data: {
    observation: TestObservation;
    calculation: CalculationResult;
  };
};

/**
 * Get observations for a test report.
 *
 * Backend:
 * GET /api/v1/test-observations?testReport=:testReportId
 */
export async function getTestObservations(
  testReportId: string,
): Promise<TestObservation[]> {
  const response = await apiRequest<TestObservationsResponse>(
    `/test-observations?testReport=${encodeURIComponent(testReportId)}`,
  );

  return response.data.observations;
}

/**
 * Create a new test observation.
 *
 * Backend:
 * POST /api/v1/test-observations
 */
export async function createTestObservation(
  input: CreateTestObservationInput,
): Promise<TestObservation> {
  const response = await apiRequest<CreateTestObservationResponse>(
    "/test-observations",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  return response.data.observation;
}

/**
 * Calculate an observation using the backend OIML calculation service.
 *
 * Backend:
 * POST /api/v1/observation-calculations/:observationId/calculate
 */
export async function calculateTestObservation(observationId: string): Promise<{
  observation: TestObservation;
  calculation: CalculationResult;
}> {
  const response = await apiRequest<CalculateObservationResponse>(
    `/observation-calculations/${observationId}/calculate`,
    {
      method: "POST",
    },
  );

  return response.data;
}
