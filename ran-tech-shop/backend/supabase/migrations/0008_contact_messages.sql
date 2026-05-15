-- 0008: Contact form messages.
-- Customer messages submitted from the public /contact page. Admin replies
-- by email; the reply is stored here for audit.

create table if not exists "ContactMessage" (
  "id"          text primary key default gen_random_uuid()::text,
  "name"        text not null,
  "email"       text not null,
  "subject"     text,
  "message"     text not null,
  "adminReply"  text,
  "repliedAt"   timestamptz,
  "read"        boolean not null default false,
  "createdAt"   timestamptz not null default now()
);
create index if not exists idx_contactmessage_created on "ContactMessage" ("createdAt" desc);
create index if not exists idx_contactmessage_read    on "ContactMessage" ("read");
