export type AiMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type AiCompletionRequest = {
  messages: AiMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
};

export type AiCompletionResponse = {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};

export interface IAiProvider {
  complete(request: AiCompletionRequest): Promise<AiCompletionResponse>;
  analyzeData(data: Record<string, unknown>): Promise<Record<string, unknown>>;
  generateInsights(data: Record<string, unknown>): Promise<string[]>;
}
