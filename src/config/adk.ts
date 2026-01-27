export type ADKConfig = {
  enabled: boolean;
  model?: string;
  useGoogleSearch?: boolean;
  replaceAgents?: {
    interpreter?: boolean;
    responder?: boolean;
    suggestion?: boolean;
    enhancer?: boolean;
  };
};

export function loadADKConfig(): ADKConfig {
  return {
    enabled: process.env.ENABLE_ADK === 'true',
    model: process.env.ADK_MODEL || 'gemini-2.0-flash-exp',
    useGoogleSearch: process.env.ADK_USE_GOOGLE_SEARCH === 'true',
    replaceAgents: {
      interpreter: process.env.ADK_REPLACE_INTERPRETER === 'true',
      responder: process.env.ADK_REPLACE_RESPONDER === 'true',
      suggestion: process.env.ADK_REPLACE_SUGGESTION === 'true',
      enhancer: process.env.ADK_REPLACE_ENHANCER === 'true',
    },
  };
}

export const isADKEnabled = (): boolean => {
  return process.env.ENABLE_ADK === 'true';
};
