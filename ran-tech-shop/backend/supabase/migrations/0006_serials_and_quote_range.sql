-- 0006: Human-friendly sequential serial IDs + quote price range.
--
-- Adds:
--   * RepairBooking.serialNo   (REP#1, REP#2, ...)
--   * Order.serialNo           (ORD#1, ORD#2, ...)
--   * RepairBooking.quotedPriceMax — admin can quote a range, not just a single price.
--
-- The serial columns use a Postgres sequence so each new row gets the next
-- integer atomically. Existing rows are backfilled in createdAt order.

-- ─── Repair booking serial ─────────────────────────────────────
create sequence if not exists repair_booking_serial start with 1;
alter table "RepairBooking" add column if not exists "serialNo" integer;

-- Backfill any existing rows in chronological order.
do $$
declare
  r record;
begin
  for r in
    select "id" from "RepairBooking"
     where "serialNo" is null
     order by "createdAt" asc, "id" asc
  loop
    update "RepairBooking"
       set "serialNo" = nextval('repair_booking_serial')
     where "id" = r."id";
  end loop;
end$$;

alter table "RepairBooking"
  alter column "serialNo" set default nextval('repair_booking_serial');
create unique index if not exists ux_repairbooking_serial on "RepairBooking" ("serialNo");

-- ─── Order serial ──────────────────────────────────────────────
create sequence if not exists order_serial start with 1;
alter table "Order" add column if not exists "serialNo" integer;

do $$
declare
  r record;
begin
  for r in
    select "id" from "Order"
     where "serialNo" is null
     order by "createdAt" asc, "id" asc
  loop
    update "Order"
       set "serialNo" = nextval('order_serial')
     where "id" = r."id";
  end loop;
end$$;

alter table "Order"
  alter column "serialNo" set default nextval('order_serial');
create unique index if not exists ux_order_serial on "Order" ("serialNo");

-- ─── Quote price range ─────────────────────────────────────────
alter table "RepairBooking" add column if not exists "quotedPriceMax" double precision;
