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
  );
