# 🚀 Guia Rápido - MCP Integration

## ⚡ Quick Start (5 minutos)

### 1. Configure o servidor MCP de exemplo

```bash
# Terminal 1: Inicie o servidor MCP de exemplo
cd examples
node mcp-server-example.js
```

Você verá:
```
🚀 Servidor MCP de Exemplo
📍 URL: http://localhost:8080
✅ Health: http://localhost:8080/health
```

### 2. Configure o ambiente

Edite o arquivo `.env`:

```env
# Habilitar MCP
ENABLE_MCP=true

# Servidor de exemplo
MCP_SERVER_1_NAME=example
MCP_SERVER_1_URL=http://localhost:8080
MCP_SERVER_1_ENABLED=true
MCP_SERVER_1_DESCRIPTION=Servidor MCP de exemplo local
```

### 3. Inicie o servidor principal

```bash
# Terminal 2
bun dev
```

### 4. Teste a integração

```bash
# Verificar saúde dos servidores MCP
curl http://localhost:3001/api/v1/chat/mcp/health

# Listar tools disponíveis
curl http://localhost:3001/api/v1/chat/mcp/tools

# Fazer uma pergunta que usa MCP
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Qual o clima em São Paulo?",
    "userId": "test"
  }'
```

## 📊 Verificar se MCP está funcionando

### Opção 1: Via API

```bash
# 1. Verificar servidores configurados
curl http://localhost:3001/api/v1/chat/mcp/servers

# Resposta esperada:
{
  "success": true,
  "data": {
    "enabled": true,
    "count": 1,
    "servers": [
      {
        "name": "example",
        "url": "http://localhost:8080",
        "enabled": true,
        "hasApiKey": false
      }
    ]
  }
}

# 2. Verificar saúde
curl http://localhost:3001/api/v1/chat/mcp/health

# Resposta esperada:
{
  "success": true,
  "data": {
    "enabled": true,
    "allHealthy": true,
    "servers": {
      "example": true
    }
  }
}

# 3. Listar tools
curl http://localhost:3001/api/v1/chat/mcp/tools

# Resposta esperada:
{
  "success": true,
  "data": {
    "enabled": true,
    "count": 4,
    "tools": [
      {
        "name": "web_search",
        "server": "example",
        "description": "Busca informações na web (simulado)"
      },
      {
        "name": "get_weather",
        "server": "example",
        "description": "Obtém informações de clima (simulado)"
      },
      ...
    ]
  }
}
```

### Opção 2: Via Chat

```bash
# Pergunta que deve usar MCP
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Qual o clima em São Paulo?",
    "userId": "test"
  }'
```

Na resposta, verifique:
```json
{
  "data": {
    "metadata": {
      "mcpUsed": true,  // ← MCP foi usado
      "sources": ["MCP: example", ...]
    }
  }
}
```

## 🎯 Exemplos de Perguntas

### Perguntas que usam MCP (com servidor de exemplo)

✅ **Clima**
```bash
"Qual o clima em São Paulo?"
"Como está o tempo no Rio de Janeiro?"
```

✅ **Busca Web (simulada)**
```bash
"Busque informações sobre e-commerce"
"Pesquise tendências de mercado"
```

✅ **Cálculos**
```bash
"Calcule 234 * 567"
"Quanto é 1500 / 25?"
```

✅ **Listar Produtos (do servidor MCP)**
```bash
"Liste produtos disponíveis"
"Mostre produtos com preço acima de 150"
```

### Perguntas que NÃO usam MCP

❌ **Dados internos do banco**
```bash
"Quantos produtos temos no catálogo?"
"Qual o total de vendas?"
```

❌ **Conversação simples**
```bash
"Olá, tudo bem?"
"Obrigado!"
```

## 🔍 Troubleshooting

### MCP não está habilitado

**Problema**: Resposta mostra `"enabled": false`

**Solução**:
```env
# No .env
ENABLE_MCP=true
```

Reinicie o servidor.

### Servidor MCP offline

**Problema**: `"allHealthy": false` ou servidor mostra `false`

**Soluções**:
1. Verifique se o servidor MCP está rodando
2. Teste diretamente: `curl http://localhost:8080/health`
3. Verifique a URL no `.env`
4. Verifique firewall/rede

### MCP não é chamado no chat

**Problema**: `"mcpUsed": false` mesmo com pergunta apropriada

**Possíveis causas**:
1. Interpretação não detectou necessidade de ferramenta externa
2. Nenhuma tool apropriada disponível
3. IA não selecionou a tool correta

**Debug**:
- Adicione keywords explícitas: "buscar na web", "informação externa"
- Verifique logs do servidor: `[MCP Agent] Processing...`
- Verifique se há tools disponíveis: `GET /chat/mcp/tools`

### Erros de conexão

**Problema**: "Failed to list tools" ou erros de timeout

**Soluções**:
1. Aumente timeout se necessário
2. Verifique conectividade de rede
3. Teste URL manualmente: `curl [MCP_SERVER_URL]/tools/list -X POST`
4. Verifique se API Key é necessária

## 📁 Estrutura de Arquivos

```
src/
├── infrastructure/
│   └── mcp/
│       ├── mcp-client.ts      # Cliente HTTP
│       └── mcp-service.ts     # Gerenciador
├── modules/
│   └── chat/
│       └── agents/
│           └── mcp.agent.ts   # Agente MCP
└── config/
    └── mcp.ts                  # Configuração

examples/
└── mcp-server-example.js       # Servidor de exemplo

ai-docs/
└── MCP_INTEGRATION.md          # Docs completos

.env                             # Configuração
mcp-requests.http               # Testes HTTP
```

## 🛠️ Próximos Passos

### 1. Conectar a servidor MCP real

Substitua o servidor de exemplo por um servidor MCP real:

```env
MCP_SERVER_1_NAME=production-api
MCP_SERVER_1_URL=https://your-mcp-server.com
MCP_SERVER_1_API_KEY=your-api-key
MCP_SERVER_1_ENABLED=true
```

### 2. Criar seus próprios servidores MCP

Use `examples/mcp-server-example.js` como template para criar seus próprios servidores com:
- Integração com APIs externas
- Acesso a banco de dados
- Ferramentas customizadas
- Processamento de dados

### 3. Adicionar múltiplos servidores

Configure até 3 servidores (ou modifique `config/mcp.ts` para mais):

```env
MCP_SERVER_1_NAME=web-search
MCP_SERVER_1_URL=https://search.example.com

MCP_SERVER_2_NAME=weather
MCP_SERVER_2_URL=https://weather.example.com

MCP_SERVER_3_NAME=crm
MCP_SERVER_3_URL=https://crm.example.com
```

## 📚 Documentação Completa

- **Guia Completo**: `ai-docs/MCP_INTEGRATION.md`
- **Pipeline**: `ai-docs/PIPELINE_AGENTES.md`
- **Testes**: `mcp-requests.http`

## 🎉 Pronto!

MCP está integrado e funcionando! O chat agora pode usar ferramentas externas de forma inteligente e automática.
