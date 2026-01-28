import type { AgentContext, AgentRole } from '@modules/chat/types/agent.types';

/**
 * Represents a single evaluation test case
 */
export type EvalCase = {
  id: string;
  name: string;
  description: string;
  input: {
    userQuery: string;
    sessionId?: string;
    conversationHistory?: AgentContext['conversationHistory'];
  };
  expected: {
    // For interpreter agent
    intent?: string | RegExp;
    intentContains?: string[];
    confidence?: { min: number; max?: number };
    requiresData?: boolean;
    requiresExternalTools?: boolean;
    entities?: Record<string, unknown>;

    // For data-query agent
    sqlContains?: string[];
    sqlNotContains?: string[];
    hasResults?: boolean;
    minResults?: number;
    maxResults?: number;

    // For responder agent
    responseContains?: string[];
    responseNotContains?: string[];
    responseLength?: { min: number; max?: number };
    answersQuestion?: boolean;
    inPortuguese?: boolean;

    // For suggestion agent
    suggestionCount?: number;
    suggestionsContain?: string[];

    // For orchestrator
    completes?: boolean;
    noErrors?: boolean;
    agentsRun?: AgentRole[];
  };
  tags?: string[];
  timeout?: number; // milliseconds
};

/**
 * Result of running a single evaluation
 */
export type EvalResult = {
  caseId: string;
  caseName: string;
  passed: boolean;
  score: number; // 0-1
  duration: number; // milliseconds
  errors: string[];
  warnings: string[];
  output?: {
    context?: AgentContext;
    response?: string;
    data?: unknown;
  };
  metrics?: {
    [key: string]: number | string | boolean;
  };
};

/**
 * Summary of evaluation run
 */
export type EvalSummary = {
  totalCases: number;
  passed: number;
  failed: number;
  averageScore: number;
  averageDuration: number;
  results: EvalResult[];
  timestamp: string;
  errors: string[];
};

/**
 * Configuration for evaluation runner
 */
export type EvalConfig = {
  parallel?: boolean;
  timeout?: number;
  stopOnFailure?: boolean;
  verbose?: boolean;
  tags?: string[]; // Filter by tags
  skipTags?: string[]; // Skip these tags
};

/**
 * Agent-specific evaluator interface
 */
export interface IEvaluator {
  name: string;
  description: string;
  evaluate(testCase: EvalCase): Promise<EvalResult>;
  validateCase(testCase: EvalCase): boolean;
}
