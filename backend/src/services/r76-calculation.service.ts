export type AccuracyClass = "I" | "II" | "III" | "IIII";

export type VerificationType = "initial" | "in_service";

export interface MpeCalculationInput {
  load: number;
  verificationScaleInterval: number;
  accuracyClass: AccuracyClass;
  verificationType?: VerificationType;
}

export interface MpeCalculationResult {
  load: number;
  verificationScaleInterval: number;
  accuracyClass: AccuracyClass;
  verificationType: VerificationType;

  verificationIntervals: number;

  mpeMultiplier: number;
  maximumPermissibleError: number;

  lowerLimit: number;
  upperLimit: number;
}

const CLASS_LIMITS: Record<
  AccuracyClass,
  {
    first: number;
    second: number;
    maximum: number;
  }
> = {
  I: {
    first: 50000,
    second: 200000,
    maximum: Infinity,
  },
  II: {
    first: 5000,
    second: 20000,
    maximum: 100000,
  },
  III: {
    first: 500,
    second: 2000,
    maximum: 10000,
  },
  IIII: {
    first: 50,
    second: 200,
    maximum: 1000,
  },
};

const getMpeMultiplier = (
  verificationIntervals: number,
  accuracyClass: AccuracyClass,
): number => {
  const limits = CLASS_LIMITS[accuracyClass];

  if (verificationIntervals <= limits.first) {
    return 0.5;
  }

  if (verificationIntervals <= limits.second) {
    return 1.0;
  }

  if (verificationIntervals <= limits.maximum) {
    return 1.5;
  }

  throw new Error(
    `Load exceeds the applicable R76 range for accuracy class ${accuracyClass}`,
  );
};

export const calculateMaximumPermissibleError = (
  input: MpeCalculationInput,
): MpeCalculationResult => {
  const {
    load,
    verificationScaleInterval,
    accuracyClass,
    verificationType = "initial",
  } = input;

  if (!Number.isFinite(load) || load < 0) {
    throw new Error("Load must be a non-negative number");
  }

  if (
    !Number.isFinite(verificationScaleInterval) ||
    verificationScaleInterval <= 0
  ) {
    throw new Error("Verification scale interval must be greater than zero");
  }

  if (load === 0) {
    throw new Error("Load must be greater than zero for this MPE calculation");
  }

  const verificationIntervals = load / verificationScaleInterval;

  const mpeMultiplier = getMpeMultiplier(verificationIntervals, accuracyClass);

  const serviceMultiplier = verificationType === "in_service" ? 2 : 1;

  const maximumPermissibleError =
    mpeMultiplier * verificationScaleInterval * serviceMultiplier;

  return {
    load,
    verificationScaleInterval,
    accuracyClass,
    verificationType,
    verificationIntervals,
    mpeMultiplier,
    maximumPermissibleError,
    lowerLimit: load - maximumPermissibleError,
    upperLimit: load + maximumPermissibleError,
  };
};
