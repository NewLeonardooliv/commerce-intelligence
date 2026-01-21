# Dataset SQL Scripts

This directory contains SQL scripts to create database tables and load data from the Olist Brazilian E-Commerce CSV files.

## Files Overview

### SQL Scripts

- **`create_tables_postgres.sql`** - PostgreSQL table creation script (recommended for this project)
- **`load_data_postgres.sql`** - PostgreSQL data loading script
- **`create_tables.sql`** - MySQL/MariaDB table creation script
- **`load_data.sql`** - MySQL/MariaDB data loading script

### CSV Dataset Files

1. `product_category_name_translation.csv` - Product category translations (Portuguese → English)
2. `olist_customers_dataset.csv` - Customer information
3. `olist_sellers_dataset.csv` - Seller information
4. `olist_products_dataset.csv` - Product catalog
5. `olist_orders_dataset.csv` - Order information
6. `olist_order_items_dataset.csv` - Order line items
7. `olist_order_payments_dataset.csv` - Payment information
8. `olist_order_reviews_dataset.csv` - Customer reviews
9. `olist_geolocation_dataset.csv` - Geolocation data

## Database Schema

```
product_category_name_translation
└── olist_products
    └── olist_order_items
        └── olist_orders
            ├── olist_order_payments
            └── olist_order_reviews

olist_customers
└── olist_orders

olist_sellers
└── olist_order_items

olist_geolocation (standalone)
```

## Usage Instructions

### For PostgreSQL (Recommended)

#### 1. Start the PostgreSQL database

```bash
docker-compose up -d postgres
```

#### 2. Create the tables

```bash
docker exec -i commerce-intelligence-postgres-1 psql -U postgres -d commerce_intelligence < dataset/create_tables_postgres.sql
```

Or connect to the database directly:

```bash
psql -h localhost -U postgres -d commerce_intelligence -f dataset/create_tables_postgres.sql
```

#### 3. Load the data

```bash
psql -h localhost -U postgres -d commerce_intelligence -f dataset/load_data_postgres.sql
```

**Note**: The `\COPY` command in PostgreSQL requires running from psql client. Make sure you're in the project root directory when running this command.

#### Alternative: Load data using Docker

```bash
# Copy CSV files to the container
docker cp dataset/ commerce-intelligence-postgres-1:/tmp/

# Execute the load script
docker exec -i commerce-intelligence-postgres-1 psql -U postgres -d commerce_intelligence <<EOF
\COPY product_category_name_translation FROM '/tmp/dataset/product_category_name_translation.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"');
\COPY olist_customers FROM '/tmp/dataset/olist_customers_dataset.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"');
\COPY olist_sellers FROM '/tmp/dataset/olist_sellers_dataset.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"');
\COPY olist_products FROM '/tmp/dataset/olist_products_dataset.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"', NULL '');
\COPY olist_orders FROM '/tmp/dataset/olist_orders_dataset.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"', NULL '');
\COPY olist_order_items FROM '/tmp/dataset/olist_order_items_dataset.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"');
\COPY olist_order_payments FROM '/tmp/dataset/olist_order_payments_dataset.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"');
\COPY olist_order_reviews FROM '/tmp/dataset/olist_order_reviews_dataset.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"', NULL '');
\COPY olist_geolocation(geolocation_zip_code_prefix, geolocation_lat, geolocation_lng, geolocation_city, geolocation_state) FROM '/tmp/dataset/olist_geolocation_dataset.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"');
EOF
```

### For MySQL/MariaDB

#### 1. Create the tables

```bash
mysql -u root -p commerce_intelligence < dataset/create_tables.sql
```

#### 2. Load the data

```bash
mysql -u root -p --local-infile=1 commerce_intelligence < dataset/load_data.sql
```

**Note**: Make sure `local_infile` is enabled in your MySQL configuration.

## Verification

After loading the data, you can verify the row counts:

```sql
SELECT 'product_category_name_translation' AS table_name, COUNT(*) AS row_count FROM product_category_name_translation
UNION ALL
SELECT 'olist_customers', COUNT(*) FROM olist_customers
UNION ALL
SELECT 'olist_sellers', COUNT(*) FROM olist_sellers
UNION ALL
SELECT 'olist_products', COUNT(*) FROM olist_products
UNION ALL
SELECT 'olist_orders', COUNT(*) FROM olist_orders
UNION ALL
SELECT 'olist_order_items', COUNT(*) FROM olist_order_items
UNION ALL
SELECT 'olist_order_payments', COUNT(*) FROM olist_order_payments
UNION ALL
SELECT 'olist_order_reviews', COUNT(*) FROM olist_order_reviews
UNION ALL
SELECT 'olist_geolocation', COUNT(*) FROM olist_geolocation
ORDER BY table_name;
```

## Sample Queries

### Get top 10 customers by order count

```sql
SELECT 
    c.customer_id,
    c.customer_city,
    c.customer_state,
    COUNT(o.order_id) as order_count
FROM olist_customers c
JOIN olist_orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.customer_city, c.customer_state
ORDER BY order_count DESC
LIMIT 10;
```

### Get average delivery time by state

```sql
SELECT 
    c.customer_state,
    COUNT(o.order_id) as total_orders,
    ROUND(AVG(EXTRACT(EPOCH FROM (o.order_delivered_customer_date - o.order_purchase_timestamp))/86400), 2) as avg_delivery_days
FROM olist_orders o
JOIN olist_customers c ON o.customer_id = c.customer_id
WHERE o.order_delivered_customer_date IS NOT NULL
GROUP BY c.customer_state
ORDER BY avg_delivery_days;
```

### Get revenue by product category

```sql
SELECT 
    pct.product_category_name_english,
    COUNT(DISTINCT oi.order_id) as order_count,
    SUM(oi.price + oi.freight_value) as total_revenue
FROM olist_order_items oi
JOIN olist_products p ON oi.product_id = p.product_id
JOIN product_category_name_translation pct ON p.product_category_name = pct.product_category_name
GROUP BY pct.product_category_name_english
ORDER BY total_revenue DESC
LIMIT 10;
```

### Get payment type distribution

```sql
SELECT 
    payment_type,
    COUNT(*) as payment_count,
    SUM(payment_value) as total_value,
    ROUND(AVG(payment_installments), 2) as avg_installments
FROM olist_order_payments
GROUP BY payment_type
ORDER BY total_value DESC;
```

## Troubleshooting

### Permission denied when loading data

If you get permission errors:
- Ensure the CSV files are readable by the database user
- For PostgreSQL, use absolute paths or ensure you're in the correct directory
- For Docker, copy the files into the container first

### Foreign key constraint errors

Make sure to:
1. Load tables in the correct order (as shown in the load scripts)
2. Parent tables must be loaded before child tables
3. Check for any missing or invalid references in the CSV files

### Character encoding issues

If you encounter encoding problems:
- Ensure your database is set to UTF-8 encoding
- For PostgreSQL: `CREATE DATABASE commerce_intelligence WITH ENCODING 'UTF8';`
- For MySQL: Add `CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci` to table definitions

## Data Source

This dataset is the Brazilian E-Commerce Public Dataset by Olist, available on Kaggle:
https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce

## License

The dataset is licensed under CC BY-NC-SA 4.0 by Olist.
