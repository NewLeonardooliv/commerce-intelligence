# Database Schema Documentation

## Overview

This document describes the complete database schema for the Olist Brazilian E-Commerce dataset.

## Entity Relationship Diagram (Text)

```
┌────────────────────────────────────┐
│ product_category_name_translation  │
│────────────────────────────────────│
│ PK product_category_name (VARCHAR) │
│    product_category_name_english   │
└────────────────────────────────────┘
               ↑
               │
               │ FK
               │
┌──────────────────────────┐
│    olist_products        │
│──────────────────────────│
│ PK product_id (VARCHAR)  │
│ FK product_category_name │
│    product_name_lenght   │
│    product_description_* │
│    product_photos_qty    │
│    product_weight_g      │
│    product_length_cm     │
│    product_height_cm     │
│    product_width_cm      │
└──────────────────────────┘
               ↑
               │
               │ FK
               │
┌──────────────────────────────────┐         ┌──────────────────────────┐
│    olist_order_items             │         │    olist_sellers         │
│──────────────────────────────────│         │──────────────────────────│
│ PK order_id (VARCHAR)            │←────────│ PK seller_id (VARCHAR)   │
│ PK order_item_id (INT)           │   FK    │    seller_zip_code_*     │
│ FK product_id                    │         │    seller_city           │
│ FK seller_id                     │         │    seller_state          │
│    shipping_limit_date           │         └──────────────────────────┘
│    price                         │
│    freight_value                 │
└──────────────────────────────────┘
               ↑
               │
               │ FK
               │
┌──────────────────────────────────┐
│       olist_orders               │
│──────────────────────────────────│
│ PK order_id (VARCHAR)            │
│ FK customer_id                   │
│    order_status                  │
│    order_purchase_timestamp      │
│    order_approved_at             │
│    order_delivered_carrier_date  │
│    order_delivered_customer_date │
│    order_estimated_delivery_date │
└──────────────────────────────────┘
        ↑               ↑
        │               │
        │ FK            │ FK
        │               │
┌──────────────────────────────────┐     ┌──────────────────────────┐
│    olist_order_payments          │     │   olist_order_reviews    │
│──────────────────────────────────│     │──────────────────────────│
│ PK order_id (VARCHAR)            │     │ PK review_id (VARCHAR)   │
│ PK payment_sequential (INT)      │     │ FK order_id              │
│    payment_type                  │     │    review_score          │
│    payment_installments          │     │    review_comment_title  │
│    payment_value                 │     │    review_comment_message│
└──────────────────────────────────┘     │    review_creation_date  │
                                          │    review_answer_*       │
                                          └──────────────────────────┘
                ↓
                │ FK
                │
┌──────────────────────────────────┐
│      olist_customers             │
│──────────────────────────────────│
│ PK customer_id (VARCHAR)         │
│    customer_unique_id            │
│    customer_zip_code_prefix      │
│    customer_city                 │
│    customer_state                │
└──────────────────────────────────┘


┌──────────────────────────────────┐
│      olist_geolocation           │
│      (Standalone Reference)      │
│──────────────────────────────────│
│ PK id (SERIAL)                   │
│    geolocation_zip_code_prefix   │
│    geolocation_lat               │
│    geolocation_lng               │
│    geolocation_city              │
│    geolocation_state             │
└──────────────────────────────────┘
```

## Table Descriptions

### 1. product_category_name_translation
**Purpose**: Translation table for product categories from Portuguese to English

| Column | Type | Description |
|--------|------|-------------|
| product_category_name | VARCHAR(100) | Portuguese category name (PK) |
| product_category_name_english | VARCHAR(100) | English translation |

**Indexes**: Primary Key

---

### 2. olist_customers
**Purpose**: Customer information and location

| Column | Type | Description |
|--------|------|-------------|
| customer_id | VARCHAR(50) | Unique customer identifier (PK) |
| customer_unique_id | VARCHAR(50) | Unique customer ID across system |
| customer_zip_code_prefix | VARCHAR(10) | First 5 digits of zip code |
| customer_city | VARCHAR(100) | Customer city |
| customer_state | VARCHAR(2) | Customer state (2-letter code) |

**Indexes**: 
- Primary Key: customer_id
- idx_customer_unique_id
- idx_customer_zip

---

### 3. olist_sellers
**Purpose**: Seller information and location

| Column | Type | Description |
|--------|------|-------------|
| seller_id | VARCHAR(50) | Unique seller identifier (PK) |
| seller_zip_code_prefix | VARCHAR(10) | First 5 digits of zip code |
| seller_city | VARCHAR(100) | Seller city |
| seller_state | VARCHAR(2) | Seller state (2-letter code) |

**Indexes**: 
- Primary Key: seller_id
- idx_seller_zip

---

### 4. olist_products
**Purpose**: Product catalog with dimensions and category

| Column | Type | Description |
|--------|------|-------------|
| product_id | VARCHAR(50) | Unique product identifier (PK) |
| product_category_name | VARCHAR(100) | Category name (FK) |
| product_name_lenght | INTEGER | Length of product name |
| product_description_lenght | INTEGER | Length of product description |
| product_photos_qty | INTEGER | Number of product photos |
| product_weight_g | INTEGER | Product weight in grams |
| product_length_cm | INTEGER | Product length in cm |
| product_height_cm | INTEGER | Product height in cm |
| product_width_cm | INTEGER | Product width in cm |

**Indexes**: 
- Primary Key: product_id
- idx_product_category

**Foreign Keys**: 
- product_category_name → product_category_name_translation.product_category_name

---

### 5. olist_orders
**Purpose**: Order header information with status and timestamps

| Column | Type | Description |
|--------|------|-------------|
| order_id | VARCHAR(50) | Unique order identifier (PK) |
| customer_id | VARCHAR(50) | Customer who placed order (FK) |
| order_status | VARCHAR(20) | Order status (delivered, shipped, etc.) |
| order_purchase_timestamp | TIMESTAMP | Purchase timestamp |
| order_approved_at | TIMESTAMP | Payment approval timestamp |
| order_delivered_carrier_date | TIMESTAMP | Handoff to carrier timestamp |
| order_delivered_customer_date | TIMESTAMP | Delivery to customer timestamp |
| order_estimated_delivery_date | TIMESTAMP | Estimated delivery date |

**Indexes**: 
- Primary Key: order_id
- idx_customer_id
- idx_order_status
- idx_purchase_timestamp

**Foreign Keys**: 
- customer_id → olist_customers.customer_id

**Order Status Values**:
- `delivered` - Order delivered to customer
- `shipped` - Order shipped
- `processing` - Order being prepared
- `canceled` - Order canceled
- `invoiced` - Order invoiced
- `unavailable` - Product unavailable
- `approved` - Payment approved

---

### 6. olist_order_items
**Purpose**: Individual line items within orders

| Column | Type | Description |
|--------|------|-------------|
| order_id | VARCHAR(50) | Order identifier (PK, FK) |
| order_item_id | INTEGER | Item sequence number within order (PK) |
| product_id | VARCHAR(50) | Product identifier (FK) |
| seller_id | VARCHAR(50) | Seller identifier (FK) |
| shipping_limit_date | TIMESTAMP | Seller shipping limit date |
| price | DECIMAL(10,2) | Item price |
| freight_value | DECIMAL(10,2) | Freight/shipping cost |

**Indexes**: 
- Primary Key: (order_id, order_item_id)
- idx_oi_product_id
- idx_oi_seller_id

**Foreign Keys**: 
- order_id → olist_orders.order_id
- product_id → olist_products.product_id
- seller_id → olist_sellers.seller_id

---

### 7. olist_order_payments
**Purpose**: Payment information for orders (can have multiple payments per order)

| Column | Type | Description |
|--------|------|-------------|
| order_id | VARCHAR(50) | Order identifier (PK, FK) |
| payment_sequential | INTEGER | Payment sequence number (PK) |
| payment_type | VARCHAR(30) | Payment method |
| payment_installments | INTEGER | Number of installments |
| payment_value | DECIMAL(10,2) | Payment amount |

**Indexes**: 
- Primary Key: (order_id, payment_sequential)
- idx_payment_type

**Foreign Keys**: 
- order_id → olist_orders.order_id

**Payment Types**:
- `credit_card` - Credit card payment
- `boleto` - Brazilian boleto payment
- `voucher` - Voucher payment
- `debit_card` - Debit card payment

---

### 8. olist_order_reviews
**Purpose**: Customer reviews and ratings for orders

| Column | Type | Description |
|--------|------|-------------|
| review_id | VARCHAR(50) | Unique review identifier (PK) |
| order_id | VARCHAR(50) | Order being reviewed (FK) |
| review_score | INTEGER | Review score (1-5) |
| review_comment_title | TEXT | Review title |
| review_comment_message | TEXT | Review message |
| review_creation_date | TIMESTAMP | Review creation date |
| review_answer_timestamp | TIMESTAMP | Seller response timestamp |

**Indexes**: 
- Primary Key: review_id
- idx_or_order_id
- idx_review_score

**Foreign Keys**: 
- order_id → olist_orders.order_id

**Review Scores**: 1 (worst) to 5 (best)

---

### 9. olist_geolocation
**Purpose**: Geolocation coordinates for Brazilian zip codes

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Auto-incrementing ID (PK) |
| geolocation_zip_code_prefix | VARCHAR(10) | First 5 digits of zip code |
| geolocation_lat | DECIMAL(10,8) | Latitude |
| geolocation_lng | DECIMAL(11,8) | Longitude |
| geolocation_city | VARCHAR(100) | City name |
| geolocation_state | VARCHAR(2) | State code (2-letter) |

**Indexes**: 
- Primary Key: id
- idx_geo_zip
- idx_geo_city
- idx_geo_state

**Note**: This table can have multiple entries for the same zip code prefix as coordinates can vary within a zip code area.

---

## Data Volume Estimates

Based on typical Olist dataset:

| Table | Approximate Rows |
|-------|-----------------|
| product_category_name_translation | ~75 |
| olist_customers | ~100,000 |
| olist_sellers | ~3,000 |
| olist_products | ~33,000 |
| olist_orders | ~100,000 |
| olist_order_items | ~112,000 |
| olist_order_payments | ~103,000 |
| olist_order_reviews | ~100,000 |
| olist_geolocation | ~1,000,000 |

## Common Queries

### Get complete order information
```sql
SELECT 
    o.order_id,
    o.order_status,
    c.customer_city,
    c.customer_state,
    oi.product_id,
    p.product_category_name,
    pct.product_category_name_english,
    s.seller_city,
    oi.price,
    oi.freight_value,
    op.payment_type,
    op.payment_value,
    r.review_score
FROM olist_orders o
JOIN olist_customers c ON o.customer_id = c.customer_id
JOIN olist_order_items oi ON o.order_id = oi.order_id
JOIN olist_products p ON oi.product_id = p.product_id
LEFT JOIN product_category_name_translation pct ON p.product_category_name = pct.product_category_name
JOIN olist_sellers s ON oi.seller_id = s.seller_id
LEFT JOIN olist_order_payments op ON o.order_id = op.order_id
LEFT JOIN olist_order_reviews r ON o.order_id = r.order_id
WHERE o.order_status = 'delivered'
LIMIT 10;
```

### Calculate delivery performance
```sql
SELECT 
    c.customer_state,
    AVG(EXTRACT(EPOCH FROM (o.order_delivered_customer_date - o.order_purchase_timestamp))/86400) as avg_delivery_days,
    AVG(EXTRACT(EPOCH FROM (o.order_estimated_delivery_date - o.order_delivered_customer_date))/86400) as avg_delay_days
FROM olist_orders o
JOIN olist_customers c ON o.customer_id = c.customer_id
WHERE o.order_delivered_customer_date IS NOT NULL
GROUP BY c.customer_state
ORDER BY avg_delivery_days;
```

### Revenue analysis by category
```sql
SELECT 
    pct.product_category_name_english,
    COUNT(DISTINCT oi.order_id) as order_count,
    SUM(oi.price) as product_revenue,
    SUM(oi.freight_value) as freight_revenue,
    SUM(oi.price + oi.freight_value) as total_revenue,
    AVG(r.review_score) as avg_review_score
FROM olist_order_items oi
JOIN olist_products p ON oi.product_id = p.product_id
JOIN product_category_name_translation pct ON p.product_category_name = pct.product_category_name
JOIN olist_orders o ON oi.order_id = o.order_id
LEFT JOIN olist_order_reviews r ON o.order_id = r.order_id
WHERE o.order_status = 'delivered'
GROUP BY pct.product_category_name_english
ORDER BY total_revenue DESC;
```
