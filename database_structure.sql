-- 🔒 Utilisateurs
create table users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique not null,
  password_hash text not null,
  is_admin boolean default false,
  created_at timestamp default now()
);

-- 🗂️ Catégories de produits
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamp default now()
);

-- 🛍️ Produits
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10, 2) not null,
  image_url text,
  stock int default 0,
  category_id uuid references categories(id) on delete set null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- 🛒 Éléments du panier
create table cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  quantity int default 1,
  created_at timestamp default now(),
  unique(user_id, product_id)
);

-- 📦 Commandes
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  total numeric(10, 2),
  status text default 'pending', -- pending, paid, shipped, cancelled
  created_at timestamp default now()
);

-- 📋 Détails des commandes
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  quantity int not null,
  unit_price numeric(10,2) not null
);

-- 💳 Paiements
create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  amount numeric(10, 2),
  provider text, -- stripe, paypal...
  status text default 'initiated', -- initiated, success, failed
  created_at timestamp default now()
);

-- ⭐ Favoris
create table favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  unique(user_id, product_id)
);

-- 🔍 Historique des recherches
create table search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  query text,
  searched_at timestamp default now()
);

-- 📝 Reviews des produits
create table product_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  review text,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  constraint one_review_per_user unique (user_id, product_id)
);

-- 📊 Vue : résumé des ratings
create view product_ratings_summary as
select
  product_id,
  round(avg(rating)::numeric, 2) as average_rating,
  count(*) as total_reviews
from product_reviews
group by product_id;

-- ===============================================
-- 🛒 CHECKOUT SYSTEM EXTENSIONS
-- ===============================================
-- Added for full checkout functionality
-- Execute these commands to enable checkout features

-- 📍 Customer Addresses Table
create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  type text not null check (type in ('shipping', 'billing')),
  full_name text not null,
  phone text not null,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'United States',
  is_default boolean default false,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- 🚚 Delivery Methods Table
create table delivery_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10, 2) not null default 0,
  estimated_days text not null, -- e.g., "3-5 business days"
  is_active boolean default true,
  created_at timestamp default now()
);

-- Insert default delivery methods
insert into delivery_methods (name, description, price, estimated_days) values
('Standard Shipping', 'Free standard shipping', 0.00, '5-7 business days'),
('Express Shipping', 'Fast delivery', 9.99, '2-3 business days'),
('Overnight Shipping', 'Next day delivery', 19.99, '1 business day');

-- 💰 Payment Methods Table (Optional - for better organization)
create table payment_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_active boolean default true,
  requires_card_details boolean default false,
  processing_fee numeric(10, 2) default 0,
  created_at timestamp default now()
);

-- Insert default payment methods
insert into payment_methods (name, description, requires_card_details, processing_fee) values
('credit_card', 'Credit/Debit Card', true, 0.00),
('paypal', 'PayPal', false, 0.00),
('cash_on_delivery', 'Cash on Delivery', false, 2.99);

-- 📦 Update Orders Table - Add new columns for checkout
alter table orders add column shipping_address_id uuid references addresses(id);
alter table orders add column billing_address_id uuid references addresses(id);
alter table orders add column delivery_method_id uuid references delivery_methods(id);
alter table orders add column subtotal numeric(10, 2);
alter table orders add column shipping_cost numeric(10, 2) default 0;
alter table orders add column tax_amount numeric(10, 2) default 0;
alter table orders add column cod_fee numeric(10, 2) default 0; -- Cash on Delivery fee
alter table orders add column order_notes text;
alter table orders add column payment_method text; -- 'credit_card', 'paypal', 'cash_on_delivery'

-- 💳 Update Payments Table - Add payment details
alter table payments add column payment_method text; -- 'stripe', 'paypal', 'credit_card'
alter table payments add column transaction_id text;
alter table payments add column payment_details jsonb; -- Store payment-specific data

-- 📧 Add email to orders for guest checkout
alter table orders add column customer_email text;

-- 🔍 Create indexes for better performance
create index idx_addresses_user_id on addresses(user_id);
create index idx_addresses_type on addresses(type);
create index idx_orders_user_id on orders(user_id);
create index idx_orders_status on orders(status);
create index idx_orders_delivery_method on orders(delivery_method_id);
create index idx_orders_shipping_address on orders(shipping_address_id);

-- 📊 Enhanced order view with full details
create view order_details_summary as
select
  o.id as order_id,
  o.user_id,
  o.customer_email,
  o.status,
  o.subtotal,
  o.shipping_cost,
  o.tax_amount,
  o.total,
  o.order_notes,
  o.payment_method,
  o.created_at,
  -- Shipping address details
  sa.full_name as shipping_name,
  sa.phone as shipping_phone,
  sa.address_line_1 as shipping_address_1,
  sa.address_line_2 as shipping_address_2,
  sa.city as shipping_city,
  sa.state as shipping_state,
  sa.postal_code as shipping_postal_code,
  sa.country as shipping_country,
  -- Delivery method details
  dm.name as delivery_method_name,
  dm.description as delivery_method_description,
  dm.estimated_days,
  -- Payment details
  p.provider as payment_provider,
  p.status as payment_status,
  p.transaction_id
from orders o
left join addresses sa on o.shipping_address_id = sa.id
left join delivery_methods dm on o.delivery_method_id = dm.id
left join payments p on o.id = p.order_id;
