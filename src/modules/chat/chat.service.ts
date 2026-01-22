import { getDatabase } from '@infrastructure/database/connection';
import { chatSessions, chatMessages } from '@infrastructure/database/schema';
import { eq, desc } from 'drizzle-orm';
import { AgentOrchestrator } from './agents/orchestrator';
import type { AgentMessage } from './types/agent.types';
import { generateId } from '@shared/utils/id.util';

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

  constructor() {
    this.orchestrator = new AgentOrchestrator();
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
}

export const chatService = new ChatService();
