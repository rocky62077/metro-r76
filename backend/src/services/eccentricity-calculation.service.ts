export interface EccentricityReading {
  position: string;
  indicatedValue: number;
}

export interface EccentricityCalculationInput {
  referenceIndication: number;
  readings: EccentricityReading[];
  maximumPermissibleError: number;
}

export interface EccentricityResult {
  referenceIndication: number;

  readings: EccentricityReading[];

  maximumDifference: number;
  maximumPermissibleError: number;

  worstPosition: string;

  result: "pass" | "fail";
}

export const calculateEccentricity = (
  input: EccentricityCalculationInput,
): EccentricityResult => {
  const { referenceIndication, readings, maximumPermissibleError } = input;

  if (!Number.isFinite(referenceIndication)) {
    throw new Error("Reference indication must be a valid number");
  }

  if (!Array.isArray(readings) || readings.length === 0) {
    throw new Error("At least one eccentricity reading is required");
  }

  if (
    readings.some(
      (reading) =>
        !reading.position || !Number.isFinite(reading.indicatedValue),
    )
  ) {
    throw new Error(
      "Every eccentricity reading must contain a position and valid indicated value",
    );
  }

  if (
    !Number.isFinite(maximumPermissibleError) ||
    maximumPermissibleError < 0
  ) {
    throw new Error(
      "Maximum permissible error must be a valid non-negative number",
    );
  }

  let maximumDifference = 0;
  let worstPosition = readings[0].position;

  for (const reading of readings) {
    const difference = Math.abs(reading.indicatedValue - referenceIndication);

    if (difference > maximumDifference) {
      maximumDifference = difference;
      worstPosition = reading.position;
    }
  }

  maximumDifference = Number(maximumDifference.toFixed(6));

  const result = maximumDifference <= maximumPermissibleError ? "pass" : "fail";

  return {
    referenceIndication,
    readings,
    maximumDifference,
    maximumPermissibleError,
    worstPosition,
    result,
  };
};
