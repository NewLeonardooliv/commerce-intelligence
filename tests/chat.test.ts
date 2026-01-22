import { describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import { chatController } from '../src/modules/chat/chat.controller';

describe('Chat Module - Input Validation', () => {
  const app = new Elysia().use(chatController);

  it('should validate required message field', async () => {
    const response = await app.handle(
      new Request('http://localhost/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
    );

    expect(response.status).toBe(422);
  });

  it('should validate empty message', async () => {
    const response = await app.handle(
      new Request('http://localhost/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: '',
        }),
      })
    );

    expect(response.status).toBe(422);
  });

  it('should validate message max length', async () => {
    const longMessage = 'a'.repeat(2001);
    const response = await app.handle(
      new Request('http://localhost/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: longMessage,
        }),
      })
    );

    expect(response.status).toBe(422);
  });
});
