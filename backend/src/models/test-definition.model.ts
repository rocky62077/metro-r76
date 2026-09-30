import mongoose, { Document, Schema } from "mongoose";

export interface ITestDefinition extends Document {
  code: string;
  name: string;
  description?: string;

  category:
    | "metrological"
    | "accuracy"
    | "repeatability"
    | "eccentricity"
    | "tare"
    | "zero"
    | "temperature"
    | "influence"
    | "other";

  standardReference: string;

  version: string;

  isActive: boolean;

  sequence: number;
}

const testDefinitionSchema = new Schema<ITestDefinition>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 50,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    category: {
      type: String,
      enum: [
        "metrological",
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
      default: "R76",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    sequence: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

testDefinitionSchema.index({ category: 1 });
testDefinitionSchema.index({ isActive: 1 });
testDefinitionSchema.index({ sequence: 1 });

export const TestDefinition = mongoose.model<ITestDefinition>(
  "TestDefinition",
  testDefinitionSchema,
);
