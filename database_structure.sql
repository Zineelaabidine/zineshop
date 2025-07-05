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
