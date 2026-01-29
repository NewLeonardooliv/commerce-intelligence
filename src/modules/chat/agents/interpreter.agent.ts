import type { IAgent, AgentContext, InterpretationResult } from '../types/agent.types';
import { LlmAgent, InMemoryRunner } from '@google/adk';

export class InterpreterAgent implements IAgent {
  role = 'interpreter' as const;
  private adkAgent: LlmAgent;

  constructor() {
    this.adkAgent = new LlmAgent({
      name: 'interpreter',
      description: 'Interprets user queries and extracts intent',
      model: 'gemini-2.5-flash',
      instruction: `You are an intent interpreter for an e-commerce analytics system.

Your task: Analyze the user query and return ONLY a JSON object with this exact structure:
{
  "intent": "clear description of what the user wants in Portuguese",
  "entities": { "key": "value" },
  "requiresData": true or false (true if needs database query),
  "suggestedQueries": [],
  "confidence": 0.0-1.0
}

IMPORTANT:
- ALWAYS return valid JSON, nothing else
- Set requiresData to true for questions about products, sales, customers, orders
- Use Portuguese for the intent description
- Be specific about what data is needed`,
    });
  }

  async process(context: AgentContext): Promise<AgentContext> {
    console.log(`[${this.role}] Processing query...`);
    
    const interpretation = await this.interpretQuery(context.userQuery);

    console.log(`[${this.role}] Interpretation:`, interpretation);

    return {
      ...context,
      interpretation,
    };
  }

  private async interpretQuery(query: string): Promise<InterpretationResult> {
    try {
      const runner = new InMemoryRunner({
        agent: this.adkAgent,
        appName: 'commerce-intelligence',
      });

      const userId = 'user-1';
      const sessionId = `session-${Date.now()}`;

      runner.sessionService.createSession({
        userId,
        sessionId,
        appName: 'commerce-intelligence',
      });

      const prompt = `Analyze this user query and return the interpretation as JSON:\n\n"${query}"\n\nReturn ONLY valid JSON with: intent, entities, requiresData, suggestedQueries, confidence`;

      let output = '';
      const runStream = runner.runAsync({
        userId,
        sessionId,
        newMessage: { parts: [{ text: prompt }] },
      });

      for await (const event of runStream) {
        const content = (event as any).content;
        if (content?.parts && Array.isArray(content.parts)) {
          for (const part of content.parts) {
            if (part.text) output += part.text;
          }
        } else if ((event as any).text) {
          output += (event as any).text;
        }
      }

      return this.parseInterpretation(output, query);
    } catch (error) {
      console.error(`[${this.role}] Error:`, error);
      return this.getFallbackInterpretation(query);
    }
  }

  private parseInterpretation(output: string, query: string): InterpretationResult {
    try {
      // Remove markdown code blocks if present
      let cleanOutput = output.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const jsonMatch = cleanOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          intent: parsed.intent || 'Análise geral de dados',
          entities: parsed.entities || {},
          requiresData: parsed.requiresData !== false, // Default to true
          suggestedQueries: parsed.suggestedQueries || [],
          confidence: parsed.confidence || 0.7,
        };
      }
    } catch (e) {
      console.error(`[${this.role}] Parse error:`, e);
    }

    return this.getFallbackInterpretation(query);
  }

  private getFallbackInterpretation(query: string): InterpretationResult {
    return {
      intent: 'Análise de dados de e-commerce',
      entities: {},
      requiresData: true,
      suggestedQueries: [],
      confidence: 0.5,
    };
  }
}
