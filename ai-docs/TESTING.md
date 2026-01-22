# Guia de Testes

## Executar Testes

```bash
# Todos os testes
bun test

# Testes com watch mode
bun test:watch

# Testes específicos
bun test tests/ai-controller.test.ts
```

## Testes da OpenAI

Os testes da OpenAI requerem:

1. **API Key configurada**:
   ```bash
   # .env
   AI_API_KEY=sk-proj-your-api-key-here
   AI_PROVIDER=openai
   ```

2. **Conexão de rede ativa**

3. **Executar com permissões de rede**:
   ```bash
   # Para testes que fazem chamadas à API real
   bun test tests/openai-provider.test.ts
   ```

### Testes Sem Custos

Para testar sem fazer chamadas reais à API:

```bash
# Configure o Mock Provider
echo "AI_PROVIDER=mock" >> .env

# Execute os testes
bun test
```

O Mock Provider simula respostas da OpenAI sem custos.

## Status dos Testes

### ✅ Testes Passando

- **Health Module**: Todos os endpoints funcionando
- **AI Controller**: Endpoints REST funcionais
- **Analytics Module**: Queries e métricas (exceto insights com OpenAI)
- **Estrutura**: Todos os arquivos sem erros de linter

### ⚠️ Testes que Requerem API Key

- **OpenAI Provider**: Requer `AI_API_KEY` válida
- **AI Analytics com OpenAI**: Requer provider configurado

## Executar Exemplos

```bash
# Configure a API key primeiro
echo "AI_API_KEY=sk-proj-your-key" >> .env
echo "AI_PROVIDER=openai" >> .env

# Execute os exemplos
bun run examples/openai-usage.ts
```

## Testar via API REST

```bash
# 1. Inicie o servidor
bun dev

# 2. Em outro terminal, teste os endpoints

# Health check
curl http://localhost:3000/api/v1/health

# Analisar dados (Mock)
curl -X POST http://localhost:3000/api/v1/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{"data": {"revenue": 100000}}'

# Ver estatísticas
curl http://localhost:3000/api/v1/ai/usage/stats
```

## Documentação Swagger

Com o servidor rodando:

1. Acesse: http://localhost:3000/swagger
2. Teste os endpoints interativamente
3. Veja a documentação completa

## Troubleshooting

### Erro: "Connection error"

- Verifique se há conexão com a internet
- Confirme que a API key está configurada
- Tente usar o Mock provider

### Erro: "API key is not configured"

```bash
# Configure no .env
AI_PROVIDER=openai
AI_API_KEY=sk-proj-your-key-here
```

### Testes muito lentos

Os testes da OpenAI fazem chamadas reais à API e podem ser lentos. Use:

```bash
# Aumentar timeout
bun test --timeout 30000
```

Ou use Mock provider para testes rápidos:

```bash
AI_PROVIDER=mock bun test
```

## Cobertura de Testes

### Arquivos com Testes

- `tests/health.test.ts` - Testes de health checks
- `tests/analytics.test.ts` - Testes do módulo de analytics
- `tests/ai-controller.test.ts` - Testes da API de AI
- `tests/openai-provider.test.ts` - Testes do provider OpenAI

### Cobertura Atual

- ✅ Health endpoints
- ✅ AI REST API
- ✅ Analytics queries
- ✅ Mock provider
- ⚠️ OpenAI provider (requer API key)
- ⚠️ Logger de uso (requer API key)

## Boas Práticas

1. **Use Mock em desenvolvimento**: Evite custos desnecessários
2. **Teste com OpenAI antes de deploy**: Valide a integração real
3. **Monitore custos**: Use os endpoints de estatísticas
4. **Configure limites**: Implemente rate limiting em produção

## CI/CD

Para pipelines de CI/CD:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: |
    echo "AI_PROVIDER=mock" >> .env
    bun test
```

Use Mock provider em CI para evitar custos e dependência de API keys.
