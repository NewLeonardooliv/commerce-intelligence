# Changelog - MCP Integration

Registro de mudanças e correções na integração MCP com Google ADK.

## [2026-01-28] - Correções Críticas

### 🐛 Corrigido: Erro "Session not found"

**Problema:**
```
error: Session not found: <session-id>
  at runAsync (/Users/leonardooliveira/sources/commerce-intelligence/node_modules/@google/adk/dist/esm/index.js:...)
```

**Causa Raiz:**
O `InMemoryRunner` do Google ADK requer que uma sessão seja criada explicitamente no `sessionService` antes de executar `runAsync()`. A implementação anterior tentava executar o agente sem criar a sessão primeiro.

**Solução Implementada:**
Adicionado código para criar a sessão antes de executar o agente:

```typescript
// Criar sessão antes de usar runAsync
try {
  await runner.sessionService.createSession({
    appName: 'mcp-test',
    userId: 'test-user',
    sessionId: sid,
  });
  console.log(`[MCP Test Service] Session created: ${sid}`);
} catch (sessionError: any) {
  // Session might already exist, which is fine
  if (!sessionError?.message?.includes('already exists')) {
    console.warn('[MCP Test Service] Session creation warning:', sessionError);
  }
}
```

**Arquivo:** `src/modules/mcp-test/mcp-test.service.ts`

**Status:** ✅ Resolvido

---

### 🐛 Corrigido: TypeError com propriedade 'finalResponse'

**Problema:**
```
Property 'finalResponse' does not exist on type 'Event'
```

**Causa:**
Tentativa de acessar diretamente `event.finalResponse` que não existe no tipo Event do ADK.

**Solução Implementada:**
Usar a função helper `isFinalResponse()` fornecida pelo ADK:

```typescript
import { isFinalResponse } from '@google/adk';

// Antes (incorreto):
if (event.finalResponse && event.content?.parts) {
  // ...
}

// Depois (correto):
if (isFinalResponse(event) && event.content?.parts) {
  finalResponse = event.content.parts.map((part) => part.text || '').join('');
}
```

**Arquivo:** `src/modules/mcp-test/mcp-test.service.ts`

**Status:** ✅ Resolvido

---

## [2026-01-27] - Implementação Inicial

### ✨ Novas Features

#### 1. Integração Google ADK com MCP
- Implementado `MCPHttpClient` usando `MCPToolset` do Google ADK
- Conexão HTTP/SSE na porta 8080 com endpoint `/mcp`
- Suporte para `StreamableHTTPConnectionParams`

**Arquivos:**
- `src/infrastructure/mcp/mcp-client.ts`
- `src/config/env.ts`

#### 2. Agente MCP Atualizado
- Integração com `LlmAgent` do Google ADK
- Suporte para dois modos: ADK (primary) e Legacy (fallback)
- Modelo: `gemini-2.0-flash-exp`

**Arquivos:**
- `src/modules/chat/agents/mcp.agent.ts`

#### 3. Rotas de Teste
- `POST /api/v1/mcp-test/prompt` - Envia prompts para o agente
- `GET /api/v1/mcp-test/health` - Verifica saúde da conexão
- `GET /api/v1/mcp-test/tools` - Lista ferramentas disponíveis

**Arquivos:**
- `src/modules/mcp-test/mcp-test.controller.ts`
- `src/modules/mcp-test/mcp-test.service.ts`
- `src/app.ts`

#### 4. Documentação Completa
- Quick Start Guide
- API Documentation
- Troubleshooting Guide
- Scripts de teste em Bash, JavaScript e Python
- Postman Collection

**Arquivos:**
- `QUICK_START_MCP_TEST.md`
- `ai-docs/MCP_TEST.md`
- `ai-docs/MCP_TROUBLESHOOTING_GUIDE.md`
- `scripts/test-mcp.sh`
- `scripts/examples/test-mcp.js`
- `scripts/examples/test-mcp.py`
- `scripts/postman/mcp-test-collection.json`
- `scripts/README.md`

---

## Configuração Necessária

### Variáveis de Ambiente

```bash
# Obrigatório
GOOGLE_API_KEY=sua_chave_aqui

# Opcional (valores padrão)
MCP_SERVER_URL=http://localhost:8080/mcp
MCP_ENABLED=true
```

### Como Obter GOOGLE_API_KEY

1. Acesse: https://aistudio.google.com/app/apikey
2. Crie uma nova chave de API
3. Adicione ao arquivo `.env`

---

## Testing

### Teste Rápido

```bash
# 1. Verificar saúde
curl http://localhost:3000/api/v1/mcp-test/health

# 2. Enviar prompt
curl -X POST http://localhost:3000/api/v1/mcp-test/prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello!"}'
```

### Suite Completa

```bash
# Bash
./scripts/test-mcp.sh

# JavaScript
node scripts/examples/test-mcp.js

# Python
python scripts/examples/test-mcp.py
```

---

## Problemas Conhecidos

### Resolvidos ✅

1. ~~Session not found error~~ - **Corrigido em 2026-01-28**
2. ~~Property 'finalResponse' does not exist~~ - **Corrigido em 2026-01-28**

### Em Aberto

Nenhum problema conhecido no momento.

---

## Próximos Passos

### Melhorias Planejadas

1. **Streaming de Respostas**
   - Implementar SSE para respostas em tempo real
   - Melhorar UX com progresso visual

2. **Cache de Sessões**
   - Implementar cache persistente de sessões
   - Melhorar performance em conversações longas

3. **Métricas e Monitoramento**
   - Adicionar métricas de uso de ferramentas
   - Monitorar latência e erros
   - Dashboard de estatísticas

4. **Autenticação**
   - Adicionar autenticação JWT
   - Rate limiting por usuário
   - Quota management

5. **Testes Automatizados**
   - Testes de integração end-to-end
   - Testes de performance
   - CI/CD pipeline

---

## Referências

- [Google ADK Documentation](https://google.github.io/adk-docs)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Gemini API](https://ai.google.dev/gemini-api/docs)

---

## Contribuindo

Para reportar bugs ou sugerir melhorias:

1. Verifique o [Troubleshooting Guide](ai-docs/MCP_TROUBLESHOOTING_GUIDE.md)
2. Crie uma issue com detalhes do problema
3. Inclua logs e passos para reproduzir

---

**Última atualização:** 2026-01-28
