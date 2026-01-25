import type { IAgent, AgentContext } from '../types/agent.types';
import { InterpreterAgent } from './interpreter.agent';
import { DataQueryAgent } from './data-query.agent';
import { MCPAgent } from './mcp.agent';
import { ResponderAgent } from './responder.agent';
import { SuggestionAgent } from './suggestion.agent';
import { EnhancerAgent } from './enhancer.agent';
import type { MCPService } from '../../../infrastructure/mcp/mcp-service';
import type { IAiProvider } from '../../../infrastructure/ai/ai-provider.interface';

export type OrchestratorConfig = {
  mcpService?: MCPService;
  aiProvider: IAiProvider;
  enableMCP?: boolean;
};

export class AgentOrchestrator {
  private agents: IAgent[];

  constructor(config: OrchestratorConfig) {
    this.agents = [
      new InterpreterAgent(),
      new DataQueryAgent(),
      ...(config.mcpService
        ? [
            new MCPAgent({
              mcpService: config.mcpService,
              aiProvider: config.aiProvider,
              enabled: config.enableMCP ?? true,
            }),
          ]
        : []),
      new ResponderAgent(),
      new SuggestionAgent(),
      new EnhancerAgent(),
    ];
  }

  async process(
    sessionId: string,
    userQuery: string,
    conversationHistory: AgentContext['conversationHistory'] = []
  ): Promise<AgentContext> {
    let context: AgentContext = {
      sessionId,
      userQuery,
      conversationHistory,
    };

    console.log(`[Orchestrator] Processing query: "${userQuery}"`);

    for (const agent of this.agents) {
      console.log(`[Orchestrator] Running agent: ${agent.role}`);

      try {
        context = await agent.process(context);
        console.log(`[Orchestrator] Agent ${agent.role} completed`);
      } catch (error) {
        console.error(`[Orchestrator] Agent ${agent.role} failed:`, error);

        context.conversationHistory.push({
          role: 'system',
          content: `Erro no agente ${agent.role}`,
          metadata: { error: String(error) },
        });
      }
    }

    console.log('[Orchestrator] Processing complete');
    return context;
  }

  async processWithSteps(
    sessionId: string,
    userQuery: string,
    conversationHistory: AgentContext['conversationHistory'] = []
  ): Promise<{
    context: AgentContext;
    steps: Array<{ agent: string; result: string }>;
  }> {
    let context: AgentContext = {
      sessionId,
      userQuery,
      conversationHistory,
    };

    const steps: Array<{ agent: string; result: string }> = [];

    for (const agent of this.agents) {
      const beforeCount = context.conversationHistory.length;
      context = await agent.process(context);
      const afterCount = context.conversationHistory.length;

      if (afterCount > beforeCount) {
        const lastMessage = context.conversationHistory[afterCount - 1];
        steps.push({
          agent: agent.role,
          result: lastMessage.content,
        });
      }
    }

    return { context, steps };
  }
}
