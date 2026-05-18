import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Step = { step: string; ok: boolean; detail?: unknown };
const log: Step[] = [];
const add = (step: string, ok: boolean, detail?: unknown) => {
  console.log(JSON.stringify({ step, ok, detail }));
  log.push({ step, ok, detail });
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const OLD_DB_URL = sanitizeDbUrl(Deno.env.get("OLD_SUPABASE_DB_URL")!);
    const OLD_URL = Deno.env.get("OLD_SUPABASE_URL")!;
    const OLD_SRK = Deno.env.get("OLD_SUPABASE_SERVICE_ROLE_KEY")!;
    const NEW_URL = Deno.env.get("SUPABASE_URL")!;
    const NEW_SRK = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const NEW_DB_URL = sanitizeDbUrl(Deno.env.get("SUPABASE_DB_URL")!);

    const url = new URL(req.url);
    const phase = url.searchParams.get("phase") ?? "all";

    const oldSql = postgres(OLD_DB_URL, { max: 4, prepare: false, ssl: "require" });
    const newSql = postgres(NEW_DB_URL, { max: 4, prepare: false, ssl: "require" });
    const oldAdmin = createClient(OLD_URL, OLD_SRK, { auth: { persistSession: false } });
    const newAdmin = createClient(NEW_URL, NEW_SRK, { auth: { persistSession: false } });

    try {
      if (phase === "schema" || phase === "all") {
        await migrateSchema(oldSql, newSql);
      }
      if (phase === "data" || phase === "all") {
        await migrateData(oldSql, newSql);
      }
      if (phase === "auth" || phase === "all") {
        await migrateAuthUsers(oldSql, newAdmin);
      }
      if (phase === "storage" || phase === "all") {
        await migrateStorage(oldSql, oldAdmin, newAdmin);
      }
    } finally {
      await oldSql.end({ timeout: 5 });
      await newSql.end({ timeout: 5 });
    }

    return new Response(JSON.stringify({ ok: true, log }, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    add("fatal", false, String(e));
    return new Response(JSON.stringify({ ok: false, log, error: String(e) }, null, 2), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/* ---------------- SCHEMA ---------------- */

async function migrateSchema(oldSql: any, newSql: any) {
  // 1. Enums
  const enums = await oldSql`
    SELECT n.nspname AS schema, t.typname AS name,
           array_agg(e.enumlabel ORDER BY e.enumsortorder) AS labels
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
    GROUP BY n.nspname, t.typname
  `;
  for (const en of enums) {
    const labels = en.labels.map((l: string) => `'${l.replace(/'/g, "''")}'`).join(", ");
    const ddl = `CREATE TYPE public.${quoteIdent(en.name)} AS ENUM (${labels});`;
    await tryExec(newSql, ddl, `enum ${en.name}`);
  }

  // 2. Tables (columns)
  const tables = await oldSql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema='public' AND table_type='BASE TABLE'
    ORDER BY table_name
  `;
  for (const t of tables) {
    const cols = await oldSql`
      SELECT column_name, data_type, udt_schema, udt_name,
             is_nullable, column_default, character_maximum_length
      FROM information_schema.columns
      WHERE table_schema='public' AND table_name=${t.table_name}
      ORDER BY ordinal_position
    `;
    const colDefs = cols.map((c: any) => {
      let type: string;
      if (c.data_type === "USER-DEFINED" || c.data_type === "ARRAY") {
        type = `${c.udt_schema}.${quoteIdent(c.udt_name)}`;
        if (c.data_type === "ARRAY") type = `${c.udt_schema}.${quoteIdent(c.udt_name.replace(/^_/, ""))}[]`;
      } else if (c.character_maximum_length) {
        type = `${c.data_type}(${c.character_maximum_length})`;
      } else {
        type = c.data_type;
      }
      let def = `${quoteIdent(c.column_name)} ${type}`;
      if (c.column_default) def += ` DEFAULT ${c.column_default}`;
      if (c.is_nullable === "NO") def += " NOT NULL";
      return def;
    }).join(", ");
    await tryExec(newSql, `CREATE TABLE IF NOT EXISTS public.${quoteIdent(t.table_name)} (${colDefs});`, `table ${t.table_name}`);
  }

  // 3. Constraints (PK, UNIQUE, FK, CHECK)
  const constraints = await oldSql`
    SELECT conrelid::regclass::text AS table_name,
           conname,
           pg_get_constraintdef(oid) AS def,
           contype
    FROM pg_constraint
    WHERE connamespace = 'public'::regnamespace
    ORDER BY CASE contype WHEN 'p' THEN 1 WHEN 'u' THEN 2 WHEN 'f' THEN 3 ELSE 4 END
  `;
  for (const c of constraints) {
    const tbl = c.table_name.replace(/^public\./, "");
    await tryExec(
      newSql,
      `ALTER TABLE public.${quoteIdent(tbl)} ADD CONSTRAINT ${quoteIdent(c.conname)} ${c.def};`,
      `constraint ${c.conname}`,
    );
  }

  // 4. Indexes (excluding ones backing constraints)
  const indexes = await oldSql`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE schemaname='public'
      AND indexname NOT IN (SELECT conname FROM pg_constraint WHERE connamespace='public'::regnamespace)
  `;
  for (const i of indexes) {
    await tryExec(newSql, i.indexdef + ";", `index ${i.indexname}`);
  }

  // 5. Functions
  const fns = await oldSql`
    SELECT p.proname, pg_get_functiondef(p.oid) AS def
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname='public'
  `;
  for (const f of fns) {
    await tryExec(newSql, f.def + ";", `function ${f.proname}`);
  }

  // 6. Triggers
  const trigs = await oldSql`
    SELECT tgname, pg_get_triggerdef(t.oid) AS def
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname='public' AND NOT t.tgisinternal
  `;
  for (const tr of trigs) {
    await tryExec(newSql, tr.def + ";", `trigger ${tr.tgname}`);
  }

  // 7. Enable RLS + policies
  const rlsTables = await oldSql`
    SELECT c.relname FROM pg_class c
    JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relkind='r' AND c.relrowsecurity=true
  `;
  for (const t of rlsTables) {
    await tryExec(newSql, `ALTER TABLE public.${quoteIdent(t.relname)} ENABLE ROW LEVEL SECURITY;`, `rls ${t.relname}`);
  }

  const policies = await oldSql`
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies WHERE schemaname='public'
  `;
  for (const p of policies) {
    const roles = (p.roles ?? []).join(", ") || "public";
    const using = p.qual ? ` USING (${p.qual})` : "";
    const wc = p.with_check ? ` WITH CHECK (${p.with_check})` : "";
    const cmd = p.cmd ?? "ALL";
    const ddl = `CREATE POLICY ${quoteIdent(p.policyname)} ON public.${quoteIdent(p.tablename)} AS ${p.permissive} FOR ${cmd} TO ${roles}${using}${wc};`;
    await tryExec(newSql, ddl, `policy ${p.policyname}`);
  }

  add("schema:done", true);
}

/* ---------------- DATA ---------------- */

async function migrateData(oldSql: any, newSql: any) {
  // Topological order by FK
  const tables: string[] = (await oldSql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema='public' AND table_type='BASE TABLE'
  `).map((r: any) => r.table_name);

  const fks = await oldSql`
    SELECT conrelid::regclass::text AS child, confrelid::regclass::text AS parent
    FROM pg_constraint WHERE contype='f' AND connamespace='public'::regnamespace
  `;
  const order = topoSort(tables, fks.map((r: any) => ({
    child: r.child.replace(/^public\./, ""),
    parent: r.parent.replace(/^public\./, ""),
  })));

  // Disable triggers during copy for FK safety
  await tryExec(newSql, `SET session_replication_role = 'replica';`, "disable triggers");

  for (const tbl of order) {
    try {
      const rows = await oldSql`SELECT * FROM ${oldSql(tbl)}`;
      if (rows.length === 0) {
        add(`data:${tbl}`, true, "0 rows");
        continue;
      }
      const cols = Object.keys(rows[0]);
      // chunked insert
      const chunkSize = 500;
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        await newSql`INSERT INTO ${newSql(tbl)} ${newSql(chunk, ...cols)} ON CONFLICT DO NOTHING`;
      }
      add(`data:${tbl}`, true, `${rows.length} rows`);
    } catch (e) {
      add(`data:${tbl}`, false, String(e));
    }
  }

  await tryExec(newSql, `SET session_replication_role = 'origin';`, "enable triggers");

  // Reset sequences
  const seqs = await oldSql`
    SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema='public'
  `;
  for (const s of seqs) {
    try {
      const [{ last_value }] = await oldSql`SELECT last_value FROM ${oldSql(s.sequence_name)}`;
      await newSql`SELECT setval(${'public.' + s.sequence_name}, ${last_value})`;
    } catch (e) {
      add(`seq:${s.sequence_name}`, false, String(e));
    }
  }
  add("data:done", true);
}

/* ---------------- AUTH ---------------- */

async function migrateAuthUsers(oldSql: any, newAdmin: any) {
  const users = await oldSql`
    SELECT id, email, phone, encrypted_password, email_confirmed_at, phone_confirmed_at,
           raw_app_meta_data, raw_user_meta_data, created_at
    FROM auth.users
  `;
  let ok = 0, fail = 0;
  for (const u of users) {
    try {
      // Use admin REST to import with password_hash
      const res = await fetch(`${Deno.env.get("SUPABASE_URL")}/auth/v1/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          "apikey": Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        },
        body: JSON.stringify({
          id: u.id,
          email: u.email,
          phone: u.phone,
          password_hash: u.encrypted_password,
          email_confirm: !!u.email_confirmed_at,
          phone_confirm: !!u.phone_confirmed_at,
          app_metadata: u.raw_app_meta_data ?? {},
          user_metadata: u.raw_user_meta_data ?? {},
        }),
      });
      if (res.ok || res.status === 422) ok++; else { fail++; add(`auth:${u.email}`, false, await res.text()); }
    } catch (e) {
      fail++; add(`auth:${u.email}`, false, String(e));
    }
  }
  add("auth:done", true, { ok, fail, total: users.length });
}

/* ---------------- STORAGE ---------------- */

async function migrateStorage(oldSql: any, oldAdmin: any, newAdmin: any) {
  const buckets = await oldSql`SELECT id, name, public FROM storage.buckets`;
  for (const b of buckets) {
    try {
      await newAdmin.storage.createBucket(b.id, { public: b.public });
    } catch (_) { /* may exist */ }
    const objs = await oldSql`SELECT name FROM storage.objects WHERE bucket_id=${b.id}`;
    let ok = 0, fail = 0;
    for (const o of objs) {
      try {
        const { data, error } = await oldAdmin.storage.from(b.id).download(o.name);
        if (error || !data) throw error ?? new Error("no data");
        const { error: upErr } = await newAdmin.storage.from(b.id).upload(o.name, data, { upsert: true });
        if (upErr) throw upErr;
        ok++;
      } catch (e) {
        fail++; add(`storage:${b.id}/${o.name}`, false, String(e));
      }
    }
    add(`storage:${b.id}`, true, { ok, fail, total: objs.length });
  }
}

/* ---------------- helpers ---------------- */

function quoteIdent(s: string) { return `"${s.replace(/"/g, '""')}"`; }

// Re-encode userinfo so passwords with special chars don't break URL parsing.
function sanitizeDbUrl(raw: string): string {
  const m = raw.match(/^(postgres(?:ql)?:\/\/)([^@]+)@(.+)$/);
  if (!m) return raw;
  const [, scheme, userinfo, rest] = m;
  const colonIdx = userinfo.indexOf(":");
  if (colonIdx === -1) return raw;
  const user = userinfo.slice(0, colonIdx);
  let pw = userinfo.slice(colonIdx + 1);
  // If password isn't already percent-encoded, encode it.
  try { decodeURIComponent(pw); } catch { pw = encodeURIComponent(pw); }
  if (/[^A-Za-z0-9\-._~%]/.test(pw)) pw = encodeURIComponent(decodeURIComponentSafe(pw));
  return `${scheme}${user}:${pw}@${rest}`;
}
function decodeURIComponentSafe(s: string) {
  try { return decodeURIComponent(s); } catch { return s; }
}

async function tryExec(sql: any, ddl: string, label: string) {
  try {
    await sql.unsafe(ddl);
    add(label, true);
  } catch (e) {
    add(label, false, String(e));
  }
}

function topoSort(nodes: string[], edges: { child: string; parent: string }[]) {
  const incoming = new Map<string, Set<string>>();
  nodes.forEach((n) => incoming.set(n, new Set()));
  edges.forEach((e) => {
    if (e.child !== e.parent && incoming.has(e.child) && nodes.includes(e.parent)) {
      incoming.get(e.child)!.add(e.parent);
    }
  });
  const out: string[] = [];
  const remaining = new Set(nodes);
  while (remaining.size) {
    const ready = [...remaining].filter((n) => [...incoming.get(n)!].every((p) => !remaining.has(p)));
    if (ready.length === 0) { out.push(...remaining); break; } // cycle: append rest
    ready.forEach((n) => { out.push(n); remaining.delete(n); });
  }
  return out;
}