import {
  pgTable,
  varchar,
  integer,
  decimal,
  timestamp,
  text,
  serial,
} from 'drizzle-orm/pg-core';

export const productCategoryNameTranslation = pgTable(
  'product_category_name_translation',
  {
    productCategoryName: varchar('product_category_name', { length: 100 }).primaryKey(),
    productCategoryNameEnglish: varchar('product_category_name_english', {
      length: 100,
    }).notNull(),
  }
);

export const olistCustomers = pgTable('olist_customers', {
  customerId: varchar('customer_id', { length: 50 }).primaryKey(),
  customerUniqueId: varchar('customer_unique_id', { length: 50 }).notNull(),
  customerZipCodePrefix: varchar('customer_zip_code_prefix', { length: 10 }).notNull(),
  customerCity: varchar('customer_city', { length: 100 }).notNull(),
  customerState: varchar('customer_state', { length: 2 }).notNull(),
});

export const olistSellers = pgTable('olist_sellers', {
  sellerId: varchar('seller_id', { length: 50 }).primaryKey(),
  sellerZipCodePrefix: varchar('seller_zip_code_prefix', { length: 10 }).notNull(),
  sellerCity: varchar('seller_city', { length: 100 }).notNull(),
  sellerState: varchar('seller_state', { length: 2 }).notNull(),
});

export const olistProducts = pgTable('olist_products', {
  productId: varchar('product_id', { length: 50 }).primaryKey(),
  productCategoryName: varchar('product_category_name', { length: 100 }),
  productNameLenght: integer('product_name_lenght'),
  productDescriptionLenght: integer('product_description_lenght'),
  productPhotosQty: integer('product_photos_qty'),
  productWeightG: integer('product_weight_g'),
  productLengthCm: integer('product_length_cm'),
  productHeightCm: integer('product_height_cm'),
  productWidthCm: integer('product_width_cm'),
});

export const olistOrders = pgTable('olist_orders', {
  orderId: varchar('order_id', { length: 50 }).primaryKey(),
  customerId: varchar('customer_id', { length: 50 }).notNull(),
  orderStatus: varchar('order_status', { length: 20 }).notNull(),
  orderPurchaseTimestamp: timestamp('order_purchase_timestamp').notNull(),
  orderApprovedAt: timestamp('order_approved_at'),
  orderDeliveredCarrierDate: timestamp('order_delivered_carrier_date'),
  orderDeliveredCustomerDate: timestamp('order_delivered_customer_date'),
  orderEstimatedDeliveryDate: timestamp('order_estimated_delivery_date'),
});

export const olistOrderItems = pgTable('olist_order_items', {
  orderId: varchar('order_id', { length: 50 }).notNull(),
  orderItemId: integer('order_item_id').notNull(),
  productId: varchar('product_id', { length: 50 }).notNull(),
  sellerId: varchar('seller_id', { length: 50 }).notNull(),
  shippingLimitDate: timestamp('shipping_limit_date').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  freightValue: decimal('freight_value', { precision: 10, scale: 2 }).notNull(),
});

export const olistOrderPayments = pgTable('olist_order_payments', {
  orderId: varchar('order_id', { length: 50 }).notNull(),
  paymentSequential: integer('payment_sequential').notNull(),
  paymentType: varchar('payment_type', { length: 30 }).notNull(),
  paymentInstallments: integer('payment_installments').notNull(),
  paymentValue: decimal('payment_value', { precision: 10, scale: 2 }).notNull(),
});

export const olistOrderReviews = pgTable('olist_order_reviews', {
  reviewId: varchar('review_id', { length: 50 }).primaryKey(),
  orderId: varchar('order_id', { length: 50 }).notNull(),
  reviewScore: integer('review_score').notNull(),
  reviewCommentTitle: text('review_comment_title'),
  reviewCommentMessage: text('review_comment_message'),
  reviewCreationDate: timestamp('review_creation_date').notNull(),
  reviewAnswerTimestamp: timestamp('review_answer_timestamp'),
});

export const olistGeolocation = pgTable('olist_geolocation', {
  id: serial('id').primaryKey(),
  geolocationZipCodePrefix: varchar('geolocation_zip_code_prefix', {
    length: 10,
  }).notNull(),
  geolocationLat: decimal('geolocation_lat', { precision: 10, scale: 8 }).notNull(),
  geolocationLng: decimal('geolocation_lng', { precision: 11, scale: 8 }).notNull(),
  geolocationCity: varchar('geolocation_city', { length: 100 }).notNull(),
  geolocationState: varchar('geolocation_state', { length: 2 }).notNull(),
});

export const chatSessions = pgTable('chat_sessions', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }),
  context: text('context'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id'),
  role: varchar('role', { length: 50 }).notNull(),
  content: text('content').notNull(),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});
