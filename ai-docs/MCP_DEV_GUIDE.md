# 🔌 MCP Integration - Developer Guide

## 📋 Visão Geral

Este projeto agora suporta **MCP (Model Context Protocol)** via HTTP, permitindo que o chat conversacional acesse ferramentas e recursos externos durante a conversa.

## 🚀 Quick Start (2 minutos)

### Terminal 1: Servidor MCP
```bash
cd examples
node mcp-server-example.js
```

### Terminal 2: Servidor Principal
```bash
# Configure .env
echo "ENABLE_MCP=true" >> .env
echo "MCP_SERVER_1_NAME=example" >> .env
echo "MCP_SERVER_1_URL=http://localhost:8080" >> .env
echo "MCP_SERVER_1_ENABLED=true" >> .env

# Inicie
bun dev
```

### Terminal 3: Teste
```bash
# Execute testes automatizados
./test-mcp.sh

# OU teste manualmente
curl http://localhost:3001/api/v1/chat/mcp/health
```

## 📁 Arquitetura

### Pipeline com MCP (6 agentes)

```
Usuário → Interpreter → DataQuery → MCP → Responder → Suggestion → Enhancer
                                      ↑
                                  Novo Agente
```

### Estrutura de Código

```
src/
├── infrastructure/mcp/
│   ├── mcp-client.ts         # Cliente HTTP MCP
│   └── mcp-service.ts        # Gerenciador de servidores
│
├── modules/chat/agents/
│   └── mcp.agent.ts          # 6º agente - MCP
│
└── config/
    └── mcp.ts                # Configuração

examples/
└── mcp-server-example.js     # Servidor de teste
```

## 🛠️ Como Funciona

### 1. Interpretação
```typescript
// Interpreter Agent detecta necessidade de ferramenta externa
{
  intent: "Buscar informações externas",
  requiresExternalTools: true,  // ← MCP será acionado
  confidence: 0.9
}
```

### 2. Seleção de Tool
```typescript
// MCP Agent usa IA para decidir qual tool usar
const decision = await aiProvider.generateText([{
  role: 'user',
  content: `
    Pergunta: "${userQuery}"
    Tools disponíveis: ${JSON.stringify(tools)}
    Escolha a tool apropriada e seus parâmetros.
  `
}]);
```

### 3. Execução
```typescript
// Executa a tool no servidor MCP
const result = await mcpService.callTool(
  'example',           // servidor
  'get_weather',       // tool
  { city: 'São Paulo' } // argumentos
);
```

### 4. Integração
```typescript
// Resultado é adicionado ao contexto
context.mcpResults = {
  tool: 'get_weather',
  server: 'example',
  data: { temp: 25, condition: 'Ensolarado' }
};
```

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Habilitar MCP globalmente
ENABLE_MCP=true

# Servidor 1
MCP_SERVER_1_NAME=example
MCP_SERVER_1_URL=http://localhost:8080
MCP_SERVER_1_API_KEY=optional-api-key
MCP_SERVER_1_ENABLED=true
MCP_SERVER_1_DESCRIPTION=Servidor de exemplo

# Servidor 2
MCP_SERVER_2_NAME=production
MCP_SERVER_2_URL=https://api.example.com
MCP_SERVER_2_API_KEY=your-api-key
MCP_SERVER_2_ENABLED=true

# Servidor 3
MCP_SERVER_3_NAME=custom
MCP_SERVER_3_URL=http://custom-server:3000
MCP_SERVER_3_ENABLED=false
```

### Configuração Manual

Edite `src/config/mcp.ts`:

```typescript
export const manualMCPConfig: MCPServerConfig[] = [
  {
    name: 'my-server',
    url: 'http://localhost:8080',
    apiKey: 'optional-key',
    enabled: true,
    description: 'Meu servidor customizado'
  }
];
```

## 📡 Protocolo MCP HTTP

### Endpoints Obrigatórios

Seu servidor MCP deve implementar:

#### 1. Health Check
```http
GET /health
→ 200 OK
```

#### 2. Listar Tools
```http
POST /tools/list
→ {
  "tools": [
    {
      "name": "tool_name",
      "description": "Tool description",
      "inputSchema": {
        "type": "object",
        "properties": { ... },
        "required": ["param1"]
      }
    }
  ]
}
```

#### 3. Executar Tool
```http
POST /tools/call
Content-Type: application/json

{
  "name": "tool_name",
  "arguments": { "param1": "value1" }
}

→ {
  "content": [
    {
      "type": "text",
      "text": "Result..."
    }
  ],
  "isError": false
}
```

#### 4. Listar Recursos (Opcional)
```http
POST /resources/list
→ {
  "resources": [
    {
      "uri": "resource://path",
      "name": "Resource Name",
      "mimeType": "text/plain"
    }
  ]
}
```

#### 5. Ler Recurso (Opcional)
```http
POST /resources/read
Content-Type: application/json

{
  "uri": "resource://path"
}

→ {
  "content": [
    {
      "type": "text",
      "text": "Resource content..."
    }
  ]
}
```

## 🎯 Criando um Servidor MCP

### Template Mínimo (Node.js)

```javascript
const express = require('express');
const app = express();
app.use(express.json());

// Health
app.get('/health', (req, res) => res.send('OK'));

// List Tools
app.post('/tools/list', (req, res) => {
  res.json({
    tools: [
      {
        name: 'my_tool',
        description: 'Does something useful',
        inputSchema: {
          type: 'object',
          properties: {
            input: { type: 'string' }
          },
          required: ['input']
        }
      }
    ]
  });
});

// Call Tool
app.post('/tools/call', (req, res) => {
  const { name, arguments: args } = req.body;
  
  if (name === 'my_tool') {
    res.json({
      content: [
        {
          type: 'text',
          text: `Processed: ${args.input}`
        }
      ]
    });
  } else {
    res.status(404).json({
      content: [{ type: 'text', text: 'Tool not found' }],
      isError: true
    });
  }
});

app.listen(8080, () => console.log('MCP Server on 8080'));
```

### Template Python (Flask)

```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/health')
def health():
    return 'OK'

@app.route('/tools/list', methods=['POST'])
def list_tools():
    return jsonify({
        'tools': [
            {
                'name': 'my_tool',
                'description': 'Does something useful',
                'inputSchema': {
                    'type': 'object',
                    'properties': {
                        'input': {'type': 'string'}
                    },
                    'required': ['input']
                }
            }
        ]
    })

@app.route('/tools/call', methods=['POST'])
def call_tool():
    data = request.json
    name = data['name']
    args = data['arguments']
    
    if name == 'my_tool':
        return jsonify({
            'content': [
                {
                    'type': 'text',
                    'text': f'Processed: {args["input"]}'
                }
            ]
        })
    else:
        return jsonify({
            'content': [{'type': 'text', 'text': 'Tool not found'}],
            'isError': True
        }), 404

if __name__ == '__main__':
    app.run(port=8080)
```

## 🧪 Testando

### 1. Teste Manual via cURL

```bash
# 1. Health do servidor MCP
curl http://localhost:8080/health

# 2. Listar tools
curl -X POST http://localhost:8080/tools/list

# 3. Executar tool
curl -X POST http://localhost:8080/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"my_tool","arguments":{"input":"test"}}'

# 4. Health do sistema principal
curl http://localhost:3001/api/v1/chat/mcp/health

# 5. Listar tools integradas
curl http://localhost:3001/api/v1/chat/mcp/tools

# 6. Chat usando MCP
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Use my_tool com input teste","userId":"dev"}'
```

### 2. Teste Automatizado

```bash
# Execute script de teste
./test-mcp.sh
```

### 3. Usando REST Client (VSCode)

Abra `mcp-requests.http` no VSCode com REST Client extension.

## 🔍 Debug

### Logs

```bash
# Inicie com logs detalhados
DEBUG=* bun dev
```

Procure por:
```
[Chat Service] MCP enabled with N servers
[MCP Agent] Processing...
[MCP Agent] Successfully executed tool: tool_name
[MCP Service] Failed to list tools from server: error
```

### Verificar Estado

```bash
# 1. Servidores configurados
curl http://localhost:3001/api/v1/chat/mcp/servers | jq

# 2. Saúde dos servidores
curl http://localhost:3001/api/v1/chat/mcp/health | jq

# 3. Tools disponíveis
curl http://localhost:3001/api/v1/chat/mcp/tools | jq
```

## 💡 Dicas de Desenvolvimento

### 1. Desabilitar MCP temporariamente
```env
ENABLE_MCP=false
```

### 2. Testar sem servidor MCP
O sistema funciona normalmente sem MCP habilitado.

### 3. Adicionar novos servidores
Basta adicionar variáveis de ambiente:
```env
MCP_SERVER_4_NAME=new-server
MCP_SERVER_4_URL=http://...
MCP_SERVER_4_ENABLED=true
```

### 4. Forçar uso de MCP
Use keywords na pergunta:
- "busque na web"
- "pesquise online"
- "informação externa"
- "dados externos"

### 5. Debug no MCP Agent
Adicione logs temporários:
```typescript
// src/modules/chat/agents/mcp.agent.ts
console.log('[DEBUG] Should use MCP:', shouldUseMCP);
console.log('[DEBUG] Available tools:', tools);
console.log('[DEBUG] Decision:', decision);
```

## 🎨 Customização

### Adicionar nova Tool

1. **No servidor MCP** (`examples/mcp-server-example.js`):

```javascript
// Adicione em tools/list
{
  name: 'my_new_tool',
  description: 'What it does',
  inputSchema: {
    type: 'object',
    properties: {
      param1: { type: 'string' }
    },
    required: ['param1']
  }
}

// Adicione handler em tools/call
case 'my_new_tool':
  result = handleMyNewTool(args);
  break;

function handleMyNewTool(args) {
  const { param1 } = args;
  return `Result for ${param1}`;
}
```

2. **Teste**:
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Use my_new_tool com param1 teste","userId":"dev"}'
```

### Modificar Decisão de Uso MCP

Edite `src/modules/chat/agents/mcp.agent.ts`:

```typescript
private shouldUseMCP(context: AgentContext): boolean {
  // Adicione suas regras customizadas
  if (context.userQuery.includes('minha_keyword')) {
    return true;
  }
  
  // Regras existentes...
  return false;
}
```

## 📚 Recursos

### Documentação
- **Completa**: `ai-docs/MCP_INTEGRATION.md`
- **Quick Start**: `MCP_QUICKSTART.md`
- **Resumo**: `ai-docs/MCP_SUMMARY.md`
- **Pipeline**: `ai-docs/PIPELINE_AGENTES.md`

### Exemplos
- **Servidor**: `examples/mcp-server-example.js`
- **Requests**: `mcp-requests.http`
- **Testes**: `test-mcp.sh`

### Links Externos
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [MCP GitHub](https://github.com/modelcontextprotocol)

## 🤝 Contribuindo

### Adicionar Novo Servidor MCP

1. Crie o servidor seguindo o protocolo
2. Configure em `.env` ou `config/mcp.ts`
3. Teste com `./test-mcp.sh`
4. Documente as tools disponíveis

### Reportar Issues

Include:
- Logs do servidor principal
- Logs do servidor MCP
- Configuração (sem API keys)
- Passos para reproduzir

---

**Happy coding!** 🚀

Para dúvidas, consulte a documentação completa em `ai-docs/MCP_INTEGRATION.md`.
