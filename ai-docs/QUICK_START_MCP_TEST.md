# 🚀 Quick Start - MCP Test Routes

Guia rápido para testar a integração MCP com Google ADK.

## ⚡ Setup Rápido (< 2 minutos)

### 1. Configure as Variáveis de Ambiente

Crie ou edite o arquivo `.env`:

```bash
# Obrigatório - Chave da API do Google Gemini
GOOGLE_API_KEY=sua_chave_aqui

# Opcional - URL do servidor MCP (padrão: http://localhost:8080/mcp)
MCP_SERVER_URL=http://localhost:8080/mcp

# Opcional - Habilitar MCP (padrão: true)
MCP_ENABLED=true
```

### 2. Inicie o Servidor

```bash
# Instalar dependências (se necessário)
bun install

# Iniciar o servidor
bun run dev
```

### 3. Teste Básico

```bash
# Verificar se está funcionando
curl http://localhost:3000/api/v1/mcp-test/health | jq

# Enviar seu primeiro prompt
curl -X POST http://localhost:3000/api/v1/mcp-test/prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello! What can you do?"}' | jq
```

✅ **Pronto!** Se recebeu resposta, está funcionando.

---

## 📋 Endpoints Disponíveis

### 1. Health Check
```bash
GET /api/v1/mcp-test/health
```

**Exemplo:**
```bash
curl http://localhost:3000/api/v1/mcp-test/health
```

### 2. List Tools
```bash
GET /api/v1/mcp-test/tools
```

**Exemplo:**
```bash
curl http://localhost:3000/api/v1/mcp-test/tools
```

### 3. Send Prompt
```bash
POST /api/v1/mcp-test/prompt
Content-Type: application/json

{
  "prompt": "Your question here",
  "sessionId": "optional-session-id"
}
```

**Exemplo:**
```bash
curl -X POST http://localhost:3000/api/v1/mcp-test/prompt \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What tools are available?",
    "sessionId": "my-test-session"
  }'
```

---

## 🎯 Exemplos de Uso

### Exemplo 1: Introdução Básica

```bash
curl -X POST http://localhost:3000/api/v1/mcp-test/prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello! Can you introduce yourself?"}' | jq
```

### Exemplo 2: Listar Ferramentas

```bash
curl -X POST http://localhost:3000/api/v1/mcp-test/prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What tools do you have access to?"}' | jq
```

### Exemplo 3: Usar uma Ferramenta

```bash
curl -X POST http://localhost:3000/api/v1/mcp-test/prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Use any available tool to demonstrate how MCP works"}' | jq
```

### Exemplo 4: Conversação com Contexto

```bash
# Primeira mensagem
curl -X POST http://localhost:3000/api/v1/mcp-test/prompt \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What tools are available?",
    "sessionId": "my-session-123"
  }' | jq

# Segunda mensagem (mesma sessão)
curl -X POST http://localhost:3000/api/v1/mcp-test/prompt \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Can you explain what the first tool does?",
    "sessionId": "my-session-123"
  }' | jq
```

---

## 🧪 Scripts de Teste Automatizados

### Bash Script

```bash
# Executar suite completa de testes
./scripts/test-mcp.sh
```

### JavaScript/Node.js

```bash
# Executar testes em JavaScript
node scripts/examples/test-mcp.js
```

### Python

```bash
# Instalar dependências
pip install requests

# Executar testes em Python
python scripts/examples/test-mcp.py
```

---

## 📦 Postman/Insomnia

Importe a collection para teste visual:

**Arquivo:** `scripts/postman/mcp-test-collection.json`

1. Abra o Postman ou Insomnia
2. Importe o arquivo da collection
3. Configure a variável `baseUrl` se necessário
4. Execute os requests

---

## 🐛 Troubleshooting

### Erro: "GOOGLE_API_KEY is required"

**Solução:**
```bash
# Adicione a chave no .env
echo "GOOGLE_API_KEY=sua_chave_aqui" >> .env

# Reinicie o servidor
bun run dev
```

### Erro: "Session not found"

**Solução:**
Este erro foi corrigido na implementação. Se ainda ocorrer:
1. Reinicie o servidor: `bun run dev`
2. Limpe o cache: `rm -rf node_modules && bun install`

### Erro: "MCP server connection failed"

**Solução:**
1. Verifique se o servidor MCP está rodando
2. Verifique a URL em `MCP_SERVER_URL`
3. Teste a conectividade: `curl http://localhost:8080/mcp`

### Erro: "No response generated"

**Solução:**
1. Verifique os logs do servidor
2. Tente um prompt mais específico
3. Verifique se as ferramentas MCP estão disponíveis:
   ```bash
   curl http://localhost:3000/api/v1/mcp-test/tools
   ```

### 📖 Guia Completo de Troubleshooting

Para problemas mais complexos, consulte o guia completo:
- [MCP Troubleshooting Guide](ai-docs/MCP_TROUBLESHOOTING_GUIDE.md)

---

## 📚 Documentação Completa

- **API Docs:** [ai-docs/MCP_TEST.md](ai-docs/MCP_TEST.md)
- **Scripts:** [scripts/README.md](scripts/README.md)
- **Swagger:** http://localhost:3000/swagger
- **Google ADK:** https://google.github.io/adk-docs

---

## 💡 Dicas

1. **Use sessionId** para manter contexto entre mensagens
2. **Verifique o health** antes de testar prompts
3. **Liste as tools** para saber o que está disponível
4. **Veja os logs** do servidor para debug detalhado
5. **Use o Swagger** para testar visualmente

---

## 🎉 Próximos Passos

Depois de testar:

1. Integre a rota em sua aplicação
2. Customize os prompts para seu caso de uso
3. Adicione autenticação se necessário
4. Implemente rate limiting para produção
5. Configure monitoramento e métricas

---

## 🆘 Precisa de Ajuda?

- Verifique os logs do servidor
- Consulte a documentação completa em `/ai-docs`
- Execute os scripts de teste automatizados
- Use o Swagger para testar interativamente

---

**Enjoy testing MCP! 🚀**
