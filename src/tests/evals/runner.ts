import type { EvalCase, EvalResult, EvalSummary, EvalConfig } from './types';

/**
 * Base class for evaluation runners
 */
export abstract class EvalRunner {
  protected config: EvalConfig;

  constructor(config?: EvalConfig) {
    this.config = {
      parallel: false,
      timeout: 30000,
      stopOnFailure: false,
      verbose: false,
      ...config,
    };
  }

  /**
   * Run a single evaluation case
   */
  abstract runCase(testCase: EvalCase): Promise<EvalResult>;

  /**
   * Run multiple evaluation cases
   */
  async run(testCases: EvalCase[]): Promise<EvalSummary> {
    const startTime = Date.now();
    const filteredCases = this.filterCases(testCases);

    console.log(`\n🧪 Running ${filteredCases.length} evaluation cases...`);

    let results: EvalResult[];

    if (this.config.parallel) {
      results = await this.runParallel(filteredCases);
    } else {
      results = await this.runSequential(filteredCases);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    const summary = this.generateSummary(results, duration);
    this.printSummary(summary);

    return summary;
  }

  /**
   * Run cases sequentially
   */
  private async runSequential(testCases: EvalCase[]): Promise<EvalResult[]> {
    const results: EvalResult[] = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`\n[${i + 1}/${testCases.length}] Running: ${testCase.name}`);

      try {
        const result = await this.runCaseWithTimeout(testCase);
        results.push(result);

        if (this.config.verbose) {
          this.printResult(result);
        } else {
          console.log(result.passed ? '  ✅ PASSED' : '  ❌ FAILED');
        }

        if (!result.passed && this.config.stopOnFailure) {
          console.log('\n⚠️  Stopping on failure');
          break;
        }
      } catch (error) {
        const errorResult: EvalResult = {
          caseId: testCase.id,
          caseName: testCase.name,
          passed: false,
          score: 0,
          duration: 0,
          errors: [error instanceof Error ? error.message : String(error)],
          warnings: [],
        };
        results.push(errorResult);

        if (this.config.stopOnFailure) {
          console.log('\n⚠️  Stopping on error');
          break;
        }
      }
    }

    return results;
  }

  /**
   * Run cases in parallel
   */
  private async runParallel(testCases: EvalCase[]): Promise<EvalResult[]> {
    const promises = testCases.map((testCase) => this.runCaseWithTimeout(testCase));
    return await Promise.all(promises);
  }

  /**
   * Run a single case with timeout
   */
  private async runCaseWithTimeout(testCase: EvalCase): Promise<EvalResult> {
    const timeout = testCase.timeout || this.config.timeout || 30000;

    return Promise.race([
      this.runCase(testCase),
      new Promise<EvalResult>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${timeout}ms`)), timeout)
      ),
    ]);
  }

  /**
   * Filter test cases by tags
   */
  private filterCases(testCases: EvalCase[]): EvalCase[] {
    let filtered = testCases;

    if (this.config.tags && this.config.tags.length > 0) {
      filtered = filtered.filter((tc) =>
        tc.tags?.some((tag) => this.config.tags?.includes(tag))
      );
    }

    if (this.config.skipTags && this.config.skipTags.length > 0) {
      filtered = filtered.filter(
        (tc) => !tc.tags?.some((tag) => this.config.skipTags?.includes(tag))
      );
    }

    return filtered;
  }

  /**
   * Generate summary from results
   */
  private generateSummary(results: EvalResult[], duration: number): EvalSummary {
    const passed = results.filter((r) => r.passed).length;
    const failed = results.length - passed;
    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const averageDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;

    const errors = results.flatMap((r) => r.errors);

    return {
      totalCases: results.length,
      passed,
      failed,
      averageScore,
      averageDuration,
      results,
      timestamp: new Date().toISOString(),
      errors,
    };
  }

  /**
   * Print evaluation result
   */
  private printResult(result: EvalResult): void {
    const status = result.passed ? '✅' : '❌';
    console.log(`  ${status} ${result.caseName}`);
    console.log(`     Score: ${(result.score * 100).toFixed(1)}%`);
    console.log(`     Duration: ${result.duration}ms`);

    if (result.errors.length > 0) {
      console.log(`     Errors:`);
      result.errors.forEach((err) => console.log(`       - ${err}`));
    }

    if (result.warnings.length > 0) {
      console.log(`     Warnings:`);
      result.warnings.forEach((warn) => console.log(`       - ${warn}`));
    }
  }

  /**
   * Print evaluation summary
   */
  private printSummary(summary: EvalSummary): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 EVALUATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Cases: ${summary.totalCases}`);
    console.log(`Passed: ${summary.passed} ✅`);
    console.log(`Failed: ${summary.failed} ❌`);
    console.log(`Average Score: ${(summary.averageScore * 100).toFixed(1)}%`);
    console.log(`Average Duration: ${summary.averageDuration.toFixed(0)}ms`);
    console.log('='.repeat(60) + '\n');
  }
}
