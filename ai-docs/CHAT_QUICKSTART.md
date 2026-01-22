# Chat API - Guia Rápido

## 🚀 Setup Inicial

### 1. Configurar Banco de Dados

Edite o `.env` com suas credenciais PostgreSQL:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/commerce_intelligence
```

### 2. Criar Tabelas

```bash
bun run db:generate
bun run db:push
```

### 3. Popular com Dados de Exemplo

```bash
bun run db:seed
```

Isso criará:
- 10 produtos
- 5 clientes
- 5 pedidos com itens

### 4. Iniciar Servidor

```bash
bun dev
```

## 💬 Testando o Chat

### Exemplo 1: Primeira Mensagem

```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Quais produtos temos no estoque?",
    "userId": "user123"
  }'
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "sessionId": "1",
    "response": "Temos 10 produtos em estoque...",
    "metadata": {
      "dataUsed": true,
      "confidence": 0.88,
      "suggestions": [
        "Qual produto tem mais estoque?",
        "Mostre os produtos por categoria"
      ]
    }
  }
}
```

### Exemplo 2: Continuando a Conversa

```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Qual o produto mais caro?",
    "sessionId": "1",
    "userId": "user123"
  }'
```

### Exemplo 3: Análise de Vendas

```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Qual foi o total de vendas?",
    "userId": "user123"
  }'
```

### Exemplo 4: Consulta de Clientes

```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Quantos clientes temos cadastrados?",
    "userId": "user123"
  }'
```

## 🔍 Endpoints Disponíveis

### POST /api/v1/chat
Enviar mensagem

### GET /api/v1/chat/sessions
Listar sessões

```bash
curl http://localhost:3001/api/v1/chat/sessions?userId=user123
```

### GET /api/v1/chat/sessions/:sessionId
Ver histórico da sessão

```bash
curl http://localhost:3001/api/v1/chat/sessions/1
```

## 🤖 Como Funciona

O chat usa **4 agentes especializados** em sequência:

1. **Interpretador** - Entende sua pergunta
2. **Consulta** - Busca dados no PostgreSQL
3. **Respondedor** - Cria resposta inicial
4. **Aprimorador** - Melhora a resposta final

## 📊 Exemplos de Perguntas

**Produtos**:
- "Quais produtos temos disponíveis?"
- "Mostre os 5 produtos mais caros"
- "Qual o estoque total?"
- "Quantos produtos por categoria?"

**Vendas**:
- "Qual foi o faturamento total?"
- "Quantos pedidos foram feitos?"
- "Qual o valor médio dos pedidos?"
- "Quais pedidos estão pendentes?"

**Clientes**:
- "Quantos clientes temos?"
- "Quem são os clientes de São Paulo?"
- "Liste os clientes que mais compraram"

**Análises Complexas**:
- "Qual categoria vende mais?"
- "Qual o ticket médio por cliente?"
- "Compare vendas por estado"

## 🔧 Configuração Avançada

### Usar OpenAI (recomendado para produção)

```env
AI_PROVIDER=openai
AI_API_KEY=sk-your-key-here
AI_MODEL=gpt-4-turbo-preview
```

### Usar Mock (desenvolvimento)

```env
AI_PROVIDER=mock
```

## 📚 Swagger UI

Acesse a documentação interativa:

```
http://localhost:3001/swagger
```

## 🐛 Troubleshooting

### Erro: "DATABASE_URL is not configured"
Configure a variável `DATABASE_URL` no `.env`

### Erro: "relation does not exist"
Execute as migrations:
```bash
bun run db:push
```

### Banco vazio
Popule com dados:
```bash
bun run db:seed
```

### Respostas genéricas
Configure AI_PROVIDER=openai com uma API key válida

## 📈 Próximos Passos

1. Adicione mais produtos ao seed
2. Configure webhooks para notificações
3. Implemente autenticação de usuários
4. Adicione análises em tempo real
5. Crie dashboard frontend

## 💡 Dicas

- Use `sessionId` para manter contexto da conversa
- Veja os `suggestions` para próximas perguntas
- Consulte o `confidence` para avaliar qualidade
- Use `sources` para entender origem dos dados
