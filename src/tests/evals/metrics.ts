import type { AgentContext } from '@modules/chat/types/agent.types';
import type { EvalCase } from './types';

/**
 * Calculate semantic similarity between two strings (simplified)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const words1 = str1.toLowerCase().split(/\s+/);
  const words2 = str2.toLowerCase().split(/\s+/);

  const commonWords = words1.filter((word) => words2.includes(word));
  const similarity = (2 * commonWords.length) / (words1.length + words2.length);

  return Math.min(1, Math.max(0, similarity));
}

/**
 * Check if response answers the question
 */
export function answersQuestion(query: string, response: string): boolean {
  const queryLower = query.toLowerCase();
  const responseLower = response.toLowerCase();

  // Check for negation patterns
  if (responseLower.includes('não sei') || responseLower.includes('não foi possível')) {
    return false;
  }

  // Extract question type
  const questionWords = ['quais', 'quantos', 'quanto', 'qual', 'como', 'onde', 'quando', 'por que'];
  const hasQuestionWord = questionWords.some((word) => queryLower.includes(word));

  if (!hasQuestionWord) {
    return responseLower.length > 20; // Generic statement
  }

  // Check if response has relevant content
  return responseLower.length > 50 && !responseLower.includes('erro');
}

/**
 * Check if text is in Portuguese
 */
export function isPortuguese(text: string): boolean {
  const portugueseIndicators = [
    'ção',
    'ões',
    'ão',
    'ões',
    'à',
    'é',
    'ê',
    'ó',
    'ô',
    'â',
    'ã',
    'õ',
    'ú',
    'ü',
    'ç',
  ];

  const portugueseWords = [
    'que',
    'não',
    'para',
    'com',
    'uma',
    'por',
    'são',
    'dos',
    'mais',
    'como',
  ];

  const textLower = text.toLowerCase();

  // Check for Portuguese-specific characters
  const hasAccents = portugueseIndicators.some((indicator) => textLower.includes(indicator));

  // Check for common Portuguese words
  const portugueseWordCount = portugueseWords.filter((word) =>
    new RegExp(`\\b${word}\\b`).test(textLower)
  ).length;

  return hasAccents || portugueseWordCount >= 3;
}

/**
 * Validate SQL query safety
 */
export function isSafeSql(sql: string): boolean {
  const sqlUpper = sql.toUpperCase();
  const dangerousKeywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE', 'CREATE'];

  return !dangerousKeywords.some((keyword) => sqlUpper.includes(keyword));
}

/**
 * Extract entities from interpretation
 */
export function extractEntities(context: AgentContext): Record<string, unknown> {
  if (!context.interpretation?.entities) {
    return {};
  }

  return context.interpretation.entities;
}

/**
 * Calculate confidence score for interpretation
 */
export function calculateInterpretationScore(context: AgentContext): number {
  if (!context.interpretation) return 0;

  let score = 0;
  const interpretation = context.interpretation;

  // Base score from AI confidence
  score += interpretation.confidence * 0.4;

  // Intent clarity
  if (interpretation.intent && interpretation.intent.length > 10) {
    score += 0.2;
  }

  // Entities identified
  const entityCount = Object.keys(interpretation.entities || {}).length;
  score += Math.min(0.2, entityCount * 0.05);

  // Suggested queries
  if (interpretation.suggestedQueries && interpretation.suggestedQueries.length > 0) {
    score += 0.2;
  }

  return Math.min(1, score);
}

/**
 * Calculate response quality score
 */
export function calculateResponseQuality(
  query: string,
  response: string,
  expectedCriteria?: {
    contains?: string[];
    notContains?: string[];
    minLength?: number;
    maxLength?: number;
  }
): number {
  let score = 0;

  // Check if response is not empty and not an error
  if (!response || response.length < 10) return 0;
  score += 0.2;

  // Check if response answers the question
  if (answersQuestion(query, response)) {
    score += 0.3;
  }

  // Check if response is in Portuguese
  if (isPortuguese(response)) {
    score += 0.2;
  }

  // Check expected criteria
  if (expectedCriteria) {
    if (expectedCriteria.contains) {
      const containsCount = expectedCriteria.contains.filter((str) =>
        response.toLowerCase().includes(str.toLowerCase())
      ).length;
      score += (containsCount / expectedCriteria.contains.length) * 0.15;
    }

    if (expectedCriteria.notContains) {
      const notContainsCount = expectedCriteria.notContains.filter(
        (str) => !response.toLowerCase().includes(str.toLowerCase())
      ).length;
      score += (notContainsCount / expectedCriteria.notContains.length) * 0.1;
    }

    if (expectedCriteria.minLength && response.length >= expectedCriteria.minLength) {
      score += 0.05;
    }
  }

  return Math.min(1, score);
}

/**
 * Calculate overall agent performance
 */
export function calculateAgentPerformance(context: AgentContext, testCase: EvalCase): number {
  let score = 0;
  let maxScore = 0;

  // Interpretation score
  if (testCase.expected.intent || testCase.expected.confidence) {
    maxScore += 1;
    if (context.interpretation) {
      score += calculateInterpretationScore(context);
    }
  }

  // Data query score
  if (testCase.expected.hasResults || testCase.expected.sqlContains) {
    maxScore += 1;
    if (context.queryResults) {
      score += context.queryResults.length > 0 ? 1 : 0;
    }
  }

  // Response score
  if (testCase.expected.responseContains || testCase.expected.answersQuestion) {
    maxScore += 1;
    if (context.rawResponse) {
      score += calculateResponseQuality(testCase.input.userQuery, context.rawResponse, {
        contains: testCase.expected.responseContains,
        notContains: testCase.expected.responseNotContains,
        minLength: testCase.expected.responseLength?.min,
        maxLength: testCase.expected.responseLength?.max,
      });
    }
  }

  return maxScore > 0 ? score / maxScore : 0;
}
