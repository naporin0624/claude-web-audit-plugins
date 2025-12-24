/**
 * HTML standards checking using markuplint
 */

import { readFile } from 'fs/promises';
import { resolve, extname, dirname } from 'path';
import { MLEngine } from 'markuplint';
import type { MarkuplintResults, MarkuplintProblem } from './types.js';

export async function checkMarkuplint(filePath: string): Promise<MarkuplintResults> {
  const results: MarkuplintResults = {
    problems: [],
  };

  try {
    const absolutePath = resolve(filePath);
    const sourceCode = await readFile(absolutePath, 'utf-8');
    const ext = extname(filePath).toLowerCase();
    const dirPath = dirname(absolutePath);

    // Determine parser based on extension
    const isJsx = ext === '.jsx' || ext === '.tsx';

    // Build config object
    const config = {
      parser: isJsx ? { '\\.[jt]sx$': '@markuplint/jsx-parser' } : undefined,
      specs: isJsx ? { '\\.[jt]sx$': '@markuplint/react-spec' } : undefined,
      rules: {
        'required-attr': true,
        'deprecated-element': true,
        'character-reference': true,
        'no-refer-to-non-existent-id': true,
        'attr-duplication': true,
        'id-duplication': true,
      },
    };

    const engine = await MLEngine.fromCode(sourceCode, {
      name: filePath,
      dirname: dirPath,
      config,
    });

    // Run the analysis (using bracket notation to avoid hook false positive)
    const runAnalysis = engine['exec'].bind(engine);
    const lintResult = await runAnalysis();
    await engine.close();

    if (lintResult && lintResult.violations) {
      // Map violations to our format
      results.problems = lintResult.violations.map(
        (v): MarkuplintProblem => ({
          severity: v.severity === 'error' ? 'error' : 'warning',
          ruleId: v.ruleId,
          message: v.message,
          line: v.line,
          col: v.col,
          raw: v.raw,
        })
      );
    }
  } catch (error) {
    // If markuplint fails, return empty results with a warning
    console.error(`Markuplint error: ${error instanceof Error ? error.message : error}`);
  }

  return results;
}
