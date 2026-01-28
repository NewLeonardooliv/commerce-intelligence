import type { IEvaluator } from '../types';
import type { EvalCase, EvalResult } from '../types';
import { InterpreterAgent } from '@modules/chat/agents/interpreter.agent';
import { calculateInterpretationScore, isPortuguese } from '../metrics';

/**
 * Evaluator for Interpreter Agent
 */
export class InterpreterEvaluator implements IEvaluator {
  name = 'InterpreterEvaluator';
  description = 'Evaluates the Interpreter Agent intent recognition and entity extraction';

  private agent: InterpreterAgent;

  constructor() {
    this.agent = new InterpreterAgent();
  }

  async evaluate(testCase: EvalCase): Promise<EvalResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;
    let maxScore = 0;

    try {
      // Create context
      const context = {
        sessionId: testCase.input.sessionId || 'eval-session',
        userQuery: testCase.input.userQuery,
        conversationHistory: testCase.input.conversationHistory || [],
      };

      // Run interpreter agent
      const result = await this.agent.process(context);
      const interpretation = result.interpretation;

      if (!interpretation) {
        errors.push('No interpretation result');
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

      // Check intent
      if (testCase.expected.intent || testCase.expected.intentContains) {
        maxScore += 1;
        let intentScore = 0;

        if (testCase.expected.intent) {
          if (typeof testCase.expected.intent === 'string') {
            intentScore = interpretation.intent === testCase.expected.intent ? 1 : 0;
          } else {
            intentScore = testCase.expected.intent.test(interpretation.intent) ? 1 : 0;
          }
        }

        if (testCase.expected.intentContains) {
          const containsCount = testCase.expected.intentContains.filter((keyword) =>
            interpretation.intent.toLowerCase().includes(keyword.toLowerCase())
          ).length;
          intentScore = Math.max(
            intentScore,
            containsCount / testCase.expected.intentContains.length
          );
        }

        score += intentScore;

        if (intentScore < 0.5) {
          errors.push(
            `Intent mismatch. Expected contains: ${testCase.expected.intentContains?.join(', ')}, got: "${interpretation.intent}"`
          );
        }
      }

      // Check confidence
      if (testCase.expected.confidence) {
        maxScore += 1;
        const { min, max = 1 } = testCase.expected.confidence;

        if (interpretation.confidence >= min && interpretation.confidence <= max) {
          score += 1;
        } else {
          errors.push(
            `Confidence out of range. Expected: ${min}-${max}, got: ${interpretation.confidence}`
          );
        }
      }

      // Check requiresData
      if (testCase.expected.requiresData !== undefined) {
        maxScore += 1;
        if (interpretation.requiresData === testCase.expected.requiresData) {
          score += 1;
        } else {
          errors.push(
            `RequiresData mismatch. Expected: ${testCase.expected.requiresData}, got: ${interpretation.requiresData}`
          );
        }
      }

      // Check requiresExternalTools
      if (testCase.expected.requiresExternalTools !== undefined) {
        maxScore += 1;
        if (interpretation.requiresExternalTools === testCase.expected.requiresExternalTools) {
          score += 1;
        } else {
          warnings.push(
            `RequiresExternalTools mismatch. Expected: ${testCase.expected.requiresExternalTools}, got: ${interpretation.requiresExternalTools}`
          );
          score += 0.5; // Partial credit
        }
      }

      // Check entities
      if (testCase.expected.entities) {
        maxScore += 1;
        const expectedKeys = Object.keys(testCase.expected.entities);
        const actualKeys = Object.keys(interpretation.entities);

        const matchedKeys = expectedKeys.filter((key) => actualKeys.includes(key));
        score += matchedKeys.length / expectedKeys.length;

        if (matchedKeys.length < expectedKeys.length) {
          warnings.push(
            `Some entities missing. Expected: ${expectedKeys.join(', ')}, got: ${actualKeys.join(', ')}`
          );
        }
      }

      // Check if interpretation is in Portuguese
      if (testCase.expected.inPortuguese) {
        maxScore += 1;
        if (isPortuguese(interpretation.intent)) {
          score += 1;
        } else {
          errors.push('Interpretation is not in Portuguese');
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
          context: result,
          data: interpretation,
        },
        metrics: {
          confidence: interpretation.confidence,
          interpretationScore: calculateInterpretationScore(result),
          entityCount: Object.keys(interpretation.entities).length,
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
