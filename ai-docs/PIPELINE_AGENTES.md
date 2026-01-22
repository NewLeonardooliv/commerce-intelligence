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
│                    3️⃣  RESPONDER AGENT                           │
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
│                   4️⃣  SUGGESTION AGENT ⭐ NOVO                   │
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
│                    5️⃣  ENHANCER AGENT                            │
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
| Pergunta do usuário | `intent`, `entities`, `requiresData`, `confidence` |

**Exemplo**:
```typescript
Input:  "Quantos clientes temos?"
Output: { 
  intent: "Contar total de clientes no banco",
  requiresData: true,
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

### 3️⃣ Responder Agent
**O que faz**: Cria resposta em linguagem natural

| Input | Output |
|-------|--------|
| `queryResults` + `interpretation` | Texto da resposta |

**Exemplo**:
```typescript
Input:  [{ category: "A", count: 100 }, ...]
Output: "Temos produtos em 20 categorias, sendo as principais..."
```

---

### 4️⃣ Suggestion Agent ⭐ NOVO
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

### 5️⃣ Enhancer Agent
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
[Responder]  → rawResponse
    ↓
[Suggestion] → suggestions ⭐
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
- ✅ Suggestion ⭐
- ✅ Enhancer

### Execução Condicional
- ⚠️ Data Query: Só se `requiresData: true`

**Exemplo sem dados**:
```
Pergunta: "Olá, tudo bem?"
→ Interpreter: requiresData = false
→ Data Query: PULADO
→ Responder: "Olá! Como posso ajudar?"
→ Suggestion: Sugestões de boas-vindas
→ Enhancer: Refina
```

---

## 📊 Métricas de Performance

### Tempo Médio por Agente

| Agente | Tempo (ms) | % do Total |
|--------|------------|------------|
| Interpreter | 200-300 | 15% |
| Data Query | 500-800 | 40% |
| Responder | 300-500 | 25% |
| Suggestion | 200-300 | 10% |
| Enhancer | 200-300 | 10% |
| **TOTAL** | **1400-2200** | **100%** |

*Com IA real (OpenAI GPT-4)*

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
  constructor() {
    this.agents = [
      new InterpreterAgent(),
      new DataQueryAgent(),
      new ResponderAgent(),
      new SuggestionAgent(),  // ← Fácil adicionar/remover
      new EnhancerAgent(),
    ];
  }
}
```

### Ordem Importa!

✅ **Ordem correta**:
```typescript
Interpreter → Data Query → Responder → Suggestion → Enhancer
```

❌ **Ordem errada**:
```typescript
Suggestion → Responder  // Suggestion precisa da resposta!
Data Query → Interpreter  // Query precisa da interpretação!
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

#### 4️⃣ Suggestion ⭐
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

- [x] 5 agentes implementados
- [x] Ordem de execução correta
- [x] Cada agente com responsabilidade única
- [x] Contexto passado entre agentes
- [x] Error handling em cada etapa
- [x] Logs detalhados
- [x] Type-safe 100%
- [x] Testes cobrindo fluxo
- [x] Documentação completa

---

**Status**: ✅ Pipeline completo com 5 agentes especializados  
**Versão**: 1.3.0  
**Data**: 2026-01-22
