# Importação de Dados do Olist

## 📊 Dataset Olist E-Commerce

O schema do banco de dados foi configurado para o dataset **Olist Brazilian E-Commerce**, disponível publicamente.

### 🔗 Fontes de Dados

- **Kaggle**: [Brazilian E-Commerce Public Dataset by Olist](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce)
- **CSV Files**: Arquivos disponíveis na pasta `database-sql/`

### 📁 Estrutura dos Dados

O dataset contém 9 tabelas:

1. **product_category_name_translation** - Tradução PT → EN de categorias
2. **olist_customers** - Dados de clientes (99.4k registros)
3. **olist_sellers** - Dados de vendedores (3.1k registros)
4. **olist_products** - Catálogo de produtos (32.9k registros)
5. **olist_orders** - Pedidos realizados (99.4k registros)
6. **olist_order_items** - Itens dos pedidos (112k registros)
7. **olist_order_payments** - Pagamentos (103k registros)
8. **olist_order_reviews** - Avaliações (99.2k registros)
9. **olist_geolocation** - Coordenadas geográficas (1M registros)

### 🚀 Como Importar os Dados

#### 1. Criar as Tabelas

```bash
# Usando o script SQL fornecido
psql -U postgres -d commerce_intelligence -f database-sql/create_tables_postgres.sql
```

#### 2. Importar os CSVs

Os arquivos CSV devem estar na pasta `database-sql/dataset/`:

```bash
# Exemplo para importar customers
psql -U postgres -d commerce_intelligence -c "
COPY olist_customers(customer_id, customer_unique_id, customer_zip_code_prefix, customer_city, customer_state)
FROM '/path/to/database-sql/dataset/olist_customers_dataset.csv'
DELIMITER ','
CSV HEADER;
"
```

#### 3. Verificar Importação

```sql
-- Ver contagem de registros
SELECT 
    'olist_customers' as table_name, COUNT(*) as records FROM olist_customers
UNION ALL
SELECT 'olist_products', COUNT(*) FROM olist_products
UNION ALL
SELECT 'olist_orders', COUNT(*) FROM olist_orders
UNION ALL
SELECT 'olist_order_items', COUNT(*) FROM olist_order_items;
```

### 📝 Script Completo de Importação

```bash
#!/bin/bash

# Configurações
DB_NAME="commerce_intelligence"
DB_USER="postgres"
DATA_DIR="/path/to/database-sql/dataset"

# Importar dados
tables=(
  "product_category_name_translation:product_category_name_translation.csv"
  "olist_customers:olist_customers_dataset.csv"
  "olist_sellers:olist_sellers_dataset.csv"
  "olist_products:olist_products_dataset.csv"
  "olist_orders:olist_orders_dataset.csv"
  "olist_order_items:olist_order_items_dataset.csv"
  "olist_order_payments:olist_order_payments_dataset.csv"
  "olist_order_reviews:olist_order_reviews_dataset.csv"
  "olist_geolocation:olist_geolocation_dataset.csv"
)

for item in "${tables[@]}"; do
  IFS=':' read -r table file <<< "$item"
  echo "Importando $table..."
  
  psql -U $DB_USER -d $DB_NAME -c "
    COPY $table
    FROM '$DATA_DIR/$file'
    DELIMITER ','
    CSV HEADER;
  "
done

echo "✅ Importação concluída!"
```

### 🧪 Consultas de Teste

Após importar os dados, teste com estas queries:

```sql
-- Top 10 categorias de produtos
SELECT 
  pct.product_category_name_english,
  COUNT(*) as total_products
FROM olist_products p
JOIN product_category_name_translation pct 
  ON p.product_category_name = pct.product_category_name
GROUP BY pct.product_category_name_english
ORDER BY total_products DESC
LIMIT 10;

-- Vendas por estado
SELECT 
  c.customer_state,
  COUNT(DISTINCT o.order_id) as total_orders,
  ROUND(SUM(oi.price + oi.freight_value), 2) as total_revenue
FROM olist_orders o
JOIN olist_customers c ON o.customer_id = c.customer_id
JOIN olist_order_items oi ON o.order_id = oi.order_id
GROUP BY c.customer_state
ORDER BY total_revenue DESC;

-- Avaliações médias por categoria
SELECT 
  pct.product_category_name_english,
  ROUND(AVG(r.review_score), 2) as avg_rating,
  COUNT(*) as total_reviews
FROM olist_order_reviews r
JOIN olist_orders o ON r.order_id = o.order_id
JOIN olist_order_items oi ON o.order_id = oi.order_id
JOIN olist_products p ON oi.product_id = p.product_id
JOIN product_category_name_translation pct 
  ON p.product_category_name = pct.product_category_name
GROUP BY pct.product_category_name_english
HAVING COUNT(*) > 100
ORDER BY avg_rating DESC
LIMIT 10;
```

### 💬 Perguntas que o Chat pode Responder

Com os dados importados, você pode perguntar:

**Vendas & Revenue**:
- "Qual foi o faturamento total de vendas?"
- "Quais estados geram mais receita?"
- "Qual o ticket médio dos pedidos?"

**Produtos**:
- "Quantos produtos temos por categoria?"
- "Quais as categorias mais populares?"
- "Produtos mais pesados do catálogo"

**Clientes**:
- "Quantos clientes temos por estado?"
- "Qual estado tem mais clientes?"
- "Distribuição geográfica de clientes"

**Avaliações**:
- "Qual a avaliação média dos produtos?"
- "Categorias com melhor avaliação"
- "Quantas avaliações temos?"

**Pagamentos**:
- "Quais os tipos de pagamento mais usados?"
- "Qual a média de parcelas?"
- "Distribuição de valores de pagamento"

### ⚠️ Importante

- O seed antigo foi removido pois não é compatível com o schema real do Olist
- Use os dados CSV oficiais do dataset Olist
- O schema está 100% compatível com o dataset original
- Todas as tabelas, campos e relacionamentos seguem o padrão Olist

### 📚 Referências

- [Olist Dataset on Kaggle](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce)
- [Documentação do Dataset](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce/data)
- Schema SQL: `database-sql/create_tables_postgres.sql`
