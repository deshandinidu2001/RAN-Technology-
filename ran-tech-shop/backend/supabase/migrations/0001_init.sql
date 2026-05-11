-- RAN Tech Shop — initial schema for Supabase Postgres.
-- Column names are quoted in camelCase to preserve the existing API contract
-- with the frontend (the controllers select * and return raw rows).
-- Primary keys are TEXT (not UUID) because the seed data uses human-readable
-- IDs like 'lap-001' / 'cpu-002'. New rows default to gen_random_uuid()::text.
--
-- Run this in: Supabase Dashboard → SQL Editor → New query → paste → Run.

-- Required for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- updatedAt trigger helper
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$ language plpgsql;

-- ----------------------------------------------------------------------------
-- users
-- ----------------------------------------------------------------------------
create table if not exists "User" (
  "id"        text primary key default gen_random_uuid()::text,
  "email"     text unique not null,
  "password"  text not null,
  "name"      text not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create trigger user_set_updated_at
  before update on "User"
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- products
-- ----------------------------------------------------------------------------
create table if not exists "Product" (
  "id"            text primary key default gen_random_uuid()::text,
  "name"          text not null,
  "description"   text not null,
  "price"         double precision not null,
  "category"      text not null,
  "subcategory"   text,
  "image"         text not null,
  "images"        text,
  "stock"         integer not null default 0,
  "featured"      boolean not null default false,
  "brand"         text,
  "sku"           text,
  "specs"         text,
  "features"      text,
  "ramType"       text,
  "ramSpeed"      integer,
  "ramCapacity"   integer,
  "ssdType"       text,
  "ssdCapacity"   integer,
  "ssdSpeed"      integer,
  "gpuMemory"     integer,
  "gpuChipset"    text,
  "displaySize"   double precision,
  "displayRes"    text,
  "displayType"   text,
  "compatibility" text,
  "isService"     boolean not null default false,
  "serviceType"   text,
  "condition"     text,
  "createdAt"     timestamptz not null default now(),
  "updatedAt"     timestamptz not null default now()
);
create trigger product_set_updated_at
  before update on "Product"
  for each row execute function set_updated_at();

create index if not exists idx_product_category    on "Product" ("category");
create index if not exists idx_product_subcategory on "Product" ("subcategory");
create index if not exists idx_product_featured    on "Product" ("featured");
create index if not exists idx_product_isservice   on "Product" ("isService");

-- ----------------------------------------------------------------------------
-- reviews (per-product)
-- ----------------------------------------------------------------------------
create table if not exists "Review" (
  "id"        text primary key default gen_random_uuid()::text,
  "productId" text not null references "Product"("id") on delete cascade,
  "userName"  text not null,
  "rating"    integer not null,
  "comment"   text not null,
  "createdAt" timestamptz not null default now()
);
create index if not exists idx_review_productid on "Review" ("productId");

-- ----------------------------------------------------------------------------
-- orders
-- ----------------------------------------------------------------------------
create table if not exists "Order" (
  "id"              text primary key default gen_random_uuid()::text,
  "userId"          text not null references "User"("id"),
  "total"           double precision not null,
  "status"          text not null default 'pending',
  "shippingName"    text,
  "shippingEmail"   text,
  "shippingAddress" text,
  "shippingCity"    text,
  "shippingZip"     text,
  "createdAt"       timestamptz not null default now(),
  "updatedAt"       timestamptz not null default now()
);
create trigger order_set_updated_at
  before update on "Order"
  for each row execute function set_updated_at();
create index if not exists idx_order_userid on "Order" ("userId");
create index if not exists idx_order_status on "Order" ("status");

-- ----------------------------------------------------------------------------
-- order items
-- ----------------------------------------------------------------------------
create table if not exists "OrderItem" (
  "id"        text primary key default gen_random_uuid()::text,
  "orderId"   text not null references "Order"("id") on delete cascade,
  "productId" text not null references "Product"("id"),
  "quantity"  integer not null,
  "price"     double precision not null
);
create index if not exists idx_orderitem_orderid   on "OrderItem" ("orderId");
create index if not exists idx_orderitem_productid on "OrderItem" ("productId");

-- ----------------------------------------------------------------------------
-- repair bookings
-- ----------------------------------------------------------------------------
create table if not exists "RepairBooking" (
  "id"               text primary key default gen_random_uuid()::text,
  "date"             text not null,
  "timeSlot"         text not null,
  "deviceType"       text,
  "services"         text,
  "products"         text,
  "totalAmount"      double precision,
  "issueDescription" text not null,
  "customerName"     text not null,
  "customerEmail"    text not null,
  "customerPhone"    text not null,
  "status"           text not null default 'pending',
  "notes"            text,
  "estimatedCost"    double precision,
  "actualCost"       double precision,
  "completedAt"      timestamptz,
  "createdAt"        timestamptz not null default now(),
  "updatedAt"        timestamptz not null default now()
);
create trigger repairbooking_set_updated_at
  before update on "RepairBooking"
  for each row execute function set_updated_at();
create index if not exists idx_repairbooking_date   on "RepairBooking" ("date");
create index if not exists idx_repairbooking_status on "RepairBooking" ("status");
create index if not exists idx_repairbooking_email  on "RepairBooking" ("customerEmail");

-- ----------------------------------------------------------------------------
-- repair reviews (separate from product reviews)
-- ----------------------------------------------------------------------------
create table if not exists "RepairReview" (
  "id"          text primary key default gen_random_uuid()::text,
  "serviceType" text not null,
  "serviceName" text not null,
  "userName"    text not null,
  "rating"      integer not null,
  "comment"     text not null,
  "createdAt"   timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- filter categories (shop UI taxonomy)
-- ----------------------------------------------------------------------------
create table if not exists "FilterCategory" (
  "id"         text primary key default gen_random_uuid()::text,
  "slug"       text unique not null,
  "name"       text not null,
  "parentSlug" text,
  "order"      integer not null default 0,
  "visible"    boolean not null default true,
  "createdAt"  timestamptz not null default now(),
  "updatedAt"  timestamptz not null default now()
);
create trigger filtercategory_set_updated_at
  before update on "FilterCategory"
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- shop availability (per-date time slot overrides)
-- ----------------------------------------------------------------------------
create table if not exists "ShopAvailability" (
  "id"        text primary key default gen_random_uuid()::text,
  "date"      text unique not null,
  "slots"     text not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create trigger shopavailability_set_updated_at
  before update on "ShopAvailability"
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- RPC: decrement product stock atomically (used by createOrder)
-- ----------------------------------------------------------------------------
create or replace function decrement_product_stock(p_id text, p_qty int)
returns void as $$
begin
  update "Product"
  set "stock" = "stock" - p_qty
  where "id" = p_id and "stock" >= p_qty;
  if not found then
    raise exception 'Insufficient stock for product %', p_id;
  end if;
end;
$$ language plpgsql;

-- ----------------------------------------------------------------------------
-- RPC: increment product stock (used when orders cancel)
-- ----------------------------------------------------------------------------
create or replace function increment_product_stock(p_id text, p_qty int)
returns void as $$
begin
  update "Product" set "stock" = "stock" + p_qty where "id" = p_id;
end;
$$ language plpgsql;
