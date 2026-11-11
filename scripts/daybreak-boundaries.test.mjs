import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
const stripTypeScriptTypes = source => ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
import { resolve } from 'node:path';
import { boundedJson } from '../supabase/functions/_shared/requestBody.ts';
import { validInternalSecret } from '../supabase/functions/_shared/internalSecret.ts';
import { privateErrorEvent } from '../src/lib/telemetryPrivacy.ts';
const require = createRequire(process.env.DAYBREAK_TEST_PACKAGE || resolve(import.meta.dirname, '../package.json'));
const sanitizeHtml = require('sanitize-html');
const { JSDOM } = require('jsdom');
const DOMPurify = require('dompurify')(new JSDOM('').window);
const root = resolve(import.meta.dirname, '..');

function edge(name, tables = {}, extras = {}) {
  let handler;
  const sends = [];
  const queries = [];
  const user = { id: 'actor', email: 'verified@example.test', email_confirmed_at: '2026-01-01' };
  const db = {
    auth: { getUser: async () => ({ data: { user }, error: null }) },
    from(table) {
      const q = { table, filters: [] };
      queries.push(q);
      const builder = new Proxy({}, { get(_, method) {
        if (method === 'then') return (ok, fail) => Promise.resolve(typeof tables[table] === 'function' ? tables[table](q) : { data: tables[table] ?? null, error: null }).then(ok, fail);
        return (...args) => { q.filters.push([method, ...args]); return builder; };
      } });
      return builder;
    },
    rpc: async () => ({ data: true, error: null }),
  };
  const source = readFileSync(resolve(root, `supabase/functions/${name}/index.ts`), 'utf8').replace(/^import .*;?\r?$/gm, '');
  const context = { Response, Request, URL, Date, TextEncoder, console, crypto, RangeError, TypeError, SyntaxError,
    boundedJson, validInternalSecret, sanitizeHtml, corsHeaders: {}, createClient: () => db,
    reserveOperation: async () => true,
    sendTemplateEmailWithLog: async (...args) => { sends.push(args); return { sent: true }; },
    serve: fn => { handler = fn; }, Deno: { serve: fn => { handler = fn; }, env: { get: key => key === 'NOTIFY_SHARED_SECRET' ? 'new-secret'.repeat(8) : 'configured-test-value' } }, ...extras };
  vm.runInNewContext(stripTypeScriptTypes(source), context);
  return { sends, queries, user, db, call: body => handler(new Request('https://app.test/function', { method: 'POST', headers: { authorization: 'Bearer user-jwt' }, body: JSON.stringify(body) })), handler };
}

test('request body rejects chunked oversize and malformed input before parsing', async () => {
  let cancelled = false;
  const stream = new ReadableStream({ pull(c) { c.enqueue(new Uint8Array(65537)); }, cancel() { cancelled = true; } });
  await assert.rejects(boundedJson(new Request('https://test', { method: 'POST', body: stream, duplex: 'half' })), RangeError);
  assert.equal(cancelled, true);
  assert.deepEqual(await boundedJson(new Request('https://test', { method: 'POST', body: '{"ok":true}' })), { ok: true });
  await assert.rejects(boundedJson(new Request('https://test', { method: 'POST', body: '{' })), SyntaxError);
});

test('email ignores forged mutable addresses, preserves verified self-mail and limits content', async () => {
  const e = edge('send-email', { profiles: { email: 'victim@test', company_id: 'tenant' }, notification_preferences: { email_address: 'victim@test' } });
  const input = { to: 'victim@test', subject: 'Test', body: '<p>Hello</p>', userId: 'actor' };
  assert.equal((await e.call(input)).status, 403);
  assert.equal(e.sends.length, 0);
  input.to = ' VERIFIED@example.test ';
  input.body = '<p>Hello <strong>team</strong></p><img onerror="alert(1)" src=x><a href="java&#x73;cript:alert(1)">link</a>';
  assert.equal((await e.call(input)).status, 200);
  assert.match(e.sends[0][2].templateData.html, /<strong>team<\/strong>/);
  assert.doesNotMatch(e.sends[0][2].templateData.html, /onerror|javascript|<img/);
  assert.equal((await e.call({ ...input, body: 'x'.repeat(70000) })).status, 413);
  e.user.email_confirmed_at = null;
  assert.equal((await e.call(input)).status, 403);
});

test('invitations use server template and require current same-company administrator', async () => {
  const invite = { email: 'invitee@test', invited_by: 'actor', organization_id: 'tenant', token: 'opaque-token', status: 'pending', created_at: new Date().toISOString() };
  let roles = [{ role: 'administrator' }];
  const e = edge('send-email', { organization_invitations: invite, profiles: { company_id: 'tenant' }, user_roles: q => {
    assert.ok(q.filters.some(x => x[0] === 'eq' && x[1] === 'company_id' && x[2] === 'tenant'));
    return { data: roles, error: null };
  }, companies: { name: 'Acme' } });
  const input = { to: 'invitee@test', subject: 'Phishing content', body: '<a href="https://attacker.test">Send payment</a>', userId: 'actor', notificationType: 'invitation', referenceId: 'invite-id' };
  assert.equal((await e.call(input)).status, 200);
  assert.equal(e.sends[0][0], 'invitation');
  assert.equal(e.sends[0][2].templateData.inviteUrl, 'https://maintenease.com/auth?signup=true&token=opaque-token');
  assert.doesNotMatch(JSON.stringify(e.sends), /attacker|Phishing/);
  roles = [];
  assert.equal((await e.call(input)).status, 403);
  roles = [{ role: 'administrator' }]; invite.created_at = '2020-01-01';
  assert.equal((await e.call(input)).status, 403);
});

test('email atomic budget exhaustion prevents provider invocation', async () => {
  const e = edge('send-email', {}, { reserveOperation: async () => false });
  assert.equal((await e.call({ to: 'verified@example.test', subject: 'Test', body: 'Hello', userId: 'actor' })).status, 429);
  assert.equal(e.sends.length, 0);
});

test('trial email uses authoritative identity and tenant and dedupes per user', async () => {
  const e = edge('notify-trial-signup', { profiles: { company_id: 'tenant', first_name: 'Member', email: 'victim@test' }, companies: { id: 'tenant', name: 'Acme', created_by: 'actor', created_at: new Date().toISOString() }, subscriptions: { status: 'trialing', trial_ends_at: new Date(Date.now() + 86400000).toISOString() } });
  assert.equal((await e.call({ company: 'FAKE', companyId: 'other' })).status, 200);
  assert.equal(e.sends[0][1], 'verified@example.test');
  assert.equal(e.sends[0][2].templateData.companyName, 'Acme');
  assert.doesNotMatch(JSON.stringify(e.sends), /victim|FAKE|other/);
  assert.doesNotMatch(e.sends[1][2].templateData.html, /verified|Acme|Member/);
  const limited = edge('notify-trial-signup', { profiles: { company_id: 'tenant' }, companies: { id: 'tenant', created_by: 'actor', created_at: new Date().toISOString() }, subscriptions: { status: 'trialing', trial_ends_at: new Date(Date.now() + 86400000).toISOString() } }, { reserveOperation: async () => false });
  assert.equal((await limited.call({})).status, 200); assert.equal(limited.sends.length, 0);
});

test('empty/mismatched internal keys fail while rotated keys pass', async () => {
  assert.equal(await validInternalSecret('', ''), false);
  assert.equal(await validInternalSecret('wrong', 'rotated'.repeat(8)), false);
  assert.equal(await validInternalSecret('rotated'.repeat(8), 'rotated'.repeat(8)), true);
});

test('error telemetry keeps HTTP500 diagnostics without routes, identity, headers or tokens', () => {
  const result = privateErrorEvent({ message: '500 secret', user: { email: 'secret' }, request: { headers: { Authorization: 'Bearer secret' } }, breadcrumbs: [{ data: { url: 'https://app/auth?token=secret' } }], exception: { values: [{ type: 'TypeError', value: '500 secret', stacktrace: { frames: [{ filename: 'https://app/static/app-123.js?token=secret', lineno: 4 }, { filename: 'https://app/auth/secret' }] } }] } });
  assert.doesNotMatch(JSON.stringify(result), /secret|Authorization|user|breadcrumbs/);
  assert.equal(result.exception.values[0].type, 'TypeError');
  assert.equal(result.exception.values[0].stacktrace.frames[0].filename, '/static/app-123.js');
  assert.equal(result.exception.values[0].stacktrace.frames[0].lineno, 4);
});

test('blog HTML rejects active parser variants and preserves article markup', () => {
  for (const input of ['<img src=x onerror=alert(1)>', '<svg><g onload=alert(1)></g></svg>', '<a href="java&#x73;cript:alert(1)">x</a>', '<math><mtext><table><mglyph><style><!--</style><img title="--><img src=1 onerror=alert(1)>">']) {
    const clean = DOMPurify.sanitize(input, { USE_PROFILES: { html: true }, FORBID_TAGS: ['form','input','button','textarea','select','style'], FORBID_ATTR: ['style'] });
    assert.doesNotMatch(clean, /onerror|onload|javascript:|<svg|<math/i);
  }
  assert.equal(DOMPurify.sanitize('<h2>Guide</h2><p><strong>Inspect</strong> weekly.</p>'), '<h2>Guide</h2><p><strong>Inspect</strong> weekly.</p>');
});

test('asset extraction denies viewer and allows current tenant manager before provider use', async () => {
  let calls = 0; let roles = [];
  const e = edge('extract-assets', { profiles: { company_id: 'tenant' }, user_roles: () => ({ data: roles, error: null }) }, {
    Blob, btoa, TextDecoder, fetch: async () => { calls++; return Response.json({ content: [{ type: 'tool_use', name: 'propose_assets', input: { assets: [{ name: 'Pump' }] } }] }); },
  });
  e.db.storage = { from: () => ({ download: async () => ({ data: new Blob(['Pump'], { type: 'text/plain' }), error: null }) }) };
  assert.equal((await e.call({ storage_path: 'tenant/manual.txt' })).status, 403); assert.equal(calls, 0);
  roles = [{ role: 'manager' }];
  const response = await e.call({ storage_path: 'tenant/manual.txt' });
  assert.equal(response.status, 200); assert.equal(calls, 1);
  assert.equal((await response.json()).assets[0].name, 'Pump');
});

test('report sharing authorizes actor and recipients without exposing dispatcher capability', async () => {
  let roles = [{ role: 'manager' }]; let members = [{ id: 'recipient' }]; let fetches = 0;
  const e = edge('notify-event', { profiles: q => ({ data: q.filters.some(x => x[0] === 'in') ? members : { id: 'recipient', company_id: 'tenant', first_name: 'Team', email: 'forged@test' }, error: null }), user_roles: () => ({ data: roles, error: null }), notifications: {}, notification_preferences: { email_enabled: true, email_address: 'forged@test' } }, {
    fetch: async (_url, opts) => { fetches++; assert.match(opts.body, /verified@example.test/); assert.doesNotMatch(opts.body, /forged@test/); return Response.json({ id: 'sent' }); },
  });
  e.db.auth.admin = { getUserById: async () => ({ data: { user: e.user }, error: null }) };
  const body = { event_type: 'report_shared', payload: { recipients: ['recipient'], report_name: 'Monthly', summary: 'Completed work', actor_id: 'forged' } };
  assert.equal((await e.call(body)).status, 200); assert.equal(fetches, 1);
  roles = []; assert.equal((await e.call(body)).status, 403);
  roles = [{ role: 'manager' }]; members = []; assert.equal((await e.call(body)).status, 403);
  assert.equal((await e.call({ event_type: 'wo_scan_due' })).status, 401);
  assert.equal(fetches, 1);
});

test('resolution sends fixed content and respects durable notification claim', async () => {
  const tables = { profiles: { company_id: 'tenant', first_name: 'Manager' }, user_roles: [{ role: 'manager' }], public_requests: { id: 'request', company_id: 'tenant', status: 'open', contact_email: 'public@test', title: 'PHISHING_SENTINEL', description: 'Send money', photos: ['javascript:bad'] } };
  const e = edge('resolve-public-request', tables, { z: require('zod').z });
  let claimed = false;
  e.db.rpc = async () => { const result = !claimed; claimed = true; return { data: result, error: null }; };
  const input = { requestId: '00000000-0000-4000-8000-000000000001' };
  assert.equal((await e.call(input)).status, 200);
  assert.equal(e.sends.length, 1); assert.doesNotMatch(JSON.stringify(e.sends), /PHISHING|Send money|javascript/);
  assert.equal((await e.call(input)).status, 200); assert.equal(e.sends.length, 1);
});

test('managed sender fails closed on local suppression and used unsubscribe records', async () => {
  let sent = 0; let tableData = { suppressed_emails: [{ id: 'opt-out' }], email_unsubscribe_tokens: [] }; let failure = false;
  const source = readFileSync(resolve(root, 'supabase/functions/_shared/transactional-email-templates/send-email.ts'), 'utf8').replace(/^import .*\r?$/gm, '').replace(/export /g, '');
  const context = { crypto, console, React: { createElement: () => ({}) }, renderAsync: async () => '<p>Hello</p>', sendLovableEmail: async () => { sent++; }, EmailAPIError: Error, TEMPLATES: { generic: { component: () => null, subject: 'Notice' } }, Deno: { env: { get: () => 'configured' } }, createClient: () => ({ from: table => {
    const q = new Proxy({}, { get: (_, name) => name === 'then' ? resolve => resolve({ data: tableData[table], error: failure ? { message: 'offline' } : null }) : () => q }); return q;
  } }) };
  vm.runInNewContext(stripTypeScriptTypes(source), context);
  assert.equal((await context.sendTemplateEmail('generic', 'person@test')).sent, false); assert.equal(sent, 0);
  tableData = { suppressed_emails: [], email_unsubscribe_tokens: [{ id: 'used' }] };
  assert.equal((await context.sendTemplateEmail('generic', 'person@test')).sent, false); assert.equal(sent, 0);
  tableData.email_unsubscribe_tokens = []; failure = true;
  await assert.rejects(context.sendTemplateEmail('generic', 'person@test')); assert.equal(sent, 0);
  failure = false;
  assert.equal((await context.sendTemplateEmail('generic', 'person@test')).sent, true); assert.equal(sent, 1);
});

test('unsubscribe token validates without disclosure and records opt-out before marking usage', async () => {
  const e = edge('handle-email-unsubscribe', { email_unsubscribe_tokens: { email: ' PERSON@test ', used_at: null }, suppressed_emails: {} });
  const token = 'valid-capability-'.repeat(3);
  const response = await e.call({ token });
  assert.equal(response.status, 200); assert.doesNotMatch(await response.text(), /PERSON|person@test|capability/);
  const writes = e.queries.filter(q => q.filters.some(x => ['upsert','update'].includes(x[0])));
  assert.equal(writes[0].table, 'suppressed_emails');
  assert.equal(writes[0].filters.find(x => x[0] === 'upsert')[1].email, 'person@test');
  assert.equal(writes[1].table, 'email_unsubscribe_tokens');
  const invalid = edge('handle-email-unsubscribe', { email_unsubscribe_tokens: null });
  assert.equal((await invalid.call({ token })).status, 404);
  assert.equal(invalid.queries.some(q => q.table === 'suppressed_emails'), false);
});
