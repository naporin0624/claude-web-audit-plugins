/**
 * Type definitions for Playwright Security Runner
 */

export interface Payload {
  name: string;
  value: string;
}

export type TestType = 'xss' | 'sqli' | 'auth' | 'csrf' | 'idor';

export type PayloadCollection = {
  [K in TestType]?: Payload[];
};

export interface TestOptions {
  url: string;
  formSelector: string | null;
  tests: TestType[];
  dryRun: boolean;
  screenshot: boolean;
  json: boolean;
  headless: boolean;
}

export interface FormInfo {
  selector: string;
}

export interface InputInfo {
  name: string;
  type: string;
  selector: string;
}

export interface TestResult {
  payload: string;
  payloadName: string;
  field: string;
  timestamp: string;
  vulnerable: boolean;
  evidence: string[];
  testType?: TestType;
  form?: string;
  error?: string;
  screenshot?: string;
}

export interface TestSummary {
  total: number;
  vulnerable: number;
}

export interface TestResults {
  target: string;
  timestamp: string;
  tests: TestResult[];
  summary: TestSummary;
}

export type BountyEstimates = {
  [K in TestType]: string;
};
