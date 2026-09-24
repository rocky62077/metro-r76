import { apiRequest } from "./client";

export type Manufacturer = {
  _id: string;
  name: string;
  code: string;
};

export type Laboratory = {
  _id: string;
  name: string;
  code: string;
};

type ManufacturersResponse = {
  success: boolean;
  message?: string;
  data: {
    manufacturers: Manufacturer[];
  };
};

type LaboratoriesResponse = {
  success: boolean;
  message?: string;
  data: {
    labs: Laboratory[];
  };
};

export async function getManufacturers(): Promise<Manufacturer[]> {
  const response = await apiRequest<ManufacturersResponse>("/manufacturers");

  return response.data.manufacturers;
}

export async function getLaboratories(): Promise<Laboratory[]> {
  const response = await apiRequest<LaboratoriesResponse>("/labs");

  return response.data.labs;
}
