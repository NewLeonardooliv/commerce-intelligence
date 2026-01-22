import { t } from 'elysia';

export const chatRequestSchema = t.Object({
  message: t.String({ minLength: 1, maxLength: 2000 }),
  sessionId: t.Optional(t.String()),
  userId: t.Optional(t.String()),
});

export const sessionIdSchema = t.Object({
  sessionId: t.String(),
});
