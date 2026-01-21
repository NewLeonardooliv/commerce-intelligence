-- PostgreSQL Script to Create Tables for Olist E-Commerce Dataset
-- This script creates all necessary tables to import CSV data from the dataset folder
-- Database: commerce_intelligence

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS olist_order_reviews CASCADE;
DROP TABLE IF EXISTS olist_order_payments CASCADE;
DROP TABLE IF EXISTS olist_order_items CASCADE;
DROP TABLE IF EXISTS olist_orders CASCADE;
DROP TABLE IF EXISTS olist_products CASCADE;
DROP TABLE IF EXISTS olist_customers CASCADE;
DROP TABLE IF EXISTS olist_sellers CASCADE;
DROP TABLE IF EXISTS olist_geolocation CASCADE;
DROP TABLE IF EXISTS product_category_name_translation CASCADE;

-- ====================
-- 1. Product Category Translation Table
-- ====================
CREATE TABLE product_category_name_translation (
    product_category_name VARCHAR(100) PRIMARY KEY,
    product_category_name_english VARCHAR(100) NOT NULL
);

COMMENT ON TABLE product_category_name_translation IS 'Translation of product category names from Portuguese to English';

-- ====================
-- 2. Customers Table
-- ====================
CREATE TABLE olist_customers (
    customer_id VARCHAR(50) PRIMARY KEY,
    customer_unique_id VARCHAR(50) NOT NULL,
    customer_zip_code_prefix VARCHAR(10) NOT NULL,
    customer_city VARCHAR(100) NOT NULL,
    customer_state VARCHAR(2) NOT NULL
);

CREATE INDEX idx_customer_unique_id ON olist_customers(customer_unique_id);
CREATE INDEX idx_customer_zip ON olist_customers(customer_zip_code_prefix);

COMMENT ON TABLE olist_customers IS 'Customer information including location details';

-- ====================
-- 3. Sellers Table
-- ====================
CREATE TABLE olist_sellers (
    seller_id VARCHAR(50) PRIMARY KEY,
    seller_zip_code_prefix VARCHAR(10) NOT NULL,
    seller_city VARCHAR(100) NOT NULL,
    seller_state VARCHAR(2) NOT NULL
);

CREATE INDEX idx_seller_zip ON olist_sellers(seller_zip_code_prefix);

COMMENT ON TABLE olist_sellers IS 'Seller information including location details';

-- ====================
-- 4. Products Table
-- ====================
CREATE TABLE olist_products (
    product_id VARCHAR(50) PRIMARY KEY,
    product_category_name VARCHAR(100),
    product_name_lenght INTEGER,
    product_description_lenght INTEGER,
    product_photos_qty INTEGER,
    product_weight_g INTEGER,
    product_length_cm INTEGER,
    product_height_cm INTEGER,
    product_width_cm INTEGER,
    FOREIGN KEY (product_category_name) REFERENCES product_category_name_translation(product_category_name)
);

CREATE INDEX idx_product_category ON olist_products(product_category_name);

COMMENT ON TABLE olist_products IS 'Product information including dimensions and category';

-- ====================
-- 5. Orders Table
-- ====================
CREATE TABLE olist_orders (
    order_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    order_status VARCHAR(20) NOT NULL,
    order_purchase_timestamp TIMESTAMP NOT NULL,
    order_approved_at TIMESTAMP,
    order_delivered_carrier_date TIMESTAMP,
    order_delivered_customer_date TIMESTAMP,
    order_estimated_delivery_date TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES olist_customers(customer_id)
);

CREATE INDEX idx_customer_id ON olist_orders(customer_id);
CREATE INDEX idx_order_status ON olist_orders(order_status);
CREATE INDEX idx_purchase_timestamp ON olist_orders(order_purchase_timestamp);

COMMENT ON TABLE olist_orders IS 'Order information with status and delivery timestamps';

-- ====================
-- 6. Order Items Table
-- ====================
CREATE TABLE olist_order_items (
    order_id VARCHAR(50) NOT NULL,
    order_item_id INTEGER NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    seller_id VARCHAR(50) NOT NULL,
    shipping_limit_date TIMESTAMP NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    freight_value DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (order_id, order_item_id),
    FOREIGN KEY (order_id) REFERENCES olist_orders(order_id),
    FOREIGN KEY (product_id) REFERENCES olist_products(product_id),
    FOREIGN KEY (seller_id) REFERENCES olist_sellers(seller_id)
);

CREATE INDEX idx_oi_product_id ON olist_order_items(product_id);
CREATE INDEX idx_oi_seller_id ON olist_order_items(seller_id);

COMMENT ON TABLE olist_order_items IS 'Individual items within orders with pricing information';

-- ====================
-- 7. Order Payments Table
-- ====================
CREATE TABLE olist_order_payments (
    order_id VARCHAR(50) NOT NULL,
    payment_sequential INTEGER NOT NULL,
    payment_type VARCHAR(30) NOT NULL,
    payment_installments INTEGER NOT NULL,
    payment_value DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (order_id, payment_sequential),
    FOREIGN KEY (order_id) REFERENCES olist_orders(order_id)
);

CREATE INDEX idx_payment_type ON olist_order_payments(payment_type);

COMMENT ON TABLE olist_order_payments IS 'Payment information for orders including type and installments';

-- ====================
-- 8. Order Reviews Table
-- ====================
CREATE TABLE olist_order_reviews (
    review_id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    review_score INTEGER NOT NULL,
    review_comment_title TEXT,
    review_comment_message TEXT,
    review_creation_date TIMESTAMP NOT NULL,
    review_answer_timestamp TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES olist_orders(order_id)
);

CREATE INDEX idx_or_order_id ON olist_order_reviews(order_id);
CREATE INDEX idx_review_score ON olist_order_reviews(review_score);

COMMENT ON TABLE olist_order_reviews IS 'Customer reviews and ratings for orders';

-- ====================
-- 9. Geolocation Table
-- ====================
CREATE TABLE olist_geolocation (
    id SERIAL PRIMARY KEY,
    geolocation_zip_code_prefix VARCHAR(10) NOT NULL,
    geolocation_lat DECIMAL(10, 8) NOT NULL,
    geolocation_lng DECIMAL(11, 8) NOT NULL,
    geolocation_city VARCHAR(100) NOT NULL,
    geolocation_state VARCHAR(2) NOT NULL
);

CREATE INDEX idx_geo_zip ON olist_geolocation(geolocation_zip_code_prefix);
CREATE INDEX idx_geo_city ON olist_geolocation(geolocation_city);
CREATE INDEX idx_geo_state ON olist_geolocation(geolocation_state);

COMMENT ON TABLE olist_geolocation IS 'Geolocation coordinates for Brazilian zip codes';

-- ====================
-- Verify Table Creation
-- ====================
SELECT 
    table_name,
    table_type
FROM 
    information_schema.tables
WHERE 
    table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY 
    table_name;
