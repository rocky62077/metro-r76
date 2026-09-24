import { apiRequest } from "./client";

export type ManufacturerReference = {
  _id: string;
  name: string;
  code: string;
};

export type LaboratoryReference = {
  _id: string;
  name: string;
  code: string;
};

export type Instrument = {
  _id: string;
  instrumentName: string;
  instrumentType: string;
  modelNumber: string;
  serialNumber: string;
  capacity: number;
  capacityUnit: string;
  scaleInterval: number;
  scaleIntervalUnit: string;
  accuracyClass?: string;
  numberOfVerificationScaleIntervals?: number;
  yearOfManufacture?: number;
  application?: string;
  status?: string;
  manufacturer?: ManufacturerReference;
  lab?: LaboratoryReference;
};

export type CreateInstrumentInput = {
  instrumentName: string;
  instrumentType: string;
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  capacity: number;
  capacityUnit: string;
  scaleInterval: number;
  scaleIntervalUnit: string;
  accuracyClass?: string;
  numberOfVerificationScaleIntervals?: number;
  lab: string;
  yearOfManufacture?: number;
  application?: string;
};

type InstrumentsResponse = {
  success: boolean;
  message?: string;
  data: {
    instruments: Instrument[];
  };
};

type CreateInstrumentResponse = {
  success: boolean;
  message?: string;
  data: {
    instrument: Instrument;
  };
};

export async function getInstruments(): Promise<Instrument[]> {
  const response = await apiRequest<InstrumentsResponse>("/instruments");

  return response.data.instruments;
}

export async function createInstrument(
  input: CreateInstrumentInput,
): Promise<Instrument> {
  const response = await apiRequest<CreateInstrumentResponse>("/instruments", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.data.instrument;
}
