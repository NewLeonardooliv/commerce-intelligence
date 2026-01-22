# Configuração da Integração OpenAI

## Visão Geral

Este projeto suporta integração com a API da OpenAI para análise de dados inteligente e geração de insights utilizando modelos de linguagem avançados.

## Configuração

### 1. Obter API Key da OpenAI

1. Acesse [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Faça login ou crie uma conta
3. Clique em "Create new secret key"
4. Copie a chave gerada (ela só será exibida uma vez)

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```bash
# AI Configuration
AI_PROVIDER=openai
AI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AI_MODEL=gpt-4-turbo-preview
```

### 3. Modelos Disponíveis

Você pode escolher entre os seguintes modelos da OpenAI:

- **gpt-4-turbo-preview** (Recomendado) - Mais recente e eficiente
- **gpt-4** - Alta qualidade, mais lento e custoso
- **gpt-4o** - Otimizado para velocidade e custo
- **gpt-3.5-turbo** - Mais rápido e econômico, qualidade boa

Configure o modelo desejado na variável `AI_MODEL`.

## Uso

### Análise de Dados

```typescript
import { aiService } from '@infrastructure/ai/ai-service';

const data = {
  revenue: 50000,
  customers: 1200,
  orders: 3500,
};

const analysis = await aiService.analyzeData(data);
console.log(analysis);
// {
//   summary: "...",
//   insights: [...],
//   patterns: [...],
//   recommendations: [...]
// }
```

### Geração de Insights

```typescript
const insights = await aiService.generateInsights(data);
console.log(insights);
// [
//   "Revenue increased by 15%...",
//   "Customer retention is...",
//   ...
// ]
```

### Completions Personalizados

```typescript
import { OpenAiProvider } from '@infrastructure/ai/openai-provider';

const provider = new OpenAiProvider();

const response = await provider.complete({
  messages: [
    {
      role: 'system',
      content: 'You are a helpful data analyst.',
    },
    {
      role: 'user',
      content: 'What trends do you see in this data?',
    },
  ],
  temperature: 0.7,
  maxTokens: 1000,
});

console.log(response.content);
```

## Alternar entre Providers

O sistema suporta dois providers:

1. **OpenAI** - Usa a API real da OpenAI
2. **Mock** - Retorna dados mockados (útil para desenvolvimento)

Para alternar, modifique a variável `AI_PROVIDER`:

```bash
# Usar OpenAI
AI_PROVIDER=openai

# Usar Mock (sem custo)
AI_PROVIDER=mock
```

## Estrutura de Arquivos

```
src/infrastructure/ai/
├── ai-provider.interface.ts  # Interface base para providers
├── ai-service.ts             # Serviço principal de IA
├── openai-provider.ts        # Implementação OpenAI
└── mock-ai-provider.ts       # Implementação Mock
```

## Tratamento de Erros

O provider da OpenAI implementa tratamento robusto de erros:

- **API Key inválida**: Lança erro na inicialização
- **Erro de API**: Captura e relança como `AppError`
- **JSON parsing**: Fallback gracioso se a resposta não for JSON válido

## Custos

Cada chamada à API da OpenAI tem um custo baseado no número de tokens:

- **Prompt tokens**: Texto enviado à API
- **Completion tokens**: Texto gerado pela API

O provider retorna informações de uso em cada resposta:

```typescript
{
  content: "...",
  usage: {
    promptTokens: 150,
    completionTokens: 300,
    totalTokens: 450
  }
}
```

### Estimativa de Custos (Março 2024)

- **GPT-4 Turbo**: ~$0.01 por 1K prompt tokens, ~$0.03 por 1K completion tokens
- **GPT-3.5 Turbo**: ~$0.0005 por 1K prompt tokens, ~$0.0015 por 1K completion tokens

## Boas Práticas

1. **Use temperaturas baixas (0.3-0.5)** para análises que requerem precisão
2. **Use temperaturas médias (0.7-0.8)** para geração criativa
3. **Limite maxTokens** para controlar custos
4. **Cache resultados** quando possível
5. **Use Mock provider** durante desenvolvimento para evitar custos

## Troubleshooting

### Erro: "OpenAI API key is not configured"

- Verifique se a variável `AI_API_KEY` está definida no `.env`
- Confirme que a chave começa com `sk-`

### Erro: "Incorrect API key provided"

- A chave da API está inválida ou expirada
- Gere uma nova chave no painel da OpenAI

### Erro: "Rate limit exceeded"

- Você excedeu o limite de requisições por minuto
- Aguarde alguns segundos e tente novamente
- Considere implementar rate limiting no seu lado

### Respostas não JSON

O provider possui fallback automático se a resposta não for JSON válido, mas você pode ajustar os prompts para melhorar a consistência.