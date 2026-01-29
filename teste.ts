import { LlmAgent, GOOGLE_SEARCH, InMemoryRunner } from '@google/adk';

const rootAgent = new LlmAgent({
    name: 'search_assistant',
    description: 'An assistant that can search the web.',
    model: 'gemini-2.5-flash', // Or your preferred models
    instruction: 'You are a helpful assistant. Answer user questions using Google Search when needed.',
    tools: [GOOGLE_SEARCH],
});

const runner = new InMemoryRunner({
    agent: rootAgent,
    appName: 'commerce-intelligence',
});

const runStream = runner.runAsync({
    userId: 'user-1',
    sessionId: 'session-1',
    newMessage: { parts: [{ text: 'What is the capital of France?' }] },
});

runner.sessionService.createSession({
    userId: 'user-1',
    sessionId: 'session-1',
    appName: 'commerce-intelligence',
  });

for await (const event of runStream) {
    console.log(`[DEBUG EVENT]:`, JSON.stringify(event));
}