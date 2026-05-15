-- 0007: Booking reminder tracking.
-- Adds a column we set the first time we send the "appointment is tomorrow"
-- reminder so the scheduler never sends it twice.

alter table "RepairBooking"
  add column if not exists "reminderSentAt" timestamptz;
