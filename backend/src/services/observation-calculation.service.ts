import {
  calculateMaximumPermissibleError,
  AccuracyClass,
  VerificationType,
} from "./r76-calculation.service.js";

export interface ObservationCalculationInput {
  inputValue: number;
  indicatedValue: number;
  verificationScaleInterval: number;
  accuracyClass: AccuracyClass;
  verificationType?: VerificationType;
}

export interface ObservationCalculationResult {
  inputValue: number;
  indicatedValue: number;

  actualError: number;
  maximumPermissibleError: number;

  lowerLimit: number;
  upperLimit: number;

  verificationIntervals: number;

  result: "pass" | "fail";
}

export const calculateObservationResult = (
  input: ObservationCalculationInput,
): ObservationCalculationResult => {
  const {
    inputValue,
    indicatedValue,
    verificationScaleInterval,
    accuracyClass,
    verificationType = "initial",
  } = input;

  if (!Number.isFinite(inputValue)) {
    throw new Error("Input value must be a valid number");
  }

  if (!Number.isFinite(indicatedValue)) {
    throw new Error("Indicated value must be a valid number");
  }

  if (inputValue <= 0) {
    throw new Error("Input value must be greater than zero");
  }
  const actualError = Number((indicatedValue - inputValue).toFixed(6));

  const mpeResult = calculateMaximumPermissibleError({
    load: inputValue,
    verificationScaleInterval,
    accuracyClass,
    verificationType,
  });

  const result =
    Math.abs(actualError) <= mpeResult.maximumPermissibleError
      ? "pass"
      : "fail";

  return {
    inputValue,
    indicatedValue,

    actualError,
    maximumPermissibleError: mpeResult.maximumPermissibleError,

    lowerLimit: mpeResult.lowerLimit,
    upperLimit: mpeResult.upperLimit,

    verificationIntervals: mpeResult.verificationIntervals,

    result,
  };
};
