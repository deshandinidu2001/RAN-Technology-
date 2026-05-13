-- 0004: Two-phase repair flow (request → quote → confirm).
-- Adds:
--  * "requestType" — distinguishes quote-only requests from direct bookings.
--  * "quoteAcceptedAt" — when the customer accepts the quote and converts
--    the request into an actual booking.
alter table "RepairBooking" add column if not exists "requestType"     text default 'booking';
alter table "RepairBooking" add column if not exists "quoteAcceptedAt" timestamptz;

-- Allowed statuses include the new 'quote-requested' and 'quote-sent' states.
-- (We don't enforce a CHECK constraint to avoid breaking existing rows.)
create index if not exists idx_repairbooking_request_type on "RepairBooking" ("requestType");
