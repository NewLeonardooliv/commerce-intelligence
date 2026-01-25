export type AgentRole =
  | 'interpreter'
  | 'data_query'
  | 'mcp'
  | 'responder'
  | 'suggestion'
  | 'enhancer';

export type AgentMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  metadata?: Record<string, unknown>;
};

export type AgentContext = {
  sessionId: string;
  userQuery: string;
  conversationHistory: AgentMessage[];
  databaseSchema?: string;
  queryResults?: unknown[];
  interpretation?: InterpretationResult;
  mcpResults?: {
    tool: string;
    server: string;
    data: unknown;
  };
  rawResponse?: string;
  suggestions?: string[];
};

export type InterpretationResult = {
  intent: string;
  entities: Record<string, unknown>;
  requiresData: boolean;
  requiresExternalTools?: boolean;
  suggestedQueries: string[];
  confidence: number;
};

export type QueryResult = {
  sql: string;
  data: unknown[];
  summary: string;
};

export type EnhancedResponse = {
  content: string;
  sources: string[];
  confidence: number;
  suggestions: string[];
};

export interface IAgent {
  role: AgentRole;
  process(context: AgentContext): Promise<AgentContext>;
}
