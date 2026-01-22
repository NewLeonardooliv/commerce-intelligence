# Sistema de Chat com Agentes Inteligentes

## Visão Geral

O sistema de chat utiliza **4 agentes especializados** que trabalham em conjunto para fornecer respostas de alta qualidade sobre dados de e-commerce.

## Arquitetura dos Agentes

### 1. **Agente Interpretador** (`InterpreterAgent`)
**Responsabilidade**: Entender a intenção do usuário

- Analisa a pergunta do usuário
- Extrai entidades (datas, categorias, métricas)
- Determina se precisa consultar dados
- Sugere queries SQL relevantes
- Retorna confiança da interpretação

**Exemplo**:
```json
{
  "intent": "Análise de vendas por categoria",
  "entities": {
    "period": "último mês",
    "metric": "receita"
  },
  "requiresData": true,
  "confidence": 0.92
}
```

### 2. **Agente de Consulta** (`DataQueryAgent`)
**Responsabilidade**: Buscar dados no PostgreSQL

- Recebe interpretação do usuário
- Gera SQL seguro e otimizado
- Executa query no banco de dados
- Retorna dados estruturados
- Trata erros de execução

**Features**:
- Geração automática de SQL com IA
- Validação de segurança (previne DROP, DELETE)
- Suporte a JOINs e agregações
- Limitação automática de resultados

### 3. **Agente Respondedor** (`ResponderAgent`)
**Responsabilidade**: Gerar resposta inicial

- Analisa dados retornados
- Cria resposta conversacional
- Destaca insights importantes
- Resume informações relevantes
- Mantém tom profissional

### 4. **Agente Aprimorador** (`EnhancerAgent`)
**Responsabilidade**: Melhorar a resposta final

- Refina linguagem e estrutura
- Adiciona formatação
- Calcula confiança da resposta
- Sugere perguntas de acompanhamento
- Identifica fontes de dados

## Fluxo de Processamento

```
┌─────────────────────────────────────────────────────┐
│  Usuário: "Quais os produtos mais vendidos?"       │
└──────────────────┬──────────────────────────────────┘
                   │
                   v
┌─────────────────────────────────────────────────────┐
│  AGENTE 1: Interpretador                            │
│  - Intent: Análise de produtos                      │
│  - Requer dados: Sim                                │
│  - Confiança: 0.95                                  │
└──────────────────┬──────────────────────────────────┘
                   │
                   v
┌─────────────────────────────────────────────────────┐
│  AGENTE 2: Consulta de Dados                        │
│  - SQL gerado e executado                           │
│  - 15 produtos retornados                           │
└──────────────────┬──────────────────────────────────┘
                   │
                   v
┌─────────────────────────────────────────────────────┐
│  AGENTE 3: Respondedor                              │
│  - Resposta criada com base nos dados               │
│  - Insights identificados                           │
└──────────────────┬──────────────────────────────────┘
                   │
                   v
┌─────────────────────────────────────────────────────┐
│  AGENTE 4: Aprimorador                              │
│  - Resposta refinada                                │
│  - Sugestões adicionadas                            │
│  - Confiança: 0.88                                  │
└──────────────────┬──────────────────────────────────┘
                   │
                   v
┌─────────────────────────────────────────────────────┐
│  Resposta Final ao Usuário                          │
└─────────────────────────────────────────────────────┘
```

## API Endpoints

### POST /api/v1/chat

Enviar mensagem para o chat.

**Request**:
```json
{
  "message": "Quais os produtos mais vendidos no último mês?",
  "sessionId": "opcional-session-id",
  "userId": "user123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": "12345",
    "response": "Baseado nos dados de vendas do último mês...",
    "metadata": {
      "interpretation": { ... },
      "dataUsed": true,
      "sources": ["Banco de dados de produtos", "Histórico de pedidos"],
      "confidence": 0.88,
      "suggestions": [
        "Como está o estoque desses produtos?",
        "Qual a margem de lucro por categoria?",
        "Quem são os principais compradores?"
      ]
    },
    "history": [...]
  }
}
```

### GET /api/v1/chat/sessions

Listar sessões de chat.

**Query Parameters**:
- `userId` (opcional): Filtrar por usuário

### GET /api/v1/chat/sessions/:sessionId

Obter detalhes de uma sessão específica.

## Schema do Banco de Dados

### Tabelas de E-commerce

```sql
-- Produtos
products (id, name, description, price, category, stock)

-- Clientes
customers (id, name, email, phone, address, city, state)

-- Pedidos
orders (id, customer_id, total, status, created_at)

-- Itens do Pedido
order_items (id, order_id, product_id, quantity, price, subtotal)
```

### Tabelas de Chat

```sql
-- Sessões de Chat
chat_sessions (id, user_id, context, created_at, updated_at)

-- Mensagens
chat_messages (id, session_id, role, content, metadata, created_at)
```

## Configuração

### Variáveis de Ambiente

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/commerce

# AI Provider
AI_PROVIDER=openai  # ou "mock" para desenvolvimento
AI_API_KEY=sk-...
AI_MODEL=gpt-4-turbo-preview
```

### Inicialização do Banco

```bash
# Gerar migration
bun drizzle-kit generate

# Executar migration
bun drizzle-kit push
```

## Exemplos de Uso

### Exemplo 1: Análise de Vendas
```bash
curl -X POST http://localhost:3000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Qual foi o faturamento total este mês?"
  }'
```

### Exemplo 2: Consulta de Produtos
```bash
curl -X POST http://localhost:3000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Mostre os 5 produtos com maior estoque",
    "sessionId": "12345"
  }'
```

### Exemplo 3: Análise de Clientes
```bash
curl -X POST http://localhost:3000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Quem são os clientes que mais compraram?"
  }'
```

## Desenvolvimento

### Adicionar Novo Agente

1. Criar arquivo em `src/modules/chat/agents/`
2. Implementar interface `IAgent`
3. Adicionar ao orquestrador

```typescript
export class CustomAgent implements IAgent {
  role = 'custom' as const;

  async process(context: AgentContext): Promise<AgentContext> {
    // Lógica do agente
    return context;
  }
}
```

### Personalizar Prompts

Os prompts de cada agente estão nos arquivos individuais e podem ser ajustados para melhorar as respostas.

## Segurança

- ✅ Validação de SQL (previne injeção)
- ✅ Limitação de resultados
- ✅ Sanitização de inputs
- ✅ Logs de auditoria
- ✅ Rate limiting (configurar)

## Performance

- Queries otimizadas com LIMIT
- Cache de sessões (futuro)
- Processamento assíncrono
- Connection pooling

## Monitoramento

Logs são gerados para cada etapa:
```
[Orchestrator] Processing query: "..."
[Orchestrator] Running agent: interpreter
[Orchestrator] Agent interpreter completed
[Orchestrator] Running agent: data_query
...
```

## Troubleshooting

### Erro: "DATABASE_URL is not configured"
Configure a variável no `.env`:
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
```

### Erro: Query execution failed
Verifique:
- Conexão com banco de dados
- Sintaxe SQL gerada
- Permissões do usuário

### Resposta de baixa qualidade
Ajuste os prompts dos agentes ou:
- Configure AI_PROVIDER=openai (em vez de mock)
- Adicione API key válida
