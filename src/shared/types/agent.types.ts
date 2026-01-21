export type AgentStatus = 'idle' | 'processing' | 'completed' | 'failed';

export type AgentCapability =
  | 'data-analysis'
  | 'pattern-recognition'
  | 'forecasting'
  | 'anomaly-detection'
  | 'recommendation'
  | 'sentiment-analysis';

export type Agent = {
  id: string;
  name: string;
  description: string;
  capabilities: AgentCapability[];
  status: AgentStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type AgentTask = {
  id: string;
  agentId: string;
  type: AgentCapability;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  status: AgentStatus;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
};

export type AgentCreateInput = {
  name: string;
  description: string;
  capabilities: AgentCapability[];
};

export type AgentTaskInput = {
  agentId: string;
  type: AgentCapability;
  input: Record<string, unknown>;
};
