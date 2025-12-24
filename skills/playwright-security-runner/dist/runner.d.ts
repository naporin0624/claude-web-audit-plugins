/**
 * Core security testing logic using Playwright
 */
import { type Page } from 'playwright';
import type { TestOptions, TestResults, TestResult, FormInfo, InputInfo, Payload } from './types.js';
export declare function findForms(page: Page, formSelector: string | null): Promise<FormInfo[]>;
export declare function getFormInputs(page: Page, formSelector: string): Promise<InputInfo[]>;
export declare function testPayload(page: Page, formSelector: string, inputSelector: string, payload: Payload, options: TestOptions): Promise<TestResult>;
export declare function runTests(options: TestOptions): Promise<TestResults>;
//# sourceMappingURL=runner.d.ts.map