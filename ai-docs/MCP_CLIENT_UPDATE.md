# 🔄 Atualização do Cliente MCP - Protocolo JSON-RPC 2.0

## ✅ Mudanças Implementadas

### 1. **Cliente MCP Atualizado**

O cliente MCP foi completamente reescrito para ser compatível com o protocolo oficial **MCP (Model Context Protocol)** que usa **JSON-RPC 2.0** sobre HTTP.

### 2. **Protocolo JSON-RPC 2.0**

#### Antes (REST simples):
```http
POST /tools/list
→ { tools: [...] }
```

#### Agora (JSON-RPC):
```http
POST /mcp
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}

→ {
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [...]
  }
}
```

### 3. **Gerenciamento de Sessão**

O cliente agora:
- ✅ Inicializa sessão automaticamente com `initialize`
- ✅ Envia notificação `notifications/initialized`
- ✅ Mantém `mcp-session-id` nos headers
- ✅ Reutiliza a sessão para todas as requisições
- ✅ Fecha sessão adequadamente com método `close()`

### 4. **Fluxo de Inicialização**

```typescript
// 1. Initialize
POST /mcp
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {},
      "resources": {}
    },
    "clientInfo": {
      "name": "commerce-intelligence",
      "version": "1.0.0"
    }
  }
}

// 2. Response com Session ID
← Headers: mcp-session-id: <session-id>

// 3. Notification Initialized
POST /mcp
Headers: mcp-session-id: <session-id>
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "notifications/initialized"
}

// 4. Todas as requisições seguintes usam o session ID
```

### 5. **Métodos Suportados**

| Método | Descrição | Params |
|--------|-----------|--------|
| `initialize` | Inicializa sessão MCP | protocolVersion, capabilities, clientInfo |
| `notifications/initialized` | Notifica inicialização completa | - |
| `tools/list` | Lista tools disponíveis | - |
| `tools/call` | Executa uma tool | name, arguments |
| `resources/list` | Lista recursos disponíveis | - |
| `resources/read` | Lê um recurso | uri |

### 6. **Configuração Atualizada**

#### `.env`
```env
ENABLE_MCP=true

# Porta 3000 (padrão do servidor MCP)
MCP_SERVER_1_NAME=olist-mcp
MCP_SERVER_1_URL=http://localhost:3000
MCP_SERVER_1_ENABLED=true
MCP_SERVER_1_DESCRIPTION=Servidor MCP para dados de e-commerce Olist
```

### 7. **Estrutura do Cliente**

```typescript
class MCPHttpClient {
  private sessionId?: string;           // Gerencia sessão
  private requestCounter = 0;           // ID incremental para JSON-RPC
  
  // Inicialização automática e lazy
  private async ensureInitialized(): Promise<void>
  
  // Envia requisição JSON-RPC
  private async sendRequest(method: string, params?: unknown): Promise<unknown>
  
  // Métodos públicos
  async listTools(): Promise<MCPTool[]>
  async callTool(params: MCPToolCallParams): Promise<MCPToolCallResult>
  async listResources(): Promise<MCPResource[]>
  async readResource(uri: string): Promise<MCPToolCallResult>
  async ping(): Promise<boolean>
  async close(): Promise<void>              // Fecha sessão
}
```

## 🔍 Diferenças Principais

### Antes vs Agora

| Aspecto | Antes (REST) | Agora (JSON-RPC) |
|---------|--------------|------------------|
| **Protocolo** | REST simples | JSON-RPC 2.0 |
| **Endpoint** | Múltiplos (`/tools/list`, `/tools/call`) | Único (`/mcp`) |
| **Sessão** | Stateless | Stateful com session ID |
| **Método HTTP** | POST/GET/DELETE | POST (método no JSON) |
| **Formato** | JSON direto | JSON-RPC wrapper |

### Exemplo de Chamada de Tool

#### Antes:
```typescript
POST /tools/call
{
  "name": "search",
  "arguments": { "query": "test" }
}
```

#### Agora:
```typescript
POST /mcp
Headers: mcp-session-id: abc-123
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "search",
    "arguments": { "query": "test" }
  }
}
```

## 🚀 Como Usar

### 1. Iniciar Servidor MCP

```bash
# No projeto do servidor MCP (olist-mcp)
bun dev

# Servidor deve estar em http://localhost:3000
```

### 2. Configurar Cliente

```env
ENABLE_MCP=true
MCP_SERVER_1_URL=http://localhost:3000
```

### 3. Testar

```bash
# Reiniciar servidor
bun dev

# Fazer requisição de chat
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Liste as tools disponíveis",
    "userId": "test"
  }'
```

## 📊 Comportamento do Cliente

### Primeira Requisição
```
1. Cliente detecta que não tem sessionId
2. Envia initialize request
3. Recebe sessionId no header
4. Envia notifications/initialized
5. Executa requisição real (tools/list, tools/call, etc)
```

### Requisições Subsequentes
```
1. Cliente reutiliza sessionId existente
2. Envia requisição diretamente
3. Mantém conexão ativa
```

### Limpeza
```
1. Cliente pode chamar close()
2. Envia DELETE /mcp com sessionId
3. Remove sessionId local
```

## 🔒 Tratamento de Erros

O cliente agora trata erros JSON-RPC:

```typescript
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32603,
    "message": "Internal server error",
    "data": { ... }
  }
}
```

Erros são convertidos em exceções JavaScript normais.

## ✨ Melhorias

1. **✅ Compatibilidade Total** com protocolo MCP oficial
2. **✅ Gerenciamento de Sessão** automático
3. **✅ Lazy Initialization** - sessão criada apenas quando necessário
4. **✅ Reutilização de Conexão** - melhor performance
5. **✅ Error Handling** robusto com JSON-RPC
6. **✅ Type-Safe** 100% com TypeScript
7. **✅ Health Check** separado do protocolo MCP

## 🐛 Troubleshooting

### Erro 404 Not Found

**Causa**: URL incorreta ou servidor não está rodando

**Solução**:
```bash
# Verificar se servidor está rodando
curl http://localhost:3000/health

# Verificar porta correta no .env
MCP_SERVER_1_URL=http://localhost:3000
```

### Erro "Bad Request: No valid session ID"

**Causa**: Sessão expirou ou não foi inicializada

**Solução**: Cliente reinicializa automaticamente. Se persistir, verificar logs do servidor.

### Erro de timeout

**Causa**: Servidor MCP não está respondendo

**Solução**:
```bash
# Verificar logs do servidor MCP
# Aumentar timeout se necessário
```

## 📚 Referências

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [JSON-RPC 2.0 Specification](https://www.jsonrpc.org/specification)
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)

---

**Status**: ✅ Cliente atualizado e compatível com protocolo MCP oficial  
**Versão**: 2.1.0  
**Data**: 2026-01-25
