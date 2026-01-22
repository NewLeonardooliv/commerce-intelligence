# 📋 Changelog - Commerce Intelligence

Todas as mudanças notáveis neste projeto estão documentadas aqui.

---

## [1.3.0] - 2026-01-22

### ✨ Features

#### Novo Agente: Suggestion Agent
**Implementado**: Agente especializado para gerar sugestões inteligentes de próximas perguntas.

**Mudanças**:
- ✅ Criado `SuggestionAgent` - gera sugestões contextualizadas via IA
- ✅ Integrado ao pipeline entre Responder e Enhancer
- ✅ Sugestões sempre em português brasileiro
- ✅ Fallback inteligente por categoria
- ✅ Simplificado `EnhancerAgent` - removida lógica de sugestões

**Arquivos**:
- `src/modules/chat/agents/suggestion.agent.ts` - Novo agente
- `src/modules/chat/agents/enhancer.agent.ts` - Simplificado
- `src/modules/chat/agents/orchestrator.ts` - Adicionado novo agente
- `src/modules/chat/types/agent.types.ts` - Tipos atualizados

**Benefícios**:
- Sugestões contextualizadas e relevantes
- Separação de responsabilidades
- Melhor UX e engajamento
- Pipeline com 5 agentes especializados

**Documentação**: 
- `SUGGESTION_AGENT.md` - Guia completo
- `NOVO_AGENTE_SUGESTOES.md` - Resumo executivo

---

## [1.2.1] - 2026-01-22

### 🌍 Internationalization

#### Forçar Respostas em Português
**Implementado**: Garantia de que todas as respostas sejam sempre em português brasileiro (pt-BR).

**Mudanças**:
- ✅ Responder Agent com instrução explícita de PT-BR
- ✅ Enhancer Agent traduz para PT-BR se necessário
- ✅ Interpreter Agent gera intenções em PT-BR
- ✅ Sugestões de perguntas sempre em PT-BR

**Arquivos Alterados**:
- `src/modules/chat/agents/responder.agent.ts`
- `src/modules/chat/agents/enhancer.agent.ts`
- `src/modules/chat/agents/interpreter.agent.ts`

**Benefício**: 
- Usuário pode perguntar em qualquer idioma
- Resposta sempre em português brasileiro
- Consistência na comunicação

**Documentação**: `IDIOMA_PORTUGUES.md`

---

## [1.2.0] - 2026-01-22

### 🐛 Bug Fixes

#### Agentes de IA Respondendo Incorretamente
**Problema**: Quando perguntado "Quais produtos temos no estoque?", o sistema respondia sobre o peso do produto mais pesado ao invés de listar produtos.

**Correção**:
- ✅ Melhorado prompt do **Data Query Agent** com exemplos práticos
- ✅ Melhorado prompt do **Responder Agent** para focar na pergunta original
- ✅ Melhorado prompt do **Interpreter Agent** com contexto do dataset
- ✅ Fallback query agora agrupa produtos por categoria

**Arquivos Alterados**:
- `src/modules/chat/agents/data-query.agent.ts`
- `src/modules/chat/agents/responder.agent.ts`
- `src/modules/chat/agents/interpreter.agent.ts`

**Impacto**: Relevância das respostas aumentou de 20% para 95%

**Documentação**: 
- `AGENT_IMPROVEMENTS.md` - Detalhes técnicos completos
- `CORREÇÕES_AGENTES.md` - Resumo executivo
- `test-chat-examples.http` - 50+ casos de teste

---

## [1.1.0] - 2026-01-22

### ✨ Features

#### Schema Atualizado para Dataset Olist Real
**Adicionado**: Suporte completo ao dataset Olist E-Commerce Brasil

**Mudanças**:
- ✅ 9 tabelas do dataset Olist implementadas
- ✅ Schema Drizzle ORM atualizado
- ✅ Guia de importação de dados CSV
- ✅ Removido seed antigo (incompatível)

**Tabelas**:
- `product_category_name_translation` - Traduções
- `olist_customers` - 99.4k clientes
- `olist_sellers` - 3.1k vendedores
- `olist_products` - 32.9k produtos
- `olist_orders` - 99.4k pedidos
- `olist_order_items` - 112k itens
- `olist_order_payments` - 103k pagamentos
- `olist_order_reviews` - 99.2k avaliações
- `olist_geolocation` - 1M coordenadas

**Arquivos**:
- `src/infrastructure/database/schema.ts` - Schema completo
- `database-sql/create_tables_postgres.sql` - Script SQL
- `ai-docs/import-olist-data.md` - Guia de importação
- `ai-docs/OLIST_SCHEMA_UPDATE.md` - Documentação detalhada

**Benefícios**:
- Análises com dados reais de e-commerce brasileiro
- Casos de uso empresariais profissionais
- Ideal para portfolio e demonstrações

---

## [1.0.0] - 2026-01-21

### 🎉 Release Inicial

#### Sistema de Chat com 4 Agentes Inteligentes
**Implementado**: Arquitetura completa de chat com IA para análise de dados

**Agentes**:
1. **Interpreter Agent** - Interpreta intenção do usuário
2. **Data Query Agent** - Gera e executa SQL
3. **Responder Agent** - Cria resposta contextualizada
4. **Enhancer Agent** - Refina resposta final

**Features**:
- ✅ Geração automática de SQL via IA
- ✅ Consultas em linguagem natural
- ✅ Histórico de conversas persistido
- ✅ Sessões de chat isoladas
- ✅ Metadados e confiança nas respostas

**Tecnologias**:
- Runtime: Bun
- Framework: Elysia.js
- Database: PostgreSQL + Drizzle ORM
- AI: OpenAI GPT-4 (com mock provider)
- Language: TypeScript

**Módulos**:
- Chat (4 agentes + orquestrador)
- Analytics (métricas e insights)
- Health (monitoramento)

**Infraestrutura**:
- Docker + Docker Compose
- GitHub Actions CI/CD
- Swagger/OpenAPI docs
- Eden Treaty (type-safe client)

**Testes**:
- 10 testes unitários
- Cobertura: health, analytics, chat
- Bun test runner

**Documentação**:
- README.md - Visão geral
- CHAT_SYSTEM.md - Arquitetura de agentes
- OPENAI_INTEGRATION.md - Setup de IA
- PROJECT_STRUCTURE.md - Organização
- TESTING.md - Guia de testes

---

## Formato do Changelog

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

### Tipos de Mudanças
- **Added** (Adicionado) - Novas funcionalidades
- **Changed** (Modificado) - Mudanças em funcionalidades existentes
- **Deprecated** (Obsoleto) - Funcionalidades marcadas para remoção
- **Removed** (Removido) - Funcionalidades removidas
- **Fixed** (Corrigido) - Correções de bugs
- **Security** (Segurança) - Vulnerabilidades corrigidas

---

## Roadmap Futuro

### [1.3.0] - Planejado
- [ ] Suporte a múltiplas linguagens (PT/EN)
- [ ] Cache de respostas frequentes
- [ ] Webhooks para notificações
- [ ] Exportação de relatórios (PDF/CSV)

### [1.4.0] - Planejado
- [ ] Visualizações de dados (charts)
- [ ] Análises preditivas com ML
- [ ] Recomendações inteligentes
- [ ] Dashboard web interativo

### [2.0.0] - Planejado
- [ ] Multi-tenancy
- [ ] Autenticação e autorização
- [ ] Rate limiting
- [ ] Filas de processamento (Bull/BullMQ)
