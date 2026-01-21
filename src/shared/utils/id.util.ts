export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

export const generateAgentId = (): string => {
  return `agent-${generateId()}`;
};

export const generateTaskId = (): string => {
  return `task-${generateId()}`;
};

export const generateInsightId = (): string => {
  return `insight-${generateId()}`;
};
