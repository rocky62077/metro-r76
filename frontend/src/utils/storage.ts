import type { Instrument, TestReport } from "../types";

const INSTRUMENTS_KEY = "metro_r76_instruments";
const REPORTS_KEY = "metro_r76_reports";

export function getInstruments(): Instrument[] {
  const data = localStorage.getItem(INSTRUMENTS_KEY);

  if (!data) {
    return [];
  }

  try {
    return JSON.parse(data) as Instrument[];
  } catch {
    return [];
  }
}

export function saveInstruments(instruments: Instrument[]): void {
  localStorage.setItem(INSTRUMENTS_KEY, JSON.stringify(instruments));
}

export function getTestReports(): TestReport[] {
  const data = localStorage.getItem(REPORTS_KEY);

  if (!data) {
    return [];
  }

  try {
    return JSON.parse(data) as TestReport[];
  } catch {
    return [];
  }
}

export function saveTestReports(reports: TestReport[]): void {
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}
