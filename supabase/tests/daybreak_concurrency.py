"""Run after daybreak_boundaries.sql, against the disposable local test container."""
import concurrent.futures
import subprocess

BASE = ['docker', 'exec', '-i', 'fiix-security-postgres', 'psql', '-X', '-qAt', '-U', 'postgres', '-d', 'daybreak_test', '-v', 'ON_ERROR_STOP=1']


def sql(statement):
    return subprocess.run(BASE, input=statement, text=True, capture_output=True)


def parallel(statements):
    with concurrent.futures.ThreadPoolExecutor(max_workers=len(statements)) as pool:
        return list(pool.map(sql, statements))


def identity(user):
    return "SET ROLE authenticated; SET request.jwt.claim.role='authenticated'; SET request.jwt.claim.sub='" + user + "';"


budget = "SET ROLE service_role; SET request.jwt.claim.role='service_role'; SELECT public.consume_operation_budget('20000000-0000-0000-0000-000000000002','extract-assets');"
results = parallel([budget] * 12)
assert all(r.returncode == 0 for r in results), [r.stderr for r in results]
assert sum(r.stdout.strip() == 't' for r in results) == 5, [r.stdout for r in results]
print('PASS: 12 concurrent requests reserve exactly 5 budget slots')

quota = identity('20000000-0000-0000-0000-000000000010') + "BEGIN; INSERT INTO public.assets(company_id,name) VALUES('10000000-0000-0000-0000-000000000003','Concurrent quota'); SELECT pg_sleep(0.1); COMMIT;"
results = parallel([quota] * 2)
assert sum(r.returncode == 0 for r in results) == 1, [(r.stdout, r.stderr) for r in results]
assert all(r.returncode == 0 or 'plan_limit_reached' in r.stderr for r in results)
assert sql("SELECT count(*) FROM public.assets WHERE company_id='10000000-0000-0000-0000-000000000003';").stdout.strip() == '50'
print('PASS: competing asset inserts cannot exceed 50-asset quota')

prefix = identity('20000000-0000-0000-0000-000000000001')
ids = ['a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004']
statements = [prefix + f"BEGIN; UPDATE public.locations SET parent_id='{ids[1-i]}' WHERE id='{ids[i]}'; SELECT pg_sleep(0.1); COMMIT;" for i in range(2)]
results = parallel(statements)
assert sum(r.returncode == 0 for r in results) == 1, [(r.stdout, r.stderr) for r in results]
assert all(r.returncode == 0 or 'cannot contain a cycle' in r.stderr for r in results)
print('PASS: simultaneous reparenting cannot form a cycle')

seed = "INSERT INTO public.public_requests(id,company_id,contact_email) VALUES('c0000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','concurrent@example.test'),('c0000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','CONCURRENT@example.test');"
assert sql(seed).returncode == 0
results = parallel(["SET ROLE service_role; SELECT public.claim_request_notification('c0000000-0000-0000-0000-00000000000" + str(i) + "');" for i in (3, 4)])
assert all(r.returncode == 0 for r in results), [r.stderr for r in results]
assert sum(r.stdout.strip() == 't' for r in results) == 1, [r.stdout for r in results]
print('PASS: concurrent distinct request claims reserve one recipient email per day')

work_quota = identity('20000000-0000-0000-0000-000000000010') + "BEGIN; INSERT INTO public.work_orders(company_id,created_by,title) VALUES('10000000-0000-0000-0000-000000000003',auth.uid(),'Concurrent work order quota'); SELECT pg_sleep(0.1); COMMIT;"
results = parallel([work_quota] * 2)
assert sum(r.returncode == 0 for r in results) == 1, [(r.stdout, r.stderr) for r in results]
assert all(r.returncode == 0 or 'plan_limit_reached' in r.stderr for r in results)
assert sql("SELECT count(*) FROM public.work_orders WHERE company_id='10000000-0000-0000-0000-000000000003';").stdout.strip() == '100'
print('PASS: competing work-order inserts cannot exceed 100/month quota')
