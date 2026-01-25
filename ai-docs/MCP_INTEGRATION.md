# 🔌 Integração MCP (Model Context Protocol)

## 📋 Visão Geral

O sistema de chat agora suporta integração com servidores **MCP (Model Context Protocol)** via HTTP, permitindo que o chat acesse ferramentas e recursos externos durante a conversa.

## 🎯 O que é MCP?

MCP é um protocolo que permite que sistemas de IA se conectem a ferramentas e recursos externos de forma padronizada. Com MCP, o chat pode:

- 🔍 Fazer buscas na web
- 📊 Acessar APIs externas
- 🗄️ Consultar bancos de dados remotos
- 🛠️ Executar ferramentas customizadas
- 📁 Acessar recursos externos

## 🏗️ Arquitetura

### Pipeline Atualizado

```
Usuário
   ↓
[1] Interpreter Agent
   ↓
[2] Data Query Agent (dados internos)
   ↓
[3] MCP Agent ⭐ NOVO (dados externos)
   ↓
[4] Responder Agent
   ↓
[5] Suggestion Agent
   ↓
[6] Enhancer Agent
   ↓
Resposta Final
```

### Componentes

```
src/
├── infrastructure/
│   └── mcp/
│       ├── mcp-client.ts        # Cliente HTTP para MCP
│       └── mcp-service.ts       # Gerenciador de múltiplos servidores
├── modules/
│   └── chat/
│       └── agents/
│           └── mcp.agent.ts     # Agente especializado em MCP
└── config/
    └── mcp.ts                    # Configuração de servidores
```

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Adicione no arquivo `.env`:

```env
# Habilitar MCP globalmente
ENABLE_MCP=true

# Servidor MCP 1
MCP_SERVER_1_NAME=web-search
MCP_SERVER_1_URL=https://mcp-server.example.com
MCP_SERVER_1_API_KEY=your-api-key
MCP_SERVER_1_ENABLED=true
MCP_SERVER_1_DESCRIPTION=Servidor para busca na web

# Servidor MCP 2
MCP_SERVER_2_NAME=financial-api
MCP_SERVER_2_URL=https://finance-mcp.example.com
MCP_SERVER_2_ENABLED=true

# Servidor MCP 3 (local)
MCP_SERVER_3_NAME=custom-tools
MCP_SERVER_3_URL=http://localhost:8080
MCP_SERVER_3_ENABLED=true
```

### 2. Configuração Manual (Alternativa)

Edite `src/config/mcp.ts`:

```typescript
export const manualMCPConfig: MCPServerConfig[] = [
  {
    name: 'web-search',
    url: 'https://mcp-web-search.example.com',
    apiKey: 'your-api-key',
    enabled: true,
    description: 'Servidor MCP para busca na web'
  },
  {
    name: 'financial-data',
    url: 'https://mcp-finance.example.com',
    enabled: true,
    description: 'Dados financeiros em tempo real'
  }
];
```

## 🔧 Protocolo MCP HTTP

### Endpoints Esperados do Servidor MCP

Seu servidor MCP deve implementar os seguintes endpoints:

#### 1. Listar Tools
```http
POST /tools/list
Content-Type: application/json

Response:
{
  "tools": [
    {
      "name": "web_search",
      "description": "Busca informações na web",
      "inputSchema": {
        "type": "object",
        "properties": {
          "query": { "type": "string" },
          "limit": { "type": "number" }
        },
        "required": ["query"]
      }
    }
  ]
}
```

#### 2. Executar Tool
```http
POST /tools/call
Content-Type: application/json

Request:
{
  "name": "web_search",
  "arguments": {
    "query": "latest tech news",
    "limit": 5
  }
}

Response:
{
  "content": [
    {
      "type": "text",
      "text": "Resultado da busca..."
    }
  ],
  "isError": false
}
```

#### 3. Listar Recursos
```http
POST /resources/list
Content-Type: application/json

Response:
{
  "resources": [
    {
      "uri": "file:///data/report.pdf",
      "name": "Relatório Mensal",
      "description": "Relatório de vendas",
      "mimeType": "application/pdf"
    }
  ]
}
```

#### 4. Ler Recurso
```http
POST /resources/read
Content-Type: application/json

Request:
{
  "uri": "file:///data/report.pdf"
}

Response:
{
  "content": [
    {
      "type": "text",
      "text": "Conteúdo do recurso..."
    }
  ]
}
```

#### 5. Health Check
```http
GET /health

Response: 200 OK
```

## 🚀 API Endpoints

### Listar Tools Disponíveis

```http
GET /api/v1/chat/mcp/tools
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "count": 3,
    "tools": [
      {
        "name": "web_search",
        "server": "web-search",
        "description": "Busca informações na web",
        "parameters": {
          "query": { "type": "string" },
          "limit": { "type": "number" }
        }
      }
    ]
  }
}
```

### Verificar Saúde dos Servidores

```http
GET /api/v1/chat/mcp/health
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "allHealthy": true,
    "servers": {
      "web-search": true,
      "financial-api": true,
      "custom-tools": false
    }
  }
}
```

### Listar Servidores Configurados

```http
GET /api/v1/chat/mcp/servers
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "count": 3,
    "servers": [
      {
        "name": "web-search",
        "url": "https://mcp-server.example.com",
        "enabled": true,
        "description": "Servidor para busca na web",
        "hasApiKey": true
      }
    ]
  }
}
```

## 💬 Usando MCP no Chat

### Exemplo 1: Busca Automática

```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Busque na web informações sobre e-commerce trends 2024",
    "userId": "user123"
  }'
```

O agente MCP será automaticamente acionado para:
1. Identificar que precisa de dados externos
2. Escolher a tool apropriada (ex: `web_search`)
3. Executar a busca
4. Integrar os resultados na resposta

### Exemplo 2: Dados Financeiros

```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Qual o preço atual do Bitcoin?",
    "userId": "user123"
  }'
```

### Resposta com MCP

```json
{
  "success": true,
  "data": {
    "sessionId": "123",
    "response": "De acordo com a busca realizada, o preço atual do Bitcoin é $45,000...",
    "metadata": {
      "interpretation": {...},
      "dataUsed": false,
      "mcpUsed": true,
      "sources": ["MCP: web-search", "Análise de IA"],
      "confidence": 0.88,
      "suggestions": [
        "Qual a variação do Bitcoin nos últimos 7 dias?",
        "Compare com outras criptomoedas"
      ]
    }
  }
}
```

## 🎯 Como o MCP Agent Funciona

### 1. Decisão de Usar MCP

O agente decide usar MCP quando:

```typescript
// A interpretação indica necessidade de ferramentas externas
interpretation.requiresExternalTools === true

// OU a pergunta contém keywords
["buscar na web", "pesquisar online", "informação externa", etc.]
```

### 2. Seleção de Tool

O agente usa IA para:
- Analisar a pergunta do usuário
- Comparar com tools disponíveis
- Escolher a tool mais apropriada
- Determinar os parâmetros necessários

### 3. Execução

```typescript
const result = await mcpService.callTool(
  'web-search',     // nome do servidor
  'search',         // nome da tool
  { query: '...' }  // argumentos
);
```

### 4. Integração

O resultado é adicionado ao contexto e usado pelos próximos agentes:
- **Responder Agent**: Usa os dados MCP na resposta
- **Suggestion Agent**: Sugere perguntas relacionadas
- **Enhancer Agent**: Refina e adiciona fontes MCP

## 🛠️ Criando um Servidor MCP

### Exemplo Mínimo (Node.js/Express)

```typescript
import express from 'express';

const app = express();
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Listar tools
app.post('/tools/list', (req, res) => {
  res.json({
    tools: [
      {
        name: 'hello',
        description: 'Diz olá',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' }
          },
          required: ['name']
        }
      }
    ]
  });
});

// Executar tool
app.post('/tools/call', (req, res) => {
  const { name, arguments: args } = req.body;
  
  if (name === 'hello') {
    res.json({
      content: [
        {
          type: 'text',
          text: `Olá, ${args.name}!`
        }
      ]
    });
  } else {
    res.status(404).json({
      content: [
        {
          type: 'text',
          text: 'Tool não encontrada'
        }
      ],
      isError: true
    });
  }
});

app.listen(8080, () => {
  console.log('MCP Server rodando na porta 8080');
});
```

### Testando Localmente

```bash
# 1. Inicie o servidor MCP
node mcp-server.js

# 2. Configure no .env
MCP_SERVER_1_NAME=local-test
MCP_SERVER_1_URL=http://localhost:8080
MCP_SERVER_1_ENABLED=true
ENABLE_MCP=true

# 3. Reinicie o servidor
bun dev

# 4. Teste
curl http://localhost:3001/api/v1/chat/mcp/health
```

## 🔒 Segurança

### Autenticação

O cliente MCP suporta autenticação via Bearer Token:

```typescript
const client = new MCPHttpClient(
  'https://api.example.com',
  'your-api-key'  // Enviado como Authorization: Bearer <token>
);
```

### Validação

- ✅ URLs são validadas antes da conexão
- ✅ Timeout padrão de 30 segundos
- ✅ Erros são capturados e logados
- ✅ Responses são validadas

### Boas Práticas

1. **Use HTTPS** em produção
2. **Proteja API Keys** com variáveis de ambiente
3. **Implemente rate limiting** no servidor MCP
4. **Valide inputs** nas tools
5. **Use tokens com escopo limitado**

## 📊 Monitoramento

### Logs

```bash
[Chat Service] MCP enabled with 3 servers
[MCP Agent] Processing...
[MCP Agent] MCP tools not needed for this query
[MCP Agent] Successfully executed tool: web_search
[MCP Service] Failed to list tools from offline-server: ...
```

### Métricas

- Número de chamadas MCP
- Taxa de sucesso/erro
- Latência por servidor
- Tools mais usadas

## 🐛 Troubleshooting

### MCP não está habilitado

```bash
# Verificar configuração
curl http://localhost:3001/api/v1/chat/mcp/servers

# Resposta esperada:
{
  "data": {
    "enabled": false,
    "servers": []
  }
}

# Solução: configurar ENABLE_MCP=true no .env
```

### Servidor MCP não responde

```bash
# Verificar saúde
curl http://localhost:3001/api/v1/chat/mcp/health

# Se servidor offline:
{
  "data": {
    "servers": {
      "my-server": false
    }
  }
}

# Solução: verificar URL e conectividade do servidor
```

### Tool não é chamada

Possíveis causas:
1. Pergunta não indica necessidade de ferramenta externa
2. IA não identificou tool apropriada
3. Servidor MCP não tem a tool necessária

## 🎯 Exemplos de Uso

### Casos de Uso Comuns

**1. Informações em Tempo Real**
```
"Qual o clima em São Paulo hoje?"
→ Usa MCP para acessar API de clima
```

**2. Dados Externos**
```
"Busque informações sobre concorrentes no mercado"
→ Usa MCP para buscar na web
```

**3. Integrações**
```
"Consulte o CRM para dados do cliente X"
→ Usa MCP para acessar API do CRM
```

**4. Análises Customizadas**
```
"Execute análise de sentimento nas reviews"
→ Usa MCP para ferramenta de NLP
```

## 📈 Roadmap

- [ ] Suporte a streaming de respostas
- [ ] Cache de resultados MCP
- [ ] Retry automático em falhas
- [ ] Métricas e analytics
- [ ] UI para gerenciar servidores
- [ ] Suporte a webhooks
- [ ] MCP via WebSocket

## 🤝 Contribuindo

Para adicionar novos servidores MCP:

1. Configure as variáveis de ambiente
2. Implemente o servidor seguindo o protocolo
3. Teste a conectividade
4. Documente as tools disponíveis

## 📚 Recursos

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [MCP Examples](https://github.com/modelcontextprotocol)
- Documentação do projeto: `ai-docs/`

---

**Status**: ✅ Implementado e funcional  
**Versão**: 1.0.0  
**Data**: 2026-01-25
