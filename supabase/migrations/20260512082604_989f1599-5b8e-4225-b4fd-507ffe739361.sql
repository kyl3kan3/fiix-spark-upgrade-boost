alter table realtime.messages enable row level security;

create policy "Users can receive on their own private message topic"
on realtime.messages
for select
to authenticated
using (
  realtime.messages.extension = 'postgres_changes'
  and realtime.messages.private = true
  and realtime.topic() = concat('user:', auth.uid()::text, ':messages')
);

create policy "Users can connect to their own private message topic"
on realtime.messages
for insert
to authenticated
with check (
  realtime.messages.extension = 'postgres_changes'
  and realtime.messages.private = true
  and realtime.topic() = concat('user:', auth.uid()::text, ':messages')
);