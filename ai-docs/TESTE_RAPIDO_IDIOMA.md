# 🧪 Teste Rápido - Multi-Idioma

## 🎯 Objetivo

Validar que todas as respostas são sempre em português, independente do idioma da pergunta.

---

## 🚀 Como Testar

### 1. Iniciar o Servidor
```bash
bun dev
```

### 2. Executar Testes

#### Teste A: Pergunta em Inglês
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How many products do we have?"}' \
  | jq -r '.data.response'
```

**✅ Esperado**: 
```
Temos 32.951 produtos no catálogo...
```
(resposta em português)

---

#### Teste B: Pergunta em Espanhol
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Cuántos clientes tenemos?"}' \
  | jq -r '.data.response'
```

**✅ Esperado**: 
```
Temos 99.441 clientes cadastrados...
```
(resposta em português)

---

#### Teste C: Pergunta em Francês
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Combien de produits avons-nous?"}' \
  | jq -r '.data.response'
```

**✅ Esperado**: 
```
Temos 32.951 produtos...
```
(resposta em português)

---

#### Teste D: Sugestões em Português
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the best selling products?"}' \
  | jq '.data.metadata.suggestions'
```

**✅ Esperado**: 
```json
[
  "Quais são as categorias mais vendidas?",
  "Quantos produtos foram vendidos no total?",
  "Qual o ticket médio de vendas?"
]
```
(sugestões em português)

---

#### Teste E: Interpretação em Português
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me the revenue by state"}' \
  | jq '.data.metadata.interpretation.intent'
```

**✅ Esperado**: 
```
"Calcular receita total agrupada por estado"
```
(interpretação em português)

---

## 📊 Checklist de Validação

Execute os testes acima e marque:

- [ ] Teste A: Resposta em português ✅
- [ ] Teste B: Resposta em português ✅
- [ ] Teste C: Resposta em português ✅
- [ ] Teste D: Sugestões em português ✅
- [ ] Teste E: Interpretação em português ✅

---

## 🔍 Validação Completa (JSON Inteiro)

Para ver toda a resposta:
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How many customers do we have?"}' \
  | jq '.'
```

Verifique que TODOS os campos estão em português:
```json
{
  "success": true,
  "data": {
    "sessionId": "1",
    "response": "Temos 99.441 clientes cadastrados...",  ← PT-BR ✅
    "metadata": {
      "interpretation": {
        "intent": "Contar total de clientes..."  ← PT-BR ✅
      },
      "sources": [
        "Banco de dados de produtos",  ← PT-BR ✅
        "Análise de intenção com IA"   ← PT-BR ✅
      ],
      "suggestions": [
        "Quantos clientes temos por estado?",  ← PT-BR ✅
        "Qual estado tem mais clientes?",      ← PT-BR ✅
        "Como está a distribuição geográfica?" ← PT-BR ✅
      ]
    }
  }
}
```

---

## 🎯 Resultado Esperado

✅ **TUDO em português**, mesmo com pergunta em outro idioma!

---

## 📁 Mais Testes

Para testes completos, veja: `test-multi-idioma.http`
- 10 testes em diferentes idiomas
- Compatível com VS Code REST Client ou similar

---

## 🐛 Troubleshooting

### Resposta em inglês/outro idioma?

1. Verifique que você está usando a versão mais recente:
   ```bash
   git pull
   ```

2. Reinicie o servidor:
   ```bash
   bun dev
   ```

3. Verifique o provider de IA em `.env`:
   ```env
   AI_PROVIDER=openai  # Melhor qualidade
   # ou
   AI_PROVIDER=mock    # Para desenvolvimento
   ```

### Mock Provider

Com `AI_PROVIDER=mock`, as respostas são genéricas mas ainda em português.
Para melhor qualidade, use `AI_PROVIDER=openai` com uma API key válida.

---

**Status**: ✅ Pronto para testar!  
**Versão**: 1.2.1  
**Data**: 2026-01-22
