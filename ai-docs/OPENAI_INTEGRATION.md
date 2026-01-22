# Integração OpenAI - Implementação Completa

## Resumo

Este documento descreve a implementação completa da integração com os modelos da OpenAI no projeto Commerce Intelligence.

## Arquivos Criados

### 1. Provider OpenAI
**Arquivo**: `src/infrastructure/ai/openai-provider.ts`

Implementação do provider da OpenAI que implementa a interface `IAiProvider`. Suporta:
- Completions de chat
- Análise de dados automatizada
- Geração de insights
- Tratamento robusto de erros
- Parsing automático de JSON

### 2. Modelos e Constantes
**Arquivo**: `src/infrastructure/ai/openai-models.ts`

Define:
- Constantes para todos os modelos OpenAI disponíveis
- Especificações de cada modelo (custos, limites, casos de uso)
- Funções utilitárias para cálculo de custos
- Recomendações por tipo de uso

### 3. Sistema de Logging
**Arquivo**: `src/infrastructure/ai/openai-logger.ts`

Logger especializado para rastrear:
- Uso de tokens
- Custos estimados
- Estatísticas agregadas por modelo e endpoint
- Logs recentes de chamadas
- Relatórios detalhados de uso

### 4. Controlador de AI
**Arquivo**: `src/modules/ai/ai.controller.ts`

API REST com os seguintes endpoints:

- `POST /api/v1/ai/analyze` - Analisa dados com IA
- `POST /api/v1/ai/insights` - Gera insights de dados
- `POST /api/v1/ai/task` - Processa tarefas de IA
- `GET /api/v1/ai/usage/stats` - Estatísticas de uso
- `GET /api/v1/ai/usage/recent` - Logs recentes
- `DELETE /api/v1/ai/usage/logs` - Limpa logs

### 5. Testes
**Arquivos**:
- `tests/openai-provider.test.ts` - Testes do provider
- `tests/ai-controller.test.ts` - Testes da API

### 6. Exemplos
**Arquivo**: `examples/openai-usage.ts`

Exemplos práticos de uso incluindo:
- Análise de dados de vendas
- Insights de marketing
- Análise de comportamento de clientes
- Completions personalizados
- Análise de tendências

### 7. Documentação
**Arquivos**:
- `docs/OPENAI_SETUP.md` - Guia de configuração
- `docs/OPENAI_INTEGRATION.md` - Este arquivo
- `examples/README.md` - Guia de exemplos

## Arquivos Modificados

### 1. AiService
**Arquivo**: `src/infrastructure/ai/ai-service.ts`

Atualizado para:
- Inicializar o provider correto baseado em `AI_PROVIDER`
- Suportar múltiplos providers (OpenAI e Mock)
- Switching automático entre providers

### 2. App Principal
**Arquivo**: `src/app.ts`

- Adicionado o controlador de AI nas rotas

### 3. TypeScript Config
**Arquivo**: `tsconfig.json`

- Incluída a pasta `tests/` no include

### 4. README Principal
**Arquivo**: `README.md`

- Adicionada seção de Features
- Documentação sobre AI Providers
- Links para documentação

### 5. Package.json
**Arquivo**: `package.json`

- Adicionada dependência `openai@^6.16.0`

## Configuração Necessária

### Variáveis de Ambiente

```bash
# .env
AI_PROVIDER=openai
AI_API_KEY=sk-proj-your-api-key-here
AI_MODEL=gpt-4-turbo-preview
AI_LOGGING=true  # Opcional, padrão: true
```

### Obter API Key

1. Acesse https://platform.openai.com/api-keys
2. Crie uma nova chave
3. Configure no `.env`

## Como Usar

### 1. Via API REST

```bash
# Analisar dados
curl -X POST http://localhost:3000/api/v1/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "revenue": 100000,
      "customers": 500
    }
  }'

# Gerar insights
curl -X POST http://localhost:3000/api/v1/ai/insights \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "revenue": 100000,
      "orders": 1200
    }
  }'

# Ver estatísticas de uso
curl http://localhost:3000/api/v1/ai/usage/stats
```

### 2. Via Código TypeScript

```typescript
import { aiService } from '@infrastructure/ai/ai-service';

// Analisar dados
const analysis = await aiService.analyzeData({
  revenue: 100000,
  customers: 500,
});

// Gerar insights
const insights = await aiService.generateInsights({
  revenue: 100000,
  orders: 1200,
});
```

### 3. Via OpenAI Provider Direto

```typescript
import { OpenAiProvider } from '@infrastructure/ai/openai-provider';

const provider = new OpenAiProvider();

const response = await provider.complete({
  messages: [
    { role: 'system', content: 'Você é um analista de dados.' },
    { role: 'user', content: 'Analise estes dados...' },
  ],
  temperature: 0.3,
  maxTokens: 1000,
});
```

## Modelos Disponíveis

| Modelo | Contexto | Custo (1K tokens) | Uso Recomendado |
|--------|----------|-------------------|-----------------|
| gpt-4-turbo-preview | 128K | $0.01 / $0.03 | Análises complexas |
| gpt-4o | 128K | $0.005 / $0.015 | Balanceado |
| gpt-4o-mini | 128K | $0.00015 / $0.0006 | Econômico |
| gpt-3.5-turbo | 16K | $0.0005 / $0.0015 | Rápido e barato |

## Monitoramento de Custos

### Via API

```bash
# Estatísticas gerais
GET /api/v1/ai/usage/stats

# Últimas 20 chamadas
GET /api/v1/ai/usage/recent?limit=20
```

### Via Código

```typescript
import { openAiLogger } from '@infrastructure/ai/openai-logger';

// Imprimir relatório
openAiLogger.printReport();

// Obter estatísticas
const stats = openAiLogger.getStats();
console.log(`Custo total: ${stats.totalCost}`);
console.log(`Total de tokens: ${stats.totalTokens}`);
```

## Modo de Desenvolvimento

Para desenvolvimento sem custos, use o Mock Provider:

```bash
# .env
AI_PROVIDER=mock
```

O Mock Provider:
- Não faz chamadas reais à API
- Retorna dados fictícios mas realistas
- Mantém a mesma interface
- Útil para testes e desenvolvimento

## Arquitetura

```
┌─────────────────────────────────────────┐
│          API REST (Elysia)              │
│   /api/v1/ai/*                          │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│        AI Controller                    │
│   (ai.controller.ts)                    │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│         AI Service                      │
│   (ai-service.ts)                       │
└────────────┬────────────────────────────┘
             │
             ▼
┌────────────┴────────────┐
│                         │
▼                         ▼
┌──────────────┐    ┌──────────────┐
│   OpenAI     │    │    Mock      │
│   Provider   │    │   Provider   │
└──────┬───────┘    └──────────────┘
       │
       ▼
┌──────────────┐
│  OpenAI API  │
└──────────────┘
```

## Recursos Implementados

### ✅ Funcionalidades Core
- [x] Integração com OpenAI Chat Completions
- [x] Análise automática de dados
- [x] Geração de insights
- [x] Suporte a múltiplos modelos
- [x] Tratamento robusto de erros

### ✅ Monitoramento
- [x] Logger de uso e custos
- [x] Estatísticas por modelo
- [x] Estatísticas por endpoint
- [x] Relatórios detalhados

### ✅ API
- [x] Endpoints REST completos
- [x] Documentação Swagger
- [x] Validação de entrada
- [x] Tratamento de erros

### ✅ Testes
- [x] Testes unitários do provider
- [x] Testes de integração da API
- [x] Cobertura de casos de erro

### ✅ Documentação
- [x] Guia de setup
- [x] Exemplos práticos
- [x] Documentação de API
- [x] Guia de troubleshooting

## Próximos Passos Sugeridos

### Cache de Respostas
- Implementar cache com Redis
- Evitar chamadas duplicadas
- Reduzir custos

### Rate Limiting
- Limitar chamadas por usuário
- Prevenir abuse
- Controlar gastos

### Streaming
- Suporte a respostas em stream
- Melhor UX para respostas longas
- Uso da API de Streaming da OpenAI

### Outros Providers
- Suporte a Anthropic (Claude)
- Suporte a Google AI (Gemini)
- Abstração para múltiplos providers

### Métricas Avançadas
- Dashboard de uso
- Alertas de custo
- Analytics de performance

### Fine-tuning
- Suporte a modelos customizados
- Upload de dados de treinamento
- Gestão de modelos fine-tuned

## Troubleshooting

### Erro: "OpenAI API key is not configured"

**Solução**: Configure `AI_API_KEY` no `.env`

### Erro: "Incorrect API key provided"

**Solução**: Verifique se a chave é válida e está ativa

### Erro: "Rate limit exceeded"

**Solução**: Aguarde ou implemente rate limiting

### Respostas inconsistentes

**Solução**: Reduza a temperatura (0.1-0.3) para maior consistência

### Custos altos

**Solução**: 
- Use modelos mais baratos (gpt-3.5-turbo, gpt-4o-mini)
- Implemente cache
- Reduza maxTokens
- Use Mock provider em desenvolvimento

## Suporte e Recursos

- [Documentação OpenAI](https://platform.openai.com/docs)
- [Preços OpenAI](https://openai.com/pricing)
- [API Reference](https://platform.openai.com/docs/api-reference)
- [Guia de Boas Práticas](https://platform.openai.com/docs/guides/best-practices)

## Changelog

### v1.0.0 (2024-01-21)

**Adicionado**:
- Integração completa com OpenAI
- Provider OpenAI com suporte a completions
- Sistema de logging e monitoramento
- Controlador REST para AI
- Exemplos práticos de uso
- Documentação completa
- Testes unitários e de integração

**Modificado**:
- AiService para suportar múltiplos providers
- App para incluir rotas de AI
- README com informações sobre AI

**Dependências**:
- openai@^6.16.0

---

**Implementado por**: Commerce Intelligence Team  
**Data**: Janeiro 2024  
**Versão**: 1.0.0
