# Guia de Queries SQL para Agentes Inteligentes

## 📋 Visão Geral

Este documento descreve as 35+ queries SQL disponíveis no arquivo `querys.sql` para uso pelos agentes inteligentes do sistema Commerce Intelligence. Estas queries fornecem insights profundos sobre vendas, clientes, produtos, entregas e satisfação.

## 🎯 Propósito

As queries foram projetadas para:
- **Fornecer contexto** aos agentes de IA para responder perguntas de negócio
- **Gerar insights** automaticamente sobre performance do e-commerce
- **Identificar padrões** e oportunidades de melhoria
- **Suportar decisões** baseadas em dados

## 📊 Categorias de Queries

### 1. Métricas Principais (KPIs)
**Queries**: 1.1 - 1.3

**Quando usar:**
- "Quais são os principais KPIs do negócio?"
- "Como está a performance geral das vendas?"
- "Qual a taxa de conversão de pedidos?"

**Insights fornecidos:**
- Receita total e por período
- Número de pedidos e clientes
- Ticket médio e valor médio do pedido
- Taxa de conversão por status

**Exemplo de uso pelo agente:**
```
Usuário: "Como está o negócio este mês?"
Agente: Executa query 1.1 e 1.2, analisa resultados e responde com métricas chave
```

---

### 2. Análise de Produtos
**Queries**: 2.1 - 2.4

**Quando usar:**
- "Quais produtos vendem mais?"
- "Qual categoria tem melhor performance?"
- "Produtos com melhores/piores avaliações?"

**Insights fornecidos:**
- Top produtos por vendas e receita
- Performance por categoria
- Correlação entre avaliações e vendas
- Análise de dimensões e características

**Casos de uso:**
- Otimização de estoque
- Decisões de marketing
- Identificação de produtos problemáticos

---

### 3. Análise de Clientes
**Queries**: 3.1 - 3.4

**Quando usar:**
- "Onde estão nossos melhores clientes?"
- "Quem são os clientes de maior valor?"
- "Como segmentar nossa base de clientes?"

**Insights fornecidos:**
- Distribuição geográfica de clientes
- Segmentação RFM (Recência, Frequência, Valor Monetário)
- Clientes recorrentes vs one-time
- Lifetime value por cliente

**Estratégias sugeridas:**
- Campanhas regionalizadas
- Programas de fidelidade
- Reativação de clientes inativos

---

### 4. Análise de Vendedores
**Queries**: 4.1 - 4.3

**Quando usar:**
- "Quais vendedores performam melhor?"
- "Como está a distribuição de vendedores?"
- "Vendedores cumprem prazos?"

**Insights fornecidos:**
- Ranking de vendedores por receita
- Concentração geográfica de vendedores
- Taxa de cumprimento de prazos
- Qualidade do serviço por vendedor

**Aplicações:**
- Identificar parceiros estratégicos
- Melhorar logística
- Ações de suporte a vendedores

---

### 5. Análise de Entregas e Logística
**Queries**: 5.1 - 5.3

**Quando usar:**
- "Quanto tempo demora a entrega?"
- "Quais estados têm entregas mais lentas?"
- "Como o frete impacta as vendas?"

**Insights fornecidos:**
- Tempo médio de entrega por região
- Taxa de atrasos
- Correlação distância vs custo de frete
- Rotas mais eficientes

**Otimizações possíveis:**
- Melhorar centros de distribuição
- Negociar fretes por rota
- Prever delays e comunicar clientes

---

### 6. Análise de Pagamentos
**Queries**: 6.1 - 6.3

**Quando usar:**
- "Quais formas de pagamento são mais usadas?"
- "Como funciona o parcelamento?"
- "Há fraudes ou anomalias?"

**Insights fornecidos:**
- Distribuição de métodos de pagamento
- Análise de parcelamento
- Pedidos com múltiplos pagamentos
- Ticket médio por método

**Decisões estratégicas:**
- Oferecer novos métodos
- Ajustar política de parcelamento
- Detectar padrões suspeitos

---

### 7. Análise de Reviews e Satisfação
**Queries**: 7.1 - 7.4

**Quando usar:**
- "Qual o nível de satisfação dos clientes?"
- "O que causa reviews negativas?"
- "Atrasos afetam a satisfação?"

**Insights fornecidos:**
- Distribuição de scores de review
- Fatores que influenciam reviews ruins
- Correlação entrega x satisfação
- Categorias problemáticas

**Ações recomendadas:**
- Melhorar produtos/categorias específicas
- Focar em entregas pontuais
- Responder reviews negativas

---

### 8. Análise Temporal e Sazonalidade
**Queries**: 8.1 - 8.3

**Quando usar:**
- "Quais dias/horários vendem mais?"
- "Como é o crescimento mês a mês?"
- "Há sazonalidade nas vendas?"

**Insights fornecidos:**
- Padrões de venda por dia da semana
- Distribuição de vendas por hora
- Taxa de crescimento mensal (MoM)
- Tendências temporais

**Planejamento:**
- Campanhas em horários de pico
- Gestão de estoque sazonal
- Previsão de demanda

---

### 9. Cohort Analysis
**Queries**: 9.1

**Quando usar:**
- "Clientes retornam após primeira compra?"
- "Qual a retenção por cohort?"
- "LTV por período de aquisição?"

**Insights fornecidos:**
- Análise de retenção
- Comportamento de cohorts
- Valor por período de aquisição

**Uso estratégico:**
- Avaliar eficácia de campanhas
- Melhorar onboarding
- Calcular CAC e LTV

---

### 10. Análises Avançadas e Insights
**Queries**: 10.1 - 10.4

**Quando usar:**
- "Produtos são comprados juntos?"
- "Como preço afeta vendas?"
- "Há pedidos suspeitos?"
- "Qual nosso NPS?"

**Insights fornecidos:**
- Cross-selling opportunities
- Elasticidade de preço
- Detecção de anomalias/fraudes
- Net Promoter Score (NPS)

**Aplicações avançadas:**
- Recomendações de produtos
- Estratégia de pricing
- Prevenção de fraudes
- Medição de lealdade

---

## 🤖 Como os Agentes Devem Usar

### Fluxo de Trabalho do Agente

1. **Receber pergunta do usuário**
   ```
   Exemplo: "Quais são as categorias mais vendidas?"
   ```

2. **Identificar categoria relevante**
   ```
   Categoria: Análise de Produtos
   Query relevante: 2.2 (Performance por Categoria)
   ```

3. **Executar query apropriada**
   ```sql
   -- Query 2.2 do arquivo querys.sql
   ```

4. **Analisar resultados**
   ```
   - Extrair insights principais
   - Identificar padrões
   - Calcular métricas derivadas se necessário
   ```

5. **Gerar resposta contextualizada**
   ```
   "Com base nos dados, as 3 categorias mais vendidas são:
   1. Health & Beauty - R$ 1.2M (15% das vendas)
   2. Watches & Gifts - R$ 950K (12% das vendas)
   3. Bed, Bath & Table - R$ 850K (11% das vendas)
   
   A categoria Health & Beauty também tem a melhor avaliação média (4.2/5)."
   ```

### Exemplos de Interação

#### Exemplo 1: Análise de Performance
```
Usuário: "Como está a performance do e-commerce?"

Agente:
1. Executa query 1.1 (Dashboard de KPIs)
2. Executa query 1.2 (Receita por período)
3. Analisa tendências
4. Responde: "O e-commerce está saudável com:
   - 98.000 pedidos entregues
   - Receita total de R$ 15.5M
   - Ticket médio de R$ 158
   - Crescimento de 8% no último mês"
```

#### Exemplo 2: Problema de Satisfação
```
Usuário: "Por que temos reviews negativas?"

Agente:
1. Executa query 7.1 (Distribuição de reviews)
2. Executa query 7.2 (Fatores de reviews negativas)
3. Executa query 7.3 (Correlação entrega x review)
4. Identifica: "As principais causas são:
   - 45% das reviews negativas têm entregas atrasadas
   - Estados do Norte têm 2x mais atrasos
   - Categoria 'Móveis' tem mais problemas (avg 2.8/5)"
5. Sugere: "Recomendo focar em melhorar entregas no Norte
   e revisar fornecedores de Móveis"
```

#### Exemplo 3: Oportunidades de Vendas
```
Usuário: "Onde podemos aumentar vendas?"

Agente:
1. Executa query 10.1 (Cross-selling)
2. Executa query 2.2 (Performance por categoria)
3. Executa query 3.1 (Distribuição geográfica)
4. Identifica oportunidades:
   - "Clientes que compram 'Beleza' frequentemente compram 'Perfumes'
   - SP tem 40% dos clientes mas apenas 30% da receita
   - Parcelamento em 4-6x tem melhor conversão"
5. Sugere estratégias específicas
```

---

## 📈 Métricas Chave por Contexto

### Para Perguntas sobre Receita
- **Queries**: 1.1, 1.2, 2.2
- **Métricas**: Total revenue, AOV, MoM growth
- **Segmentação**: Por período, categoria, região

### Para Perguntas sobre Clientes
- **Queries**: 3.1, 3.2, 3.3, 3.4
- **Métricas**: Total customers, LTV, RFM segments
- **Segmentação**: Por estado, cidade, comportamento

### Para Perguntas sobre Operações
- **Queries**: 5.1, 5.2, 5.3, 4.3
- **Métricas**: Delivery time, on-time rate, freight cost
- **Segmentação**: Por rota, estado, vendedor

### Para Perguntas sobre Satisfação
- **Queries**: 7.1, 7.2, 7.3, 10.4
- **Métricas**: Avg review score, NPS, complaint rate
- **Segmentação**: Por categoria, região, fator

---

## 🎨 Templates de Resposta

### Template: Análise de Tendência
```
"Analisando os dados de [período], observo que:

📊 Métricas Principais:
- [Métrica 1]: [Valor] ([Variação]% vs período anterior)
- [Métrica 2]: [Valor] ([Variação]% vs período anterior)

📈 Tendências:
- [Tendência positiva identificada]
- [Tendência negativa identificada]

💡 Insights:
- [Insight 1 com dados]
- [Insight 2 com dados]

🎯 Recomendações:
1. [Ação recomendada 1]
2. [Ação recomendada 2]
"
```

### Template: Comparação
```
"Comparando [A] vs [B]:

[A]:
- [Métrica 1]: [Valor]
- [Métrica 2]: [Valor]
- Performance: [Avaliação]

[B]:
- [Métrica 1]: [Valor]
- [Métrica 2]: [Valor]
- Performance: [Avaliação]

Vencedor: [A/B] supera por [X]% em [métrica chave]
"
```

### Template: Root Cause Analysis
```
"Investigando [problema], identifiquei:

🔍 Dados:
- [Estatística 1]
- [Estatística 2]

🎯 Causas Principais:
1. [Causa 1] - Impacto: [%]
2. [Causa 2] - Impacto: [%]

🔧 Soluções Propostas:
1. [Solução 1] - Prioridade: [Alta/Média/Baixa]
2. [Solução 2] - Prioridade: [Alta/Média/Baixa]
"
```

---

## 🔄 Queries Combinadas

Algumas perguntas requerem múltiplas queries:

### "Por que as vendas caíram?"
1. Query 1.2 - Tendência temporal
2. Query 2.2 - Performance por categoria
3. Query 7.1 - Reviews (pode indicar problemas)
4. Query 5.1 - Entregas (pode causar insatisfação)

### "Qual a melhor estratégia de crescimento?"
1. Query 3.1 - Onde estão os clientes
2. Query 2.2 - O que vendem melhor
3. Query 10.1 - Cross-selling opportunities
4. Query 8.3 - Tendências de crescimento

### "Como melhorar a satisfação?"
1. Query 7.1, 7.2, 7.3, 7.4 - Reviews analysis
2. Query 5.1 - Delivery performance
3. Query 4.3 - Seller performance
4. Query 2.2 - Product quality by category

---

## ⚡ Performance e Otimização

### Queries Rápidas (< 1s)
- 1.1, 1.3, 6.1, 7.1
- Use para respostas rápidas

### Queries Moderadas (1-5s)
- 2.1, 2.2, 3.1, 4.1, 5.1
- Maioria das análises

### Queries Pesadas (> 5s)
- 9.1, 10.1
- Use com cache quando possível

### Dicas de Otimização
- Sempre filtrar por `order_status = 'delivered'` quando apropriado
- Usar LIMIT em queries exploratórias
- Considerar cache para queries frequentes
- Materializar views para queries complexas recorrentes

---

## 🚀 Próximos Passos

### Expansões Futuras
1. **Análise Preditiva**
   - Forecast de vendas
   - Previsão de churn
   - Recomendações personalizadas

2. **Machine Learning**
   - Segmentação automática
   - Detecção de anomalias
   - Pricing dinâmico

3. **Real-time Analytics**
   - Dashboard ao vivo
   - Alertas automáticos
   - Monitoramento contínuo

### Views Materializadas Sugeridas
```sql
-- View para KPIs diários
CREATE MATERIALIZED VIEW daily_kpis AS
SELECT ... FROM olist_orders ...;

-- View para performance de categoria
CREATE MATERIALIZED VIEW category_performance AS
SELECT ... FROM olist_order_items ...;

-- Refresh periódico
REFRESH MATERIALIZED VIEW daily_kpis;
```

---

## 📚 Referências

- **Schema**: Ver `create_tables_postgres.sql`
- **Queries**: Ver `querys.sql`
- **Dataset**: Olist Brazilian E-Commerce (Kaggle)

---

## 🤝 Contribuindo

Para adicionar novas queries:
1. Identifique a categoria apropriada
2. Documente o propósito e casos de uso
3. Otimize a query antes de adicionar
4. Atualize este guia com exemplos

---

**Última atualização**: 2026-01-21
**Versão**: 1.0.0
**Queries totais**: 35+
