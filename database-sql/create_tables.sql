-- SQL Script to Create Tables for Olist E-Commerce Dataset
-- This script creates all necessary tables to import CSV data from the dataset folder

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS olist_order_reviews;
DROP TABLE IF EXISTS olist_order_payments;
DROP TABLE IF EXISTS olist_order_items;
DROP TABLE IF EXISTS olist_orders;
DROP TABLE IF EXISTS olist_products;
DROP TABLE IF EXISTS olist_customers;
DROP TABLE IF EXISTS olist_sellers;
DROP TABLE IF EXISTS olist_geolocation;
DROP TABLE IF EXISTS product_category_name_translation;

-- ====================
-- 1. Product Category Translation Table
-- ====================
CREATE TABLE product_category_name_translation (
    product_category_name VARCHAR(100) PRIMARY KEY,
    product_category_name_english VARCHAR(100) NOT NULL
);

-- ====================
-- 2. Customers Table
-- ====================
CREATE TABLE olist_customers (
    customer_id VARCHAR(50) PRIMARY KEY,
    customer_unique_id VARCHAR(50) NOT NULL,
    customer_zip_code_prefix VARCHAR(10) NOT NULL,
    customer_city VARCHAR(100) NOT NULL,
    customer_state VARCHAR(2) NOT NULL,
    INDEX idx_customer_unique_id (customer_unique_id),
    INDEX idx_customer_zip (customer_zip_code_prefix)
);

-- ====================
-- 3. Sellers Table
-- ====================
CREATE TABLE olist_sellers (
    seller_id VARCHAR(50) PRIMARY KEY,
    seller_zip_code_prefix VARCHAR(10) NOT NULL,
    seller_city VARCHAR(100) NOT NULL,
    seller_state VARCHAR(2) NOT NULL,
    INDEX idx_seller_zip (seller_zip_code_prefix)
);

-- ====================
-- 4. Products Table
-- ====================
CREATE TABLE olist_products (
    product_id VARCHAR(50) PRIMARY KEY,
    product_category_name VARCHAR(100),
    product_name_lenght INT,
    product_description_lenght INT,
    product_photos_qty INT,
    product_weight_g INT,
    product_length_cm INT,
    product_height_cm INT,
    product_width_cm INT,
    FOREIGN KEY (product_category_name) REFERENCES product_category_name_translation(product_category_name),
    INDEX idx_product_category (product_category_name)
);

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
    FOREIGN KEY (customer_id) REFERENCES olist_customers(customer_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_order_status (order_status),
    INDEX idx_purchase_timestamp (order_purchase_timestamp)
);

-- ====================
-- 6. Order Items Table
-- ====================
CREATE TABLE olist_order_items (
    order_id VARCHAR(50) NOT NULL,
    order_item_id INT NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    seller_id VARCHAR(50) NOT NULL,
    shipping_limit_date TIMESTAMP NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    freight_value DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (order_id, order_item_id),
    FOREIGN KEY (order_id) REFERENCES olist_orders(order_id),
    FOREIGN KEY (product_id) REFERENCES olist_products(product_id),
    FOREIGN KEY (seller_id) REFERENCES olist_sellers(seller_id),
    INDEX idx_product_id (product_id),
    INDEX idx_seller_id (seller_id)
);

-- ====================
-- 7. Order Payments Table
-- ====================
CREATE TABLE olist_order_payments (
    order_id VARCHAR(50) NOT NULL,
    payment_sequential INT NOT NULL,
    payment_type VARCHAR(30) NOT NULL,
    payment_installments INT NOT NULL,
    payment_value DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (order_id, payment_sequential),
    FOREIGN KEY (order_id) REFERENCES olist_orders(order_id),
    INDEX idx_payment_type (payment_type)
);

-- ====================
-- 8. Order Reviews Table
-- ====================
CREATE TABLE olist_order_reviews (
    review_id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    review_score INT NOT NULL,
    review_comment_title TEXT,
    review_comment_message TEXT,
    review_creation_date TIMESTAMP NOT NULL,
    review_answer_timestamp TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES olist_orders(order_id),
    INDEX idx_order_id (order_id),
    INDEX idx_review_score (review_score)
);

-- ====================
-- 9. Geolocation Table
-- ====================
CREATE TABLE olist_geolocation (
    geolocation_zip_code_prefix VARCHAR(10) NOT NULL,
    geolocation_lat DECIMAL(10, 8) NOT NULL,
    geolocation_lng DECIMAL(11, 8) NOT NULL,
    geolocation_city VARCHAR(100) NOT NULL,
    geolocation_state VARCHAR(2) NOT NULL,
    INDEX idx_geo_zip (geolocation_zip_code_prefix),
    INDEX idx_geo_city (geolocation_city),
    INDEX idx_geo_state (geolocation_state)
);

-- ====================
-- Verify Table Creation
-- ====================
-- Show all tables
SHOW TABLES;
