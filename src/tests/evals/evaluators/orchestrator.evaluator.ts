import type { IEvaluator } from '../types';
import type { EvalCase, EvalResult } from '../types';
import { AgentOrchestrator } from '@modules/chat/agents/orchestrator';
import { MockAiProvider } from '@infrastructure/ai/mock-ai-provider';
import {
  calculateResponseQuality,
  answersQuestion,
  isPortuguese,
  isSafeSql,
} from '../metrics';

/**
 * Evaluator for Agent Orchestrator
 * Tests the complete agent pipeline
 */
export class OrchestratorEvaluator implements IEvaluator {
  name = 'OrchestratorEvaluator';
  description = 'Evaluates the complete agent orchestration pipeline';

  private orchestrator: AgentOrchestrator;

  constructor() {
    const aiProvider = new MockAiProvider();
    this.orchestrator = new AgentOrchestrator({
      aiProvider,
      enableMCP: false, // Disable MCP for evals
    });
  }

  async evaluate(testCase: EvalCase): Promise<EvalResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;
    let maxScore = 0;

    try {
      // Run orchestrator
      const context = await this.orchestrator.process(
        testCase.input.sessionId || 'eval-session',
        testCase.input.userQuery,
        testCase.input.conversationHistory || []
      );

      // Check if pipeline completed
      if (testCase.expected.completes !== undefined) {
        maxScore += 1;
        if (context.rawResponse) {
          score += 1;
        } else {
          errors.push('Pipeline did not complete successfully');
        }
      }

      // Check for errors in conversation history
      if (testCase.expected.noErrors) {
        maxScore += 1;
        const hasErrors = context.conversationHistory.some(
          (msg) => msg.metadata?.error || msg.content.toLowerCase().includes('erro')
        );

        if (!hasErrors) {
          score += 1;
        } else {
          errors.push('Pipeline execution contains errors');
        }
      }

      // Check which agents ran
      if (testCase.expected.agentsRun) {
        maxScore += 1;
        const agentsRun = context.conversationHistory
          .filter((msg) => msg.metadata?.agent)
          .map((msg) => msg.metadata?.agent as string);

        const expectedAgents = testCase.expected.agentsRun;
        const matchedAgents = expectedAgents.filter((agent) => agentsRun.includes(agent));

        score += matchedAgents.length / expectedAgents.length;

        if (matchedAgents.length < expectedAgents.length) {
          warnings.push(
            `Not all expected agents ran. Expected: ${expectedAgents.join(', ')}, got: ${agentsRun.join(', ')}`
          );
        }
      }

      // Check SQL generation
      if (testCase.expected.sqlContains || testCase.expected.sqlNotContains) {
        maxScore += 1;
        const sqlMessage = context.conversationHistory.find(
          (msg) => msg.metadata?.agent === 'data_query'
        );

        if (sqlMessage) {
          const sql = sqlMessage.content;

          // Check safety
          if (!isSafeSql(sql)) {
            errors.push('Generated SQL contains dangerous operations');
          } else {
            score += 0.3;
          }

          // Check contains
          if (testCase.expected.sqlContains) {
            const containsCount = testCase.expected.sqlContains.filter((keyword) =>
              sql.toUpperCase().includes(keyword.toUpperCase())
            ).length;

            score += (containsCount / testCase.expected.sqlContains.length) * 0.5;

            if (containsCount < testCase.expected.sqlContains.length) {
              warnings.push(
                `SQL missing keywords: ${testCase.expected.sqlContains.filter((k) => !sql.toUpperCase().includes(k.toUpperCase())).join(', ')}`
              );
            }
          }

          // Check not contains
          if (testCase.expected.sqlNotContains) {
            const notContainsCount = testCase.expected.sqlNotContains.filter(
              (keyword) => !sql.toUpperCase().includes(keyword.toUpperCase())
            ).length;

            score += (notContainsCount / testCase.expected.sqlNotContains.length) * 0.2;
          }
        } else {
          warnings.push('No SQL query generated');
        }
      }

      // Check results
      if (testCase.expected.hasResults !== undefined) {
        maxScore += 1;
        const hasResults = context.queryResults && context.queryResults.length > 0;

        if (hasResults === testCase.expected.hasResults) {
          score += 1;
        } else {
          warnings.push(
            `Results mismatch. Expected results: ${testCase.expected.hasResults}, got results: ${hasResults}`
          );
        }
      }

      if (testCase.expected.minResults !== undefined) {
        maxScore += 1;
        const resultCount = context.queryResults?.length || 0;

        if (resultCount >= testCase.expected.minResults) {
          score += 1;
        } else {
          warnings.push(
            `Not enough results. Expected min: ${testCase.expected.minResults}, got: ${resultCount}`
          );
        }
      }

      // Check response quality
      if (context.rawResponse) {
        if (testCase.expected.answersQuestion) {
          maxScore += 1;
          if (answersQuestion(testCase.input.userQuery, context.rawResponse)) {
            score += 1;
          } else {
            errors.push('Response does not answer the question');
          }
        }

        if (testCase.expected.inPortuguese) {
          maxScore += 1;
          if (isPortuguese(context.rawResponse)) {
            score += 1;
          } else {
            errors.push('Response is not in Portuguese');
          }
        }

        if (testCase.expected.responseContains) {
          maxScore += 1;
          const containsCount = testCase.expected.responseContains.filter((keyword) =>
            context.rawResponse!.toLowerCase().includes(keyword.toLowerCase())
          ).length;

          score += containsCount / testCase.expected.responseContains.length;

          if (containsCount < testCase.expected.responseContains.length) {
            warnings.push(
              `Response missing keywords: ${testCase.expected.responseContains.filter((k) => !context.rawResponse!.toLowerCase().includes(k.toLowerCase())).join(', ')}`
            );
          }
        }

        if (testCase.expected.responseNotContains) {
          maxScore += 1;
          const notContainsCount = testCase.expected.responseNotContains.filter(
            (keyword) => !context.rawResponse!.toLowerCase().includes(keyword.toLowerCase())
          ).length;

          score += notContainsCount / testCase.expected.responseNotContains.length;
        }
      }

      // Check suggestions
      if (testCase.expected.suggestionCount !== undefined) {
        maxScore += 1;
        const suggestionCount = context.suggestions?.length || 0;

        if (suggestionCount >= testCase.expected.suggestionCount) {
          score += 1;
        } else {
          warnings.push(
            `Not enough suggestions. Expected: ${testCase.expected.suggestionCount}, got: ${suggestionCount}`
          );
        }
      }

      const finalScore = maxScore > 0 ? score / maxScore : 0;
      const passed = errors.length === 0 && finalScore >= 0.7;

      return {
        caseId: testCase.id,
        caseName: testCase.name,
        passed,
        score: finalScore,
        duration: Date.now() - startTime,
        errors,
        warnings,
        output: {
          context,
          response: context.rawResponse,
        },
        metrics: {
          responseQuality: context.rawResponse
            ? calculateResponseQuality(testCase.input.userQuery, context.rawResponse)
            : 0,
          resultCount: context.queryResults?.length || 0,
          suggestionCount: context.suggestions?.length || 0,
          agentsRun: context.conversationHistory
            .filter((msg) => msg.metadata?.agent)
            .map((msg) => msg.metadata?.agent).length,
        },
      };
    } catch (error) {
      errors.push(`Exception: ${error instanceof Error ? error.message : String(error)}`);
      return {
        caseId: testCase.id,
        caseName: testCase.name,
        passed: false,
        score: 0,
        duration: Date.now() - startTime,
        errors,
        warnings,
      };
    }
  }

  validateCase(testCase: EvalCase): boolean {
    return !!testCase.input.userQuery;
  }
}
