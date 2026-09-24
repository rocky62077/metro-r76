export type InstrumentStatus =
  | "Active"
  | "Under Testing"
  | "Approved"
  | "Rejected";

export type Instrument = {
  id: number;
  manufacturer: string;
  model: string;
  serialNumber: string;
  maxCapacity: string;
  accuracyClass: string;
  status: InstrumentStatus;
};

export type TestReportStatus =
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Approved"
  | "Completed"
  | "Rejected";

export type TestReport = {
  id: number;
  reportNumber: string;
  instrumentId: number;
  testDate: string;
  testedBy: string;
  status: TestReportStatus;
};
