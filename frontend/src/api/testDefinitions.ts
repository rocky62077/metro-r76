import { apiRequest } from "./client";

export type TestDefinition = {
  _id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  standardReference: string;
  version: string;
  isActive: boolean;
  sequence: number;
};

type TestDefinitionsResponse = {
  success: boolean;
  message?: string;
  data: {
    testDefinitions: TestDefinition[];
  };
};

export async function getTestDefinitions(): Promise<TestDefinition[]> {
  const response =
    await apiRequest<TestDefinitionsResponse>("/test-definitions");

  return response.data.testDefinitions;
}
