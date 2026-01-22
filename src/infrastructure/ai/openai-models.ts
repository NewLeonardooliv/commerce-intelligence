/**
 * OpenAI Models Configuration
 * 
 * Lista de modelos disponíveis e suas características.
 * Atualizado em: Janeiro 2024
 */

export const OPENAI_MODELS = {
  // GPT-4 Models (Mais recentes e poderosos)
  GPT_4_TURBO: 'gpt-4-turbo-preview',
  GPT_4: 'gpt-4',
  GPT_4_0125: 'gpt-4-0125-preview',
  GPT_4_1106: 'gpt-4-1106-preview',
  
  // GPT-4 Optimized
  GPT_4O: 'gpt-4o',
  GPT_4O_MINI: 'gpt-4o-mini',
  
  // GPT-3.5 Models (Mais rápidos e econômicos)
  GPT_3_5_TURBO: 'gpt-3.5-turbo',
  GPT_3_5_TURBO_16K: 'gpt-3.5-turbo-16k',
} as const;

export type OpenAiModel = typeof OPENAI_MODELS[keyof typeof OPENAI_MODELS];

/**
 * Características dos modelos
 */
export const MODEL_SPECS = {
  [OPENAI_MODELS.GPT_4_TURBO]: {
    maxTokens: 128000,
    contextWindow: 128000,
    costPer1kPrompt: 0.01,
    costPer1kCompletion: 0.03,
    description: 'Modelo mais recente do GPT-4, otimizado para performance',
    useCase: 'Análises complexas, raciocínio avançado',
  },
  [OPENAI_MODELS.GPT_4]: {
    maxTokens: 8192,
    contextWindow: 8192,
    costPer1kPrompt: 0.03,
    costPer1kCompletion: 0.06,
    description: 'Modelo GPT-4 padrão, alta qualidade',
    useCase: 'Tarefas que exigem raciocínio profundo',
  },
  [OPENAI_MODELS.GPT_4O]: {
    maxTokens: 128000,
    contextWindow: 128000,
    costPer1kPrompt: 0.005,
    costPer1kCompletion: 0.015,
    description: 'GPT-4 otimizado para velocidade e custo',
    useCase: 'Balanceamento entre qualidade e custo',
  },
  [OPENAI_MODELS.GPT_4O_MINI]: {
    maxTokens: 128000,
    contextWindow: 128000,
    costPer1kPrompt: 0.00015,
    costPer1kCompletion: 0.0006,
    description: 'Versão mini do GPT-4o, muito econômica',
    useCase: 'Tarefas simples com baixo custo',
  },
  [OPENAI_MODELS.GPT_3_5_TURBO]: {
    maxTokens: 4096,
    contextWindow: 16385,
    costPer1kPrompt: 0.0005,
    costPer1kCompletion: 0.0015,
    description: 'Modelo rápido e econômico',
    useCase: 'Tarefas simples, alta velocidade',
  },
  [OPENAI_MODELS.GPT_3_5_TURBO_16K]: {
    maxTokens: 16384,
    contextWindow: 16385,
    costPer1kPrompt: 0.0015,
    costPer1kCompletion: 0.002,
    description: 'GPT-3.5 com contexto estendido',
    useCase: 'Documentos longos, contexto amplo',
  },
} as const;

/**
 * Recomendações de uso por caso
 */
export const USE_CASE_RECOMMENDATIONS = {
  dataAnalysis: OPENAI_MODELS.GPT_4_TURBO,
  simpleQueries: OPENAI_MODELS.GPT_3_5_TURBO,
  complexReasoning: OPENAI_MODELS.GPT_4,
  costOptimized: OPENAI_MODELS.GPT_4O_MINI,
  balanced: OPENAI_MODELS.GPT_4O,
} as const;

/**
 * Calcula o custo estimado de uma requisição
 */
export function estimateCost(
  model: OpenAiModel,
  promptTokens: number,
  completionTokens: number
): number {
  const specs = MODEL_SPECS[model];
  if (!specs) return 0;

  const promptCost = (promptTokens / 1000) * specs.costPer1kPrompt;
  const completionCost = (completionTokens / 1000) * specs.costPer1kCompletion;

  return promptCost + completionCost;
}

/**
 * Formata o custo em USD
 */
export function formatCost(cost: number): string {
  return `$${cost.toFixed(6)}`;
}

/**
 * Obtém informações sobre um modelo
 */
export function getModelInfo(model: OpenAiModel) {
  return MODEL_SPECS[model] || null;
}
