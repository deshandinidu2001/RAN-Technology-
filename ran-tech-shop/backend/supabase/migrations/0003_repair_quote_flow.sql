-- 0003: Repair quote flow.
-- Adds device targeting + price range to services, mail-in / quote-reply
-- fields to repair bookings, and a small in-app notifications table.

-- ─── Product (services) ─────────────────────────────────────────────
alter table "Product" add column if not exists "priceMax"   double precision;
alter table "Product" add column if not exists "deviceType" text;
create index if not exists idx_product_devicetype on "Product" ("deviceType");

-- ─── RepairBooking (mail-in + quote reply) ──────────────────────────
alter table "RepairBooking" add column if not exists "deviceModel"  text;
alter table "RepairBooking" add column if not exists "images"       text;        -- JSON array of URLs
alter table "RepairBooking" add column if not exists "services"     text;        -- (may already exist)
alter table "RepairBooking" add column if not exists "quotedPrice"  double precision;
alter table "RepairBooking" add column if not exists "quotedAt"     timestamptz;
alter table "RepairBooking" add column if not exists "quoteMessage" text;
alter table "RepairBooking" alter column "issueDescription" drop not null;

-- ─── Notification (in-app web notifications) ────────────────────────
create table if not exists "Notification" (
  "id"         text primary key default gen_random_uuid()::text,
  "email"      text not null,
  "title"      text not null,
  "body"       text not null,
  "link"       text,
  "type"       text not null default 'info',
  "read"       boolean not null default false,
  "refId"      text,
  "createdAt"  timestamptz not null default now()
);
create index if not exists idx_notification_email on "Notification" ("email");
create index if not exists idx_notification_read  on "Notification" ("read");
