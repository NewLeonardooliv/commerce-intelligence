# Quick Start Guide

## 🚀 Início Rápido

### 1. Instalar Dependências
```bash
bun install
```

### 2. Configurar Ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações (API keys, etc).

### 3. Iniciar Servidor de Desenvolvimento
```bash
bun dev
```

O servidor estará disponível em: `http://localhost:3000`

### 4. Acessar Documentação da API
Abra seu navegador em: `http://localhost:3000/swagger`

## 📝 Testando a API

### Usando cURL

**Health Check:**
```bash
curl http://localhost:3000/api/v1/health
```

**Criar um Agente:**
```bash
curl -X POST http://localhost:3000/api/v1/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sales Analyzer",
    "description": "Analisa dados de vendas e fornece insights",
    "capabilities": ["data-analysis", "forecasting"]
  }'
```

**Query Analytics:**
```bash
curl -X POST http://localhost:3000/api/v1/analytics/query \
  -H "Content-Type: application/json" \
  -d '{
    "metrics": ["revenue", "orders"],
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "granularity": "day"
  }'
```

### Usando arquivo requests.http

Abra o arquivo `requests.http` no VS Code com a extensão REST Client instalada.

## 🧪 Executar Testes

```bash
bun test
```

## 📚 Estrutura do Projeto

```
src/
├── app.ts                  # Entry point
├── config/                 # Configurações
├── modules/                # Módulos de funcionalidades
│   ├── agents/             # Gestão de agentes IA
│   ├── analytics/          # Análise de dados
│   └── health/             # Health checks
├── shared/                 # Recursos compartilhados
│   ├── errors/             # Tratamento de erros
│   ├── middlewares/        # Middlewares
│   ├── types/              # Definições de tipos
│   └── utils/              # Utilitários
└── infrastructure/         # Infraestrutura
    ├── ai/                 # Integração com IA
    └── storage/            # Armazenamento
```

## 🎯 Principais Funcionalidades

### 1. Agentes Inteligentes
- Criar e gerenciar agentes de IA
- Executar tarefas com diferentes capacidades
- Monitorar status e resultados

### 2. Analytics
- Query de métricas com granularidade temporal
- Geração de insights com IA
- Análise de padrões e tendências

### 3. Type Safety
- End-to-end type safety com Eden Treaty
- Validação automática de schemas
- IntelliSense completo no cliente

## 🔧 Scripts Disponíveis

```bash
bun dev              # Desenvolvimento com hot-reload
bun start            # Produção
bun test             # Testes unitários
bun run type-check   # Verificação de tipos
bun run format       # Formatar código
```

## 📖 Documentação Completa

- **API.md** - Documentação completa da API
- **DEVELOPMENT.md** - Guia de desenvolvimento
- **DEPLOYMENT.md** - Guia de deployment
- **PROJECT_STRUCTURE.md** - Arquitetura do projeto

## 🐳 Docker

```bash
docker-compose up -d    # Iniciar com Docker
docker-compose logs -f  # Ver logs
docker-compose down     # Parar
```

## 💡 Próximos Passos

1. Integrar com provedor de IA real (OpenAI, Anthropic, etc)
2. Adicionar banco de dados (PostgreSQL, MongoDB)
3. Implementar autenticação e autorização
4. Adicionar cache com Redis
5. Configurar rate limiting
6. Implementar background jobs
7. Adicionar monitoramento e logs

## 🤝 Contribuindo

Este projeto segue princípios de Clean Code:
- Código auto-explicativo
- Evite comentários desnecessários
- Nomes descritivos
- Funções pequenas e focadas
- SOLID principles

## 📝 Métricas Disponíveis

- `revenue`: Receita total
- `orders`: Número de pedidos
- `customers`: Número de clientes
- `conversion-rate`: Taxa de conversão
- `average-order-value`: Valor médio do pedido
- `customer-lifetime-value`: Valor vitalício do cliente

## 🎭 Capacidades dos Agentes

- `data-analysis`: Análise de dados
- `pattern-recognition`: Reconhecimento de padrões
- `forecasting`: Previsão de tendências
- `anomaly-detection`: Detecção de anomalias
- `recommendation`: Geração de recomendações
- `sentiment-analysis`: Análise de sentimentos

## 🌐 Endpoints Principais

- `GET /api/v1/health` - Health check
- `POST /api/v1/agents` - Criar agente
- `GET /api/v1/agents` - Listar agentes
- `POST /api/v1/agents/tasks` - Criar tarefa
- `POST /api/v1/analytics/query` - Query analytics
- `POST /api/v1/analytics/insights` - Gerar insights
