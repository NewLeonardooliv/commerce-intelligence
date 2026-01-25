import { Elysia } from 'elysia';
import { chatService } from './chat.service';
import { successResponse } from '@shared/utils/response.util';
import { chatRequestSchema, sessionIdSchema } from './chat.schema';
import { t } from 'elysia';

export const chatController = new Elysia({ prefix: '/chat' })
  .post(
    '/',
    async ({ body }) => {
      const result = await chatService.chat(body);
      return successResponse(result);
    },
    {
      body: chatRequestSchema,
      detail: {
        summary: 'Send chat message',
        description:
          'Send a message to the AI chat system with intelligent agents for e-commerce data analysis',
        tags: ['Chat'],
      },
    }
  )
  .get(
    '/sessions',
    async ({ query }) => {
      const sessions = await chatService.listSessions(query.userId);
      return successResponse(sessions);
    },
    {
      query: t.Object({
        userId: t.Optional(t.String()),
      }),
      detail: {
        summary: 'List chat sessions',
        description: 'Get all chat sessions, optionally filtered by user',
        tags: ['Chat'],
      },
    }
  )
  .get(
    '/sessions/:sessionId',
    async ({ params }) => {
      const session = await chatService.getSession(params.sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      return successResponse(session);
    },
    {
      params: sessionIdSchema,
      detail: {
        summary: 'Get chat session',
        description: 'Get a specific chat session with full message history',
        tags: ['Chat'],
      },
    }
  )
  .get(
    '/mcp/tools',
    async () => {
      const tools = await chatService.getMCPTools();
      return successResponse(tools);
    },
    {
      detail: {
        summary: 'List MCP tools',
        description: 'Get all available MCP tools from connected servers',
        tags: ['Chat', 'MCP'],
      },
    }
  )
  .get(
    '/mcp/health',
    async () => {
      const health = await chatService.getMCPHealth();
      return successResponse(health);
    },
    {
      detail: {
        summary: 'Check MCP health',
        description: 'Check connectivity status of all MCP servers',
        tags: ['Chat', 'MCP'],
      },
    }
  )
  .get(
    '/mcp/servers',
    async () => {
      const servers = await chatService.getMCPServers();
      return successResponse(servers);
    },
    {
      detail: {
        summary: 'List MCP servers',
        description: 'Get all configured MCP servers',
        tags: ['Chat', 'MCP'],
      },
    }
  );
