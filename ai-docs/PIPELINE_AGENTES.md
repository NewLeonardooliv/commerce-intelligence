# 🔄 Pipeline de Agentes - Arquitetura Completa

## 📊 Diagrama do Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUÁRIO                                  │
│                    "Quantos produtos temos?"                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    1️⃣  INTERPRETER AGENT                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Função: Interpretar intenção da pergunta                  │  │
│  │ Input:  "Quantos produtos temos?"                         │  │
│  │ Output: {                                                 │  │
│  │   intent: "Contar total de produtos no catálogo",        │  │
│  │   requiresData: true,                                     │  │
│  │   requiresExternalTools: false,                           │  │
│  │   confidence: 0.9                                         │  │
│  │ }                                                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    2️⃣  DATA QUERY AGENT                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Função: Gerar e executar SQL                              │  │
│  │ Input:  intent + schema do banco                          │  │
│  │ SQL:    SELECT                                            │  │
│  │           pct.product_category_name_english,              │  │
│  │           COUNT(*) as total                               │  │
│  │         FROM olist_products p                             │  │
│  │         GROUP BY pct.product_category_name_english        │  │
│  │ Output: [                                                 │  │
│  │   { category: "bed_bath_table", total: 1729 },           │  │
│  │   { category: "sports_leisure", total: 1664 },           │  │
│  │   ...                                                     │  │
│  │ ]                                                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    3️⃣  MCP AGENT ⭐ NOVO                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Função: Usar ferramentas e recursos externos via MCP      │  │
│  │ Input:  userQuery + interpretation + availableTools       │  │
│  │ Decisão: Verificar se precisa de dados externos           │  │
│  │ Tool:   web_search("e-commerce trends 2024")             │  │
│  │ Output: {                                                 │  │
│  │   tool: "web_search",                                     │  │
│  │   server: "mcp-web",                                      │  │
│  │   data: "E-commerce cresceu 25% em 2024..."              │  │
│  │ }                                                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    4️⃣  RESPONDER AGENT                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Função: Criar resposta baseada nos dados                  │  │
│  │ Input:  queryResults + interpretation                     │  │
│  │ Output: "Temos 32.951 produtos no catálogo, distribuídos │  │
│  │          em 20 categorias principais. As maiores são      │  │
│  │          bed_bath_table (1.729 produtos), sports_leisure  │  │
│  │          (1.664 produtos) e furniture_decor (1.591)..."   │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   5️⃣  SUGGESTION AGENT                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Função: Gerar sugestões de próximas perguntas             │  │
│  │ Input:  userQuery + context + rawResponse                │  │
│  │ Output: [                                                 │  │
│  │   "Quais são as 10 categorias com mais produtos?",       │  │
│  │   "Qual o ticket médio por categoria de produto?",       │  │
│  │   "Como está a distribuição de estoque?"                 │  │
│  │ ]                                                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    6️⃣  ENHANCER AGENT                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Função: Refinar resposta e adicionar metadados            │  │
│  │ Input:  rawResponse + suggestions                         │  │
│  │ Output: {                                                 │  │
│  │   content: "Temos 32.951 produtos...",                    │  │
│  │   sources: ["Banco de dados", "IA"],                      │  │
│  │   confidence: 0.91,                                       │  │
│  │   suggestions: [...]                                      │  │
│  │ }                                                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     RESPOSTA FINAL                               │
│  {                                                               │
│    "success": true,                                              │
│    "data": {                                                     │
│      "sessionId": "123",                                         │
│      "response": "Temos 32.951 produtos...",                     │
│      "metadata": {                                               │
│        "interpretation": { "intent": "..." },                    │
│        "sources": ["Banco de dados", "IA"],                      │
│        "confidence": 0.91,                                       │
│        "suggestions": [                                          │
│          "Quais são as 10 categorias com mais produtos?",        │
│          "Qual o ticket médio por categoria?",                   │
│          "Como está a distribuição de estoque?"                  │
│        ]                                                         │
│      }                                                           │
│    }                                                             │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Responsabilidades de Cada Agente

### 1️⃣ Interpreter Agent
**O que faz**: Entende a intenção do usuário

| Input | Output |
|-------|--------|
| Pergunta do usuário | `intent`, `entities`, `requiresData`, `requiresExternalTools`, `confidence` |

**Exemplo**:
```typescript
Input:  "Quantos clientes temos?"
Output: { 
  intent: "Contar total de clientes no banco",
  requiresData: true,
  requiresExternalTools: false,
  confidence: 0.95
}
```

---

### 2️⃣ Data Query Agent
**O que faz**: Gera SQL e consulta banco de dados

| Input | Output |
|-------|--------|
| `intent` + `schema` | SQL + dados do banco |

**Exemplo**:
```typescript
Input:  { intent: "Contar produtos por categoria" }
SQL:    SELECT category, COUNT(*) FROM products GROUP BY category
Output: [{ category: "X", count: 100 }, ...]
```

---

### 3️⃣ MCP Agent ⭐ NOVO
**O que faz**: Usa ferramentas e recursos externos via MCP

| Input | Output |
|-------|--------|
| `userQuery` + `interpretation` + `availableTools` | Resultado das ferramentas MCP |

**Exemplo**:
```typescript
Input:  { userQuery: "Busque tendências de e-commerce", requiresExternalTools: true }
Tool:   web_search("e-commerce trends 2024")
Output: { tool: "web_search", server: "mcp-web", data: "..." }
```

---

### 4️⃣ Responder Agent
**O que faz**: Cria resposta em linguagem natural

| Input | Output |
|-------|--------|
| `queryResults` + `mcpResults` + `interpretation` | Texto da resposta |

**Exemplo**:
```typescript
Input:  [{ category: "A", count: 100 }, ...] + mcpResults
Output: "Temos produtos em 20 categorias, sendo as principais..."
```

---

### 5️⃣ Suggestion Agent
**O que faz**: Sugere próximas perguntas relevantes

| Input | Output |
|-------|--------|
| `context` completo | 3 sugestões de perguntas |

**Exemplo**:
```typescript
Input:  { userQuery: "Quantos produtos?", rawResponse: "..." }
Output: [
  "Quais categorias têm mais produtos?",
  "Qual o ticket médio?",
  "Produtos mais vendidos?"
]
```

---

### 6️⃣ Enhancer Agent
**O que faz**: Refina resposta final e adiciona metadados

| Input | Output |
|-------|--------|
| `rawResponse` + `suggestions` | Resposta refinada + metadados |

**Exemplo**:
```typescript
Input:  { rawResponse: "...", suggestions: [...] }
Output: {
  content: "Resposta refinada...",
  sources: ["DB", "IA"],
  confidence: 0.9,
  suggestions: [...]
}
```

---

## 🔄 Fluxo de Dados

```
userQuery
    ↓
[Interpreter] → interpretation
    ↓
[Data Query] → queryResults + sql
    ↓
[MCP Agent]  → mcpResults (se necessário) ⭐
    ↓
[Responder]  → rawResponse
    ↓
[Suggestion] → suggestions
    ↓
[Enhancer]   → finalResponse + metadata
    ↓
JSON para usuário
```

---

## 🎯 Quando Cada Agente É Executado

### Sempre Executam
- ✅ Interpreter
- ✅ Responder
- ✅ Suggestion
- ✅ Enhancer

### Execução Condicional
- ⚠️ Data Query: Só se `requiresData: true`
- ⚠️ MCP Agent: Só se `requiresExternalTools: true` ou keywords detectadas ⭐

**Exemplo sem dados**:
```
Pergunta: "Olá, tudo bem?"
→ Interpreter: requiresData = false, requiresExternalTools = false
→ Data Query: PULADO
→ MCP Agent: PULADO ⭐
→ Responder: "Olá! Como posso ajudar?"
→ Suggestion: Sugestões de boas-vindas
→ Enhancer: Refina
```

---

## 📊 Métricas de Performance

### Tempo Médio por Agente

| Agente | Tempo (ms) | % do Total |
|--------|------------|------------|
| Interpreter | 200-300 | 12% |
| Data Query | 500-800 | 32% |
| MCP Agent | 300-600 | 20% |
| Responder | 300-500 | 18% |
| Suggestion | 200-300 | 9% |
| Enhancer | 200-300 | 9% |
| **TOTAL** | **1700-2800** | **100%** |

*Com IA real (OpenAI GPT-4) e MCP habilitado*

---

## 🔍 Debug: Como Rastrear

Para debug, cada agente adiciona ao histórico:

```typescript
conversationHistory: [
  {
    role: "assistant",
    content: "Interpretação: ...",
    metadata: { agent: "interpreter" }
  },
  {
    role: "tool",
    content: "SQL: SELECT ...",
    metadata: { agent: "data_query" }
  },
  {
    role: "assistant",
    content: "Temos X produtos...",
    metadata: { agent: "responder" }
  },
  {
    role: "assistant",
    content: "Sugestões: ...",
    metadata: { agent: "suggestion" } // ⭐
  },
  {
    role: "assistant",
    content: "Resposta refinada...",
    metadata: { agent: "enhancer" }
  }
]
```

---

## 🛠️ Configuração do Pipeline

### Adicionar/Remover Agentes

```typescript
// orchestrator.ts
export class AgentOrchestrator {
  constructor(config: OrchestratorConfig) {
    this.agents = [
      new InterpreterAgent(),
      new DataQueryAgent(),
      new MCPAgent({...}),      // ← Novo agente MCP
      new ResponderAgent(),
      new SuggestionAgent(),
      new EnhancerAgent(),
    ];
  }
}
```

### Ordem Importa!

✅ **Ordem correta**:
```typescript
Interpreter → Data Query → MCP → Responder → Suggestion → Enhancer
```

❌ **Ordem errada**:
```typescript
MCP → Interpreter        // MCP precisa da interpretação!
Suggestion → Responder   // Suggestion precisa da resposta!
Data Query → Interpreter // Query precisa da interpretação!
```

---

## 🎨 Exemplo Completo: Fluxo Real

### Input
```json
{
  "message": "Quantos produtos temos?"
}
```

### Pipeline

#### 1️⃣ Interpreter
```typescript
→ Analisa: "Quantos produtos temos?"
→ Output: {
    intent: "Contar total de produtos no catálogo",
    requiresData: true,
    confidence: 0.95
  }
```

#### 2️⃣ Data Query
```typescript
→ Gera SQL: "SELECT COUNT(*), category FROM products GROUP BY category"
→ Executa
→ Output: [
    { category: "bed_bath_table", count: 1729 },
    { category: "sports_leisure", count: 1664 },
    ...20 categorias
  ]
```

#### 3️⃣ Responder
```typescript
→ Analisa dados: 20 categorias, 32.951 produtos
→ Output: "Temos 32.951 produtos distribuídos em 20 categorias 
           principais. As maiores são bed_bath_table (1.729), 
           sports_leisure (1.664) e furniture_decor (1.591)."
```

#### 4️⃣ Suggestion
```typescript
→ Contexto: pergunta sobre produtos + resposta com categorias
→ Output: [
    "Quais são as 10 categorias com mais produtos?",
    "Qual o ticket médio por categoria de produto?",
    "Como está a distribuição de estoque por categoria?"
  ]
```

#### 5️⃣ Enhancer
```typescript
→ Refina resposta + adiciona metadados
→ Output: {
    content: "Temos 32.951 produtos...",
    sources: ["Banco de dados", "Análise de IA"],
    confidence: 0.91,
    suggestions: [...]
  }
```

### Output Final
```json
{
  "success": true,
  "data": {
    "sessionId": "1",
    "response": "Temos 32.951 produtos distribuídos...",
    "metadata": {
      "interpretation": {
        "intent": "Contar total de produtos no catálogo",
        "confidence": 0.95
      },
      "dataUsed": true,
      "sources": ["Banco de dados", "Análise de IA"],
      "confidence": 0.91,
      "suggestions": [
        "Quais são as 10 categorias com mais produtos?",
        "Qual o ticket médio por categoria de produto?",
        "Como está a distribuição de estoque por categoria?"
      ]
    }
  }
}
```

---

## ✅ Checklist de Pipeline Saudável

- [x] 6 agentes implementados (Interpreter, DataQuery, MCP, Responder, Suggestion, Enhancer)
- [x] Ordem de execução correta
- [x] Cada agente com responsabilidade única
- [x] Contexto passado entre agentes
- [x] Error handling em cada etapa
- [x] Logs detalhados
- [x] Type-safe 100%
- [x] Testes cobrindo fluxo
- [x] Documentação completa
- [x] Integração MCP via HTTP ⭐

---

**Status**: ✅ Pipeline completo com 6 agentes especializados  
**Versão**: 2.0.0 (com MCP)  
**Data**: 2026-01-25
