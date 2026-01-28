# Agent Evaluation Framework

Framework completo para avaliar a performance dos agents de IA do Commerce Intelligence.

## 📁 Estrutura

```
src/tests/evals/
├── README.md                      # Este arquivo
├── QUICKSTART.md                  # Guia rápido de início
├── EXAMPLE.md                     # Exemplos detalhados de como criar testes
├── types.ts                       # Tipos e interfaces TypeScript
├── metrics.ts                     # Funções de cálculo de métricas
├── runner.ts                      # Classe base para executores de eval
├── report-generator.ts            # Gerador de relatórios (HTML, JSON, MD)
├── cli.ts                         # CLI para execução de evals
├── index.test.ts                  # Arquivo principal de testes
├── cases/                         # Casos de teste organizados
│   ├── interpreter.evals.ts       # 12 casos para Interpreter Agent
│   ├── data-query.evals.ts        # 12 casos para Data Query Agent
│   ├── responder.evals.ts         # 12 casos para Responder Agent
│   └── orchestrator.evals.ts      # 14 casos para Orchestrator (E2E)
└── evaluators/                    # Avaliadores específicos
    ├── interpreter.evaluator.ts   # Avaliador do Interpreter
    └── orchestrator.evaluator.ts  # Avaliador do Orchestrator (E2E)
```

## 🚀 Início Rápido

```bash
# Executar todos os evals
bun run test:evals

# Gerar relatórios
bun run evals:report

# Ver ajuda
bun src/tests/evals/cli.ts --help
```

## 📊 Estatísticas

- **Total de casos**: 50+ casos de teste
- **Agentes cobertos**: 5 agents (Interpreter, DataQuery, Responder, Suggestion, Orchestrator)
- **Categorias**: 15+ categorias (products, customers, orders, etc)
- **Complexidade**: básico, intermediário, avançado
- **Tipos**: funcional, integração, E2E, segurança, edge cases

## 📖 Documentação

- **[QUICKSTART.md](./QUICKSTART.md)**: Comece aqui! Guia rápido de 5 minutos
- **[EXAMPLE.md](./EXAMPLE.md)**: Exemplos completos de como criar novos casos
- **[README-EVALS.md](../../../README-EVALS.md)**: Documentação completa do framework

## 🎯 Casos de Teste

### Interpreter Agent (12 casos)

Testa a capacidade de interpretar queries e extrair intenções:

- ✅ Queries simples (produtos, clientes, faturamento)
- ✅ Queries complexas (agregações, múltiplas entidades)
- ✅ Queries ambíguas
- ✅ Queries multilíngues
- ✅ Extração de entidades
- ✅ Detecção de ferramentas externas

### Data Query Agent (12 casos)

Testa a geração de SQL e consultas ao banco:

- ✅ SQL básico (SELECT, WHERE, GROUP BY)
- ✅ Joins e relacionamentos
- ✅ Agregações (COUNT, SUM, AVG)
- ✅ Rankings e ordenações
- ✅ Filtros temporais
- ✅ Segurança (prevenção de SQL injection)
- ✅ Traduções de categorias

### Responder Agent (12 casos)

Testa a qualidade das respostas geradas:

- ✅ Respostas contextuais
- ✅ Respostas em português
- ✅ Uso de dados numéricos
- ✅ Sumarização de resultados
- ✅ Tom conversacional
- ✅ Tratamento de dados vazios
- ✅ Precisão das informações

### Orchestrator (14 casos E2E)

Testa o pipeline completo de agents:

- ✅ Fluxo completo (interpretação → query → resposta)
- ✅ Coordenação entre agents
- ✅ Tratamento de erros
- ✅ Contexto conversacional
- ✅ Queries complexas multi-tabela
- ✅ Análises temporais e geográficas
- ✅ Geração de sugestões

## 🏷️ Tags Disponíveis

### Por Agent
- `interpreter`, `data-query`, `responder`, `suggestion`, `orchestrator`

### Por Complexidade
- `basic`: Casos simples e diretos
- `intermediate`: Complexidade média
- `advanced`: Casos complexos e desafiadores

### Por Categoria
- `products`, `customers`, `orders`, `sellers`, `payments`, `reviews`
- `aggregation`, `joins`, `ranking`, `filtering`, `temporal`, `geography`

### Casos Especiais
- `edge-case`: Casos extremos
- `error-handling`: Tratamento de erros
- `security`: Testes de segurança
- `multilingual`: Múltiplos idiomas
- `context`: Com histórico de conversa

## 📈 Métricas Avaliadas

### Score de Interpretação (0-1)
- Confiança do AI (40%)
- Clareza da intenção (20%)
- Entidades identificadas (20%)
- Queries sugeridas (20%)

### Score de Qualidade de SQL (0-1)
- SQL seguro (30%)
- Contém keywords esperadas (50%)
- Não contém keywords proibidas (20%)

### Score de Qualidade de Resposta (0-1)
- Resposta não vazia (20%)
- Responde à pergunta (30%)
- Está em português (20%)
- Contém informações esperadas (15%)
- Tamanho adequado (15%)

### Score Geral (0-1)
- Média ponderada de todos os critérios
- **Passed**: score >= 0.7 e sem erros críticos

## 🛠️ Scripts Disponíveis

```bash
# Via npm/bun scripts
bun run test:evals                    # Todos os evals via Bun Test
bun run test:evals:interpreter        # Apenas interpreter
bun run test:evals:orchestrator       # Apenas orchestrator
bun run test:evals:comprehensive      # Suite completa
bun run evals                         # Manual runner
bun run evals:cli                     # CLI tool
bun run evals:report                  # Gera todos os relatórios

# Comandos diretos
bun test src/tests/evals/             # Testes via Bun Test
bun src/tests/evals/index.test.ts     # Manual runner
bun src/tests/evals/cli.ts [options]  # CLI com opções
```

## 🎨 Tipos de Relatórios

### HTML (Interativo)
- Formato visual e interativo
- Resultados expandíveis por clique
- Gráficos e estatísticas
- Ideal para: apresentações, revisões de equipe

### JSON (Programático)
- Formato estruturado e completo
- Fácil de processar programaticamente
- Ideal para: CI/CD, comparações, analytics

### Markdown (Documentação)
- Formato texto legível
- Pode ser commitado no git
- Ideal para: documentação, PRs, READMEs

## 🔄 Fluxo de Avaliação

```
1. Carregar casos de teste
   ↓
2. Para cada caso:
   - Executar agent(s)
   - Capturar output
   - Calcular métricas
   - Comparar com expectativas
   - Gerar resultado (pass/fail + score)
   ↓
3. Agregar resultados
   ↓
4. Gerar relatório final
   ↓
5. Salvar relatórios (HTML, JSON, MD)
```

## 💡 Casos de Uso

### 1. Desenvolvimento Local
```bash
# Teste rápido após mudanças
bun src/tests/evals/cli.ts --tags=basic --verbose
```

### 2. CI/CD Pipeline
```bash
# Validação automática
bun run test:evals
```

### 3. Benchmarking
```bash
# Medir performance ao longo do tempo
bun run evals:report
# Comparar com baselines anteriores
```

### 4. Debugging
```bash
# Isolar e investigar falhas
bun src/tests/evals/cli.ts --tags=edge-case --verbose --stopOnFailure
```

### 5. Regression Testing
```bash
# Garantir que mudanças não quebram funcionalidades
bun test src/tests/evals/
```

## 🎓 Como Contribuir

### Adicionar Novos Casos

1. Escolha o arquivo apropriado em `cases/`
2. Siga os exemplos existentes
3. Use tags apropriadas
4. Teste localmente
5. Abra um PR

Veja [EXAMPLE.md](./EXAMPLE.md) para guia completo.

### Criar Novo Evaluator

1. Implemente a interface `IEvaluator`
2. Adicione em `evaluators/`
3. Integre no `index.test.ts`
4. Documente no README

### Melhorar Métricas

1. Edite `metrics.ts`
2. Adicione testes para suas funções
3. Atualize documentação

## 📊 Resultados Esperados

### Interpreter Agent
- Pass rate: **80%+**
- Average score: **85%+**
- Avg duration: **500-1000ms**

### Data Query Agent
- Pass rate: **75%+**
- Average score: **80%+**
- Avg duration: **1000-2000ms**

### Responder Agent
- Pass rate: **85%+**
- Average score: **85%+**
- Avg duration: **800-1500ms**

### Orchestrator (E2E)
- Pass rate: **70%+**
- Average score: **75%+**
- Avg duration: **2000-4000ms**

## 🐛 Troubleshooting

### Testes falhando
1. Execute com `--verbose` para ver detalhes
2. Verifique se expectativas são realistas
3. Teste manualmente o mesmo query
4. Ajuste thresholds se necessário

### Testes lentos
1. Use `--tags=basic` para testes rápidos
2. Aumente timeout se necessário
3. Use `--parallel` (com cuidado)
4. Considere mocks para testes unitários

### Resultados inconsistentes
1. Verifique dependências entre testes
2. Use dados determinísticos
3. Considere variações da IA
4. Ajuste confidence thresholds

## 🔗 Links Úteis

- [OpenAI Evals](https://github.com/openai/evals)
- [LangChain Evaluation](https://python.langchain.com/docs/guides/evaluation)
- [Anthropic Testing Guide](https://www.anthropic.com/index/testing-ai-agents)

## 📝 Changelog

### v1.0.0 (2026-01-28)
- ✨ Framework inicial completo
- 📊 50+ casos de teste
- 📈 Métricas de avaliação
- 📄 Geração de relatórios (HTML, JSON, MD)
- 🔧 CLI tool
- 📚 Documentação completa

## 📄 Licença

MIT - Commerce Intelligence

## 🤝 Suporte

Para dúvidas ou sugestões:
1. Leia a documentação completa
2. Veja os exemplos em `EXAMPLE.md`
3. Execute com `--verbose` para debug
4. Abra uma issue no repositório

---

**Pronto para começar?** Execute:

```bash
bun run test:evals
```

🚀 Happy Testing!
