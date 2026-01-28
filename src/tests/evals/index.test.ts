import { describe, test, expect } from 'bun:test';
import { EvalRunner } from './runner';
import type { EvalCase, EvalResult } from './types';
import { interpreterEvalCases } from './cases/interpreter.evals';
import { dataQueryEvalCases } from './cases/data-query.evals';
import { responderEvalCases } from './cases/responder.evals';
import { orchestratorEvalCases } from './cases/orchestrator.evals';
import { InterpreterEvaluator } from './evaluators/interpreter.evaluator';
import { OrchestratorEvaluator } from './evaluators/orchestrator.evaluator';

/**
 * Concrete implementation of EvalRunner for Interpreter tests
 */
class InterpreterEvalRunner extends EvalRunner {
  private evaluator: InterpreterEvaluator;

  constructor() {
    super({ verbose: false, timeout: 30000 });
    this.evaluator = new InterpreterEvaluator();
  }

  async runCase(testCase: EvalCase): Promise<EvalResult> {
    return await this.evaluator.evaluate(testCase);
  }
}

/**
 * Concrete implementation of EvalRunner for Orchestrator tests
 */
class OrchestratorEvalRunner extends EvalRunner {
  private evaluator: OrchestratorEvaluator;

  constructor() {
    super({ verbose: false, timeout: 60000 });
    this.evaluator = new OrchestratorEvaluator();
  }

  async runCase(testCase: EvalCase): Promise<EvalResult> {
    return await this.evaluator.evaluate(testCase);
  }
}

describe('Agent Evals', () => {
  describe('Interpreter Agent Evals', () => {
    test('should run basic interpreter evals', async () => {
      const runner = new InterpreterEvalRunner();
      const basicCases = interpreterEvalCases.filter((c) => c.tags?.includes('basic'));

      const summary = await runner.run(basicCases);

      expect(summary.totalCases).toBeGreaterThan(0);
      expect(summary.passed).toBeGreaterThan(0);
      expect(summary.averageScore).toBeGreaterThan(0.5);
    }, 60000);

    test('should handle ambiguous queries', async () => {
      const runner = new InterpreterEvalRunner();
      const ambiguousCases = interpreterEvalCases.filter((c) => c.tags?.includes('ambiguous'));

      const summary = await runner.run(ambiguousCases);

      expect(summary.totalCases).toBeGreaterThan(0);
      // Ambiguous cases might have lower scores, that's expected
      expect(summary.averageScore).toBeGreaterThan(0.3);
    }, 30000);
  });

  describe('Orchestrator Evals', () => {
    test('should run basic end-to-end evals', async () => {
      const runner = new OrchestratorEvalRunner();
      const basicCases = orchestratorEvalCases.filter((c) => c.tags?.includes('basic'));

      const summary = await runner.run(basicCases);

      expect(summary.totalCases).toBeGreaterThan(0);
      expect(summary.passed).toBeGreaterThanOrEqual(0);
      expect(summary.averageScore).toBeGreaterThan(0.4);
    }, 120000);

    test('should handle edge cases gracefully', async () => {
      const runner = new OrchestratorEvalRunner();
      const edgeCases = orchestratorEvalCases.filter((c) => c.tags?.includes('edge-case'));

      const summary = await runner.run(edgeCases);

      expect(summary.totalCases).toBeGreaterThan(0);
      // Edge cases should at least complete without crashing
      expect(summary.results.every((r) => r.duration > 0)).toBe(true);
    }, 120000);
  });

  describe('Comprehensive Agent Evaluation', () => {
    test('should evaluate all orchestrator test cases', async () => {
      const runner = new OrchestratorEvalRunner();

      const summary = await runner.run(orchestratorEvalCases);

      expect(summary.totalCases).toBe(orchestratorEvalCases.length);
      expect(summary.passed + summary.failed).toBe(summary.totalCases);
      expect(summary.averageScore).toBeGreaterThan(0);

      // Print detailed report
      console.log('\n📊 Comprehensive Evaluation Report:');
      console.log(`Total Cases: ${summary.totalCases}`);
      console.log(`Passed: ${summary.passed} (${((summary.passed / summary.totalCases) * 100).toFixed(1)}%)`);
      console.log(`Failed: ${summary.failed} (${((summary.failed / summary.totalCases) * 100).toFixed(1)}%)`);
      console.log(`Average Score: ${(summary.averageScore * 100).toFixed(1)}%`);
      console.log(`Average Duration: ${summary.averageDuration.toFixed(0)}ms`);

      // Should have at least 50% pass rate
      expect(summary.passed / summary.totalCases).toBeGreaterThan(0.5);
    }, 300000); // 5 minutes timeout for comprehensive test
  });
});

/**
 * Manual test runner for development
 * Run with: bun src/tests/evals/index.test.ts
 */
if (import.meta.main) {
  console.log('🚀 Running Agent Evals...\n');

  // Run interpreter evals
  console.log('📋 Running Interpreter Evals...');
  const interpreterRunner = new InterpreterEvalRunner();
  await interpreterRunner.run(interpreterEvalCases);

  // Run orchestrator evals
  console.log('\n📋 Running Orchestrator Evals...');
  const orchestratorRunner = new OrchestratorEvalRunner();
  await orchestratorRunner.run(orchestratorEvalCases);

  console.log('\n✨ All evals completed!');
}
