import type { IAgent, AgentContext } from '../types/agent.types';
import { InterpreterAgent } from './interpreter.agent';
import { DataQueryAgent } from './data-query.agent';
import { MCPAgent } from './mcp.agent';
import { ResponderAgent } from './responder.agent';
import { SuggestionAgent } from './suggestion.agent';
import { EnhancerAgent } from './enhancer.agent';
import type { MCPService } from '../../../infrastructure/mcp/mcp-service';
import type { IAiProvider } from '../../../infrastructure/ai/ai-provider.interface';
import { ADKAgentWrapper } from '../../../infrastructure/adk/adk-agent-wrapper';
import type { ADKConfig } from '../../../config/adk';

export type OrchestratorConfig = {
  mcpService?: MCPService;
  aiProvider: IAiProvider;
  enableMCP?: boolean;
  adkConfig?: ADKConfig;
};

export class AgentOrchestrator {
  private agents: IAgent[];

  constructor(config: OrchestratorConfig) {
    const adkConfig = config.adkConfig;
    const useADK = adkConfig?.enabled ?? false;

    this.agents = [
      useADK && adkConfig?.replaceAgents?.interpreter
        ? new ADKAgentWrapper({
            name: 'interpreter',
            description: 'Interprets user queries and extracts intent',
            role: 'adk_interpreter',
            model: adkConfig.model,
            instruction:
              'You are an intent interpreter. Analyze the user query and extract the intent, entities, and determine if data is needed.',
            useGoogleSearch: false,
          })
        : new InterpreterAgent(),
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
      useADK && adkConfig?.replaceAgents?.responder
        ? new ADKAgentWrapper({
            name: 'responder',
            description: 'Generates responses based on data and context',
            role: 'adk_responder',
            model: adkConfig.model,
            instruction:
              'You are a response generator. Create clear, informative responses in Portuguese based on the data provided.',
            useGoogleSearch: adkConfig.useGoogleSearch,
          })
        : new ResponderAgent(),
      useADK && adkConfig?.replaceAgents?.suggestion
        ? new ADKAgentWrapper({
            name: 'suggestion',
            description: 'Generates follow-up question suggestions',
            role: 'adk_suggestion',
            model: adkConfig.model,
            instruction:
              'You are a suggestion generator. Create 3 relevant follow-up questions in Portuguese.',
            useGoogleSearch: false,
          })
        : new SuggestionAgent(),
      useADK && adkConfig?.replaceAgents?.enhancer
        ? new ADKAgentWrapper({
            name: 'enhancer',
            description: 'Enhances and refines responses',
            role: 'adk_enhancer',
            model: adkConfig.model,
            instruction:
              'You are a response enhancer. Refine and improve the response quality in Portuguese.',
            useGoogleSearch: false,
          })
        : new EnhancerAgent(),
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
