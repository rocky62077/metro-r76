import mongoose, { Document, Schema } from "mongoose";

export interface ILab extends Document {
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone?: string;
  email?: string;
  accreditation?: string;
  accreditationNumber?: string;
  reportPrefix: string;
  isActive: boolean;
}

const labSchema = new Schema<ILab>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 50,
    },

    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    state: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    country: {
      type: String,
      required: true,
      trim: true,
      default: "India",
    },

    postalCode: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },

    phone: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    accreditation: {
      type: String,
      trim: true,
    },

    accreditationNumber: {
      type: String,
      trim: true,
    },

    reportPrefix: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 20,
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

export const Lab = mongoose.model<ILab>("Lab", labSchema);
