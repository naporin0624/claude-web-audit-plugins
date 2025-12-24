/**
 * Web Resource Analyzer
 * Main entry point for validating web resource files
 */
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { SitemapValidator, sitemapNotFound, RobotsValidator, robotsNotFound, SecurityTxtValidator, securityNotFound, LlmsTxtValidator, llmsNotFound, } from './validators/index.js';
const FILES = {
    sitemap: {
        paths: ['sitemap.xml', 'sitemap_index.xml'],
        createValidator: (content, source) => new SitemapValidator(content, source),
        notFound: sitemapNotFound,
        async: true,
    },
    robots: {
        paths: ['robots.txt'],
        createValidator: (content, source) => new RobotsValidator(content, source),
        notFound: robotsNotFound,
        async: false,
    },
    security: {
        paths: ['.well-known/security.txt', 'security.txt'],
        createValidator: (content, source) => new SecurityTxtValidator(content, source),
        notFound: securityNotFound,
        async: false,
    },
    llms: {
        paths: ['llms.txt'],
        createValidator: (content, source) => new LlmsTxtValidator(content, source, false),
        notFound: (source) => llmsNotFound(source, false),
        async: false,
    },
    'llms-full': {
        paths: ['llms-full.txt'],
        createValidator: (content, source) => new LlmsTxtValidator(content, source, true),
        notFound: (source) => llmsNotFound(source, true),
        async: false,
    },
};
export class WebResourceAnalyzer {
    target;
    isUrl;
    options;
    results = {};
    constructor(target, options = {}) {
        this.target = target;
        this.isUrl = target.startsWith('http://') || target.startsWith('https://');
        this.options = {
            json: options.json || false,
            only: options.only || null,
            timeout: options.timeout || 10000,
        };
    }
    async analyze() {
        const filesToCheck = this.getFilesToCheck();
        const timestamp = new Date().toISOString();
        for (const fileKey of filesToCheck) {
            const config = FILES[fileKey];
            if (!config)
                continue;
            try {
                const result = await this.checkFile(fileKey, config);
                this.results[fileKey] = result;
            }
            catch (error) {
                this.results[fileKey] = {
                    file: fileKey,
                    source: this.target,
                    found: false,
                    valid: false,
                    error: error instanceof Error ? error.message : String(error),
                    summary: { critical: 1, important: 0, recommended: 0, passed: 0 },
                    issues: [
                        {
                            severity: 'critical',
                            check: 'error',
                            message: `Error checking file: ${error instanceof Error ? error.message : error}`,
                            fix: 'Check if the target is accessible',
                        },
                    ],
                    passed: [],
                };
            }
        }
        return this.generateReport(timestamp);
    }
    getFilesToCheck() {
        if (this.options.only) {
            return this.options.only.split(',').map((f) => f.trim().toLowerCase());
        }
        return Object.keys(FILES);
    }
    async checkFile(fileKey, config) {
        let content = null;
        let source = '';
        if (this.isUrl) {
            for (const path of config.paths) {
                const url = new URL(path, this.target).href;
                source = url;
                try {
                    const response = await fetch(url, {
                        signal: AbortSignal.timeout(this.options.timeout),
                        headers: {
                            'User-Agent': 'WebResourceChecker/2.0',
                        },
                    });
                    if (response.ok) {
                        content = await response.text();
                        break;
                    }
                }
                catch {
                    // Try next path
                }
            }
        }
        else {
            const basePath = resolve(this.target);
            for (const path of config.paths) {
                const fullPath = join(basePath, path);
                source = fullPath;
                if (existsSync(fullPath)) {
                    try {
                        content = readFileSync(fullPath, 'utf8');
                        break;
                    }
                    catch {
                        // Try next path
                    }
                }
            }
        }
        if (content === null) {
            return config.notFound(source);
        }
        const validator = config.createValidator(content, source);
        if (config.async) {
            return await validator.validate();
        }
        return validator.validate();
    }
    generateReport(timestamp) {
        const files = Object.values(this.results);
        const summary = {
            target: this.target,
            timestamp,
            totalFiles: files.length,
            found: files.filter((f) => f.found).length,
            valid: files.filter((f) => f.valid).length,
            issues: {
                critical: files.reduce((sum, f) => sum + (f.summary?.critical || 0), 0),
                important: files.reduce((sum, f) => sum + (f.summary?.important || 0), 0),
                recommended: files.reduce((sum, f) => sum + (f.summary?.recommended || 0), 0),
            },
        };
        return {
            summary,
            files: this.results,
        };
    }
}
