-- 0005: Repair-side taxonomy + explicit pricing mode.
--
-- Adds:
--  * Product.priceMode — 'fixed' | 'range' | 'quote'
--      fixed : show `price` as the final price
--      range : show `price`–`priceMax` and require admin to send a final quote
--      quote : hide price entirely; admin quotes after inspecting the device
--  * RepairCategory — per-device categories the admin manages
--    (e.g. desktop / "Hardware", mobile / "Screen", laptop / "Upgrade").

alter table "Product" add column if not exists "priceMode" text not null default 'fixed';

create table if not exists "RepairCategory" (
  "id"         text primary key default gen_random_uuid()::text,
  "name"       text not null,
  "slug"       text not null,
  "deviceType" text not null,
  "order"      integer not null default 0,
  "createdAt"  timestamptz not null default now(),
  "updatedAt"  timestamptz not null default now()
);
create unique index if not exists ux_repair_category_device_slug
  on "RepairCategory" ("deviceType", "slug");
create index if not exists idx_repair_category_device
  on "RepairCategory" ("deviceType");

create trigger repaircategory_set_updated_at
  before update on "RepairCategory"
  for each row execute function set_updated_at();
