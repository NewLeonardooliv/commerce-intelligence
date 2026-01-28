# Arquitetura do Framework de Evals

Este documento descreve a arquitetura e o fluxo de execução do framework de avaliação dos agents.

## 🏗️ Visão Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                     AGENT EVALUATION FRAMEWORK                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Test Cases  │────▶│   Evaluator  │────▶│   Results    │
│  (*.evals.ts)│     │  (evaluate)  │     │  (metrics)   │
└──────────────┘     └──────────────┘     └──────────────┘
                             │
                             ▼
                     ┌──────────────┐
                     │   Reports    │
                     │ HTML/JSON/MD │
                     └──────────────┘
```

## 📦 Componentes Principais

### 1. Test Cases (Casos de Teste)

```
cases/
├── interpreter.evals.ts      # Casos para Interpreter Agent
├── data-query.evals.ts       # Casos para Data Query Agent
├── responder.evals.ts        # Casos para Responder Agent
└── orchestrator.evals.ts     # Casos End-to-End
```

**Responsabilidades:**
- Definir entradas (user queries)
- Definir expectativas (expected outcomes)
- Organizar por tags e complexidade
- Documentar casos específicos

**Estrutura:**
```typescript
{
  id: 'unique-id',
  name: 'Test name',
  input: { userQuery, sessionId?, conversationHistory? },
  expected: { intent?, sql?, response?, ... },
  tags: ['tag1', 'tag2']
}
```

### 2. Evaluators (Avaliadores)

```
evaluators/
├── interpreter.evaluator.ts   # Avalia interpretações
└── orchestrator.evaluator.ts  # Avalia pipeline completo
```

**Responsabilidades:**
- Executar agents com casos de teste
- Coletar outputs
- Calcular métricas
- Comparar com expectativas
- Gerar resultado (pass/fail + score)

**Interface:**
```typescript
interface IEvaluator {
  name: string;
  description: string;
  evaluate(testCase: EvalCase): Promise<EvalResult>;
  validateCase(testCase: EvalCase): boolean;
}
```

### 3. Metrics (Métricas)

```
metrics.ts
```

**Responsabilidades:**
- Calcular similaridade
- Validar respostas
- Detectar idioma
- Verificar segurança SQL
- Calcular scores agregados

**Funções principais:**
```typescript
calculateSimilarity(str1, str2): number
answersQuestion(query, response): boolean
isPortuguese(text): boolean
isSafeSql(sql): boolean
calculateInterpretationScore(context): number
calculateResponseQuality(query, response): number
```

### 4. Runner (Executor)

```
runner.ts
```

**Responsabilidades:**
- Orquestrar execução dos casos
- Controlar paralelismo
- Gerenciar timeouts
- Filtrar por tags
- Gerar sumário final

**Modos de execução:**
- Sequential: Um caso por vez
- Parallel: Múltiplos casos simultaneamente

### 5. Report Generator (Gerador de Relatórios)

```
report-generator.ts
```

**Responsabilidades:**
- Gerar relatório HTML (interativo)
- Gerar relatório JSON (programático)
- Gerar relatório Markdown (documentação)
- Comparar com baselines
- Detectar regressões

### 6. CLI (Interface de Linha de Comando)

```
cli.ts
```

**Responsabilidades:**
- Interface amigável para executar evals
- Filtros por tags e agents
- Opções de configuração
- Geração de relatórios sob demanda

## 🔄 Fluxo de Execução

### Fluxo Completo

```
┌─────────────┐
│   Start     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│ Load Test Cases         │
│ - Read from cases/*.ts  │
│ - Filter by tags        │
│ - Validate cases        │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ For Each Test Case      │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Execute Agent(s)        │
│ - Run agent.process()   │
│ - Capture output        │
│ - Measure duration      │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Calculate Metrics       │
│ - Intent accuracy       │
│ - SQL quality           │
│ - Response quality      │
│ - Overall score         │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Compare with Expected   │
│ - Check all criteria    │
│ - Generate errors list  │
│ - Generate warnings     │
│ - Determine pass/fail   │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Create Result           │
│ - Score (0-1)           │
│ - Passed (bool)         │
│ - Duration (ms)         │
│ - Errors/Warnings       │
│ - Output data           │
│ - Metrics               │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Aggregate Results       │
│ - Total cases           │
│ - Passed/Failed count   │
│ - Average score         │
│ - Average duration      │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Generate Reports        │
│ - HTML (interactive)    │
│ - JSON (data)           │
│ - Markdown (docs)       │
└──────┬──────────────────┘
       │
       ▼
┌─────────────┐
│     End     │
└─────────────┘
```

### Fluxo de Avaliação (Detalhado)

```
Test Case
    │
    ▼
┌─────────────────────────────────────────────────┐
│           INTERPRETER EVALUATOR                 │
├─────────────────────────────────────────────────┤
│ 1. Run InterpreterAgent.process(context)        │
│ 2. Get interpretation result                    │
│ 3. Check:                                       │
│    ✓ Intent matches expected                    │
│    ✓ Confidence in range                        │
│    ✓ RequiresData correct                       │
│    ✓ Entities extracted                         │
│    ✓ Language is Portuguese                     │
│ 4. Calculate score (0-1)                        │
│ 5. Return EvalResult                            │
└─────────────────────────────────────────────────┘
                        │
                        ▼
                   [Result]


Test Case
    │
    ▼
┌─────────────────────────────────────────────────┐
│           ORCHESTRATOR EVALUATOR                │
├─────────────────────────────────────────────────┤
│ 1. Run Orchestrator.process(query)              │
│ 2. Get full context with all agent outputs      │
│ 3. Check:                                       │
│    ✓ Pipeline completed                         │
│    ✓ No errors in history                       │
│    ✓ Expected agents ran                        │
│    ✓ SQL is safe and correct                    │
│    ✓ Results returned                           │
│    ✓ Response quality                           │
│    ✓ Suggestions generated                      │
│ 4. Calculate combined score                     │
│ 5. Return EvalResult                            │
└─────────────────────────────────────────────────┘
                        │
                        ▼
                   [Result]
```

## 🎯 Scoring System

### Score Calculation

```
Final Score = Σ(criterion_score) / total_criteria

Where each criterion is scored 0-1:
- 1.0 = Perfect match
- 0.7-0.99 = Good match
- 0.5-0.69 = Partial match
- 0-0.49 = Poor match
```

### Pass/Fail Logic

```
PASSED if:
  - Final Score >= 0.7 AND
  - No critical errors

FAILED if:
  - Final Score < 0.7 OR
  - Has critical errors
```

### Example Scoring

```typescript
// Interpreter Agent
maxScore = 0
score = 0

// Check intent (weight: 1)
if (intentMatches) score += 1
maxScore += 1

// Check confidence (weight: 1)
if (confidenceInRange) score += 1
maxScore += 1

// Check requiresData (weight: 1)
if (requiresDataCorrect) score += 1
maxScore += 1

// Check entities (weight: 1)
score += (matchedEntities / totalEntities)
maxScore += 1

// Final score
finalScore = score / maxScore
// Example: 3.5 / 4 = 0.875 = 87.5%
```

## 📊 Data Flow

```
┌──────────────┐
│ User Query   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Test Case    │
│ {            │
│   input,     │
│   expected   │
│ }            │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Agent(s)     │
│ - Process    │
│ - Transform  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Agent Output │
│ {            │
│   context,   │
│   response,  │
│   data       │
│ }            │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Evaluator    │
│ - Measure    │
│ - Compare    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Eval Result  │
│ {            │
│   score,     │
│   passed,    │
│   errors     │
│ }            │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Report       │
│ - Aggregate  │
│ - Format     │
└──────────────┘
```

## 🔌 Extension Points

### 1. Adicionar Novo Agent

```typescript
// 1. Create evaluator
class MyAgentEvaluator implements IEvaluator {
  async evaluate(testCase: EvalCase): Promise<EvalResult> {
    // Your evaluation logic
  }
}

// 2. Create test cases
export const myAgentEvalCases: EvalCase[] = [
  // Your cases
];

// 3. Add to index.test.ts
import { myAgentEvalCases } from './cases/my-agent.evals';
```

### 2. Adicionar Nova Métrica

```typescript
// In metrics.ts
export function myCustomMetric(data: any): number {
  // Calculate your metric (0-1)
  return score;
}

// Use in evaluator
const customScore = myCustomMetric(context.data);
```

### 3. Adicionar Novo Formato de Relatório

```typescript
// In report-generator.ts
export async function generateXmlReport(
  summary: EvalSummary,
  outputPath?: string
): Promise<string> {
  // Generate XML format
}
```

## 🎨 Design Patterns

### 1. Strategy Pattern
- Different evaluators for different agents
- Pluggable metric calculators
- Multiple report formats

### 2. Template Method Pattern
- `EvalRunner` base class
- Subclasses implement `runCase()`
- Common flow in base class

### 3. Builder Pattern
- Test cases built incrementally
- Flexible configuration
- Optional parameters

### 4. Observer Pattern
- Progress callbacks
- Event logging
- Real-time updates

## 🔒 Best Practices

### Test Cases
- ✅ Unique IDs
- ✅ Descriptive names
- ✅ Clear expectations
- ✅ Appropriate tags
- ✅ Independent tests

### Evaluators
- ✅ Single responsibility
- ✅ Composable metrics
- ✅ Error handling
- ✅ Performance tracking
- ✅ Detailed feedback

### Reports
- ✅ Multiple formats
- ✅ Clear visualization
- ✅ Actionable insights
- ✅ Historical comparison
- ✅ Easy sharing

### CI/CD
- ✅ Fast feedback (< 5min)
- ✅ Fail fast on errors
- ✅ Archive results
- ✅ Trend analysis
- ✅ Automated alerts

## 📚 References

- [OpenAI Evals](https://github.com/openai/evals)
- [LangChain Evaluation](https://python.langchain.com/docs/guides/evaluation)
- [Martin Fowler - Testing](https://martinfowler.com/testing/)
- [Google Testing Blog](https://testing.googleblog.com/)

---

**Última atualização:** 2026-01-28  
**Versão:** 1.0.0
