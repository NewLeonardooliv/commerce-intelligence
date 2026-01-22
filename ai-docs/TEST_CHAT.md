# Como Testar o Sistema de Chat

## ✅ Bug Corrigido

**Problema**: `parseInt(sessionId)` resultava em `NaN` quando sessionId era undefined ou inválido  
**Solução**: Validação antes de usar no banco de dados

## 🚀 Passos para Testar

### 1. Verificar se o servidor está rodando

```bash
# Terminal 1 - Iniciar servidor
bun dev
```

Deve mostrar:
```
🚀 Server is running at http://localhost:3001
📚 API Documentation: http://localhost:3001/swagger
```

### 2. Testar sem banco de dados (validação)

```bash
# Deve retornar erro 422 (validação)
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 3. Setup do Banco de Dados (se ainda não fez)

```bash
# Terminal 2
bun run db:push
bun run db:seed
```

### 4. Primeira Mensagem (sem sessionId)

```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Olá, quais produtos temos?",
    "userId": "test-user"
  }'
```

**Resposta esperada**:
```json
{
  "success": true,
  "data": {
    "sessionId": "1",
    "response": "...",
    "metadata": {
      "dataUsed": true,
      "confidence": 0.xx,
      "suggestions": [...]
    }
  }
}
```

### 5. Continuar Conversa (com sessionId)

```bash
# Use o sessionId da resposta anterior
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Qual o mais caro?",
    "sessionId": "1",
    "userId": "test-user"
  }'
```

### 6. Ver Sessões

```bash
curl http://localhost:3001/api/v1/chat/sessions
```

### 7. Ver Histórico de uma Sessão

```bash
curl http://localhost:3001/api/v1/chat/sessions/1
```

## 🔍 Exemplos de Perguntas para Testar

### Produtos
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Quais produtos temos no estoque?"}'

curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Mostre os 5 produtos mais caros"}'
```

### Vendas
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Qual foi o total de vendas?"}'

curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Quantos pedidos foram feitos?"}'
```

### Clientes
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Quantos clientes temos?"}'

curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Mostre clientes de São Paulo"}'
```

## 📊 Verificar Resposta

Uma resposta bem-sucedida deve ter:

✅ `success: true`  
✅ `sessionId` (número como string)  
✅ `response` (texto da resposta)  
✅ `metadata.dataUsed` (true se consultou banco)  
✅ `metadata.confidence` (0.0 a 1.0)  
✅ `metadata.suggestions` (array de sugestões)

## 🐛 Troubleshooting

### Erro: "DATABASE_URL is not configured"
```bash
# Adicione no .env
DATABASE_URL=postgresql://user:password@localhost:5432/commerce_intelligence
```

### Erro: "relation does not exist"
```bash
# Execute as migrations
bun run db:push
```

### Erro: Respostas vazias ou genéricas
```bash
# 1. Verifique se populou o banco
bun run db:seed

# 2. Configure OpenAI (opcional, para respostas melhores)
AI_PROVIDER=openai
AI_API_KEY=sk-your-key-here
```

### Erro: Connection refused
```bash
# Verifique se o servidor está rodando
ps aux | grep bun

# Se não estiver, inicie
bun dev
```

## 📖 Documentação Interativa

Acesse o Swagger UI para testar visualmente:
```
http://localhost:3001/swagger
```

## ✅ Checklist de Teste

- [ ] Servidor iniciado
- [ ] Banco de dados criado (`db:push`)
- [ ] Dados populados (`db:seed`)
- [ ] Primeira mensagem funciona
- [ ] SessionId é retornado
- [ ] Conversa mantém contexto
- [ ] Consultas ao banco funcionam
- [ ] Sugestões são geradas
- [ ] Histórico é salvo

## 🎯 Teste Completo

Execute este script para testar todo o fluxo:

```bash
#!/bin/bash

echo "🧪 Testando Sistema de Chat"
echo ""

# Teste 1: Validação
echo "1️⃣ Testando validação..."
curl -s -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{}' | grep -q "422" && echo "✅ Validação OK" || echo "❌ Validação falhou"

# Teste 2: Primeira mensagem
echo "2️⃣ Enviando primeira mensagem..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Quais produtos temos?", "userId": "test"}')

echo $RESPONSE | grep -q "success" && echo "✅ Mensagem enviada" || echo "❌ Erro ao enviar"

# Teste 3: Listar sessões
echo "3️⃣ Listando sessões..."
curl -s http://localhost:3001/api/v1/chat/sessions | grep -q "success" && echo "✅ Sessões listadas" || echo "❌ Erro ao listar"

echo ""
echo "✅ Testes completos!"
```

Salve como `test-chat.sh` e execute:
```bash
chmod +x test-chat.sh
./test-chat.sh
```
