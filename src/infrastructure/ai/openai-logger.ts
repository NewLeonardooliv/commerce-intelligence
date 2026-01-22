import type { OpenAiModel } from './openai-models';
import { estimateCost, formatCost, getModelInfo } from './openai-models';

interface UsageLog {
  timestamp: Date;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
  endpoint: string;
}

class OpenAiLogger {
  private logs: UsageLog[] = [];
  private enabled: boolean = true;

  constructor() {
    this.enabled = process.env.AI_LOGGING !== 'false';
  }

  /**
   * Registra uma chamada à API
   */
  logUsage(
    model: string,
    promptTokens: number,
    completionTokens: number,
    endpoint: string = 'completion'
  ): void {
    if (!this.enabled) return;

    const totalTokens = promptTokens + completionTokens;
    const estimatedCost = estimateCost(
      model as OpenAiModel,
      promptTokens,
      completionTokens
    );

    const log: UsageLog = {
      timestamp: new Date(),
      model,
      promptTokens,
      completionTokens,
      totalTokens,
      estimatedCost,
      endpoint,
    };

    this.logs.push(log);

    // Log no console em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`[OpenAI] ${endpoint} - Model: ${model}`);
      console.log(
        `  Tokens: ${totalTokens} (prompt: ${promptTokens}, completion: ${completionTokens})`
      );
      console.log(`  Estimated cost: ${formatCost(estimatedCost)}`);
    }
  }

  /**
   * Obtém o total de tokens usados
   */
  getTotalTokens(): number {
    return this.logs.reduce((sum, log) => sum + log.totalTokens, 0);
  }

  /**
   * Obtém o custo total estimado
   */
  getTotalCost(): number {
    return this.logs.reduce((sum, log) => sum + log.estimatedCost, 0);
  }

  /**
   * Obtém estatísticas de uso
   */
  getStats() {
    const totalCalls = this.logs.length;
    const totalTokens = this.getTotalTokens();
    const totalCost = this.getTotalCost();

    // Agrupa por modelo
    const byModel = this.logs.reduce(
      (acc, log) => {
        if (!acc[log.model]) {
          acc[log.model] = {
            calls: 0,
            tokens: 0,
            cost: 0,
          };
        }
        acc[log.model].calls++;
        acc[log.model].tokens += log.totalTokens;
        acc[log.model].cost += log.estimatedCost;
        return acc;
      },
      {} as Record<string, { calls: number; tokens: number; cost: number }>
    );

    // Agrupa por endpoint
    const byEndpoint = this.logs.reduce(
      (acc, log) => {
        if (!acc[log.endpoint]) {
          acc[log.endpoint] = {
            calls: 0,
            tokens: 0,
            cost: 0,
          };
        }
        acc[log.endpoint].calls++;
        acc[log.endpoint].tokens += log.totalTokens;
        acc[log.endpoint].cost += log.estimatedCost;
        return acc;
      },
      {} as Record<string, { calls: number; tokens: number; cost: number }>
    );

    return {
      totalCalls,
      totalTokens,
      totalCost: formatCost(totalCost),
      byModel,
      byEndpoint,
      averageTokensPerCall: totalCalls > 0 ? Math.round(totalTokens / totalCalls) : 0,
      averageCostPerCall:
        totalCalls > 0 ? formatCost(totalCost / totalCalls) : '$0.000000',
    };
  }

  /**
   * Obtém os logs mais recentes
   */
  getRecentLogs(limit: number = 10): UsageLog[] {
    return this.logs.slice(-limit);
  }

  /**
   * Limpa os logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Imprime um relatório de uso
   */
  printReport(): void {
    const stats = this.getStats();

    console.log('\n=== OpenAI Usage Report ===');
    console.log(`Total Calls: ${stats.totalCalls}`);
    console.log(`Total Tokens: ${stats.totalTokens.toLocaleString()}`);
    console.log(`Total Cost: ${stats.totalCost}`);
    console.log(`Average Tokens/Call: ${stats.averageTokensPerCall}`);
    console.log(`Average Cost/Call: ${stats.averageCostPerCall}`);

    console.log('\nBy Model:');
    Object.entries(stats.byModel).forEach(([model, data]) => {
      console.log(`  ${model}:`);
      console.log(`    Calls: ${data.calls}`);
      console.log(`    Tokens: ${data.tokens.toLocaleString()}`);
      console.log(`    Cost: ${formatCost(data.cost)}`);
    });

    console.log('\nBy Endpoint:');
    Object.entries(stats.byEndpoint).forEach(([endpoint, data]) => {
      console.log(`  ${endpoint}:`);
      console.log(`    Calls: ${data.calls}`);
      console.log(`    Tokens: ${data.tokens.toLocaleString()}`);
      console.log(`    Cost: ${formatCost(data.cost)}`);
    });

    console.log('\n========================\n');
  }

  /**
   * Habilita ou desabilita o logging
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

// Singleton instance
export const openAiLogger = new OpenAiLogger();

// Export para uso em testes
export { OpenAiLogger };
