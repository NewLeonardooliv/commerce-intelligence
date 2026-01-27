import { getDatabase } from '@infrastructure/database/connection';
import { chatSessions, chatMessages } from '@infrastructure/database/schema';
import { eq, desc } from 'drizzle-orm';
import { AgentOrchestrator } from './agents/orchestrator';
import type { AgentMessage } from './types/agent.types';
import { generateId } from '@shared/utils/id.util';
import { MCPService } from '../../infrastructure/mcp/mcp-service';
import { loadMCPConfig, isMCPEnabled } from '../../config/mcp';
import { loadADKConfig, isADKEnabled } from '../../config/adk';
import { aiService } from '../../infrastructure/ai/ai-service';

type ChatSession = {
  id: number;
  userId: string | null;
  context: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

type ChatMessage = {
  id: number;
  sessionId: number | null;
  role: string;
  content: string;
  metadata: string | null;
  createdAt: Date | null;
};

export type ChatRequest = {
  message: string;
  sessionId?: string;
  userId?: string;
};

export type ChatResponse = {
  sessionId: string;
  response: string;
  metadata: {
    interpretation?: unknown;
    dataUsed: boolean;
    mcpUsed?: boolean;
    sources: string[];
    confidence: number;
    suggestions: string[];
  };
  history: Array<{
    role: string;
    content: string;
  }>;
};

class ChatService {
  private orchestrator: AgentOrchestrator;
  private mcpService?: MCPService;

  constructor() {
    if (isMCPEnabled()) {
      const mcpServers = loadMCPConfig();
      if (mcpServers.length > 0) {
        console.log(`[Chat Service] Initializing MCP with ${mcpServers.length} servers:`);
        mcpServers.forEach((server) => {
          console.log(`  - ${server.name}: ${server.url} (enabled: ${server.enabled})`);
        });
        this.mcpService = new MCPService(mcpServers);
        console.log(`[Chat Service] MCP service initialized`);
      } else {
        console.log('[Chat Service] MCP enabled but no servers configured');
      }
    } else {
      console.log('[Chat Service] MCP is disabled');
    }

    const adkConfig = isADKEnabled() ? loadADKConfig() : undefined;
    if (adkConfig?.enabled) {
      console.log('[Chat Service] Google ADK enabled');
      console.log(`  - Model: ${adkConfig.model}`);
      console.log(`  - Google Search: ${adkConfig.useGoogleSearch}`);
      if (adkConfig.replaceAgents) {
        const replacedAgents = Object.entries(adkConfig.replaceAgents)
          .filter(([_, enabled]) => enabled)
          .map(([agent]) => agent);
        if (replacedAgents.length > 0) {
          console.log(`  - Replacing agents: ${replacedAgents.join(', ')}`);
        }
      }
    }

    this.orchestrator = new AgentOrchestrator({
      mcpService: this.mcpService,
      aiProvider: aiService.getProvider(),
      enableMCP: !!this.mcpService,
      adkConfig,
    });
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const db = getDatabase();

    let sessionId = request.sessionId;
    let session: ChatSession | undefined;

    if (sessionId) {
      const parsedId = parseInt(sessionId, 10);
      if (!isNaN(parsedId)) {
        const sessions = await db
          .select()
          .from(chatSessions)
          .where(eq(chatSessions.id, parsedId))
          .limit(1);
        session = sessions[0];
      }
    }

    if (!session) {
      const newSessions = await db
        .insert(chatSessions)
        .values({
          userId: request.userId || null,
          context: JSON.stringify({ created: new Date() }),
        })
        .returning();
      session = newSessions[0];
      sessionId = session.id.toString();
    }

    await db.insert(chatMessages).values({
      sessionId: session.id,
      role: 'user',
      content: request.message,
      metadata: JSON.stringify({ timestamp: new Date() }),
    });

    const history = await this.getSessionHistory(session.id);
    const conversationHistory: AgentMessage[] = history.map((msg) => ({
      role: msg.role as AgentMessage['role'],
      content: msg.content,
      metadata: msg.metadata ? JSON.parse(msg.metadata) : undefined,
    }));

    const context = await this.orchestrator.process(
      sessionId!,
      request.message,
      conversationHistory
    );

    const finalMessage =
      context.conversationHistory[context.conversationHistory.length - 1];
    const responseContent = finalMessage?.content || 'Não foi possível gerar resposta';
    const responseMetadata = finalMessage?.metadata || {};

    await db.insert(chatMessages).values({
      sessionId: session.id,
      role: 'assistant',
      content: responseContent,
      metadata: JSON.stringify(responseMetadata),
    });

    return {
      sessionId: sessionId!,
      response: responseContent,
      metadata: {
        interpretation: context.interpretation,
        dataUsed: !!context.queryResults && context.queryResults.length > 0,
        mcpUsed: !!context.mcpResults,
        sources: (responseMetadata.sources as string[]) || [],
        confidence: (responseMetadata.confidence as number) || 0.5,
        suggestions: (responseMetadata.suggestions as string[]) || [],
      },
      history: context.conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    };
  }

  async getSession(sessionId: string) {
    const db = getDatabase();

    const parsedId = parseInt(sessionId, 10);
    if (isNaN(parsedId)) {
      return null;
    }

    const sessions = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, parsedId))
      .limit(1);

    const session = sessions[0];
    if (!session) {
      return null;
    }

    const history = await this.getSessionHistory(session.id);

    return {
      id: session.id.toString(),
      userId: session.userId,
      messages: history,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }

  async listSessions(userId?: string) {
    const db = getDatabase();

    const query = db
      .select()
      .from(chatSessions)
      .orderBy(desc(chatSessions.updatedAt))
      .limit(50);

    const sessions = userId
      ? await query.where(eq(chatSessions.userId, userId))
      : await query;

    return sessions.map((session) => ({
      id: session.id.toString(),
      userId: session.userId,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }));
  }

  private async getSessionHistory(sessionId: number): Promise<ChatMessage[]> {
    const db = getDatabase();

    return db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt)
      .limit(50);
  }

  async getMCPTools() {
    if (!this.mcpService) {
      return { enabled: false, tools: [] };
    }

    try {
      const tools = await this.mcpService.listAllTools();
      return {
        enabled: true,
        count: tools.length,
        tools: tools.map((tool) => ({
          name: tool.name,
          server: tool.serverName,
          description: tool.description,
          parameters: tool.inputSchema.properties,
        })),
      };
    } catch (error) {
      console.error('[Chat Service] Error listing MCP tools:', error);
      return { enabled: true, error: String(error), tools: [] };
    }
  }

  async getMCPHealth() {
    if (!this.mcpService) {
      return { enabled: false, servers: {} };
    }

    try {
      const health = await this.mcpService.checkHealth();
      return {
        enabled: true,
        servers: health,
        allHealthy: Object.values(health).every((h) => h),
      };
    } catch (error) {
      console.error('[Chat Service] Error checking MCP health:', error);
      return { enabled: true, error: String(error), servers: {} };
    }
  }

  async getMCPServers() {
    if (!this.mcpService) {
      return { enabled: false, servers: [] };
    }

    const servers = this.mcpService.getServers();
    return {
      enabled: true,
      count: servers.length,
      servers: servers.map((s) => ({
        name: s.name,
        url: s.url,
        enabled: s.enabled,
        description: s.description,
        hasApiKey: !!s.apiKey,
      })),
    };
  }
}

export const chatService = new ChatService();
