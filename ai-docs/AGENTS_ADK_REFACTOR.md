# Refatoração dos Agentes para ADK Nativo

## 📋 Resumo

Refatoração completa dos agentes do sistema para usar Google ADK (Gemini) nativamente ao invés de um wrapper genérico. Cada agente agora tem sua própria implementação ADK específica para suas necessidades.

## 🔄 Mudanças Realizadas

### Antes
- ❌ Usava `ADKAgentWrapper` genérico para todos os agentes
- ❌ Lógica de processamento centralizada e genérica
- ❌ Dependência de agentes OpenAI como fallback
- ❌ Contexto construído de forma uniforme para todos

### Depois
- ✅ Cada agente tem implementação ADK específica
- ✅ Lógica de processamento customizada por agente
- ✅ 100% baseado em Google ADK (Gemini)
- ✅ Contexto otimizado para cada tipo de agente

## 🎯 Agentes Refatorados

### 1. **InterpreterAgent** (`interpreter.agent.ts`)
- Usa ADK com modelo `gemini-2.5-flash`
- Parseia JSON de interpretação
- Fallback robusto em caso de erro
- Retorna: `intent`, `entities`, `requiresData`, `confidence`

### 2. **ResponderAgent** (`responder.agent.ts`)
- Usa ADK com modelo `gemini-2.5-flash`
- Gera respostas baseadas em dados
- Constrói prompt específico com query + dados
- Retorna: resposta em texto (português)

### 3. **SuggestionAgent** (`suggestion.agent.ts`)
- Usa ADK com modelo `gemini-2.5-flash`
- Gera 3 perguntas de follow-up
- Parse inteligente removendo formatação
- Retorna: array de 3 sugestões em português

### 4. **EnhancerAgent** (`enhancer.agent.ts`)
- Usa ADK com modelo `gemini-2.5-flash`
- Melhora qualidade da resposta
- Adiciona metadata (sources, confidence)
- Retorna: resposta melhorada + metadata

### 5. **DataQueryAgent** (`data-query.agent.ts`)
- Mantido como estava (não usa ADK)
- Executa consultas SQL no banco
- Usa AI apenas para gerar SQL

### 6. **MCPAgent** (`mcp.agent.ts`)
- Mantido como estava
- Integração com ferramentas MCP externas

## 🏗️ Arquitetura

```
Orquestrador
    ↓
1. InterpreterAgent (ADK) → interpretation
    ↓
2. DataQueryAgent → queryResults
    ↓
3. MCPAgent (opcional) → mcpResults
    ↓
4. ResponderAgent (ADK) → rawResponse
    ↓
5. SuggestionAgent (ADK) → suggestions
    ↓
6. EnhancerAgent (ADK) → enhanced response + metadata
```

## 🔧 Configuração

### Variáveis de Ambiente (`.env`)
```env
# Google ADK (obrigatório)
ENABLE_ADK=true
GOOGLE_API_KEY=your_api_key
GOOGLE_GENAI_API_KEY=your_api_key

# Modelo ADK
ADK_MODEL=gemini-2.5-flash

# Flags de substituição (não mais necessárias)
# ADK_REPLACE_INTERPRETER=true
# ADK_REPLACE_RESPONDER=true
# ADK_REPLACE_SUGGESTION=true
# ADK_REPLACE_ENHANCER=true
```

### Dependências
```json
{
  "@google/adk": "^latest"
}
```

## 📝 Vantagens da Nova Arquitetura

1. **Código Mais Limpo**
   - Cada agente é responsável por sua própria lógica
   - Não há código genérico tentando lidar com múltiplos casos

2. **Melhor Performance**
   - Prompts otimizados para cada tipo de agente
   - Menos overhead de abstração

3. **Mais Manutenível**
   - Fácil entender e modificar cada agente individualmente
   - Menos acoplamento entre componentes

4. **Debugging Simplificado**
   - Logs específicos por agente
   - Fluxo de dados mais claro

5. **Extensibilidade**
   - Fácil adicionar novos agentes
   - Cada agente pode ter features únicas

## 🧪 Testes

Para testar o sistema:

```bash
# Reiniciar servidor
bun run dev

# Testar endpoint
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Quais produtos temos no estoque?"}'
```

## 🚨 Breaking Changes

1. **Removido `ADKAgentWrapper`**
   - Não é mais usado em nenhum lugar
   - Pode ser deletado futuramente

2. **Tipos de AgentRole Simplificados**
   - Removidos: `adk_interpreter`, `adk_responder`, `adk_suggestion`, `adk_enhancer`
   - Todos usam os nomes base: `interpreter`, `responder`, etc.

3. **ADK Obrigatório**
   - Sistema não funciona mais sem ADK habilitado
   - Sem fallback para OpenAI

## 📚 Próximos Passos

1. ~~Refatorar agentes para ADK nativo~~ ✅
2. ~~Remover ADKAgentWrapper~~ ⏳ (pode ser removido)
3. ~~Atualizar testes~~ (se houver)
4. ~~Documentar nova arquitetura~~ ✅
5. Monitorar performance em produção
6. Considerar cache de respostas ADK

## 🤝 Contribuindo

Ao adicionar novos agentes:

1. Crie uma classe que implementa `IAgent`
2. Use ADK nativamente (`LlmAgent` + `InMemoryRunner`)
3. Implemente lógica específica no `process()`
4. Adicione logs para debugging
5. Implemente tratamento de erros robusto
6. Adicione ao orquestrador

## 📄 Licença

Mesmo do projeto principal.
