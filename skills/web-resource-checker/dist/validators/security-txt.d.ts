/**
 * security.txt Validator
 * Validates security.txt against RFC 9116
 */
import type { FileReport } from '../types.js';
export declare class SecurityTxtValidator {
    private content;
    private source;
    private issues;
    private passed;
    private fields;
    constructor(content: string, source?: string);
    validate(): FileReport;
    private parse;
    private checkRequiredFields;
    private checkExpires;
    private checkContact;
    private checkOptionalFields;
    private generateReport;
}
export declare function createNotFoundReport(source: string): FileReport;
