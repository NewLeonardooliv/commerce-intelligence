import { LlmAgent, GOOGLE_SEARCH, InMemoryRunner } from '@google/adk';
import type {
  IAgent,
  AgentContext,
  AgentRole,
} from '../../modules/chat/types/agent.types';

export type ADKAgentWrapperConfig = {
  name: string;
  description: string;
  role: AgentRole;
  model?: string;
  instruction: string;
  useGoogleSearch?: boolean;
  customTools?: any[];
};

export class ADKAgentWrapper implements IAgent {
  role: AgentRole;
  private adkAgent: LlmAgent;
  private config: ADKAgentWrapperConfig;

  constructor(config: ADKAgentWrapperConfig) {
    this.role = config.role;
    this.config = config;

    const tools: any[] = [];
    if (config.useGoogleSearch) {
      tools.push(GOOGLE_SEARCH);
    }
    if (config.customTools) {
      tools.push(...config.customTools);
    }

    this.adkAgent = new LlmAgent({
      name: config.name,
      description: config.description,
      model: config.model || 'gemini-2.5-flash',
      instruction: config.instruction,
      tools: tools.length > 0 ? (tools as any) : undefined,
    });
  }

  async process(context: AgentContext): Promise<AgentContext> {
    try {
      console.log(`[ADK Agent ${this.role}] Processing...`);
      const conversationText = this.buildConversationText(context);

      const runner = new InMemoryRunner({
        agent: this.adkAgent,
        appName: 'commerce-intelligence',
      });

      let finalOutput = '';
      const userId = 'user-1';
      const sessionId = `session-${Date.now()}`;

      runner.sessionService.createSession({
        userId,
        sessionId,
        appName: 'commerce-intelligence',
      });

      const runStream = runner.runAsync({
        userId,
        sessionId,
        newMessage: { parts: [{ text: conversationText }] },
      });

      for await (const event of runStream) {
        console.log(`[DEBUG EVENT]:`, JSON.stringify(event));

        const content = (event as any).content;

        if (content?.parts && Array.isArray(content.parts)) {
          for (const part of content.parts) {
            if (part.text) finalOutput += part.text;
          }
        } else if ((event as any).text) {
          finalOutput += (event as any).text;
        }
      }

      if (!finalOutput) {
        finalOutput = "O modelo não retornou conteúdo. Verifique as permissões da API Key.";
      }

      context.conversationHistory.push({
        role: 'assistant',
        content: finalOutput,
        metadata: {
          agent: this.role,
          adkAgent: true,
          model: this.config.model,
        },
      });

      console.log(`[ADK Agent ${this.role}] Completed`);
      return context;
    } catch (error) {
      console.error(`[ADK Agent ${this.role}] Error:`, error);

      context.conversationHistory.push({
        role: 'system',
        content: `Erro no agente ADK ${this.role}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        metadata: { agent: this.role, error: String(error) },
      });

      return context;
    }
  }

  private buildConversationText(context: AgentContext): string {
    const parts: string[] = [];

    parts.push(`User Query: ${context.userQuery}`);

    if (context.interpretation) {
      parts.push(`\nInterpretation: ${JSON.stringify(context.interpretation, null, 2)}`);
    }

    if (context.queryResults && context.queryResults.length > 0) {
      parts.push(`\nDatabase Results: ${JSON.stringify(context.queryResults, null, 2)}`);
    }

    if (context.mcpResults) {
      parts.push(`\nMCP Results: ${JSON.stringify(context.mcpResults, null, 2)}`);
    }

    if (context.conversationHistory.length > 0) {
      parts.push('\nConversation History:');
      context.conversationHistory.forEach((msg) => {
        parts.push(`${msg.role}: ${msg.content.substring(0, 200)}...`);
      });
    }

    return parts.join('\n');
  }

  getADKAgent(): LlmAgent {
    return this.adkAgent;
  }
}
