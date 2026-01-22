# 💡 Suggestion Agent - Agente de Sugestões

## 🎯 Objetivo

O **Suggestion Agent** é um agente especializado em gerar sugestões inteligentes de próximas perguntas que o usuário pode fazer, baseado no contexto da conversa atual.

---

## 🏗️ Arquitetura

### Posição no Pipeline

```
1. Interpreter Agent   → Interpreta a pergunta
2. Data Query Agent    → Executa SQL
3. Responder Agent     → Gera resposta
4. Suggestion Agent    → Sugere próximas perguntas ⭐ NOVO
5. Enhancer Agent      → Refina resposta final
```

### Responsabilidades

✅ **Gerar 3 sugestões** de perguntas relacionadas  
✅ **Considerar o contexto** da conversa atual  
✅ **Variar profundidade** (perguntas simples e análises complexas)  
✅ **Sempre em português** brasileiro  
✅ **Relevantes** ao tópico discutido

---

## 🔧 Como Funciona

### 1. Análise de Contexto

O agente recebe:
- Pergunta original do usuário
- Intenção interpretada
- Dados consultados (quantidade)
- Resposta gerada

### 2. Geração Inteligente via IA

Usa a IA para gerar sugestões contextualizadas:

```typescript
const prompt = `Baseado no contexto acima, sugira 3 perguntas RELEVANTES 
que o usuário pode querer fazer em seguida.

IDIOMA: Todas as sugestões DEVEM estar em PORTUGUÊS (pt-BR).

Diretrizes:
1. Perguntas completas e naturais
2. Relacionadas ao contexto atual
3. Explorar diferentes aspectos dos dados
4. Variar entre simples e profundas
5. Focar em insights acionáveis`;
```

### 3. Sugestões Padrão (Fallback)

Se a IA falhar, retorna sugestões baseadas em palavras-chave:

| Palavra-chave na pergunta | Sugestões |
|---------------------------|-----------|
| `produto` | Categorias mais vendidas, ticket médio, estoque |
| `cliente` | Distribuição por estado, perfil de compra |
| `pedido` / `venda` | Faturamento, taxa de conversão, horários de pico |
| `pagamento` | Métodos mais usados, média de parcelas |
| `avaliação` / `review` | Avaliação média, categorias bem avaliadas |
| *padrão* | Tendências, desempenho geral, insights recentes |

---

## 📝 Exemplo de Uso

### Input (Contexto)
```typescript
{
  userQuery: "Quantos produtos temos?",
  interpretation: {
    intent: "Contar total de produtos no catálogo"
  },
  queryResults: [...], // 32 registros
  rawResponse: "Temos 32.951 produtos em 20 categorias..."
}
```

### Output (Sugestões)
```typescript
{
  suggestions: [
    "Quais são as 10 categorias com mais produtos?",
    "Qual o ticket médio por categoria de produto?",
    "Quais produtos têm melhor avaliação?"
  ]
}
```

### Na Resposta Final (JSON)
```json
{
  "success": true,
  "data": {
    "response": "Temos 32.951 produtos...",
    "metadata": {
      "suggestions": [
        "Quais são as 10 categorias com mais produtos?",
        "Qual o ticket médio por categoria de produto?",
        "Quais produtos têm melhor avaliação?"
      ]
    }
  }
}
```

---

## 🎨 Características das Sugestões

### ✅ Boas Sugestões

```typescript
✅ "Quais são as 10 categorias com mais vendas?"
✅ "Como está a distribuição de clientes por região?"
✅ "Qual o ticket médio dos pedidos nos últimos 3 meses?"
✅ "Quais produtos têm melhor avaliação?"
✅ "Como está a taxa de entrega no prazo?"
```

**Por quê?**
- Perguntas completas e naturais
- Exploram diferentes aspectos
- Específicas e acionáveis
- Relevantes ao contexto

### ❌ Más Sugestões

```typescript
❌ "Mostre mais"
❌ "E os outros?"
❌ "Detalhes"
❌ "What about customers?" (não em português)
❌ "Fale mais sobre isso" (muito vaga)
```

**Por quê?**
- Muito vagas
- Não são perguntas
- Não em português
- Não acionáveis

---

## 🧪 Como Testar

### Teste 1: Pergunta sobre Produtos
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Quantos produtos temos?"}' \
  | jq '.data.metadata.suggestions'
```

**Esperado**:
```json
[
  "Quais são as categorias de produtos mais vendidas?",
  "Qual o ticket médio por categoria de produto?",
  "Como está a distribuição de estoque por categoria?"
]
```

### Teste 2: Pergunta sobre Clientes
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Quantos clientes temos?"}' \
  | jq '.data.metadata.suggestions'
```

**Esperado**:
```json
[
  "Como está a distribuição de clientes por estado?",
  "Quais estados têm maior número de clientes?",
  "Qual o perfil de compra dos clientes por região?"
]
```

### Teste 3: Pergunta sobre Vendas
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Qual foi o faturamento total?"}' \
  | jq '.data.metadata.suggestions'
```

**Esperado**:
```json
[
  "Como está a taxa de conversão de pedidos?",
  "Quais são os horários de pico de vendas?",
  "Qual o ticket médio dos pedidos?"
]
```

---

## 🔍 Fluxo Detalhado

### 1. Recebe Contexto
```typescript
context = {
  userQuery: "Quantos clientes temos?",
  interpretation: { intent: "Contar clientes", ... },
  queryResults: [{ count: 99441 }],
  rawResponse: "Temos 99.441 clientes..."
}
```

### 2. Gera Prompt para IA
```typescript
prompt = `
Contexto: Usuário perguntou sobre total de clientes
Dados: 99.441 clientes encontrados
Resposta: "Temos 99.441 clientes cadastrados..."

Sugira 3 perguntas relevantes em PORTUGUÊS.
`
```

### 3. IA Retorna Sugestões
```typescript
aiResponse = `
Como está a distribuição de clientes por estado?
Quais estados têm mais clientes?
Qual o perfil de compra por região?
`
```

### 4. Parse e Validação
```typescript
suggestions = [
  "Como está a distribuição de clientes por estado?",
  "Quais estados têm mais clientes?",
  "Qual o perfil de compra por região?"
]
```

### 5. Adiciona ao Contexto
```typescript
context.suggestions = suggestions
```

### 6. Enhancer Usa Sugestões
```typescript
enhancedResponse = {
  content: "Temos 99.441 clientes...",
  suggestions: context.suggestions,
  ...
}
```

---

## 📊 Benefícios

### 1. **Melhora UX**
- Usuário não precisa pensar na próxima pergunta
- Fluxo de conversa mais natural
- Descoberta de insights que não imaginava

### 2. **Engajamento**
- Incentiva exploração dos dados
- Aumenta tempo de uso do sistema
- Gera mais valor para o usuário

### 3. **Guia o Usuário**
- Mostra o que é possível perguntar
- Educa sobre capacidades do sistema
- Direciona para análises úteis

### 4. **Análise Contextual**
- Sugestões relevantes ao momento
- Complementa a resposta atual
- Explora diferentes ângulos

---

## 🔧 Configuração

### Ativar/Desativar Sugestões

Se no futuro quiser desativar sugestões:

```typescript
// orchestrator.ts
constructor(options: { enableSuggestions: boolean }) {
  this.agents = [
    new InterpreterAgent(),
    new DataQueryAgent(),
    new ResponderAgent(),
    ...(options.enableSuggestions ? [new SuggestionAgent()] : []),
    new EnhancerAgent(),
  ];
}
```

### Ajustar Quantidade

```typescript
// suggestion.agent.ts
private parseSuggestions(text: string): string[] {
  const MAX_SUGGESTIONS = 5; // ← Altere aqui
  // ...
}
```

---

## 📁 Arquivos

### Criados
- `src/modules/chat/agents/suggestion.agent.ts` - Agente principal

### Modificados
- `src/modules/chat/agents/orchestrator.ts` - Adiciona SuggestionAgent
- `src/modules/chat/agents/enhancer.agent.ts` - Remove lógica de sugestões
- `src/modules/chat/types/agent.types.ts` - Adiciona `suggestions?: string[]`

---

## ✅ Checklist de Validação

- [x] Agente criado e funcional
- [x] Integrado ao orquestrador
- [x] Type-safe (TypeScript)
- [x] Sugestões sempre em português
- [x] Fallback inteligente
- [x] Testes passando
- [x] Documentação completa

---

## 🚀 Próximos Passos (Opcional)

### Melhorias Futuras

1. **Personalização**
   - Sugestões baseadas no histórico do usuário
   - Preferências de tipo de análise

2. **Machine Learning**
   - Aprender quais sugestões são mais clicadas
   - Melhorar relevância ao longo do tempo

3. **Categorização**
   - Separar sugestões por tipo (rápidas, profundas, comparativas)
   - Permitir usuário escolher tipo preferido

4. **Cache**
   - Cachear sugestões para perguntas comuns
   - Reduzir chamadas à IA

---

## 📊 Métricas de Sucesso

Para medir efetividade do agente:

```typescript
// Métricas a implementar
{
  suggestions_generated: number;
  suggestions_clicked: number;
  click_through_rate: number;
  avg_session_length: number;
  most_popular_suggestions: string[];
}
```

---

**Status**: ✅ Implementado e testado  
**Versão**: 1.3.0  
**Data**: 2026-01-22
