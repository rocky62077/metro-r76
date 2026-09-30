import mongoose, { Document, Schema } from "mongoose";

export interface IInstrument extends Document {
  instrumentName: string;
  instrumentType: string;
  manufacturer: mongoose.Types.ObjectId;
  modelNumber: string;
  serialNumber: string;

  capacity: number;
  capacityUnit: string;

  scaleInterval: number;
  scaleIntervalUnit: string;

  accuracyClass?: string;
  numberOfVerificationScaleIntervals?: number;

  lab: mongoose.Types.ObjectId;

  yearOfManufacture?: number;
  application?: string;

  status: "registered" | "under_test" | "passed" | "failed" | "inactive";

  isActive: boolean;
}

const instrumentSchema = new Schema<IInstrument>(
  {
    instrumentName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    instrumentType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    manufacturer: {
      type: Schema.Types.ObjectId,
      ref: "Manufacturer",
      required: true,
    },

    modelNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    serialNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
    },

    capacity: {
      type: Number,
      required: true,
      min: 0,
    },

    capacityUnit: {
      type: String,
      required: true,
      trim: true,
      default: "kg",
    },

    scaleInterval: {
      type: Number,
      required: true,
      min: 0,
    },

    scaleIntervalUnit: {
      type: String,
      required: true,
      trim: true,
      default: "kg",
    },

    accuracyClass: {
      type: String,
      trim: true,
    },

    numberOfVerificationScaleIntervals: {
      type: Number,
      min: 0,
    },

    lab: {
      type: Schema.Types.ObjectId,
      ref: "Lab",
      required: true,
    },

    yearOfManufacture: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear(),
    },

    application: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    status: {
      type: String,
      enum: ["registered", "under_test", "passed", "failed", "inactive"],
      default: "registered",
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

instrumentSchema.index({ manufacturer: 1 });
instrumentSchema.index({ lab: 1 });
instrumentSchema.index({ modelNumber: 1 });

export const Instrument = mongoose.model<IInstrument>(
  "Instrument",
  instrumentSchema,
);
