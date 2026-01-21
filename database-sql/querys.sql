-- ==================================================================================
-- COMMERCE INTELLIGENCE - QUERIES SQL PARA AGENTES INTELIGENTES
-- ==================================================================================
-- Este arquivo contém queries SQL essenciais para análise de e-commerce
-- Estas queries servem como contexto para agentes de IA responderem perguntas
-- sobre vendas, clientes, produtos, entregas e performance do negócio
-- ==================================================================================

-- ==================================================================================
-- 1. MÉTRICAS PRINCIPAIS (KPIs)
-- ==================================================================================

-- 1.1 Dashboard de KPIs Principais
-- Retorna: receita total, número de pedidos, ticket médio, clientes únicos
SELECT 
    COUNT(DISTINCT o.order_id) as total_orders,
    COUNT(DISTINCT o.customer_id) as total_customers,
    ROUND(SUM(oi.price + oi.freight_value)::NUMERIC, 2) as total_revenue,
    ROUND(AVG(oi.price + oi.freight_value)::NUMERIC, 2) as avg_ticket,
    ROUND((SUM(oi.price + oi.freight_value) / COUNT(DISTINCT o.order_id))::NUMERIC, 2) as avg_order_value,
    COUNT(DISTINCT oi.product_id) as total_products_sold,
    COUNT(DISTINCT oi.seller_id) as active_sellers
FROM olist_orders o
JOIN olist_order_items oi ON o.order_id = oi.order_id
WHERE o.order_status = 'delivered';

-- 1.2 Receita Total por Período (Mensal)
-- Retorna: receita mensal para análise de tendências
SELECT 
    DATE_TRUNC('month', o.order_purchase_timestamp) as month,
    COUNT(DISTINCT o.order_id) as total_orders,
    ROUND(SUM(oi.price)::NUMERIC, 2) as product_revenue,
    ROUND(SUM(oi.freight_value)::NUMERIC, 2) as freight_revenue,
    ROUND(SUM(oi.price + oi.freight_value)::NUMERIC, 2) as total_revenue,
    ROUND(AVG(oi.price + oi.freight_value)::NUMERIC, 2) as avg_order_value
FROM olist_orders o
JOIN olist_order_items oi ON o.order_id = oi.order_id
WHERE o.order_status = 'delivered'
GROUP BY DATE_TRUNC('month', o.order_purchase_timestamp)
ORDER BY month;

-- 1.3 Taxa de Conversão de Pedidos por Status
-- Retorna: distribuição de pedidos por status
SELECT 
    order_status,
    COUNT(*) as order_count,
    ROUND((COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER ()) * 100, 2) as percentage
FROM olist_orders
GROUP BY order_status
ORDER BY order_count DESC;

-- ==================================================================================
-- 2. ANÁLISE DE PRODUTOS
-- ==================================================================================

-- 2.1 Top 20 Produtos Mais Vendidos
-- Retorna: produtos mais populares com receita e quantidade
SELECT 
    p.product_id,
    pct.product_category_name_english as category,
    COUNT(DISTINCT oi.order_id) as total_orders,
    SUM(oi.price) as total_revenue,
    ROUND(AVG(oi.price)::NUMERIC, 2) as avg_price,
    ROUND(AVG(r.review_score)::NUMERIC, 2) as avg_review_score
FROM olist_order_items oi
JOIN olist_products p ON oi.product_id = p.product_id
LEFT JOIN product_category_name_translation pct ON p.product_category_name = pct.product_category_name
JOIN olist_orders o ON oi.order_id = o.order_id
LEFT JOIN olist_order_reviews r ON o.order_id = r.order_id
WHERE o.order_status = 'delivered'
GROUP BY p.product_id, pct.product_category_name_english
ORDER BY total_orders DESC
LIMIT 20;

-- 2.2 Performance por Categoria de Produto
-- Retorna: análise completa de vendas por categoria
SELECT 
    COALESCE(pct.product_category_name_english, 'Unknown') as category,
    COUNT(DISTINCT oi.order_id) as total_orders,
    COUNT(DISTINCT oi.product_id) as unique_products,
    ROUND(SUM(oi.price)::NUMERIC, 2) as product_revenue,
    ROUND(SUM(oi.freight_value)::NUMERIC, 2) as freight_revenue,
    ROUND(SUM(oi.price + oi.freight_value)::NUMERIC, 2) as total_revenue,
    ROUND(AVG(oi.price)::NUMERIC, 2) as avg_price,
    ROUND(AVG(r.review_score)::NUMERIC, 2) as avg_review_score,
    COUNT(r.review_id) as total_reviews
FROM olist_order_items oi
JOIN olist_products p ON oi.product_id = p.product_id
LEFT JOIN product_category_name_translation pct ON p.product_category_name = pct.product_category_name
JOIN olist_orders o ON oi.order_id = o.order_id
LEFT JOIN olist_order_reviews r ON o.order_id = r.order_id
WHERE o.order_status = 'delivered'
GROUP BY COALESCE(pct.product_category_name_english, 'Unknown')
ORDER BY total_revenue DESC;

-- 2.3 Produtos com Melhor e Pior Avaliação
-- Retorna: produtos ranqueados por review score
WITH product_reviews AS (
    SELECT 
        p.product_id,
        COALESCE(pct.product_category_name_english, 'Unknown') as category,
        COUNT(r.review_id) as review_count,
        ROUND(AVG(r.review_score)::NUMERIC, 2) as avg_review_score,
        COUNT(DISTINCT oi.order_id) as total_orders,
        ROUND(SUM(oi.price)::NUMERIC, 2) as total_revenue
    FROM olist_products p
    LEFT JOIN product_category_name_translation pct ON p.product_category_name = pct.product_category_name
    JOIN olist_order_items oi ON p.product_id = oi.product_id
    JOIN olist_orders o ON oi.order_id = o.order_id
    LEFT JOIN olist_order_reviews r ON o.order_id = r.order_id
    WHERE o.order_status = 'delivered'
    GROUP BY p.product_id, pct.product_category_name_english
    HAVING COUNT(r.review_id) >= 10  -- Mínimo 10 reviews para ser relevante
)
SELECT * FROM product_reviews
ORDER BY avg_review_score DESC, review_count DESC
LIMIT 20;

-- 2.4 Análise de Dimensões e Peso dos Produtos
-- Retorna: estatísticas de produtos por categoria
SELECT 
    COALESCE(pct.product_category_name_english, 'Unknown') as category,
    COUNT(p.product_id) as product_count,
    ROUND(AVG(p.product_weight_g)::NUMERIC, 2) as avg_weight_g,
    ROUND(AVG(p.product_length_cm * p.product_width_cm * p.product_height_cm)::NUMERIC, 2) as avg_volume_cm3,
    ROUND(AVG(p.product_photos_qty)::NUMERIC, 2) as avg_photos_qty,
    ROUND(AVG(p.product_name_lenght)::NUMERIC, 2) as avg_name_length
FROM olist_products p
LEFT JOIN product_category_name_translation pct ON p.product_category_name = pct.product_category_name
GROUP BY COALESCE(pct.product_category_name_english, 'Unknown')
ORDER BY product_count DESC;

-- ==================================================================================
-- 3. ANÁLISE DE CLIENTES
-- ==================================================================================

-- 3.1 Distribuição Geográfica de Clientes
-- Retorna: clientes por estado com volume de compras
SELECT 
    c.customer_state,
    COUNT(DISTINCT c.customer_id) as total_customers,
    COUNT(DISTINCT o.order_id) as total_orders,
    ROUND(AVG(oi.price + oi.freight_value)::NUMERIC, 2) as avg_order_value,
    ROUND(SUM(oi.price + oi.freight_value)::NUMERIC, 2) as total_revenue,
    ROUND((COUNT(DISTINCT o.order_id)::NUMERIC / COUNT(DISTINCT c.customer_id)), 2) as orders_per_customer
FROM olist_customers c
LEFT JOIN olist_orders o ON c.customer_id = o.customer_id
LEFT JOIN olist_order_items oi ON o.order_id = oi.order_id
WHERE o.order_status = 'delivered' OR o.order_status IS NULL
GROUP BY c.customer_state
ORDER BY total_revenue DESC;

-- 3.2 Top Cidades com Mais Compras
-- Retorna: ranking de cidades por volume de pedidos
SELECT 
    c.customer_city,
    c.customer_state,
    COUNT(DISTINCT c.customer_id) as total_customers,
    COUNT(DISTINCT o.order_id) as total_orders,
    ROUND(SUM(oi.price + oi.freight_value)::NUMERIC, 2) as total_revenue,
    ROUND(AVG(oi.price + oi.freight_value)::NUMERIC, 2) as avg_order_value
FROM olist_customers c
JOIN olist_orders o ON c.customer_id = o.customer_id
JOIN olist_order_items oi ON o.order_id = oi.order_id
WHERE o.order_status = 'delivered'
GROUP BY c.customer_city, c.customer_state
ORDER BY total_revenue DESC
LIMIT 20;

-- 3.3 Análise de Clientes Recorrentes (RFM Simplificado)
-- Retorna: segmentação de clientes por recência, frequência e valor monetário
WITH customer_rfm AS (
    SELECT 
        c.customer_unique_id,
        c.customer_state,
        COUNT(DISTINCT o.order_id) as frequency,
        ROUND(SUM(oi.price + oi.freight_value)::NUMERIC, 2) as monetary,
        MAX(o.order_purchase_timestamp) as last_purchase_date,
        EXTRACT(DAYS FROM (NOW() - MAX(o.order_purchase_timestamp))) as days_since_last_purchase
    FROM olist_customers c
    JOIN olist_orders o ON c.customer_id = o.customer_id
    JOIN olist_order_items oi ON o.order_id = oi.order_id
    WHERE o.order_status = 'delivered'
    GROUP BY c.customer_unique_id, c.customer_state
)
SELECT 
    CASE 
        WHEN frequency = 1 THEN 'One-time Customer'
        WHEN frequency = 2 THEN 'Repeat Customer'
        WHEN frequency >= 3 THEN 'Loyal Customer'
    END as customer_segment,
    COUNT(*) as customer_count,
    ROUND(AVG(monetary)::NUMERIC, 2) as avg_lifetime_value,
    ROUND(AVG(days_since_last_purchase)::NUMERIC, 0) as avg_days_since_purchase
FROM customer_rfm
GROUP BY customer_segment
ORDER BY customer_count DESC;

-- 3.4 Clientes de Maior Valor (Top 50)
-- Retorna: clientes com maior lifetime value
SELECT 
    c.customer_unique_id,
    c.customer_city,
    c.customer_state,
    COUNT(DISTINCT o.order_id) as total_orders,
    ROUND(SUM(oi.price + oi.freight_value)::NUMERIC, 2) as lifetime_value,
    ROUND(AVG(oi.price + oi.freight_value)::NUMERIC, 2) as avg_order_value,
    MIN(o.order_purchase_timestamp) as first_purchase,
    MAX(o.order_purchase_timestamp) as last_purchase,
    ROUND(AVG(r.review_score)::NUMERIC, 2) as avg_review_score
FROM olist_customers c
JOIN olist_orders o ON c.customer_id = o.customer_id
JOIN olist_order_items oi ON o.order_id = oi.order_id
LEFT JOIN olist_order_reviews r ON o.order_id = r.order_id
WHERE o.order_status = 'delivered'
GROUP BY c.customer_unique_id, c.customer_city, c.customer_state
ORDER BY lifetime_value DESC
LIMIT 50;

-- ==================================================================================
-- 4. ANÁLISE DE VENDEDORES
-- ==================================================================================

-- 4.1 Performance dos Vendedores
-- Retorna: ranking de vendedores por volume de vendas
SELECT 
    s.seller_id,
    s.seller_city,
    s.seller_state,
    COUNT(DISTINCT oi.order_id) as total_orders,
    COUNT(DISTINCT oi.product_id) as unique_products_sold,
    ROUND(SUM(oi.price)::NUMERIC, 2) as total_revenue,
    ROUND(AVG(oi.price)::NUMERIC, 2) as avg_product_price,
    ROUND(AVG(r.review_score)::NUMERIC, 2) as avg_review_score,
    COUNT(r.review_id) as total_reviews
FROM olist_sellers s
JOIN olist_order_items oi ON s.seller_id = oi.seller_id
JOIN olist_orders o ON oi.order_id = o.order_id
LEFT JOIN olist_order_reviews r ON o.order_id = r.order_id
WHERE o.order_status = 'delivered'
GROUP BY s.seller_id, s.seller_city, s.seller_state
ORDER BY total_revenue DESC
LIMIT 50;

-- 4.2 Vendedores por Estado
-- Retorna: concentração de vendedores por região
SELECT 
    s.seller_state,
    COUNT(DISTINCT s.seller_id) as total_sellers,
    COUNT(DISTINCT oi.order_id) as total_orders,
    ROUND(SUM(oi.price)::NUMERIC, 2) as total_revenue,
    ROUND(AVG(oi.price)::NUMERIC, 2) as avg_price,
    ROUND((COUNT(DISTINCT oi.order_id)::NUMERIC / COUNT(DISTINCT s.seller_id)), 2) as orders_per_seller
FROM olist_sellers s
JOIN olist_order_items oi ON s.seller_id = oi.seller_id
JOIN olist_orders o ON oi.order_id = o.order_id
WHERE o.order_status = 'delivered'
GROUP BY s.seller_state
ORDER BY total_revenue DESC;

-- 4.3 Análise de Cumprimento de Prazos pelos Vendedores
-- Retorna: performance de entrega dos vendedores
SELECT 
    s.seller_id,
    s.seller_state,
    COUNT(oi.order_id) as total_orders,
    COUNT(CASE WHEN o.order_delivered_carrier_date <= oi.shipping_limit_date THEN 1 END) as on_time_handoffs,
    ROUND((COUNT(CASE WHEN o.order_delivered_carrier_date <= oi.shipping_limit_date THEN 1 END)::NUMERIC / 
           NULLIF(COUNT(oi.order_id), 0)) * 100, 2) as on_time_rate,
    ROUND(AVG(EXTRACT(EPOCH FROM (o.order_delivered_carrier_date - o.order_approved_at)) / 86400)::NUMERIC, 2) as avg_days_to_carrier
FROM olist_sellers s
JOIN olist_order_items oi ON s.seller_id = oi.seller_id
JOIN olist_orders o ON oi.order_id = o.order_id
WHERE o.order_status = 'delivered' 
  AND o.order_delivered_carrier_date IS NOT NULL
  AND o.order_approved_at IS NOT NULL
GROUP BY s.seller_id, s.seller_state
HAVING COUNT(oi.order_id) >= 10
ORDER BY on_time_rate DESC
LIMIT 50;

-- ==================================================================================
-- 5. ANÁLISE DE ENTREGAS E LOGÍSTICA
-- ==================================================================================

-- 5.1 Performance de Entrega por Estado
-- Retorna: tempo médio de entrega e atrasos por estado
SELECT 
    c.customer_state,
    COUNT(o.order_id) as total_deliveries,
    ROUND(AVG(EXTRACT(EPOCH FROM (o.order_delivered_customer_date - o.order_purchase_timestamp)) / 86400)::NUMERIC, 2) as avg_delivery_days,
    ROUND(AVG(EXTRACT(EPOCH FROM (o.order_estimated_delivery_date - o.order_delivered_customer_date)) / 86400)::NUMERIC, 2) as avg_early_late_days,
    COUNT(CASE WHEN o.order_delivered_customer_date > o.order_estimated_delivery_date THEN 1 END) as late_deliveries,
    ROUND((COUNT(CASE WHEN o.order_delivered_customer_date > o.order_estimated_delivery_date THEN 1 END)::NUMERIC / 
           COUNT(o.order_id)) * 100, 2) as late_delivery_rate,
    ROUND(AVG(oi.freight_value)::NUMERIC, 2) as avg_freight_cost
FROM olist_orders o
JOIN olist_customers c ON o.customer_id = c.customer_id
JOIN olist_order_items oi ON o.order_id = oi.order_id
WHERE o.order_status = 'delivered'
  AND o.order_delivered_customer_date IS NOT NULL
  AND o.order_estimated_delivery_date IS NOT NULL
GROUP BY c.customer_state
ORDER BY avg_delivery_days;

-- 5.2 Análise de Distância e Custo de Frete
-- Retorna: relação entre distância e frete
WITH order_locations AS (
    SELECT 
        o.order_id,
        c.customer_state,
        s.seller_state,
        CASE WHEN c.customer_state = s.seller_state THEN 'Same State' ELSE 'Different State' END as location_type,
        AVG(oi.freight_value) as avg_freight,
        AVG(oi.price) as avg_price,
        AVG(EXTRACT(EPOCH FROM (o.order_delivered_customer_date - o.order_purchase_timestamp)) / 86400) as delivery_days
    FROM olist_orders o
    JOIN olist_customers c ON o.customer_id = c.customer_id
    JOIN olist_order_items oi ON o.order_id = oi.order_id
    JOIN olist_sellers s ON oi.seller_id = s.seller_id
    WHERE o.order_status = 'delivered'
      AND o.order_delivered_customer_date IS NOT NULL
    GROUP BY o.order_id, c.customer_state, s.seller_state
)
SELECT 
    location_type,
    COUNT(*) as order_count,
    ROUND(AVG(avg_freight)::NUMERIC, 2) as avg_freight_value,
    ROUND(AVG(avg_price)::NUMERIC, 2) as avg_product_price,
    ROUND(AVG(delivery_days)::NUMERIC, 2) as avg_delivery_days,
    ROUND((AVG(avg_freight) / NULLIF(AVG(avg_price), 0) * 100)::NUMERIC, 2) as freight_percentage_of_price
FROM order_locations
GROUP BY location_type;

-- 5.3 Rotas de Entrega Mais Comuns
-- Retorna: rotas mais frequentes entre vendedor e cliente
SELECT 
    s.seller_state || ' -> ' || c.customer_state as route,
    s.seller_state as origin_state,
    c.customer_state as destination_state,
    COUNT(DISTINCT o.order_id) as total_orders,
    ROUND(AVG(EXTRACT(EPOCH FROM (o.order_delivered_customer_date - o.order_purchase_timestamp)) / 86400)::NUMERIC, 2) as avg_delivery_days,
    ROUND(AVG(oi.freight_value)::NUMERIC, 2) as avg_freight_cost,
    ROUND(SUM(oi.price + oi.freight_value)::NUMERIC, 2) as total_revenue
FROM olist_orders o
JOIN olist_customers c ON o.customer_id = c.customer_id
JOIN olist_order_items oi ON o.order_id = oi.order_id
JOIN olist_sellers s ON oi.seller_id = s.seller_id
WHERE o.order_status = 'delivered'
  AND o.order_delivered_customer_date IS NOT NULL
GROUP BY s.seller_state, c.customer_state
ORDER BY total_orders DESC
LIMIT 30;

-- ==================================================================================
-- 6. ANÁLISE DE PAGAMENTOS
-- ==================================================================================

-- 6.1 Métodos de Pagamento
-- Retorna: distribuição de métodos de pagamento e valores
SELECT 
    op.payment_type,
    COUNT(DISTINCT op.order_id) as total_orders,
    ROUND(SUM(op.payment_value)::NUMERIC, 2) as total_value,
    ROUND(AVG(op.payment_value)::NUMERIC, 2) as avg_payment_value,
    ROUND(AVG(op.payment_installments)::NUMERIC, 2) as avg_installments,
    MAX(op.payment_installments) as max_installments,
    ROUND((COUNT(DISTINCT op.order_id)::NUMERIC / SUM(COUNT(DISTINCT op.order_id)) OVER ()) * 100, 2) as order_percentage
FROM olist_order_payments op
JOIN olist_orders o ON op.order_id = o.order_id
WHERE o.order_status = 'delivered'
GROUP BY op.payment_type
ORDER BY total_value DESC;

-- 6.2 Análise de Parcelamento
-- Retorna: uso de parcelamento e relação com valor
SELECT 
    CASE 
        WHEN payment_installments = 1 THEN '1x (À vista)'
        WHEN payment_installments BETWEEN 2 AND 3 THEN '2-3x'
        WHEN payment_installments BETWEEN 4 AND 6 THEN '4-6x'
        WHEN payment_installments BETWEEN 7 AND 12 THEN '7-12x'
        ELSE '12+x'
    END as installment_range,
    COUNT(DISTINCT op.order_id) as order_count,
    ROUND(AVG(op.payment_value)::NUMERIC, 2) as avg_order_value,
    ROUND(SUM(op.payment_value)::NUMERIC, 2) as total_value,
    ROUND((COUNT(DISTINCT op.order_id)::NUMERIC / SUM(COUNT(DISTINCT op.order_id)) OVER ()) * 100, 2) as percentage
FROM olist_order_payments op
JOIN olist_orders o ON op.order_id = o.order_id
WHERE o.order_status = 'delivered'
  AND op.payment_type = 'credit_card'
GROUP BY installment_range
ORDER BY 
    CASE 
        WHEN installment_range = '1x (À vista)' THEN 1
        WHEN installment_range = '2-3x' THEN 2
        WHEN installment_range = '4-6x' THEN 3
        WHEN installment_range = '7-12x' THEN 4
        ELSE 5
    END;

-- 6.3 Pedidos com Múltiplas Formas de Pagamento
-- Retorna: análise de pedidos com mais de um pagamento
SELECT 
    payment_count,
    COUNT(*) as order_count,
    ROUND(AVG(total_payment)::NUMERIC, 2) as avg_total_payment,
    ROUND((COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER ()) * 100, 2) as percentage
FROM (
    SELECT 
        op.order_id,
        COUNT(*) as payment_count,
        SUM(op.payment_value) as total_payment
    FROM olist_order_payments op
    JOIN olist_orders o ON op.order_id = o.order_id
    WHERE o.order_status = 'delivered'
    GROUP BY op.order_id
) payment_summary
GROUP BY payment_count
ORDER BY payment_count;

-- ==================================================================================
-- 7. ANÁLISE DE REVIEWS E SATISFAÇÃO
-- ==================================================================================

-- 7.1 Distribuição de Scores de Review
-- Retorna: distribuição geral de satisfação dos clientes
SELECT 
    review_score,
    COUNT(*) as review_count,
    ROUND((COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER ()) * 100, 2) as percentage,
    COUNT(CASE WHEN review_comment_message IS NOT NULL THEN 1 END) as reviews_with_comment,
    ROUND((COUNT(CASE WHEN review_comment_message IS NOT NULL THEN 1 END)::NUMERIC / COUNT(*)) * 100, 2) as comment_rate
FROM olist_order_reviews
GROUP BY review_score
ORDER BY review_score DESC;

-- 7.2 Fatores que Influenciam Reviews Negativas (Score 1-2)
-- Retorna: análise de pedidos com reviews ruins
SELECT 
    c.customer_state,
    COALESCE(pct.product_category_name_english, 'Unknown') as category,
    COUNT(r.review_id) as negative_reviews,
    ROUND(AVG(EXTRACT(EPOCH FROM (o.order_delivered_customer_date - o.order_purchase_timestamp)) / 86400)::NUMERIC, 2) as avg_delivery_days,
    COUNT(CASE WHEN o.order_delivered_customer_date > o.order_estimated_delivery_date THEN 1 END) as late_deliveries,
    ROUND(AVG(oi.freight_value)::NUMERIC, 2) as avg_freight_cost,
    ROUND(AVG(oi.price)::NUMERIC, 2) as avg_product_price
FROM olist_order_reviews r
JOIN olist_orders o ON r.order_id = o.order_id
JOIN olist_customers c ON o.customer_id = c.customer_id
JOIN olist_order_items oi ON o.order_id = oi.order_id
JOIN olist_products p ON oi.product_id = p.product_id
LEFT JOIN product_category_name_translation pct ON p.product_category_name = pct.product_category_name
WHERE r.review_score IN (1, 2)
  AND o.order_status = 'delivered'
  AND o.order_delivered_customer_date IS NOT NULL
GROUP BY c.customer_state, pct.product_category_name_english
HAVING COUNT(r.review_id) >= 5
ORDER BY negative_reviews DESC
LIMIT 30;

-- 7.3 Correlação entre Tempo de Entrega e Review Score
-- Retorna: impacto do tempo de entrega na satisfação
WITH delivery_reviews AS (
    SELECT 
        r.review_score,
        EXTRACT(EPOCH FROM (o.order_delivered_customer_date - o.order_purchase_timestamp)) / 86400 as delivery_days,
        CASE 
            WHEN o.order_delivered_customer_date <= o.order_estimated_delivery_date THEN 'On Time'
            ELSE 'Late'
        END as delivery_status
    FROM olist_order_reviews r
    JOIN olist_orders o ON r.order_id = o.order_id
    WHERE o.order_status = 'delivered'
      AND o.order_delivered_customer_date IS NOT NULL
      AND o.order_estimated_delivery_date IS NOT NULL
)
SELECT 
    delivery_status,
    COUNT(*) as total_reviews,
    ROUND(AVG(review_score)::NUMERIC, 2) as avg_review_score,
    ROUND(AVG(delivery_days)::NUMERIC, 2) as avg_delivery_days,
    COUNT(CASE WHEN review_score >= 4 THEN 1 END) as positive_reviews,
    ROUND((COUNT(CASE WHEN review_score >= 4 THEN 1 END)::NUMERIC / COUNT(*)) * 100, 2) as positive_rate
FROM delivery_reviews
GROUP BY delivery_status;

-- 7.4 Produtos/Categorias com Mais Reclamações
-- Retorna: categorias problemáticas baseado em reviews
SELECT 
    COALESCE(pct.product_category_name_english, 'Unknown') as category,
    COUNT(r.review_id) as total_reviews,
    ROUND(AVG(r.review_score)::NUMERIC, 2) as avg_review_score,
    COUNT(CASE WHEN r.review_score <= 2 THEN 1 END) as negative_reviews,
    COUNT(CASE WHEN r.review_score >= 4 THEN 1 END) as positive_reviews,
    ROUND((COUNT(CASE WHEN r.review_score <= 2 THEN 1 END)::NUMERIC / COUNT(r.review_id)) * 100, 2) as negative_rate,
    ROUND((COUNT(CASE WHEN r.review_score >= 4 THEN 1 END)::NUMERIC / COUNT(r.review_id)) * 100, 2) as positive_rate
FROM olist_order_reviews r
JOIN olist_orders o ON r.order_id = o.order_id
JOIN olist_order_items oi ON o.order_id = oi.order_id
JOIN olist_products p ON oi.product_id = p.product_id
LEFT JOIN product_category_name_translation pct ON p.product_category_name = pct.product_category_name
WHERE o.order_status = 'delivered'
GROUP BY pct.product_category_name_english
HAVING COUNT(r.review_id) >= 50
ORDER BY negative_rate DESC
LIMIT 20;

-- ==================================================================================
-- 8. ANÁLISE TEMPORAL E SAZONALIDADE
-- ==================================================================================

-- 8.1 Vendas por Dia da Semana
-- Retorna: padrão de vendas por dia da semana
SELECT 
    TO_CHAR(o.order_purchase_timestamp, 'Day') as day_of_week,
    EXTRACT(DOW FROM o.order_purchase_timestamp) as day_number,
    COUNT(DISTINCT o.order_id) as total_orders,
    ROUND(SUM(oi.price + oi.freight_value)::NUMERIC, 2) as total_revenue,
    ROUND(AVG(oi.price + oi.freight_value)::NUMERIC, 2) as avg_order_value
FROM olist_orders o
JOIN olist_order_items oi ON o.order_id = oi.order_id
WHERE o.order_status = 'delivered'
GROUP BY day_of_week, day_number
ORDER BY day_number;

-- 8.2 Vendas por Hora do Dia
-- Retorna: distribuição de vendas ao longo do dia
SELECT 
    EXTRACT(HOUR FROM order_purchase_timestamp) as hour,
    COUNT(DISTINCT order_id) as total_orders,
    ROUND(AVG(order_value)::NUMERIC, 2) as avg_order_value
FROM (
    SELECT 
        o.order_id,
        o.order_purchase_timestamp,
        SUM(oi.price + oi.freight_value) as order_value
    FROM olist_orders o
    JOIN olist_order_items oi ON o.order_id = oi.order_id
    WHERE o.order_status = 'delivered'
    GROUP BY o.order_id, o.order_purchase_timestamp
) hourly_orders
GROUP BY hour
ORDER BY hour;

-- 8.3 Crescimento Mês a Mês (MoM Growth)
-- Retorna: taxa de crescimento mensal
WITH monthly_revenue AS (
    SELECT 
        DATE_TRUNC('month', o.order_purchase_timestamp) as month,
        COUNT(DISTINCT o.order_id) as orders,
        ROUND(SUM(oi.price + oi.freight_value)::NUMERIC, 2) as revenue
    FROM olist_orders o
    JOIN olist_order_items oi ON o.order_id = oi.order_id
    WHERE o.order_status = 'delivered'
    GROUP BY DATE_TRUNC('month', o.order_purchase_timestamp)
)
SELECT 
    month,
    orders,
    revenue,
    LAG(revenue) OVER (ORDER BY month) as previous_month_revenue,
    ROUND(((revenue - LAG(revenue) OVER (ORDER BY month)) / 
           NULLIF(LAG(revenue) OVER (ORDER BY month), 0) * 100)::NUMERIC, 2) as revenue_growth_percentage,
    orders - LAG(orders) OVER (ORDER BY month) as order_growth
FROM monthly_revenue
ORDER BY month;

-- ==================================================================================
-- 9. COHORT ANALYSIS
-- ==================================================================================

-- 9.1 Análise de Cohort por Mês de Primeira Compra
-- Retorna: retenção de clientes por cohort
WITH customer_cohorts AS (
    SELECT 
        c.customer_unique_id,
        DATE_TRUNC('month', MIN(o.order_purchase_timestamp)) as cohort_month,
        DATE_TRUNC('month', o.order_purchase_timestamp) as order_month,
        COUNT(DISTINCT o.order_id) as orders,
        SUM(oi.price + oi.freight_value) as revenue
    FROM olist_customers c
    JOIN olist_orders o ON c.customer_id = o.customer_id
    JOIN olist_order_items oi ON o.order_id = oi.order_id
    WHERE o.order_status = 'delivered'
    GROUP BY c.customer_unique_id, DATE_TRUNC('month', o.order_purchase_timestamp)
)
SELECT 
    cohort_month,
    COUNT(DISTINCT customer_unique_id) as cohort_size,
    ROUND(SUM(revenue)::NUMERIC, 2) as total_revenue,
    ROUND(AVG(orders)::NUMERIC, 2) as avg_orders_per_customer
FROM customer_cohorts
GROUP BY cohort_month
ORDER BY cohort_month;

-- ==================================================================================
-- 10. ANÁLISES AVANÇADAS E INSIGHTS
-- ==================================================================================

-- 10.1 Cross-selling: Categorias Frequentemente Compradas Juntas
-- Retorna: pares de categorias que aparecem juntos em pedidos
SELECT 
    pct1.product_category_name_english as category_1,
    pct2.product_category_name_english as category_2,
    COUNT(DISTINCT oi1.order_id) as orders_together,
    ROUND(AVG(oi1.price + oi2.price)::NUMERIC, 2) as avg_combined_value
FROM olist_order_items oi1
JOIN olist_order_items oi2 ON oi1.order_id = oi2.order_id AND oi1.product_id < oi2.product_id
JOIN olist_products p1 ON oi1.product_id = p1.product_id
JOIN olist_products p2 ON oi2.product_id = p2.product_id
JOIN product_category_name_translation pct1 ON p1.product_category_name = pct1.product_category_name
JOIN product_category_name_translation pct2 ON p2.product_category_name = pct2.product_category_name
JOIN olist_orders o ON oi1.order_id = o.order_id
WHERE o.order_status = 'delivered'
  AND pct1.product_category_name_english != pct2.product_category_name_english
GROUP BY pct1.product_category_name_english, pct2.product_category_name_english
HAVING COUNT(DISTINCT oi1.order_id) >= 10
ORDER BY orders_together DESC
LIMIT 30;

-- 10.2 Elasticidade de Preço por Categoria
-- Retorna: relação entre preço e volume de vendas
WITH category_price_ranges AS (
    SELECT 
        COALESCE(pct.product_category_name_english, 'Unknown') as category,
        CASE 
            WHEN oi.price < 50 THEN 'Under $50'
            WHEN oi.price BETWEEN 50 AND 100 THEN '$50-$100'
            WHEN oi.price BETWEEN 100 AND 200 THEN '$100-$200'
            WHEN oi.price BETWEEN 200 AND 500 THEN '$200-$500'
            ELSE 'Over $500'
        END as price_range,
        COUNT(*) as items_sold,
        ROUND(AVG(r.review_score)::NUMERIC, 2) as avg_review_score
    FROM olist_order_items oi
    JOIN olist_products p ON oi.product_id = p.product_id
    LEFT JOIN product_category_name_translation pct ON p.product_category_name = pct.product_category_name
    JOIN olist_orders o ON oi.order_id = o.order_id
    LEFT JOIN olist_order_reviews r ON o.order_id = r.order_id
    WHERE o.order_status = 'delivered'
    GROUP BY pct.product_category_name_english, price_range
)
SELECT 
    category,
    price_range,
    items_sold,
    avg_review_score,
    ROUND((items_sold::NUMERIC / SUM(items_sold) OVER (PARTITION BY category)) * 100, 2) as percentage_of_category
FROM category_price_ranges
WHERE category IN (
    SELECT category 
    FROM category_price_ranges 
    GROUP BY category 
    HAVING SUM(items_sold) >= 100
)
ORDER BY category, 
    CASE 
        WHEN price_range = 'Under $50' THEN 1
        WHEN price_range = '$50-$100' THEN 2
        WHEN price_range = '$100-$200' THEN 3
        WHEN price_range = '$200-$500' THEN 4
        ELSE 5
    END;

-- 10.3 Identificação de Fraudes Potenciais ou Anomalias
-- Retorna: pedidos com padrões suspeitos
SELECT 
    o.order_id,
    o.customer_id,
    c.customer_state,
    o.order_status,
    COUNT(oi.order_item_id) as items_count,
    ROUND(SUM(oi.price + oi.freight_value)::NUMERIC, 2) as total_order_value,
    SUM(op.payment_value) as total_payment_value,
    ROUND(ABS(SUM(oi.price + oi.freight_value) - SUM(op.payment_value))::NUMERIC, 2) as payment_difference,
    COUNT(op.payment_sequential) as payment_count
FROM olist_orders o
JOIN olist_customers c ON o.customer_id = c.customer_id
JOIN olist_order_items oi ON o.order_id = oi.order_id
JOIN olist_order_payments op ON o.order_id = op.order_id
GROUP BY o.order_id, o.customer_id, c.customer_state, o.order_status
HAVING 
    ABS(SUM(oi.price + oi.freight_value) - SUM(op.payment_value)) > 10  -- Diferença > $10
    OR COUNT(op.payment_sequential) > 4  -- Mais de 4 pagamentos
    OR SUM(oi.price + oi.freight_value) > 5000  -- Valor muito alto
ORDER BY payment_difference DESC
LIMIT 50;

-- 10.4 Net Promoter Score (NPS) Aproximado
-- Retorna: NPS baseado em review scores
WITH nps_calculation AS (
    SELECT 
        review_score,
        COUNT(*) as review_count,
        CASE 
            WHEN review_score >= 4 THEN 'Promoter'
            WHEN review_score = 3 THEN 'Passive'
            ELSE 'Detractor'
        END as nps_category
    FROM olist_order_reviews
    GROUP BY review_score
)
SELECT 
    nps_category,
    SUM(review_count) as count,
    ROUND((SUM(review_count)::NUMERIC / SUM(SUM(review_count)) OVER ()) * 100, 2) as percentage
FROM nps_calculation
GROUP BY nps_category
ORDER BY 
    CASE 
        WHEN nps_category = 'Promoter' THEN 1
        WHEN nps_category = 'Passive' THEN 2
        ELSE 3
    END;

-- ==================================================================================
-- FIM DO ARQUIVO
-- ==================================================================================
-- Total de queries: 35+ queries organizadas em 10 categorias
-- Uso: Estas queries podem ser executadas diretamente ou adaptadas conforme necessário
-- para fornecer contexto aos agentes de IA
-- ==================================================================================
