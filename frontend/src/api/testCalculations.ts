import { apiRequest } from "./client";

export type CalculationResult = "pass" | "fail";

export type RepeatabilityCalculationInput = {
  instrumentId: string;
  load: number;
  indicatedValues: number[];
  verificationType?: "initial" | "subsequent";
};

export type RepeatabilityCalculation = {
  readings: number[];
  numberOfReadings: number;
  load: number;
  minimumIndication: number;
  maximumIndication: number;
  range: number;
  maximumPermissibleError: number;
  result: CalculationResult;
};

export type EccentricityReading = {
  position: string;
  indicatedValue: number;
};

export type EccentricityCalculationInput = {
  referenceIndication: number;
  readings: EccentricityReading[];
  maximumPermissibleError: number;
};

export type EccentricityCalculation = {
  referenceIndication: number;
  readings: EccentricityReading[];
  maximumDifference: number;
  maximumPermissibleError: number;
  worstPosition: string;
  result: CalculationResult;
};

export type ZeroSettingCalculationInput = {
  instrumentId: string;
  zeroIndication: number;
};

export type ZeroSettingCalculation = {
  zeroIndication: number;
  verificationScaleInterval: number;
  maximumAllowedDeviation: number;
  absoluteDeviation: number;
  result: CalculationResult;
};

export type TareCalculationInput = {
  grossLoad: number;
  tareValue: number;
  indicatedNetValue: number;
  verificationScaleInterval: number;
  maximumPermissibleError: number;
};

export type TareCalculation = {
  grossLoad: number;
  tareValue: number;
  expectedNetValue: number;
  indicatedNetValue: number;
  tareError: number;
  maximumPermissibleError: number;
  result: CalculationResult;
};

type RepeatabilityResponse = {
  success: boolean;
  message?: string;
  data: {
    instrument: {
      id: string;
      instrumentName: string;
      serialNumber: string;
      accuracyClass?: string;
      scaleInterval: number;
      scaleIntervalUnit: string;
    };
    calculation: RepeatabilityCalculation;
  };
};

type EccentricityResponse = {
  success: boolean;
  message?: string;
  data: {
    calculation: EccentricityCalculation;
  };
};

type ZeroSettingResponse = {
  success: boolean;
  message?: string;
  data: {
    instrument: {
      id: string;
      instrumentName: string;
      serialNumber: string;
      scaleInterval: number;
      scaleIntervalUnit: string;
    };
    calculation: ZeroSettingCalculation;
  };
};

type TareResponse = {
  success: boolean;
  message?: string;
  data: {
    calculation: TareCalculation;
  };
};

export async function calculateRepeatability(
  input: RepeatabilityCalculationInput,
): Promise<{
  instrument: RepeatabilityResponse["data"]["instrument"];
  calculation: RepeatabilityCalculation;
}> {
  const response = await apiRequest<RepeatabilityResponse>(
    "/repeatability-calculations/calculate",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  return response.data;
}

export async function calculateEccentricity(
  input: EccentricityCalculationInput,
): Promise<EccentricityCalculation> {
  const response = await apiRequest<EccentricityResponse>(
    "/eccentricity-calculations/calculate",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  return response.data.calculation;
}

export async function calculateZeroSetting(
  input: ZeroSettingCalculationInput,
): Promise<{
  instrument: ZeroSettingResponse["data"]["instrument"];
  calculation: ZeroSettingCalculation;
}> {
  const response = await apiRequest<ZeroSettingResponse>(
    "/zero-setting-calculations/calculate",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  return response.data;
}

export async function calculateTare(
  input: TareCalculationInput,
): Promise<TareCalculation> {
  const response = await apiRequest<TareResponse>(
    "/tare-calculations/calculate",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  return response.data.calculation;
}
