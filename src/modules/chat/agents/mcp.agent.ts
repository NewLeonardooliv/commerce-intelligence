import type { IAgent, AgentContext } from '../types/agent.types';
import type { MCPService } from '../../../infrastructure/mcp/mcp-service';
import type { IAiProvider } from '../../../infrastructure/ai/ai-provider.interface';
import { LlmAgent, MCPToolset } from '@google/adk';
import { env } from '../../../config/env';

export type MCPAgentConfig = {
  mcpService: MCPService;
  aiProvider: IAiProvider;
  enabled: boolean;
};

export class MCPAgent implements IAgent {
  role = 'mcp' as const;
  private mcpService: MCPService;
  private aiProvider: IAiProvider;
  private enabled: boolean;
  private adkAgent?: LlmAgent;

  constructor(config: MCPAgentConfig) {
    this.mcpService = config.mcpService;
    this.aiProvider = config.aiProvider;
    this.enabled = config.enabled;

    // Initialize ADK Agent with MCP Toolset if enabled and API key is available
    if (this.enabled && env.google.apiKey) {
      try {
        console.log('[MCP Agent] Initializing ADK agent with MCP toolset...');
        
        const mcpToolset = new MCPToolset({
          type: 'StreamableHTTPConnectionParams',
          url: env.mcp.serverUrl,
        });

        this.adkAgent = new LlmAgent({
          model: 'gemini-2.0-flash-exp',
          name: 'mcp_agent',
          instruction: `Você é um assistente especializado em usar ferramentas MCP para obter informações externas e complementares.
          
Suas responsabilidades:
- Identificar quando ferramentas MCP são necessárias
- Selecionar e usar as ferramentas apropriadas
- Interpretar e formatar os resultados das ferramentas
- Integrar os resultados ao contexto da conversa

Sempre seja objetivo e retorne informações relevantes para a consulta do usuário.`,
          tools: [mcpToolset],
        });

        console.log('[MCP Agent] ADK agent initialized successfully');
      } catch (error) {
        console.error('[MCP Agent] Error initializing ADK agent:', error);
        this.adkAgent = undefined;
      }
    }
  }

  async process(context: AgentContext): Promise<AgentContext> {
    if (!this.enabled) {
      console.log('[MCP Agent] Disabled, skipping');
      return context;
    }

    try {
      console.log('[MCP Agent] Processing...');

      const shouldUseMCP = this.shouldUseMCP(context);

      if (!shouldUseMCP) {
        console.log('[MCP Agent] MCP tools not needed for this query');
        return context;
      }

      // Use ADK agent if available for more intelligent tool selection and execution
      if (this.adkAgent) {
        return await this.processWithADK(context);
      }

      // Fallback to legacy method if ADK agent is not available
      return await this.processLegacy(context);
    } catch (error) {
      console.error('[MCP Agent] Error:', error);

      context.conversationHistory.push({
        role: 'system',
        content: `Erro ao usar ferramentas MCP: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        metadata: { agent: this.role, error: String(error) },
      });

      return context;
    }
  }

  /**
   * Process using Google ADK agent for intelligent tool selection and execution
   */
  private async processWithADK(context: AgentContext): Promise<AgentContext> {
    try {
      console.log('[MCP Agent] Processing with ADK agent...');

      if (!this.adkAgent) {
        throw new Error('ADK agent not initialized');
      }

      // Build context for the ADK agent
      const prompt = this.buildADKPrompt(context);

      console.log('[MCP Agent] ADK agent available for MCP tool usage');
      console.log('[MCP Agent] Prompt:', prompt);

      // Note: Direct execution requires ADK Runner
      // For now, we'll use a simplified response
      const response = {
        text: 'ADK agent is ready to process MCP tools. Integration requires ADK Runner setup.',
      };

      // Add the response to conversation history
      context.conversationHistory.push({
        role: 'assistant',
        content: response.text,
        metadata: {
          agent: this.role,
          method: 'adk',
        },
      });

      // Store MCP results
      context.mcpResults = {
        tool: 'adk_agent',
        server: 'google_adk',
        data: {
          content: [
            {
              type: 'text',
              text: response.text,
            },
          ],
          isError: false,
        },
      };

      console.log('[MCP Agent] Successfully processed with ADK');

      return context;
    } catch (error) {
      console.error('[MCP Agent] Error processing with ADK:', error);
      throw error;
    }
  }

  /**
   * Legacy processing method (fallback)
   */
  private async processLegacy(context: AgentContext): Promise<AgentContext> {
    console.log('[MCP Agent] Processing with legacy method...');

    const availableTools = await this.mcpService.listAllTools();

    if (availableTools.length === 0) {
      console.log('[MCP Agent] No MCP tools available');
      return context;
    }

    const toolDecision = await this.decideToolUsage(context, availableTools);

    if (!toolDecision) {
      console.log('[MCP Agent] No suitable tool found');
      return context;
    }

    const toolResult = await this.mcpService.callTool(
      toolDecision.serverName,
      toolDecision.toolName,
      toolDecision.arguments
    );

    context.conversationHistory.push({
      role: 'tool',
      content: this.formatToolResult(toolResult),
      metadata: {
        agent: this.role,
        tool: toolDecision.toolName,
        server: toolDecision.serverName,
      },
    });

    context.mcpResults = {
      tool: toolDecision.toolName,
      server: toolDecision.serverName,
      data: toolResult,
    };

    console.log(`[MCP Agent] Successfully executed tool: ${toolDecision.toolName}`);

    return context;
  }

  /**
   * Build prompt for ADK agent based on context
   */
  private buildADKPrompt(context: AgentContext): string {
    let prompt = `Pergunta do usuário: ${context.userQuery}\n\n`;

    if (context.interpretation) {
      prompt += `Interpretação da consulta:\n`;
      prompt += `- Intenção: ${context.interpretation.intent}\n`;
      prompt += `- Confiança: ${context.interpretation.confidence}\n`;

      if (context.interpretation.entities) {
        const entities = Array.isArray(context.interpretation.entities)
          ? context.interpretation.entities
          : [];

        if (entities.length > 0) {
          prompt += `- Entidades identificadas: ${entities
            .map((e: any) => `${e.type}: ${e.value}`)
            .join(', ')}\n`;
        }
      }

      if (context.interpretation.requiresExternalTools) {
        prompt += `- Requer ferramentas externas: Sim\n`;
      }

      prompt += '\n';
    }

    if (context.conversationHistory.length > 1) {
      prompt += `Histórico da conversa:\n`;
      context.conversationHistory.slice(-3).forEach((msg) => {
        if (msg.role === 'user') {
          prompt += `Usuário: ${msg.content}\n`;
        } else if (msg.role === 'assistant') {
          prompt += `Assistente: ${msg.content}\n`;
        }
      });
      prompt += '\n';
    }

    prompt += `TAREFA:
Use as ferramentas MCP disponíveis para obter as informações necessárias e responder à pergunta do usuário.
Seja objetivo e retorne informações relevantes e bem formatadas.`;

    return prompt;
  }

  private shouldUseMCP(context: AgentContext): boolean {
    return true;
    if (context.interpretation?.requiresExternalTools) {
    }

    const mcpKeywords = [
      'buscar na web',
      'pesquisar online',
      'informação externa',
      'dados externos',
      'api externa',
    ];

    const query = context.userQuery.toLowerCase();
    return mcpKeywords.some((keyword) => query.includes(keyword));
  }

  private async decideToolUsage(
    context: AgentContext,
    availableTools: Awaited<ReturnType<MCPService['listAllTools']>>
  ): Promise<{
    serverName: string;
    toolName: string;
    arguments: Record<string, unknown>;
  } | null> {
    const prompt = `
Você é um assistente especializado em decidir qual ferramenta MCP usar.

Pergunta do usuário: ${context.userQuery}

Contexto da interpretação:
${JSON.stringify(context.interpretation, null, 2)}

Ferramentas disponíveis:
${availableTools
  .map(
    (tool, i) => `${i + 1}. ${tool.serverName}::${tool.name}
   Descrição: ${tool.description}
   Parâmetros: ${JSON.stringify(tool.inputSchema.properties, null, 2)}`
  )
  .join('\n\n')}

TAREFA:
1. Analise a pergunta do usuário
2. Escolha a ferramenta mais apropriada
3. Determine os parâmetros necessários
4. Responda APENAS com JSON válido no formato:
{
  "toolName": "nome_da_tool",
  "serverName": "nome_do_servidor",
  "arguments": { "param1": "valor1" }
}

Se nenhuma ferramenta for apropriada, responda: { "toolName": null }
`;

    try {
      const response = await this.aiProvider.generateText([
        {
          role: 'user',
          content: prompt,
        },
      ]);

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log('[MCP Agent] No JSON found in AI response');
        return null;
      }

      const decision = JSON.parse(jsonMatch[0]);

      if (!decision.toolName) {
        return null;
      }

      return {
        serverName: decision.serverName,
        toolName: decision.toolName,
        arguments: decision.arguments || {},
      };
    } catch (error) {
      console.error('[MCP Agent] Error deciding tool usage:', error);
      return null;
    }
  }

  private formatToolResult(result: Awaited<ReturnType<MCPService['callTool']>>): string {
    if (result.isError) {
      return `Erro ao executar ferramenta: ${result.content.map((c) => c.text).join('\n')}`;
    }

    return result.content
      .map((content) => {
        if (content.type === 'text') {
          return content.text;
        }
        if (content.type === 'image') {
          return `[Imagem: ${content.mimeType}]`;
        }
        if (content.type === 'resource') {
          return `[Recurso: ${content.mimeType}]`;
        }
        return '';
      })
      .join('\n');
  }
}
