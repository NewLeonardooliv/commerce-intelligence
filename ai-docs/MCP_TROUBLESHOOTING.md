# 🔧 MCP Troubleshooting Guide

## ❌ Erro: "Failed to initialize MCP: 404 Not Found"

### Causa
O servidor MCP não está rodando ou não está acessível na URL configurada.

### Diagnóstico

#### 1. Verificar se o servidor MCP está rodando
```bash
# Testar endpoint de health
curl http://localhost:3000/health

# Deve retornar:
{"status":"ok"}
```

#### 2. Verificar configuração
```bash
# Ver configuração do .env
cat .env | grep MCP

# Deve mostrar:
ENABLE_MCP=true
MCP_SERVER_1_NAME=olist-mcp
MCP_SERVER_1_URL=http://localhost:3000
MCP_SERVER_1_ENABLED=true
```

#### 3. Verificar logs do servidor principal
```bash
# Ao iniciar, deve aparecer:
[Chat Service] Initializing MCP with 1 servers:
  - olist-mcp: http://localhost:3000 (enabled: true)
[Chat Service] MCP service initialized
```

### Soluções

#### Solução 1: Iniciar o servidor MCP
```bash
# No diretório do servidor MCP (olist-mcp)
cd /path/to/olist-mcp
bun dev

# Deve aparecer:
MCP Server listening on http://localhost:3000/mcp
```

#### Solução 2: Verificar porta correta
```bash
# Se o servidor está em outra porta, atualize .env:
MCP_SERVER_1_URL=http://localhost:PORTA_CORRETA
```

#### Solução 3: Desabilitar MCP temporariamente
```bash
# No .env:
ENABLE_MCP=false

# Reiniciar servidor
bun dev
```

## 🔍 Logs de Debug

Com as melhorias adicionadas, você verá logs detalhados:

### Ao iniciar o servidor
```
[Chat Service] Initializing MCP with 1 servers:
  - olist-mcp: http://localhost:3000 (enabled: true)
[Chat Service] MCP service initialized
```

### Ao fazer uma requisição de chat
```
[MCP Agent] Processing...
[MCP Client] Initializing connection to http://localhost:3000
[MCP Client] Session initialized: abc-123-def-456
[MCP Client] Initialization complete
```

### Se o servidor não estiver disponível
```
[MCP Client] Initializing connection to http://localhost:3000
[MCP Client] Initialization failed: 404 Not Found
[MCP Client] Error details: Cannot GET /mcp
[MCP Service] Failed to list tools from olist-mcp: Cannot connect to MCP server...
[MCP Agent] No MCP tools available
```

## 📋 Checklist de Verificação

- [ ] Servidor MCP está rodando?
  ```bash
  curl http://localhost:3000/health
  ```

- [ ] URL está correta no .env?
  ```bash
  grep MCP_SERVER_1_URL .env
  ```

- [ ] MCP está habilitado?
  ```bash
  grep ENABLE_MCP .env
  # Deve ser: ENABLE_MCP=true
  ```

- [ ] Servidor principal foi reiniciado após mudanças no .env?
  ```bash
  # Parar e reiniciar
  bun dev
  ```

- [ ] Logs mostram inicialização correta?
  ```
  [Chat Service] Initializing MCP with 1 servers
  ```

## 🧪 Teste Manual

### 1. Testar servidor MCP diretamente

```bash
# Initialize
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {"name": "test", "version": "1.0"}
    }
  }'
```

### 2. Verificar health check

```bash
curl http://localhost:3000/health
# Deve retornar: {"status":"ok"}
```

### 3. Testar através do chat

```bash
curl -X POST http://localhost:3001/api/v1/chat/mcp/health \
  -H "Content-Type: application/json"
```

Resposta esperada se servidor estiver OK:
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "allHealthy": true,
    "servers": {
      "olist-mcp": true
    }
  }
}
```

## 🚀 Fluxo Correto de Inicialização

### 1. Iniciar servidor MCP primeiro
```bash
# Terminal 1
cd /path/to/olist-mcp
bun dev
# Aguardar: "MCP Server listening on http://localhost:3000/mcp"
```

### 2. Iniciar servidor principal
```bash
# Terminal 2
cd /path/to/commerce-intelligence
bun dev
# Aguardar logs de inicialização MCP
```

### 3. Fazer requisição de teste
```bash
# Terminal 3
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "teste",
    "userId": "test"
  }'
```

## ⚠️ Problemas Comuns

### Problema: "Cannot connect to MCP server"
**Causa**: Servidor não está rodando ou firewall bloqueando
**Solução**: Iniciar servidor MCP e verificar firewall

### Problema: "No session ID received from server"
**Causa**: Servidor MCP não está retornando header `mcp-session-id`
**Solução**: Verificar implementação do servidor MCP

### Problema: "MCP enabled but no servers configured"
**Causa**: Variáveis de ambiente não estão carregadas
**Solução**: Verificar arquivo .env e reiniciar servidor

### Problema: Health check passa mas initialize falha
**Causa**: Endpoint `/health` existe mas `/mcp` não
**Solução**: Verificar se o servidor implementa o endpoint `/mcp` corretamente

## 📞 Suporte

Se o problema persistir:

1. Copie todos os logs relevantes
2. Verifique a saída de:
   ```bash
   curl -v http://localhost:3000/health
   curl -v http://localhost:3000/mcp
   ```
3. Verifique se há erros no servidor MCP
4. Consulte a documentação do servidor MCP

---

**Dica**: Use `ENABLE_MCP=false` para desabilitar MCP e continuar trabalhando enquanto resolve problemas de configuração.
