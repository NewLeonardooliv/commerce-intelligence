# 🚀 Quick Start - Sistema de Chat

## ✅ Bug Fix Aplicado

**Problema corrigido**: `parseInt(sessionId)` resultando em `NaN`  
**Status**: ✅ Resolvido e testado

---

## 📋 Pré-requisitos

- Bun instalado
- PostgreSQL rodando
- Porta 3001 disponível

---

## 🏃 Start Rápido (3 passos)

### 1. Setup do Banco

```bash
# Configure DATABASE_URL no .env
DATABASE_URL=postgresql://user:password@localhost:5432/commerce_intelligence

# Crie as tabelas
bun run db:push

# Popule com dados de exemplo
bun run db:seed
```

**Dados criados**:
- 10 produtos (Eletrônicos, Periféricos, etc.)
- 5 clientes (São Paulo, Rio, BH, etc.)
- 5 pedidos completos

### 2. Inicie o Servidor

```bash
bun dev
```

Aguarde ver:
```
🚀 Server is running at http://localhost:3001
📚 API Documentation: http://localhost:3001/swagger
```

### 3. Primeira Pergunta

```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Quais produtos temos no estoque?",
    "userId": "demo"
  }'
```

---

## 📖 Exemplos Rápidos

### Produtos
```bash
# Lista produtos
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Liste todos os produtos"}'

# Produtos mais caros
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Quais os 3 produtos mais caros?"}'

# Estoque por categoria
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Mostre o estoque por categoria"}'
```

### Vendas
```bash
# Total de vendas
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Qual foi o total de vendas?"}'

# Quantidade de pedidos
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Quantos pedidos temos?"}'
```

### Clientes
```bash
# Total de clientes
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Quantos clientes temos cadastrados?"}'

# Clientes por cidade
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Mostre clientes agrupados por cidade"}'
```

---

## 🔄 Manter Contexto

```bash
# Primeira mensagem
RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Quais produtos temos?", "userId": "user1"}')

# Extrair sessionId (com jq)
SESSION_ID=$(echo $RESPONSE | jq -r '.data.sessionId')

# Segunda mensagem com contexto
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Qual o mais caro?\", \"sessionId\": \"$SESSION_ID\", \"userId\": \"user1\"}"
```

---

## 📊 Ver Histórico

```bash
# Listar todas as sessões
curl http://localhost:3001/api/v1/chat/sessions

# Ver mensagens de uma sessão específica
curl http://localhost:3001/api/v1/chat/sessions/1
```

---

## 🌐 Interface Web (Swagger)

Acesse: `http://localhost:3001/swagger`

- Teste todos os endpoints visualmente
- Veja documentação completa
- Experimente diferentes queries

---

## 🔧 Configuração de IA

### Modo Mock (padrão)
```env
AI_PROVIDER=mock
```
✅ Funciona sem API key  
✅ Respostas simuladas  
⚠️ Qualidade básica

### Modo OpenAI (recomendado)
```env
AI_PROVIDER=openai
AI_API_KEY=sk-your-key-here
AI_MODEL=gpt-4-turbo-preview
```
✅ Respostas de alta qualidade  
✅ SQL gerado com precisão  
✅ Insights relevantes

---

## ⚡ Atalhos Úteis

```bash
# Ver logs do servidor
tail -f /tmp/server.log

# Resetar banco de dados
bun run db:push && bun run db:seed

# Executar testes
bun test

# Verificar tipos
bun run type-check

# Formatar código
bun run format
```

---

## 🐛 Troubleshooting

### ❌ Erro: "DATABASE_URL is not configured"
```bash
# Adicione no .env
echo 'DATABASE_URL=postgresql://user:pass@localhost:5432/commerce_intelligence' >> .env
```

### ❌ Erro: "relation does not exist"
```bash
# Execute migrations
bun run db:push
```

### ❌ Erro: "No data found"
```bash
# Popule o banco
bun run db:seed
```

### ❌ Porta 3001 em uso
```bash
# Mude a porta no .env
echo 'PORT=3002' >> .env
```

### ❌ Servidor não inicia
```bash
# Verifique dependências
bun install

# Verifique PostgreSQL
pg_isready
```

---

## 📈 Próximos Passos

1. ✅ Teste diferentes perguntas
2. ✅ Veja o histórico no Swagger
3. ✅ Configure OpenAI para melhor qualidade
4. ✅ Adicione mais dados com seed customizado
5. ✅ Integre com frontend

---

## 📚 Documentação Completa

- **TEST_CHAT.md** - Guia completo de testes
- **ai-docs/CHAT_SYSTEM.md** - Arquitetura dos agentes
- **chat-requests.http** - Mais exemplos
- **README.md** - Visão geral

---

## 🎯 Sucesso!

Se você conseguiu executar os 3 passos acima, o sistema está funcionando! 🎉

Agora você tem:
✅ API de chat funcionando  
✅ 4 agentes inteligentes processando  
✅ Integração com PostgreSQL  
✅ Respostas contextualizadas  
✅ Histórico de conversas
