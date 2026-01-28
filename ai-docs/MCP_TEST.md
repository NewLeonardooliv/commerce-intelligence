# MCP Test Routes

Este documento descreve as rotas de teste criadas para testar a integração do MCP (Model Context Protocol) com Google ADK.

## Visão Geral

As rotas de teste permitem enviar prompts diretamente ao agente MCP e receber respostas, facilitando o desenvolvimento e debug da integração com o servidor MCP.

## Endpoints Disponíveis

### 1. POST `/api/v1/mcp-test/prompt`

Envia um prompt para o agente MCP e recebe a resposta processada.

**Request Body:**
```json
{
  "prompt": "What tools are available?",
  "sessionId": "optional-session-id"
}
```

**Campos:**
- `prompt` (string, obrigatório): O prompt/mensagem a ser enviado ao agente MCP
- `sessionId` (string, opcional): ID da sessão para continuidade da conversa. Se não fornecido, será gerado automaticamente.

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "generated-or-provided-session-id",
    "prompt": "What tools are available?",
    "response": "Response from MCP agent with available tools...",
    "timestamp": "2026-01-27T10:30:00.000Z",
    "metadata": {
      "toolsUsed": ["tool1", "tool2"],
      "processingTime": 1234
    }
  }
}
```

**Exemplo de uso com curl:**
```bash
curl -X POST http://localhost:3000/api/v1/mcp-test/prompt \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "List all available tools"
  }'
```

**Exemplo com sessão contínua:**
```bash
# Primeira requisição
curl -X POST http://localhost:3000/api/v1/mcp-test/prompt \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Hello, what can you do?",
    "sessionId": "my-test-session"
  }'

# Segunda requisição na mesma sessão
curl -X POST http://localhost:3000/api/v1/mcp-test/prompt \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Can you list the tools available?",
    "sessionId": "my-test-session"
  }'
```

### 2. GET `/api/v1/mcp-test/health`

Verifica o status de saúde da conexão com o servidor MCP.

**Response:**
```json
{
  "success": true,
  "data": {
    "healthy": true,
    "serverUrl": "http://localhost:8080/mcp",
    "adkEnabled": true,
    "googleApiKeyConfigured": true,
    "message": "MCP server is connected and ADK agent is ready"
  }
}
```

**Exemplo de uso:**
```bash
curl http://localhost:3000/api/v1/mcp-test/health
```

### 3. GET `/api/v1/mcp-test/tools`

Lista todas as ferramentas disponíveis no servidor MCP.

**Response:**
```json
{
  "success": true,
  "data": {
    "tools": ["tool1", "tool2", "tool3"]
  }
}
```

**Exemplo de uso:**
```bash
curl http://localhost:3000/api/v1/mcp-test/tools
```

## Exemplos de Prompts para Teste

### Teste Básico
```json
{
  "prompt": "Hello! Can you introduce yourself?"
}
```

### Listar Ferramentas
```json
{
  "prompt": "What tools do you have access to?"
}
```

### Executar Ferramenta Específica
```json
{
  "prompt": "Use the search tool to find information about AI"
}
```

### Teste com Contexto
```json
{
  "prompt": "Can you help me analyze some data?",
  "sessionId": "analysis-session-1"
}
```

## Configuração Necessária

Para usar as rotas de teste, certifique-se de que as seguintes variáveis de ambiente estão configuradas:

```bash
# Obrigatório - Chave da API do Google para usar o Gemini
GOOGLE_API_KEY=sua_chave_aqui

# Opcional - URL do servidor MCP (padrão: http://localhost:8080/mcp)
MCP_SERVER_URL=http://localhost:8080/mcp

# Opcional - Habilitar/desabilitar MCP (padrão: true)
MCP_ENABLED=true
```

## Arquitetura

### Fluxo de Processamento

1. **Recepção do Prompt**: O controller recebe o prompt via POST
2. **Criação da Sessão**: O service cria ou usa uma sessão existente
3. **Processamento ADK**: 
   - O `LlmAgent` do ADK recebe o prompt
   - O agente decide quais ferramentas MCP usar
   - O `MCPToolset` executa as ferramentas necessárias
   - O modelo Gemini processa os resultados
4. **Resposta**: O resultado é retornado formatado ao cliente

### Componentes

- **mcpTestController**: Controller Elysia que define os endpoints
- **mcpTestService**: Service que gerencia o agente ADK e o cliente MCP
- **MCPHttpClient**: Cliente que conecta ao servidor MCP via HTTP/SSE
- **LlmAgent (ADK)**: Agente do Google ADK que processa prompts e usa ferramentas MCP

## Debugging

### Logs

O service gera logs detalhados durante o processamento:

```
[MCP Test Service] Initializing...
[MCP Test Service] Initialized successfully
[MCP Test Service] Processing prompt in session abc123
[MCP Test Service] Prompt: What tools are available?
[MCP Test Service] Event: { id: '1', author: 'mcp_test_agent', finalResponse: false }
[MCP Test Service] Event: { id: '2', author: 'tool_name', finalResponse: false }
[MCP Test Service] Event: { id: '3', author: 'mcp_test_agent', finalResponse: true }
[MCP Test Service] Response generated in 1234ms
```

### Verificar Status

Antes de testar, verifique o status:

```bash
# Verificar se o MCP está saudável
curl http://localhost:3000/api/v1/mcp-test/health

# Listar ferramentas disponíveis
curl http://localhost:3000/api/v1/mcp-test/tools
```

### Erros Comuns

#### "MCP Test Agent not initialized"
- **Causa**: GOOGLE_API_KEY não está configurada
- **Solução**: Configure a variável de ambiente GOOGLE_API_KEY

#### "MCP server connection failed"
- **Causa**: Servidor MCP não está rodando ou URL está incorreta
- **Solução**: 
  - Verifique se o servidor MCP está rodando em http://localhost:8080/mcp
  - Verifique a variável MCP_SERVER_URL

#### "No response generated"
- **Causa**: O agente não conseguiu processar o prompt
- **Solução**: 
  - Verifique os logs para detalhes
  - Tente um prompt mais específico
  - Verifique se as ferramentas MCP estão disponíveis

## Testes Automatizados

Você pode criar scripts de teste para validar a integração:

```bash
#!/bin/bash
# test-mcp.sh

BASE_URL="http://localhost:3000/api/v1/mcp-test"

echo "1. Checking MCP health..."
curl -s "$BASE_URL/health" | jq

echo "\n2. Listing available tools..."
curl -s "$BASE_URL/tools" | jq

echo "\n3. Testing basic prompt..."
curl -s -X POST "$BASE_URL/prompt" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, what can you do?"}' | jq

echo "\n4. Testing tool usage..."
curl -s -X POST "$BASE_URL/prompt" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "List all available tools"}' | jq
```

## Swagger/OpenAPI

As rotas de teste estão documentadas no Swagger da aplicação:

- Acesse: http://localhost:3000/swagger
- Procure pela tag "MCP Test"
- Teste diretamente pela interface do Swagger

## Próximos Passos

1. Adicionar autenticação se necessário
2. Implementar rate limiting para testes
3. Adicionar métricas de uso das ferramentas MCP
4. Criar testes de integração automatizados
5. Adicionar suporte para streaming de respostas

## Referências

- [Google ADK Documentation](https://google.github.io/adk-docs)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Gemini API](https://ai.google.dev/gemini-api/docs)
