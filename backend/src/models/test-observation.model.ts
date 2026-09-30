import mongoose, { Document, Schema } from "mongoose";

export interface ITestObservation extends Document {
  testReport: mongoose.Types.ObjectId;
  testDefinition: mongoose.Types.ObjectId;

  observationNumber: number;

  inputValue?: number;
  inputUnit?: string;

  indicatedValue?: number;
  indicatedUnit?: string;

  errorValue?: number;
  errorUnit?: string;

  toleranceValue?: number;
  toleranceUnit?: string;

  result: "pending" | "pass" | "fail";

  rawData?: Record<string, unknown>;

  remarks?: string;

  enteredBy: mongoose.Types.ObjectId;

  calculatedAt?: Date;
}

const testObservationSchema = new Schema<ITestObservation>(
  {
    testReport: {
      type: Schema.Types.ObjectId,
      ref: "TestReport",
      required: true,
    },

    testDefinition: {
      type: Schema.Types.ObjectId,
      ref: "TestDefinition",
      required: true,
    },

    observationNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    inputValue: {
      type: Number,
    },

    inputUnit: {
      type: String,
      trim: true,
      maxlength: 20,
    },

    indicatedValue: {
      type: Number,
    },

    indicatedUnit: {
      type: String,
      trim: true,
      maxlength: 20,
    },

    errorValue: {
      type: Number,
    },

    errorUnit: {
      type: String,
      trim: true,
      maxlength: 20,
    },

    toleranceValue: {
      type: Number,
    },

    toleranceUnit: {
      type: String,
      trim: true,
      maxlength: 20,
    },

    result: {
      type: String,
      enum: ["pending", "pass", "fail"],
      default: "pending",
    },

    rawData: {
      type: Schema.Types.Mixed,
    },

    remarks: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    enteredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    calculatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

testObservationSchema.index({
  testReport: 1,
});

testObservationSchema.index({
  testDefinition: 1,
});

testObservationSchema.index({
  testReport: 1,
  observationNumber: 1,
});

export const TestObservation = mongoose.model<ITestObservation>(
  "TestObservation",
  testObservationSchema,
);
