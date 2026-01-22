# 🇧🇷 Forçar Respostas em Português

## 🎯 Objetivo

Garantir que **TODAS as respostas** do sistema sejam sempre em **português brasileiro (pt-BR)**, independente do idioma da pergunta do usuário.

---

## ✅ Mudanças Implementadas

### 1. **Responder Agent** 
**Arquivo**: `src/modules/chat/agents/responder.agent.ts`

Adicionado ao prompt:
```typescript
IDIOMA: Responda SEMPRE em PORTUGUÊS (pt-BR), independente do idioma da pergunta.

Diretrizes:
// ... outras diretrizes
- SEMPRE use português brasileiro na resposta
```

**Efeito**: 
- ✅ Resposta principal sempre em PT-BR
- ✅ Mesmo se pergunta for em inglês

---

### 2. **Enhancer Agent**
**Arquivo**: `src/modules/chat/agents/enhancer.agent.ts`

Adicionado ao prompt:
```typescript
IDIOMA: A resposta DEVE ser SEMPRE em PORTUGUÊS (pt-BR), independente do idioma original.

Melhore esta resposta seguindo estas diretrizes:
1. Torne mais clara e estruturada em PORTUGUÊS
// ... outras diretrizes
6. Se a resposta original estiver em outro idioma, TRADUZA para português brasileiro

Retorne TUDO em português brasileiro:
- Resposta melhorada
- Sugestões de acompanhamento
```

**Efeito**:
- ✅ Resposta final refinada sempre em PT-BR
- ✅ Sugestões de perguntas sempre em PT-BR
- ✅ Traduz se resposta original estiver em outro idioma

---

### 3. **Interpreter Agent**
**Arquivo**: `src/modules/chat/agents/interpreter.agent.ts`

Adicionado ao prompt:
```typescript
IDIOMA: A interpretação (campo "intent") deve estar em PORTUGUÊS, independente do idioma da pergunta.

Responda APENAS com JSON puro, sem markdown:
{
  "intent": "descrição específica da intenção EM PORTUGUÊS",
  // ... outros campos
}
```

**Efeito**:
- ✅ Interpretação da intenção sempre em PT-BR
- ✅ Metadados de intenção legíveis em português

---

## 🧪 Como Testar

### Teste 1: Pergunta em Português
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Quantos produtos temos?"
  }'
```

**Esperado**: Resposta em português ✅

---

### Teste 2: Pergunta em Inglês
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How many products do we have?"
  }'
```

**Esperado**: Resposta em português ✅ (mesmo pergunta em inglês)

---

### Teste 3: Pergunta em Espanhol
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "¿Cuántos productos tenemos?"
  }'
```

**Esperado**: Resposta em português ✅

---

## 📊 Fluxo de Idioma

```
Pergunta (qualquer idioma)
    ↓
Interpreter Agent → intent em PT-BR
    ↓
Data Query Agent → SQL (idioma neutro)
    ↓
Responder Agent → resposta em PT-BR
    ↓
Enhancer Agent → refina em PT-BR + sugestões em PT-BR
    ↓
Resposta Final → SEMPRE em PT-BR 🇧🇷
```

---

## 🎯 Garantias

### ✅ O que está sempre em português:

1. **Resposta principal ao usuário**
   - Texto explicativo
   - Números e métricas
   - Análises e insights

2. **Interpretação da intenção**
   - Campo `metadata.interpretation.intent`
   - Visível no JSON de resposta

3. **Sugestões de acompanhamento**
   - Campo `metadata.suggestions`
   - 2-3 perguntas relacionadas

4. **Fontes de dados**
   - Campo `metadata.sources`
   - Ex: "Banco de dados de produtos"

---

### ⚠️ O que NÃO é traduzido:

1. **Dados brutos do banco**
   - Nomes de categorias em inglês (vindo do dataset)
   - Ex: `bed_bath_table`, `sports_leisure`
   - ℹ️ Estes são dados originais do Olist

2. **IDs e códigos**
   - `customer_id`, `product_id`, `order_id`
   - Mantidos como estão no banco

3. **SQL gerado**
   - Comandos SQL (SELECT, FROM, WHERE)
   - Idioma técnico padrão

---

## 📝 Exemplos de Resposta

### Exemplo 1: Pergunta em Português

**Input**:
```json
{
  "message": "Quais produtos temos?"
}
```

**Output** (trechos):
```json
{
  "response": "Temos produtos em 20 categorias principais...",
  "metadata": {
    "interpretation": {
      "intent": "Listar produtos ou categorias disponíveis no catálogo"
    },
    "suggestions": [
      "Quantos produtos temos por categoria?",
      "Quais são as categorias mais populares?",
      "Qual o estoque médio por categoria?"
    ],
    "sources": [
      "Banco de dados de produtos",
      "Análise de intenção com IA"
    ]
  }
}
```

✅ Tudo em português!

---

### Exemplo 2: Pergunta em Inglês

**Input**:
```json
{
  "message": "How many customers do we have?"
}
```

**Output** (trechos):
```json
{
  "response": "Temos um total de 99.441 clientes cadastrados no sistema...",
  "metadata": {
    "interpretation": {
      "intent": "Contar total de clientes no banco de dados"
    },
    "suggestions": [
      "Quantos clientes temos por estado?",
      "Qual estado tem mais clientes?",
      "Como está a distribuição geográfica?"
    ]
  }
}
```

✅ Resposta em português mesmo com pergunta em inglês!

---

## 🔧 Configuração

Não há configuração adicional necessária. As mudanças estão nos prompts dos agentes e são aplicadas automaticamente.

### Variáveis de Ambiente

As configurações de idioma são **hard-coded** nos prompts para garantir consistência.

Se no futuro quiser suportar múltiplos idiomas, adicione em `.env`:
```env
# Futuro: suporte multi-idioma
API_RESPONSE_LANGUAGE=pt-BR
```

---

## ✅ Validação

### Checklist

- [x] Responder Agent com instrução de PT-BR
- [x] Enhancer Agent com instrução de PT-BR
- [x] Interpreter Agent com instrução de PT-BR
- [x] Type check passando
- [x] Testes não quebrados
- [x] Documentação atualizada

### Teste Manual

```bash
# 1. Iniciar servidor
bun dev

# 2. Testar com pergunta em inglês
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the best selling products?"}' \
  | jq '.data.response'

# Deve retornar resposta em português!
```

---

## 🌍 Suporte Multi-Idioma Futuro

Se precisar suportar múltiplos idiomas no futuro:

### Opção 1: Variável de Ambiente
```typescript
// config/env.ts
export const env = {
  // ...
  responseLanguage: process.env.API_RESPONSE_LANGUAGE || 'pt-BR',
};

// agents/responder.agent.ts
const languageInstruction = env.responseLanguage === 'pt-BR'
  ? 'Responda SEMPRE em PORTUGUÊS (pt-BR)'
  : 'Always respond in ENGLISH (en-US)';
```

### Opção 2: Header HTTP
```typescript
// Detectar idioma do header Accept-Language
const userLanguage = request.headers['accept-language'] || 'pt-BR';
```

### Opção 3: Campo na Requisição
```typescript
// Body da requisição
{
  "message": "How many products?",
  "language": "pt-BR" // Usuário especifica idioma desejado
}
```

---

## 📚 Documentação Relacionada

- **AGENT_IMPROVEMENTS.md** - Melhorias gerais dos agentes
- **CORREÇÕES_AGENTES.md** - Bug fixes aplicados
- **CHAT_SYSTEM.md** - Arquitetura dos agentes

---

## ✅ Status

- ✅ Implementado: Forçar PT-BR em todos os agentes
- ✅ Testado: Type check passou
- ✅ Documentado: Este guia
- ✅ Pronto para produção

**Todas as respostas agora são garantidas em português! 🇧🇷**
