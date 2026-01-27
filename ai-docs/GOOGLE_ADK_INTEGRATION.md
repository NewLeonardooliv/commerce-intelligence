# 🚀 Integração Google ADK (Agent Development Kit)

## ✅ O que foi implementado

Integração completa e **opcional** do [Google ADK](https://github.com/google/adk-js) no sistema de chat, permitindo usar agentes Google ADK em conjunto ou no lugar dos agentes customizados existentes.

## 📦 Características da Integração

### ✨ Benefícios do Google ADK

1. **Gemini 2.0**: Acesso aos modelos mais recentes do Google
2. **Google Search**: Integração nativa com busca do Google
3. **Code-First**: Desenvolvimento em TypeScript puro
4. **Modular**: Fácil de adicionar/remover
5. **Zero Breaking Changes**: Sistema existente permanece intacto

### 🔄 Arquitetura Híbrida

```
Pipeline Flexível:
┌─────────────────────────────────────────────────────────┐
│  Agentes Customizados    OU    Agentes ADK              │
│  ─────────────────────        ─────────────────         │
│  • InterpreterAgent            • ADK Interpreter        │
│  • ResponderAgent              • ADK Responder          │
│  • SuggestionAgent             • ADK Suggestion         │
│  • EnhancerAgent               • ADK Enhancer           │
└─────────────────────────────────────────────────────────┘
```

### 🎯 Agentes Substituíveis

Você pode escolher quais agentes usar ADK:

| Agente | Função | Substituível? | Google Search? |
|--------|--------|---------------|----------------|
| Interpreter | Interpreta intenção | ✅ Sim | ❌ Não |
| Data Query | Consulta BD | ❌ Não | ❌ Não |
| MCP | Ferramentas MCP | ❌ Não | ❌ Não |
| Responder | Gera resposta | ✅ Sim | ✅ Sim |
| Suggestion | Sugere perguntas | ✅ Sim | ❌ Não |
| Enhancer | Refina resposta | ✅ Sim | ❌ Não |

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Adicione no `.env`:

```env
# Google ADK Configuration
ENABLE_ADK=true
ADK_MODEL=gemini-2.0-flash-exp
ADK_USE_GOOGLE_SEARCH=true
ADK_REPLACE_INTERPRETER=false
ADK_REPLACE_RESPONDER=true
ADK_REPLACE_SUGGESTION=false
ADK_REPLACE_ENHANCER=false
```

### 2. Opções de Configuração

#### `ENABLE_ADK`
- **Tipo**: boolean
- **Padrão**: `false`
- **Descrição**: Habilita/desabilita globalmente o ADK

#### `ADK_MODEL`
- **Tipo**: string
- **Padrão**: `gemini-2.0-flash-exp`
- **Opções**: 
  - `gemini-2.0-flash-exp` (mais rápido)
  - `gemini-2.5-flash` (balanceado)
  - `gemini-2.5-pro` (mais poderoso)

#### `ADK_USE_GOOGLE_SEARCH`
- **Tipo**: boolean
- **Padrão**: `false`
- **Descrição**: Habilita Google Search nos agentes ADK (apenas Responder)

#### `ADK_REPLACE_*`
- **Tipo**: boolean
- **Padrão**: `false`
- **Descrição**: Substitui agente específico por versão ADK

## 🎯 Casos de Uso

### Caso 1: ADK Desabilitado (Padrão)

```env
ENABLE_ADK=false
```

**Resultado**: Sistema usa apenas agentes customizados (comportamento original)

```
Interpreter → DataQuery → MCP → Responder → Suggestion → Enhancer
(todos customizados)
```

### Caso 2: ADK com Google Search no Responder

```env
ENABLE_ADK=true
ADK_MODEL=gemini-2.0-flash-exp
ADK_USE_GOOGLE_SEARCH=true
ADK_REPLACE_RESPONDER=true
```

**Resultado**: Respostas enriquecidas com busca do Google

```
Interpreter → DataQuery → MCP → ADK Responder (com Google Search) → Suggestion → Enhancer
                                  ↑ Pode buscar dados atualizados da web
```

**Exemplo de pergunta**:
```
"Qual o preço atual do Bitcoin comparado com nossas vendas?"
→ ADK busca preço atual do Bitcoin
→ Combina com dados internos de vendas
→ Gera resposta completa
```

### Caso 3: Todos os Agentes com ADK

```env
ENABLE_ADK=true
ADK_MODEL=gemini-2.5-pro
ADK_USE_GOOGLE_SEARCH=true
ADK_REPLACE_INTERPRETER=true
ADK_REPLACE_RESPONDER=true
ADK_REPLACE_SUGGESTION=true
ADK_REPLACE_ENHANCER=true
```

**Resultado**: Pipeline totalmente com Gemini 2.0

```
ADK Interpreter → DataQuery → MCP → ADK Responder → ADK Suggestion → ADK Enhancer
(todos usando Gemini 2.0)
```

### Caso 4: Mix Estratégico (Recomendado)

```env
ENABLE_ADK=true
ADK_MODEL=gemini-2.0-flash-exp
ADK_USE_GOOGLE_SEARCH=true
ADK_REPLACE_INTERPRETER=false  # Mantém lógica customizada
ADK_REPLACE_RESPONDER=true     # Usa ADK com Google Search
ADK_REPLACE_SUGGESTION=false   # Mantém sugestões customizadas
ADK_REPLACE_ENHANCER=false     # Mantém refinamento customizado
```

**Vantagem**: Combina o melhor dos dois mundos
- Interpretação customizada (rápida, específica)
- Resposta com ADK + Google Search (rica, atualizada)
- Sugestões customizadas (contextualizadas)

## 📊 Estrutura de Arquivos

```
src/
├── infrastructure/
│   └── adk/
│       ├── adk-provider.ts         # Implementa IAiProvider com ADK
│       └── adk-agent-wrapper.ts    # Wrapper para agentes ADK
│
├── config/
│   └── adk.ts                      # Configuração ADK
│
└── modules/
    └── chat/
        └── agents/
            └── orchestrator.ts      # Integrado com ADK
```

## 🔧 Como Funciona

### 1. Inicialização

No `ChatService`, o ADK é inicializado se habilitado:

```typescript
if (isADKEnabled()) {
  const adkConfig = loadADKConfig();
  console.log('[Chat Service] Google ADK enabled');
  console.log(`  - Model: ${adkConfig.model}`);
  console.log(`  - Google Search: ${adkConfig.useGoogleSearch}`);
}
```

### 2. Seleção de Agentes

No `Orchestrator`, agentes são escolhidos baseado na configuração:

```typescript
const agents = [
  adkConfig?.replaceAgents?.interpreter
    ? new ADKAgentWrapper({ role: 'adk_interpreter', ... })
    : new InterpreterAgent(),
  
  // DataQuery sempre customizado (acesso ao BD)
  new DataQueryAgent(),
  
  // MCP sempre customizado (protocolo específico)
  new MCPAgent(),
  
  adkConfig?.replaceAgents?.responder
    ? new ADKAgentWrapper({ 
        role: 'adk_responder', 
        useGoogleSearch: true,  // ← Habilita Google Search
        ...
      })
    : new ResponderAgent(),
  // ...
];
```

### 3. Processamento

ADK Agents processam contexto completo:

```typescript
// Contexto inclui:
{
  userQuery: "Qual o preço do Bitcoin?",
  interpretation: { ... },
  queryResults: [ ... ],  // Dados do BD
  mcpResults: { ... },    // Dados de MCP
  conversationHistory: [ ... ]
}

// ADK Agent processa tudo e gera resposta
const result = await adkAgent.generate({
  input: contextoCompleto
});
```

## 🎨 Customização

### Criar Agente ADK Customizado

```typescript
import { ADKAgentWrapper } from '@infrastructure/adk/adk-agent-wrapper';

const myAgent = new ADKAgentWrapper({
  name: 'my-custom-agent',
  description: 'Descrição do agente',
  role: 'adk_responder',
  model: 'gemini-2.5-pro',
  instruction: `
    Você é um agente especializado em X.
    Sua tarefa é Y.
    Use Z quando necessário.
  `,
  useGoogleSearch: true,
  customTools: [/* ferramentas customizadas */],
});
```

### Usar ADK Provider Diretamente

```typescript
import { ADKProvider } from '@infrastructure/adk/adk-provider';

const adkProvider = new ADKProvider({
  name: 'my-provider',
  description: 'Provider customizado',
  model: 'gemini-2.0-flash-exp',
  instruction: 'Instruções...',
});

// Usar como qualquer IAiProvider
const response = await adkProvider.generateText([
  { role: 'user', content: 'Minha pergunta' }
]);
```

## 📈 Performance

### Comparação (estimativa)

| Configuração | Latência | Custo | Qualidade |
|--------------|----------|-------|-----------|
| Sem ADK | 1.5-2s | $ | ⭐⭐⭐⭐ |
| ADK Flash | 2-2.5s | $$ | ⭐⭐⭐⭐⭐ |
| ADK Pro | 3-4s | $$$ | ⭐⭐⭐⭐⭐+ |
| ADK + Search | 3-5s | $$$ | ⭐⭐⭐⭐⭐++ |

### Recomendações

**Desenvolvimento/Testes**:
```env
ENABLE_ADK=true
ADK_MODEL=gemini-2.0-flash-exp
ADK_USE_GOOGLE_SEARCH=false
ADK_REPLACE_RESPONDER=true
```

**Produção (balanceado)**:
```env
ENABLE_ADK=true
ADK_MODEL=gemini-2.0-flash-exp
ADK_USE_GOOGLE_SEARCH=true
ADK_REPLACE_RESPONDER=true
ADK_REPLACE_ENHANCER=true
```

**Produção (máxima qualidade)**:
```env
ENABLE_ADK=true
ADK_MODEL=gemini-2.5-pro
ADK_USE_GOOGLE_SEARCH=true
ADK_REPLACE_INTERPRETER=true
ADK_REPLACE_RESPONDER=true
ADK_REPLACE_SUGGESTION=true
ADK_REPLACE_ENHANCER=true
```

## 🧪 Testando

### 1. Teste Básico

```bash
# Habilitar ADK
echo "ENABLE_ADK=true" >> .env
echo "ADK_REPLACE_RESPONDER=true" >> .env

# Reiniciar servidor
bun dev

# Fazer requisição
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Qual o clima em São Paulo hoje?",
    "userId": "test"
  }'
```

Nos logs, você verá:
```
[Chat Service] Google ADK enabled
  - Model: gemini-2.0-flash-exp
  - Google Search: false
  - Replacing agents: responder
[ADK Agent adk_responder] Processing...
[ADK Agent adk_responder] Completed
```

### 2. Teste com Google Search

```bash
# Habilitar Google Search
echo "ADK_USE_GOOGLE_SEARCH=true" >> .env

# Reiniciar e testar
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Qual o preço atual do dólar?",
    "userId": "test"
  }'
```

## 🔍 Troubleshooting

### ADK não está sendo usado

**Verificar**:
1. `ENABLE_ADK=true` no `.env`
2. Pelo menos um `ADK_REPLACE_*=true`
3. Logs mostram "Google ADK enabled"

### Erro: "generate is not a function"

**Causa**: Versão incompatível do ADK

**Solução**:
```bash
bun remove @google/adk
bun add @google/adk@latest
```

### Google Search não funciona

**Verificar**:
1. `ADK_USE_GOOGLE_SEARCH=true`
2. `ADK_REPLACE_RESPONDER=true` (Search só funciona no Responder)
3. Pergunta realmente precisa de busca web

## 📚 Recursos Adicionais

- [Google ADK Documentation](https://google.github.io/adk-docs/)
- [ADK TypeScript Samples](https://github.com/google/adk-js/tree/main/samples)
- [Gemini Models](https://ai.google.dev/gemini-api/docs/models)

## ⚡ Migração Gradual

Você pode migrar gradualmente:

**Semana 1**: Apenas Responder
```env
ADK_REPLACE_RESPONDER=true
```

**Semana 2**: Adicionar Enhancer
```env
ADK_REPLACE_RESPONDER=true
ADK_REPLACE_ENHANCER=true
```

**Semana 3**: Adicionar Google Search
```env
ADK_USE_GOOGLE_SEARCH=true
```

**Semana 4**: Pipeline completo ADK
```env
ADK_REPLACE_INTERPRETER=true
ADK_REPLACE_RESPONDER=true
ADK_REPLACE_SUGGESTION=true
ADK_REPLACE_ENHANCER=true
```

## 🎯 Conclusão

✅ **Zero Breaking Changes**: Sistema existente permanece funcional  
✅ **Opt-in**: ADK é totalmente opcional  
✅ **Granular**: Escolha exatamente quais agentes usar  
✅ **Powerful**: Acesso a Gemini 2.0 + Google Search  
✅ **Type-Safe**: 100% TypeScript  

---

**Status**: ✅ Integração completa e funcional  
**Versão**: 3.0.0 (com Google ADK)  
**Data**: 2026-01-25
