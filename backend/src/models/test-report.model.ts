import mongoose, { Document, Schema } from "mongoose";

export interface ITestReport extends Document {
  reportNumber: string;

  instrument: mongoose.Types.ObjectId;
  lab: mongoose.Types.ObjectId;

  testDate: Date;

  testedBy: mongoose.Types.ObjectId;

  status:
    | "draft"
    | "in_progress"
    | "submitted"
    | "under_review"
    | "approved"
    | "rejected"
    | "completed";

  overallResult: "pending" | "pass" | "fail";

  remarks?: string;
}

const testReportSchema = new Schema<ITestReport>(
  {
    reportNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    instrument: {
      type: Schema.Types.ObjectId,
      ref: "Instrument",
      required: true,
    },

    lab: {
      type: Schema.Types.ObjectId,
      ref: "Lab",
      required: true,
    },

    testDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    testedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "draft",
        "in_progress",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "completed",
      ],
      default: "draft",
    },

    overallResult: {
      type: String,
      enum: ["pending", "pass", "fail"],
      default: "pending",
    },

    remarks: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  },
);

testReportSchema.index({ instrument: 1 });
testReportSchema.index({ lab: 1 });
testReportSchema.index({ status: 1 });
testReportSchema.index({ testDate: -1 });

export const TestReport = mongoose.model<ITestReport>(
  "TestReport",
  testReportSchema,
);
