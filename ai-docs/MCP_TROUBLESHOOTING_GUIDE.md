# MCP Troubleshooting Guide

Guia completo de solução de problemas para a integração MCP com Google ADK.

## Problemas Comuns e Soluções

### 1. Erro: "Session not found"

**Erro completo:**
```
error: Session not found: <session-id>
  at runAsync (/path/to/node_modules/@google/adk/dist/esm/index.js:...)
```

**Causa:**
O `InMemoryRunner` do Google ADK requer que uma sessão seja criada explicitamente antes de executar `runAsync()`.

**Solução:**
Sempre crie a sessão antes de executar o agente:

```typescript
const runner = new InMemoryRunner({
  agent: this.agent,
  appName: 'mcp-test',
});

// IMPORTANTE: Criar sessão antes de usar runAsync
await runner.sessionService.createSession({
  appName: 'mcp-test',
  userId: 'test-user',
  sessionId: sessionId,
});

// Agora pode usar runAsync
for await (const event of runner.runAsync({
  userId: 'test-user',
  sessionId: sessionId,
  newMessage: userMessage,
})) {
  // Processar eventos
}
```

**Status:** ✅ Corrigido no código

---

### 2. Erro: "MCP Test Agent not initialized"

**Erro completo:**
```json
{
  "response": "Error: MCP Test Agent not initialized. Please configure GOOGLE_API_KEY environment variable."
}
```

**Causa:**
A variável de ambiente `GOOGLE_API_KEY` não está configurada.

**Solução:**
1. Configure a variável no arquivo `.env`:
```bash
GOOGLE_API_KEY=sua_chave_aqui
```

2. Obtenha sua chave em: https://aistudio.google.com/app/apikey

3. Reinicie o servidor:
```bash
bun run dev
```

**Verificação:**
```bash
curl http://localhost:3000/api/v1/mcp-test/health
# Deve retornar: "googleApiKeyConfigured": true
```

---

### 3. Erro: "MCP server connection failed"

**Causa:**
O servidor MCP não está acessível na URL configurada.

**Soluções:**

**a) Verificar se o servidor MCP está rodando:**
```bash
# Testar conectividade
curl http://localhost:8080/mcp

# Ou verificar a porta
lsof -i :8080
```

**b) Verificar a URL configurada:**
```bash
# No .env
MCP_SERVER_URL=http://localhost:8080/mcp
```

**c) Verificar logs do servidor MCP:**
- Certifique-se de que o servidor MCP está rodando e ouvindo na porta correta
- Verifique se não há firewall bloqueando a conexão

**d) Testar com outro endpoint:**
Se você não tem um servidor MCP rodando, pode testar sem ele:
```bash
# O agente funcionará sem ferramentas MCP
export MCP_ENABLED=false
```

---

### 4. Erro: "Property 'finalResponse' does not exist on type 'Event'"

**Causa:**
Tentativa de acessar diretamente a propriedade `finalResponse` em eventos do ADK.

**Solução:**
Use a função helper `isFinalResponse()`:

```typescript
import { isFinalResponse } from '@google/adk';

for await (const event of runner.runAsync(...)) {
  if (isFinalResponse(event) && event.content?.parts) {
    const response = event.content.parts.map((part) => part.text || '').join('');
  }
}
```

**Status:** ✅ Corrigido no código

---

### 5. Erro: "No response generated"

**Sintoma:**
A resposta retorna, mas o campo `response` está vazio ou é "No response generated".

**Causas Possíveis:**

**a) Evento final não foi capturado:**
```typescript
// Solução: Verificar se está usando isFinalResponse corretamente
if (isFinalResponse(event) && event.content?.parts) {
  finalResponse = event.content.parts.map((part) => part.text || '').join('');
}
```

**b) Timeout antes da resposta completa:**
```typescript
// Aumentar timeout se necessário (em desenvolvimento)
// Ou aguardar mais tempo
```

**c) Erro no processamento do modelo:**
- Verificar logs do servidor para erros detalhados
- Testar com um prompt mais simples

---

### 6. Erro: "Invalid JSON response"

**Causa:**
O modelo retornou texto que não é JSON válido quando se esperava JSON.

**Soluções:**

**a) Não forçar JSON se não for necessário:**
```typescript
// O agente retorna texto por padrão, não JSON
// Use o texto diretamente
```

**b) Se precisar de JSON estruturado:**
```typescript
const agent = new LlmAgent({
  // ... outras configs
  outputSchema: yourSchema, // Define schema de saída
});
```

---

### 7. Erro de Parsing com Código JavaScript Interno

**Erro:**
```
explore_df(${t})
`}var fo=new ot,v=class o extends L{constructor(e)...
```

**Causa:**
Erro interno do ADK sendo exposto nos logs. Geralmente relacionado a problemas de sessão ou configuração.

**Solução:**
1. Verificar se a sessão foi criada corretamente (ver solução #1)
2. Verificar se todas as dependências do ADK estão atualizadas:
```bash
bun update @google/adk @google/genai
```
3. Limpar node_modules e reinstalar:
```bash
rm -rf node_modules bun.lock
bun install
```

**Status:** ✅ Corrigido com a criação adequada de sessões

---

### 8. Timeout em Requisições

**Sintoma:**
Requisições demoram muito ou dão timeout.

**Causas e Soluções:**

**a) Servidor MCP lento:**
- Verificar performance do servidor MCP
- Verificar latência de rede

**b) Modelo Gemini lento:**
- Usar modelo mais rápido: `gemini-2.0-flash-exp` ao invés de `gemini-2.0-pro`
- Reduzir tamanho do prompt
- Limitar tokens de saída

**c) Muitas ferramentas MCP:**
- O modelo demora mais quando tem muitas ferramentas disponíveis
- Considerar filtrar ferramentas relevantes

---

### 9. Erro: "Cannot read property 'parts' of undefined"

**Causa:**
Tentativa de acessar `event.content.parts` quando `content` é undefined.

**Solução:**
Sempre verificar se content existe:

```typescript
if (isFinalResponse(event) && event.content?.parts) {
  // Safe access
  const response = event.content.parts.map((part) => part.text || '').join('');
}
```

---

### 10. Problemas com Continuidade de Sessão

**Sintoma:**
Ao usar o mesmo `sessionId`, o agente não lembra do contexto anterior.

**Causas e Soluções:**

**a) Usando novo runner a cada requisição:**
```typescript
// PROBLEMA: Criar novo runner perde o contexto
const runner = new InMemoryRunner({ agent, appName: 'app' });

// SOLUÇÃO: Reutilizar o mesmo runner ou sessionService
// Armazenar o runner/sessionService em um singleton
```

**b) SessionService diferente:**
```typescript
// Cada InMemoryRunner tem seu próprio sessionService
// Para manter contexto, use o mesmo sessionService
```

---

## Debugging Tips

### 1. Habilitar Logs Detalhados

```typescript
// Adicionar logs em pontos críticos
console.log('[DEBUG] Session ID:', sessionId);
console.log('[DEBUG] Event received:', {
  id: event.id,
  author: event.author,
  isFinal: isFinalResponse(event),
  hasContent: !!event.content,
  hasParts: !!event.content?.parts,
});
```

### 2. Testar Componentes Isoladamente

```bash
# Testar só o health
curl http://localhost:3000/api/v1/mcp-test/health

# Testar só as tools
curl http://localhost:3000/api/v1/mcp-test/tools

# Testar prompt simples sem sessão
curl -X POST http://localhost:3000/api/v1/mcp-test/prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello"}'
```

### 3. Verificar Variáveis de Ambiente

```bash
# Verificar se está carregando o .env
node -e "console.log(process.env.GOOGLE_API_KEY ? 'OK' : 'NOT SET')"

# Ou dentro do código
console.log('GOOGLE_API_KEY configured:', !!env.google.apiKey);
console.log('MCP_SERVER_URL:', env.mcp.serverUrl);
```

### 4. Usar try-catch Detalhado

```typescript
try {
  // Seu código
} catch (error) {
  console.error('Error details:', {
    message: error instanceof Error ? error.message : 'Unknown',
    stack: error instanceof Error ? error.stack : undefined,
    error: error,
  });
}
```

---

## Checklist de Diagnóstico

Quando algo não funciona, siga este checklist:

- [ ] GOOGLE_API_KEY está configurada?
- [ ] Servidor está rodando?
- [ ] Health check retorna sucesso?
- [ ] MCP server está acessível (se usando)?
- [ ] Dependências estão atualizadas?
- [ ] Sessão está sendo criada antes de usar?
- [ ] Logs mostram algum erro específico?
- [ ] Prompt é válido e não muito longo?
- [ ] Timeout é adequado para a operação?
- [ ] Cache/node_modules está limpo?

---

## Comandos Úteis para Diagnóstico

```bash
# Verificar saúde completa
curl -s http://localhost:3000/api/v1/mcp-test/health | jq

# Testar conexão MCP diretamente
curl -v http://localhost:8080/mcp

# Verificar processos rodando
lsof -i :3000
lsof -i :8080

# Verificar logs em tempo real
tail -f logs/app.log

# Limpar e reinstalar
rm -rf node_modules bun.lock
bun install

# Reiniciar servidor
pkill -f "bun" && bun run dev
```

---

## Contato e Suporte

Se o problema persistir:

1. Verifique os logs detalhados do servidor
2. Teste com os exemplos fornecidos nos scripts
3. Consulte a documentação do Google ADK: https://google.github.io/adk-docs
4. Verifique issues conhecidos no repositório do ADK

---

**Última atualização:** 2026-01-28
