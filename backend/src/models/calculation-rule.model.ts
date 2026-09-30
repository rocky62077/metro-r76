import mongoose, { Document, Schema } from "mongoose";

export interface ICalculationRule extends Document {
  code: string;
  name: string;

  standardReference: string;
  version: string;

  testCategory:
    | "accuracy"
    | "repeatability"
    | "eccentricity"
    | "tare"
    | "zero"
    | "temperature"
    | "influence"
    | "other";

  accuracyClass?: "I" | "II" | "III" | "IIII";

  minLoad?: number;
  maxLoad?: number;

  formulaType:
    | "absolute_error"
    | "percentage_error"
    | "maximum_permissible_error"
    | "custom";

  parameters: Record<string, unknown>;

  isActive: boolean;
}

const calculationRuleSchema = new Schema<ICalculationRule>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 100,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    standardReference: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    version: {
      type: String,
      required: true,
      trim: true,
    },

    testCategory: {
      type: String,
      enum: [
        "accuracy",
        "repeatability",
        "eccentricity",
        "tare",
        "zero",
        "temperature",
        "influence",
        "other",
      ],
      required: true,
    },

    accuracyClass: {
      type: String,
      enum: ["I", "II", "III", "IIII"],
    },

    minLoad: {
      type: Number,
      min: 0,
    },

    maxLoad: {
      type: Number,
      min: 0,
    },

    formulaType: {
      type: String,
      enum: [
        "absolute_error",
        "percentage_error",
        "maximum_permissible_error",
        "custom",
      ],
      required: true,
    },

    parameters: {
      type: Schema.Types.Mixed,
      default: {},
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

calculationRuleSchema.index({
  standardReference: 1,
  version: 1,
});

calculationRuleSchema.index({
  testCategory: 1,
});

calculationRuleSchema.index({
  accuracyClass: 1,
});

calculationRuleSchema.index({
  isActive: 1,
});

export const CalculationRule = mongoose.model<ICalculationRule>(
  "CalculationRule",
  calculationRuleSchema,
);
