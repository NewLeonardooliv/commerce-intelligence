import { LlmAgent, GOOGLE_SEARCH, InMemoryRunner } from '@google/adk';
import type {
  IAgent,
  AgentContext,
  AgentRole,
} from '../../modules/chat/types/agent.types';

export type ADKAgentWrapperConfig = {
  name: string;
  description: string;
  role: AgentRole;
  model?: string;
  instruction: string;
  useGoogleSearch?: boolean;
  customTools?: any[];
};

export class ADKAgentWrapper implements IAgent {
  role: AgentRole;
  private adkAgent: LlmAgent;
  private config: ADKAgentWrapperConfig;

  constructor(config: ADKAgentWrapperConfig) {
    this.role = config.role;
    this.config = config;

    const tools: any[] = [];
    if (config.useGoogleSearch) {
      tools.push(GOOGLE_SEARCH);
    }
    if (config.customTools) {
      tools.push(...config.customTools);
    }

    this.adkAgent = new LlmAgent({
      name: config.name,
      description: config.description,
      model: config.model || 'gemini-2.5-flash',
      instruction: config.instruction,
      tools: tools.length > 0 ? (tools as any) : undefined,
    });
  }

  async process(context: AgentContext): Promise<AgentContext> {
    try {
      console.log(`[ADK Agent ${this.role}] Processing...`);

      // Validation: Check if this agent should process based on role
      if (!this.shouldProcess(context)) {
        console.log(`[ADK Agent ${this.role}] Skipping - conditions not met`);
        return context;
      }

      const conversationText = this.buildConversationText(context);

      const runner = new InMemoryRunner({
        agent: this.adkAgent,
        appName: 'commerce-intelligence',
      });

      let finalOutput = '';
      const userId = 'user-1';
      const sessionId = `session-${Date.now()}`;

      runner.sessionService.createSession({
        userId,
        sessionId,
        appName: 'commerce-intelligence',
      });

      const runStream = runner.runAsync({
        userId,
        sessionId,
        newMessage: { parts: [{ text: conversationText }] },
      });

      for await (const event of runStream) {
        console.log(`[DEBUG EVENT]:`, JSON.stringify(event));

        const content = (event as any).content;

        if (content?.parts && Array.isArray(content.parts)) {
          for (const part of content.parts) {
            if (part.text) finalOutput += part.text;
          }
        } else if ((event as any).text) {
          finalOutput += (event as any).text;
        }
      }

      if (!finalOutput) {
        finalOutput = "O modelo não retornou conteúdo. Verifique as permissões da API Key.";
      }

      // Update context based on role
      this.updateContext(context, finalOutput);

      console.log(`[ADK Agent ${this.role}] Completed`);
      return context;
    } catch (error) {
      console.error(`[ADK Agent ${this.role}] Error:`, error);

      context.conversationHistory.push({
        role: 'system',
        content: `Erro no agente ADK ${this.role}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        metadata: { agent: this.role, error: String(error) },
      });

      return context;
    }
  }

  private shouldProcess(context: AgentContext): boolean {
    let shouldProcess = false;
    let reason = '';

    switch (this.role) {
      case 'adk_interpreter':
        // Interpreter always processes
        shouldProcess = true;
        reason = 'always processes';
        break;
      
      case 'adk_responder':
        // Responder processes if we have data OR if interpretation exists
        shouldProcess = !!(context.interpretation || context.queryResults || context.mcpResults);
        reason = shouldProcess 
          ? `has interpretation=${!!context.interpretation}, queryResults=${!!context.queryResults}, mcpResults=${!!context.mcpResults}`
          : 'no data available';
        break;
      
      case 'adk_suggestion':
        // Suggestion only processes if we have a response
        shouldProcess = !!context.rawResponse;
        reason = shouldProcess ? 'has rawResponse' : 'no rawResponse';
        break;
      
      case 'adk_enhancer':
        // Enhancer only processes if we have a raw response
        shouldProcess = !!context.rawResponse;
        reason = shouldProcess ? 'has rawResponse' : 'no rawResponse';
        break;
      
      default:
        shouldProcess = true;
        reason = 'default';
    }

    console.log(`[ADK Agent ${this.role}] shouldProcess=${shouldProcess} (${reason})`);
    return shouldProcess;
  }

  private updateContext(context: AgentContext, output: string): void {
    switch (this.role) {
      case 'adk_interpreter':
        // Try to parse interpretation from output
        try {
          // Remove markdown code blocks if present
          let cleanOutput = output.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          
          const jsonMatch = cleanOutput.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            context.interpretation = {
              intent: parsed.intent || 'Análise geral de dados',
              entities: parsed.entities || {},
              requiresData: parsed.requiresData !== false, // Default to true
              suggestedQueries: parsed.suggestedQueries || [],
              confidence: parsed.confidence || 0.7,
            };
            console.log(`[ADK Agent ${this.role}] Interpretation parsed:`, context.interpretation);
          } else {
            console.warn(`[ADK Agent ${this.role}] No JSON found in output:`, output.substring(0, 200));
            // Fallback interpretation
            context.interpretation = {
              intent: 'Análise de dados de e-commerce',
              entities: {},
              requiresData: true,
              suggestedQueries: [],
              confidence: 0.5,
            };
          }
        } catch (e) {
          console.error(`[ADK Agent ${this.role}] Error parsing interpretation:`, e);
          // Fallback interpretation
          context.interpretation = {
            intent: 'Análise de dados de e-commerce',
            entities: {},
            requiresData: true,
            suggestedQueries: [],
            confidence: 0.5,
          };
        }
        break;
      
      case 'adk_responder':
        // Set raw response
        context.rawResponse = output;
        break;
      
      case 'adk_suggestion':
        // Parse suggestions - remove numbering, bullets, and markdown
        const lines = output.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 10)
          .map(line => {
            // Remove numbering (1., 1), 2., etc)
            let cleaned = line.replace(/^\d+[\.\)]\s*/, '');
            // Remove bullets
            cleaned = cleaned.replace(/^[-*•]\s*/, '');
            // Remove quotes
            cleaned = cleaned.replace(/^["']\s*/, '').replace(/\s*["']$/, '');
            return cleaned.trim();
          })
          .filter(line => line.length > 0);
        
        context.suggestions = lines.slice(0, 3);
        console.log(`[ADK Agent ${this.role}] Suggestions parsed:`, context.suggestions);
        break;
      
      case 'adk_enhancer':
        // Add enhanced response to conversation history
        context.conversationHistory.push({
          role: 'assistant',
          content: output,
          metadata: {
            agent: this.role,
            adkAgent: true,
            model: this.config.model,
            sources: this.extractSources(context),
            confidence: this.calculateConfidence(context),
            suggestions: context.suggestions || [],
          },
        });
        break;
      
      default:
        // Default behavior - add to conversation history
        context.conversationHistory.push({
          role: 'assistant',
          content: output,
          metadata: {
            agent: this.role,
            adkAgent: true,
            model: this.config.model,
          },
        });
    }
  }

  private extractSources(context: AgentContext): string[] {
    const sources: string[] = [];

    if (context.queryResults && context.queryResults.length > 0) {
      sources.push('Banco de dados de produtos');
      sources.push('Histórico de pedidos');
    }

    if (context.interpretation) {
      sources.push('Análise de intenção com IA');
    }

    return sources;
  }

  private calculateConfidence(context: AgentContext): number {
    let confidence = 0.5;

    if (context.interpretation) {
      confidence += context.interpretation.confidence * 0.3;
    }

    if (context.queryResults && context.queryResults.length > 0) {
      confidence += 0.2;
    }

    return Math.min(confidence, 1.0);
  }

  private buildConversationText(context: AgentContext): string {
    const parts: string[] = [];

    // Role-specific prompt construction
    switch (this.role) {
      case 'adk_interpreter':
        parts.push(`Analyze this user query and return the interpretation as JSON:`);
        parts.push(`\n"${context.userQuery}"\n`);
        parts.push(`Return ONLY valid JSON with: intent, entities, requiresData, suggestedQueries, confidence`);
        break;

      case 'adk_responder':
        parts.push(`User asked: "${context.userQuery}"\n`);
        if (context.interpretation) {
          parts.push(`Intent: ${context.interpretation.intent}\n`);
        }
        if (context.queryResults && context.queryResults.length > 0) {
          parts.push(`Database Results:\n${JSON.stringify(context.queryResults, null, 2)}\n`);
        }
        if (context.mcpResults) {
          parts.push(`External Data:\n${JSON.stringify(context.mcpResults, null, 2)}\n`);
        }
        parts.push(`Generate a clear response in Portuguese based on the data above.`);
        break;

      case 'adk_suggestion':
        parts.push(`User asked: "${context.userQuery}"\n`);
        if (context.rawResponse) {
          parts.push(`Response given: "${context.rawResponse}"\n`);
        }
        parts.push(`Generate 3 relevant follow-up questions in Portuguese, one per line, no formatting.`);
        break;

      case 'adk_enhancer':
        parts.push(`User asked: "${context.userQuery}"\n`);
        if (context.rawResponse) {
          parts.push(`Current Response:\n"${context.rawResponse}"\n`);
        }
        if (context.queryResults && context.queryResults.length > 0) {
          parts.push(`Data was used: Yes (${context.queryResults.length} records)\n`);
        }
        parts.push(`Enhance this response to make it clearer and more professional in Portuguese.`);
        break;

      default:
        // Default format for other agent types
        parts.push(`User Query: ${context.userQuery}`);
        if (context.interpretation) {
          parts.push(`\nInterpretation: ${JSON.stringify(context.interpretation, null, 2)}`);
        }
        if (context.queryResults && context.queryResults.length > 0) {
          parts.push(`\nDatabase Results: ${JSON.stringify(context.queryResults, null, 2)}`);
        }
    }

    return parts.join('\n');
  }

  getADKAgent(): LlmAgent {
    return this.adkAgent;
  }
}
