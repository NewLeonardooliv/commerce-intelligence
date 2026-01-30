import type { IAgent, AgentContext } from '../types/agent.types';

export class PredictAgent implements IAgent {
  role = 'predict' as const;

  private baseUrl: string;
  private timeoutMs: number;

  constructor() {
    this.baseUrl =
      process.env.PREDICT_API_URL?.replace(/\/$/, '') ||
      'http://localhost:8000';

    this.timeoutMs = 15_000;
    console.log(`[PredictAgent] Using API at ${this.baseUrl}`);
  }

  async process(context: AgentContext): Promise<AgentContext> {
    if (!context.interpretation) return context;
    if (!this.shouldPredict(context)) return context;

    const months_ahead = this.getMonthsAhead(context);
    const category = this.getCategory(context);

    try {
      const raw = await this.callApi({ months_ahead, category });

      // ✅ total apenas quando for ALL
      const totalAllM1 = !category ? this.sumAllCategoriesM1(raw) : null;

      const summaryText = this.formatPredictionText(raw, category, totalAllM1);

      context.predictResults = {
        months_ahead,
        category,
        raw,
        summaryText,
      };

      context.conversationHistory.push({
        role: 'tool',
        content: `Forecast executado (months_ahead=${months_ahead}${category ? `, category=${category}` : ''})`,
        metadata: { agent: 'predict', months_ahead, category },
      });

      return context;
    } catch (err) {
      context.conversationHistory.push({
        role: 'system',
        content: `Erro ao consultar API de previsão`,
        metadata: { agent: 'predict', error: String(err) },
      });
      return context;
    }
  }

  private shouldPredict(context: AgentContext): boolean {
    const itp = context.interpretation;
    if (!itp) return false;
    
    if (itp.requiresExternalTools === true) return true;

    const text = `${itp.intent} ${context.userQuery}`.toLowerCase();
    return (
      text.includes('previs') ||
      text.includes('prever') ||
      text.includes('proje') ||
      text.includes('forecast')
    );
  }

  private getMonthsAhead(context: AgentContext): number {
    const ent = context.interpretation?.entities ?? {};
    const v = (ent as any)['months_ahead'];

    const n =
      typeof v === 'number'
        ? v
        : typeof v === 'string'
          ? parseInt(v, 10)
          : NaN;

    if (!Number.isFinite(n) || n <= 0) return 1;
    return Math.min(n, 24);
  }

  private getCategory(context: AgentContext): string | undefined {
    const ent = context.interpretation?.entities ?? {};
    const v = (ent as any)['category'];
    if (typeof v === 'string' && v.trim()) return v.trim();
    return undefined;
  }

  private async callApi(args: { months_ahead: number; category?: string }): Promise<any> {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const url = args.category
        ? `${this.baseUrl}/predict/next-months`
        : `${this.baseUrl}/predict/next-months/all`;

      const body = args.category
        ? { category: args.category, months_ahead: args.months_ahead }
        : { months_ahead: args.months_ahead };

      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error(`Predict API ${resp.status}: ${text}`);
      }

      return await resp.json();
    } finally {
      clearTimeout(t);
    }
  }

  private sumAllCategoriesM1(raw: any): { total: number; formatted: string } | null {
    if (!Array.isArray(raw?.items)) return null;

    let total = 0;

    for (const it of raw.items) {
      if (typeof it?.prediction === 'number' && Number.isFinite(it.prediction)) {
        total += it.prediction;
        continue;
      }
      if (Array.isArray(it?.predictions) && typeof it.predictions[0] === 'number' && Number.isFinite(it.predictions[0])) {
        total += it.predictions[0];
        continue;
      }
    }

    if (!Number.isFinite(total)) return null;

    return { total, formatted: this.formatBRL(total) };
  }

  private formatPredictionText(
    raw: any,
    category: string | undefined,
    totalAllM1: { formatted: string } | null
  ): string {
    // categoria específica
    if (category && raw?.category && Array.isArray(raw?.formatted)) {
      const lines = raw.formatted.map((v: string, i: number) => `M+${i + 1}: ${v}`);
      return `Previsão para a categoria "${raw.category}" (${raw.months_ahead} mês(es)):\n${lines.join('\n')}`;
    }

    // ALL: só total
    if (!category && Array.isArray(raw?.items)) {
      if (totalAllM1?.formatted) {
        return `Total previsto de vendas (todas as categorias) para o próximo mês (M+1): ${totalAllM1.formatted}`;
      }
      return `Não foi possível calcular o total geral da previsão (todas as categorias).`;
    }

    return `Resultado da previsão:\n${JSON.stringify(raw, null, 2)}`;
  }

  private formatBRL(value: number): string {
    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);
    } catch {
      return `R$ ${value.toFixed(2)}`.replace('.', ',');
    }
  }
}
