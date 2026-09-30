import {
  calculateMaximumPermissibleError,
  AccuracyClass,
  VerificationType,
} from "./r76-calculation.service.js";

export interface RepeatabilityCalculationInput {
  indicatedValues: number[];
  load: number;
  verificationScaleInterval: number;
  accuracyClass: AccuracyClass;
  verificationType?: VerificationType;
}

export interface RepeatabilityCalculationResult {
  readings: number[];
  numberOfReadings: number;

  load: number;

  minimumIndication: number;
  maximumIndication: number;

  range: number;

  maximumPermissibleError: number;

  result: "pass" | "fail";
}

export const calculateRepeatability = (
  input: RepeatabilityCalculationInput,
): RepeatabilityCalculationResult => {
  const {
    indicatedValues,
    load,
    verificationScaleInterval,
    accuracyClass,
    verificationType = "initial",
  } = input;

  if (!Array.isArray(indicatedValues)) {
    throw new Error("Indicated values must be an array");
  }

  if (indicatedValues.length < 2) {
    throw new Error("At least two readings are required for repeatability");
  }

  if (indicatedValues.some((value) => !Number.isFinite(value))) {
    throw new Error("All indicated values must be valid numbers");
  }

  if (!Number.isFinite(load) || load <= 0) {
    throw new Error("Load must be greater than zero");
  }

  const minimumIndication = Math.min(...indicatedValues);

  const maximumIndication = Math.max(...indicatedValues);

  const range = Number((maximumIndication - minimumIndication).toFixed(6));

  const mpeResult = calculateMaximumPermissibleError({
    load,
    verificationScaleInterval,
    accuracyClass,
    verificationType,
  });

  const maximumPermissibleError = mpeResult.maximumPermissibleError;

  const result = range <= maximumPermissibleError ? "pass" : "fail";

  return {
    readings: indicatedValues,
    numberOfReadings: indicatedValues.length,

    load,

    minimumIndication,
    maximumIndication,

    range,

    maximumPermissibleError,

    result,
  };
};
