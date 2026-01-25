import type { IAgent, AgentContext } from '../types/agent.types';
import type { MCPService } from '../../../infrastructure/mcp/mcp-service';
import type { IAiProvider } from '../../../infrastructure/ai/ai-provider.interface';

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

  constructor(config: MCPAgentConfig) {
    this.mcpService = config.mcpService;
    this.aiProvider = config.aiProvider;
    this.enabled = config.enabled;
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

  private shouldUseMCP(context: AgentContext): boolean {
    if (context.interpretation?.requiresExternalTools) {
      return true;
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
