import { getDatabase } from '@infrastructure/database/connection';
import type { IAgent, AgentContext } from '../types/agent.types';
import { sql } from 'drizzle-orm';

type Candidate = { category: string; human: string; score: number };

export class CategoryLookupAgent implements IAgent {
  role = 'category_lookup' as const;

  private TOP_K = 5;

  private AUTO_THRESHOLD = 0.72;
  private GAP_THRESHOLD = 0.12;

  private MIN_INPUT_LEN = 4; 
  private MIN_ACCEPT = 0.60; 

  async process(context: AgentContext): Promise<AgentContext> {
    const itp = context.interpretation;
    if (!itp) return context;

    const raw = (itp.entities as any)?.category;
    if (typeof raw !== 'string' || !raw.trim()) return context;

    const input = raw.trim();
    const normalized = this.normalizePt(input);

    const notFoundMsg = 'Não foi encontrada nenhuma categoria semelhante à informada.';

    if (normalized.length < this.MIN_INPUT_LEN) {
      context.halt = true;
      context.rawResponse = notFoundMsg;

      context.conversationHistory.push({
        role: 'tool',
        content: notFoundMsg,
        metadata: { agent: this.role, input, normalized, reason: 'too_short' },
      });

      return context;
    }

    const { resolved, suggestions, debug } = await this.resolveWithSimilarity(input);
    const bestScore = debug.top[0]?.score ?? 0;

    if (!resolved && bestScore < this.MIN_ACCEPT) {
      context.halt = true;
      context.rawResponse = notFoundMsg;

      context.conversationHistory.push({
        role: 'tool',
        content: notFoundMsg,
        metadata: { agent: this.role, input, bestScore, suggestions, debug, reason: 'too_distant' },
      });

      return context;
    }

    // 3) resolveu => normaliza a entidade
    if (resolved) {
      (context.interpretation!.entities as any).category = resolved;

      // opcional: log interno
      context.conversationHistory.push({
        role: 'tool',
        content: `Categoria resolvida: "${input}" -> "${resolved}"`,
        metadata: { agent: this.role, input, resolved, suggestions, debug },
      });
    } else {
      // ambíguo mas não distante: segue sem halt
      context.conversationHistory.push({
        role: 'tool',
        content: `Categoria ambígua para "${input}".`,
        metadata: { agent: this.role, input, suggestions, debug },
      });
    }

    return context;
  }

  private async resolveWithSimilarity(input: string): Promise<{
    resolved: string | null;
    suggestions: string[];
    debug: { normalizedInput: string; top: Array<{ category: string; score: number }> };
  }> {
    const db = getDatabase();

    const rows = await db.execute(sql.raw(`
      SELECT product_category_name AS category
      FROM product_category_name_translation
    `));

    const arr = (Array.isArray(rows) ? rows : [rows as any])
      .map((r: any) => r?.category)
      .filter(Boolean)
      .map((c: any) => String(c));

    const normIn = this.normalizePt(input);

    const scored: Candidate[] = arr.map((cat) => {
      const human = this.normalizePt(cat.replace(/_/g, ' '));
      const score = this.similarityScore(normIn, human);
      return { category: cat, human, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const top = scored.slice(0, this.TOP_K);
    const suggestions = top.map((c) => c.category);

    const best = top[0];
    const second = top[1];
    const gap = second ? best.score - second.score : best.score;

    const resolved =
      best && best.score >= this.AUTO_THRESHOLD && gap >= this.GAP_THRESHOLD
        ? best.category
        : null;

    return {
      resolved,
      suggestions,
      debug: {
        normalizedInput: normIn,
        top: top.map((t) => ({ category: t.category, score: Number(t.score.toFixed(3)) })),
      },
    };
  }

  private normalizePt(s: string): string {
    return s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/&/g, ' ')
      .replace(/\be\b/g, ' ')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private similarityScore(a: string, b: string): number {
    if (!a || !b) return 0;

    let bonus = 0;
    if (b.includes(a)) bonus += 0.35;
    if (b.startsWith(a)) bonus += 0.15;

    const aTokens = new Set(a.split(' ').filter(Boolean));
    const bTokens = new Set(b.split(' ').filter(Boolean));

    const inter = [...aTokens].filter((t) => bTokens.has(t)).length;
    const union = new Set([...aTokens, ...bTokens]).size || 1;
    const jaccard = inter / union;

    const lenRatio = Math.min(a.length, b.length) / Math.max(a.length, b.length);

    const score = 0.55 * jaccard + 0.25 * lenRatio + bonus;
    return Math.max(0, Math.min(1, score));
  }
}
