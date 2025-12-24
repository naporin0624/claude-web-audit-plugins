/**
 * Form Security Analyzer
 *
 * Static analysis of HTML forms for security vulnerabilities.
 * No requests sent - safe to run on any file.
 */
import type { AnalysisResult } from './types.js';
export declare function analyzeFile(filePath: string): AnalysisResult;
