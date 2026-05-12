-- Add a `specFields` JSON column to FilterCategory so admins can configure
-- which specification dropdowns appear in the Add Product form for each
-- category. Shape: [{ "label": "Processor", "options": ["Intel Core i5", ...] }, ...]
alter table "FilterCategory"
  add column if not exists "specFields" jsonb not null default '[]'::jsonb;
