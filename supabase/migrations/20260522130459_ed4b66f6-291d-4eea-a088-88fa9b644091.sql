drop trigger if exists public_requests_notify_after_insert on public.public_requests;

create trigger public_requests_notify_after_insert
after insert on public.public_requests
for each row
execute function public.public_requests_notify_trigger();