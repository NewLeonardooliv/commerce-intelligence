#!/usr/bin/env bun

/**
 * CLI tool for running agent evaluations
 * 
 * Usage:
 *   bun src/tests/evals/cli.ts --all
 *   bun src/tests/evals/cli.ts --interpreter
 *   bun src/tests/evals/cli.ts --orchestrator --report=html
 *   bun src/tests/evals/cli.ts --tags=basic,products
 */

import { parseArgs } from 'util';
import { interpreterEvalCases } from './cases/interpreter.evals';
import { orchestratorEvalCases } from './cases/orchestrator.evals';
import { InterpreterEvaluator } from './evaluators/interpreter.evaluator';
import { OrchestratorEvaluator } from './evaluators/orchestrator.evaluator';
import { EvalRunner } from './runner';
import type { EvalCase, EvalResult, EvalConfig } from './types';
import {
  generateHtmlReport,
  generateJsonReport,
  generateMarkdownReport,
} from './report-generator';
import { join } from 'path';

class InterpreterEvalRunner extends EvalRunner {
  private evaluator = new InterpreterEvaluator();
  async runCase(testCase: EvalCase): Promise<EvalResult> {
    return await this.evaluator.evaluate(testCase);
  }
}

class OrchestratorEvalRunner extends EvalRunner {
  private evaluator = new OrchestratorEvaluator();
  async runCase(testCase: EvalCase): Promise<EvalResult> {
    return await this.evaluator.evaluate(testCase);
  }
}

async function main() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      all: { type: 'boolean', short: 'a' },
      interpreter: { type: 'boolean', short: 'i' },
      orchestrator: { type: 'boolean', short: 'o' },
      tags: { type: 'string', short: 't' },
      skipTags: { type: 'string' },
      verbose: { type: 'boolean', short: 'v' },
      parallel: { type: 'boolean', short: 'p' },
      stopOnFailure: { type: 'boolean', short: 's' },
      report: { type: 'string', short: 'r' }, // html, json, markdown, all
      output: { type: 'string' }, // output directory
      help: { type: 'boolean', short: 'h' },
    },
    allowPositionals: false,
  });

  if (values.help) {
    console.log(`
🧪 Agent Evaluation CLI

Usage:
  bun src/tests/evals/cli.ts [options]

Options:
  -a, --all              Run all evaluations
  -i, --interpreter      Run interpreter agent evals
  -o, --orchestrator     Run orchestrator evals
  -t, --tags <tags>      Filter by tags (comma-separated)
      --skipTags <tags>  Skip tags (comma-separated)
  -v, --verbose          Show detailed output
  -p, --parallel         Run tests in parallel
  -s, --stopOnFailure    Stop on first failure
  -r, --report <type>    Generate report (html, json, markdown, all)
      --output <dir>     Output directory for reports
  -h, --help             Show this help message

Examples:
  bun src/tests/evals/cli.ts --all
  bun src/tests/evals/cli.ts --interpreter --verbose
  bun src/tests/evals/cli.ts --orchestrator --report=html
  bun src/tests/evals/cli.ts --tags=basic,products
  bun src/tests/evals/cli.ts --all --report=all --output=./reports
    `);
    process.exit(0);
  }

  const config: EvalConfig = {
    verbose: values.verbose || false,
    parallel: values.parallel || false,
    stopOnFailure: values.stopOnFailure || false,
    tags: values.tags ? values.tags.split(',') : undefined,
    skipTags: values.skipTags ? values.skipTags.split(',') : undefined,
  };

  console.log('🚀 Starting Agent Evaluations...\n');

  let ranSomething = false;

  // Run interpreter evals
  if (values.interpreter || values.all) {
    ranSomething = true;
    console.log('📋 Running Interpreter Agent Evaluations...');
    const runner = new InterpreterEvalRunner(config);
    const summary = await runner.run(interpreterEvalCases);

    if (values.report) {
      await generateReports(summary, values.report as string, values.output as string, 'interpreter');
    }
  }

  // Run orchestrator evals
  if (values.orchestrator || values.all) {
    ranSomething = true;
    console.log('\n📋 Running Orchestrator Evaluations...');
    const runner = new OrchestratorEvalRunner(config);
    const summary = await runner.run(orchestratorEvalCases);

    if (values.report) {
      await generateReports(summary, values.report as string, values.output as string, 'orchestrator');
    }
  }

  if (!ranSomething) {
    console.log('❌ No evaluations specified. Use --all, --interpreter, or --orchestrator');
    console.log('Run with --help for usage information');
    process.exit(1);
  }

  console.log('\n✨ All evaluations completed!');
}

async function generateReports(
  summary: any,
  reportType: string,
  outputDir: string = './reports',
  prefix: string
) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

  if (reportType === 'html' || reportType === 'all') {
    const htmlPath = join(outputDir, `${prefix}-eval-${timestamp}.html`);
    await generateHtmlReport(summary, htmlPath);
  }

  if (reportType === 'json' || reportType === 'all') {
    const jsonPath = join(outputDir, `${prefix}-eval-${timestamp}.json`);
    await generateJsonReport(summary, jsonPath);
  }

  if (reportType === 'markdown' || reportType === 'all') {
    const mdPath = join(outputDir, `${prefix}-eval-${timestamp}.md`);
    await generateMarkdownReport(summary, mdPath);
  }
}

// Run the CLI
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
