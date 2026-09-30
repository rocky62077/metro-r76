export type OimlTestType =
  | "accuracy"
  | "repeatability"
  | "eccentricity"
  | "zero_setting"
  | "tare";

export interface OimlTestDefinition {
  code: string;
  name: string;
  category: OimlTestType;
  standardReference: string;
  calculationService: string;
  isActive: boolean;
}

const OIML_TESTS: OimlTestDefinition[] = [
  {
    code: "R76-ACCURACY",
    name: "Weighing Accuracy Test",
    category: "accuracy",
    standardReference: "OIML R76-1:2006",
    calculationService: "observation-calculation.service",
    isActive: true,
  },
  {
    code: "R76-REPEATABILITY",
    name: "Repeatability Test",
    category: "repeatability",
    standardReference: "OIML R76-1:2006",
    calculationService: "repeatability-calculation.service",
    isActive: true,
  },
  {
    code: "R76-ECCENTRICITY",
    name: "Eccentric Loading Test",
    category: "eccentricity",
    standardReference: "OIML R76-1:2006",
    calculationService: "eccentricity-calculation.service",
    isActive: true,
  },
  {
    code: "R76-ZERO-SETTING",
    name: "Zero-Setting Test",
    category: "zero_setting",
    standardReference: "OIML R76-1:2006",
    calculationService: "zero-setting-calculation.service",
    isActive: true,
  },
  {
    code: "R76-TARE",
    name: "Tare Test",
    category: "tare",
    standardReference: "OIML R76-1:2006",
    calculationService: "tare-calculation.service",
    isActive: true,
  },
];

export const getOimlTestDefinitions = (): OimlTestDefinition[] => {
  return OIML_TESTS.filter((test) => test.isActive);
};

export const getOimlTestDefinition = (
  code: string,
): OimlTestDefinition | undefined => {
  return OIML_TESTS.find((test) => test.code === code && test.isActive);
};
