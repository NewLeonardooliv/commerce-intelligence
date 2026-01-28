# Agent Evaluation Framework

Este documento descreve o framework de avaliação (evals) dos agents do Commerce Intelligence.

## 📋 Visão Geral

O framework de evals permite testar e avaliar sistematicamente o desempenho dos agents de IA em diferentes cenários e casos de uso. Ele fornece métricas objetivas para medir:

- **Precisão**: O agent entende corretamente a intenção do usuário?
- **Qualidade**: As respostas são relevantes, corretas e bem formatadas?
- **Robustez**: O agent lida bem com casos extremos e ambíguos?
- **Performance**: Qual é a velocidade de resposta?

## 🏗️ Estrutura

```
src/tests/evals/
├── types.ts                    # Tipos e interfaces do framework
├── metrics.ts                  # Funções de cálculo de métricas
├── runner.ts                   # Executor de evals (base class)
├── cases/                      # Casos de teste organizados
│   ├── interpreter.evals.ts    # Testes do Interpreter Agent
│   ├── data-query.evals.ts     # Testes do Data Query Agent
│   ├── responder.evals.ts      # Testes do Responder Agent
│   └── orchestrator.evals.ts   # Testes do Orchestrator completo
├── evaluators/                 # Avaliadores específicos por agent
│   ├── interpreter.evaluator.ts
│   └── orchestrator.evaluator.ts
└── index.test.ts               # Arquivo principal de testes
```

## 🚀 Como Executar

### Executar todos os testes

```bash
bun test src/tests/evals/
```

### Executar teste específico

```bash
bun test src/tests/evals/index.test.ts
```

### Executar manualmente (modo desenvolvimento)

```bash
bun src/tests/evals/index.test.ts
```

### Executar com filtros de tags

```typescript
const runner = new InterpreterEvalRunner({
  tags: ['basic'],          // Apenas casos com tag 'basic'
  skipTags: ['slow'],       // Pular casos com tag 'slow'
  verbose: true,            // Mostrar detalhes
  stopOnFailure: false,     // Continuar mesmo com falhas
});
```

## 📝 Estrutura de um Caso de Teste

```typescript
{
  id: 'interp-001',
  name: 'Simple product listing query',
  description: 'User asks for available products',
  input: {
    userQuery: 'Quais produtos temos disponíveis?',
  },
  expected: {
    intentContains: ['produto', 'listar'],
    confidence: { min: 0.7 },
    requiresData: true,
  },
  tags: ['interpreter', 'basic', 'products'],
}
```

### Campos Principais

#### Input
- `userQuery`: Pergunta do usuário
- `sessionId`: (Opcional) ID da sessão
- `conversationHistory`: (Opcional) Histórico de mensagens

#### Expected
- **Para Interpreter Agent:**
  - `intent`: Intenção esperada (string ou regex)
  - `intentContains`: Palavras-chave que devem estar na intenção
  - `confidence`: Nível de confiança mínimo/máximo
  - `requiresData`: Se requer consulta ao banco
  - `entities`: Entidades que devem ser extraídas

- **Para Data Query Agent:**
  - `sqlContains`: Palavras-chave que devem estar no SQL
  - `sqlNotContains`: Palavras que NÃO devem estar no SQL
  - `hasResults`: Se deve retornar resultados
  - `minResults`/`maxResults`: Quantidade de resultados

- **Para Responder Agent:**
  - `responseContains`: Palavras que devem estar na resposta
  - `responseNotContains`: Palavras que NÃO devem estar
  - `answersQuestion`: Se responde a pergunta
  - `inPortuguese`: Se resposta está em português
  - `responseLength`: Tamanho mínimo/máximo

- **Para Orchestrator:**
  - `completes`: Se o pipeline completa
  - `noErrors`: Se não há erros
  - `agentsRun`: Quais agents devem executar
  - Todos os critérios acima combinados

## 📊 Métricas e Scoring

### Score de Interpretação
Avalia a qualidade da interpretação da intenção:
- Confiança do AI (40%)
- Clareza da intenção (20%)
- Entidades identificadas (20%)
- Queries sugeridas (20%)

### Score de Qualidade de Resposta
Avalia a qualidade da resposta gerada:
- Resposta não vazia e sem erros (20%)
- Responde à pergunta (30%)
- Está em português (20%)
- Contém palavras-chave esperadas (15%)
- Não contém palavras indesejadas (10%)
- Tamanho adequado (5%)

### Score Final
- `score`: 0.0 a 1.0 (porcentagem de critérios atendidos)
- `passed`: true se score >= 0.7 e sem erros críticos

## 📈 Relatório de Resultados

Exemplo de saída:

```
🧪 Running 14 evaluation cases...

[1/14] Running: Complete simple query pipeline
  ✅ PASSED

[2/14] Running: Complete customer count pipeline
  ✅ PASSED

...

============================================================
📊 EVALUATION SUMMARY
============================================================
Total Cases: 14
Passed: 12 ✅
Failed: 2 ❌
Average Score: 82.5%
Average Duration: 1250ms
============================================================
```

## 🏷️ Tags Disponíveis

### Por Agent
- `interpreter`, `data-query`, `responder`, `orchestrator`

### Por Complexidade
- `basic`: Casos simples e diretos
- `intermediate`: Casos de complexidade média
- `advanced`: Casos complexos e desafiadores

### Por Categoria
- `products`, `customers`, `orders`, `revenue`, `payments`, `reviews`
- `aggregation`, `joins`, `ranking`, `temporal`, `geography`

### Casos Especiais
- `edge-case`: Casos extremos
- `error-handling`: Testes de tratamento de erro
- `security`: Testes de segurança (SQL injection, etc)
- `multilingual`: Testes com múltiplos idiomas
- `context`: Testes com histórico de conversa

## 🔧 Criando Novos Casos de Teste

1. Adicione o caso no arquivo apropriado em `cases/`
2. Use um ID único e descritivo
3. Adicione tags relevantes
4. Defina critérios de sucesso claros
5. Documente casos especiais

```typescript
export const myNewEvalCases: EvalCase[] = [
  {
    id: 'custom-001',
    name: 'My custom test',
    description: 'What this test evaluates',
    input: {
      userQuery: 'Your test query',
    },
    expected: {
      // Your expectations
    },
    tags: ['custom', 'basic'],
    timeout: 30000, // Optional custom timeout
  },
];
```

## 🎯 Melhores Práticas

1. **Cobertura**: Teste casos comuns, edge cases e erros
2. **Independência**: Cada teste deve ser independente
3. **Clareza**: Nome e descrição devem ser auto-explicativos
4. **Realismo**: Use queries reais que usuários fariam
5. **Manutenção**: Revise e atualize regularmente os evals

## 🐛 Debug e Troubleshooting

### Ver detalhes dos testes

```typescript
const runner = new OrchestratorEvalRunner({ verbose: true });
```

### Executar apenas um caso

```typescript
const singleCase = orchestratorEvalCases.find(c => c.id === 'orch-001');
const result = await runner.run([singleCase]);
```

### Analisar falhas

O objeto `EvalResult` contém:
- `errors`: Erros críticos que causaram falha
- `warnings`: Avisos que não impedem sucesso
- `output`: Dados de saída do agent para inspeção
- `metrics`: Métricas calculadas

## 📚 Exemplos de Uso

### Benchmark de Performance

```typescript
const runner = new OrchestratorEvalRunner();
const results = await runner.run(orchestratorEvalCases);

console.log(`Avg Duration: ${results.averageDuration}ms`);
console.log(`P95 Duration: ${calculateP95(results.results.map(r => r.duration))}ms`);
```

### CI/CD Integration

```typescript
// No seu pipeline de CI
const runner = new OrchestratorEvalRunner({
  stopOnFailure: true,  // Falha rápida
  tags: ['basic'],       // Apenas testes básicos
});

const summary = await runner.run(orchestratorEvalCases);

if (summary.averageScore < 0.8) {
  process.exit(1);  // Falha o build se score < 80%
}
```

### Regression Testing

```typescript
// Salve resultados baseline
const baseline = await runner.run(allCases);
saveResults('baseline.json', baseline);

// Compare com nova versão
const current = await runner.run(allCases);
const regression = compareResults(baseline, current);

if (regression.scoreDropped > 0.1) {
  console.warn('⚠️  Performance regression detected!');
}
```

## 🔄 Continuous Improvement

Os evals devem evoluir com o produto:

1. Adicione casos para bugs reportados
2. Adicione casos para novas features
3. Remova/atualize casos obsoletos
4. Aumente a cobertura gradualmente
5. Monitore métricas ao longo do tempo

## 📖 Referências

- [OpenAI Evals](https://github.com/openai/evals)
- [LangChain Evaluation](https://python.langchain.com/docs/guides/evaluation)
- [Agent Testing Best Practices](https://www.anthropic.com/index/testing-ai-agents)
