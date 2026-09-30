export interface TareCalculationInput {
  grossLoad: number;
  tareValue: number;
  indicatedNetValue: number;
  verificationScaleInterval: number;
  maximumPermissibleError: number;
}

export interface TareCalculationResult {
  grossLoad: number;
  tareValue: number;

  expectedNetValue: number;
  indicatedNetValue: number;

  tareError: number;

  maximumPermissibleError: number;

  result: "pass" | "fail";
}

export const calculateTare = (
  input: TareCalculationInput,
): TareCalculationResult => {
  const {
    grossLoad,
    tareValue,
    indicatedNetValue,
    verificationScaleInterval,
    maximumPermissibleError,
  } = input;

  if (!Number.isFinite(grossLoad) || grossLoad < 0) {
    throw new Error("Gross load must be a valid non-negative number");
  }

  if (!Number.isFinite(tareValue) || tareValue < 0) {
    throw new Error("Tare value must be a valid non-negative number");
  }

  if (!Number.isFinite(indicatedNetValue)) {
    throw new Error("Indicated net value must be a valid number");
  }

  if (
    !Number.isFinite(verificationScaleInterval) ||
    verificationScaleInterval <= 0
  ) {
    throw new Error("Verification scale interval must be greater than zero");
  }

  if (
    !Number.isFinite(maximumPermissibleError) ||
    maximumPermissibleError < 0
  ) {
    throw new Error(
      "Maximum permissible error must be a valid non-negative number",
    );
  }

  const expectedNetValue = Number((grossLoad - tareValue).toFixed(6));

  const tareError = Number((indicatedNetValue - expectedNetValue).toFixed(6));

  const result =
    Math.abs(tareError) <= maximumPermissibleError ? "pass" : "fail";

  return {
    grossLoad,
    tareValue,

    expectedNetValue,
    indicatedNetValue,

    tareError,

    maximumPermissibleError,

    result,
  };
};
