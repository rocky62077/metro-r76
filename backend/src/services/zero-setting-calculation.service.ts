export interface ZeroSettingCalculationInput {
  zeroIndication: number;
  verificationScaleInterval: number;
}

export interface ZeroSettingCalculationResult {
  zeroIndication: number;
  verificationScaleInterval: number;

  maximumAllowedDeviation: number;

  absoluteDeviation: number;

  result: "pass" | "fail";
}

export const calculateZeroSetting = (
  input: ZeroSettingCalculationInput,
): ZeroSettingCalculationResult => {
  const { zeroIndication, verificationScaleInterval } = input;

  if (!Number.isFinite(zeroIndication)) {
    throw new Error("Zero indication must be a valid number");
  }

  if (
    !Number.isFinite(verificationScaleInterval) ||
    verificationScaleInterval <= 0
  ) {
    throw new Error("Verification scale interval must be greater than zero");
  }

  /*
   * OIML R76-1:2006, clause 4.5.2:
   * After zero setting, the effect of zero deviation
   * on the weighing result shall not be more than ±0.25 e.
   */

  const maximumAllowedDeviation = Number(
    (0.25 * verificationScaleInterval).toFixed(6),
  );

  const absoluteDeviation = Number(Math.abs(zeroIndication).toFixed(6));

  const result = absoluteDeviation <= maximumAllowedDeviation ? "pass" : "fail";

  return {
    zeroIndication,
    verificationScaleInterval,

    maximumAllowedDeviation,

    absoluteDeviation,

    result,
  };
};
