import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import postgres from "npm:postgres@3.4.5";

const ALLOWED_ORIGINS = new Set([
  "https://infoworks-jp.github.io",
  "https://rio-works.com",
  "https://www.rio-works.com",
]);

const FORM_ENDPOINT = "https://formsubmit.co/ajax/info@rio-works.com";

function cors(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://infoworks-jp.github.io";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Vary": "Origin",
    "Content-Type": "application/json; charset=utf-8",
  };
}

function json(body: unknown, status = 200, origin: string | null = null) {
  return new Response(JSON.stringify(body), { status, headers: cors(origin) });
}

function clean(v: unknown, max: number) {
  return String(v ?? "").replace(/\0/g, "").trim().slice(0, max);
}

async function sha256(input: string) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });

  const dbUrl = Deno.env.get("SUPABASE_DB_URL");
  if (!dbUrl) return json({ ok:false, error:"server_config" }, 500, origin);

  if (req.method === "GET") {
    const sql = postgres(dbUrl, { prepare:false, max:1 });
    try {
      await sql`select 1`;
      return json({ ok:true, service:"rio-contact" }, 200, origin);
    } catch (e) {
      console.error("contact health error", e instanceof Error ? e.message : String(e));
      return json({ ok:false, error:"database_unavailable" }, 503, origin);
    } finally {
      await sql.end({ timeout:1 }).catch(() => {});
    }
  }

  if (req.method !== "POST") return json({ ok:false, error:"method_not_allowed" }, 405, origin);
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return json({ ok:false, error:"origin_not_allowed" }, 403, origin);

  let payload: Record<string, unknown>;
  try { payload = await req.json(); } catch { return json({ ok:false, error:"invalid_json" }, 400, origin); }

  if (clean(payload.website, 200)) return json({ ok:true }, 200, origin);

  const inquiryType = clean(payload.type, 80);
  const name = clean(payload.name, 100);
  const company = clean(payload.company, 140);
  const email = clean(payload.email, 254);
  const tel = clean(payload.tel, 50);
  const message = clean(payload.message, 5000);
  const clientToken = clean(payload.clientToken, 120);

  if (!inquiryType || !name || !email || !message) return json({ ok:false, error:"required_fields" }, 400, origin);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok:false, error:"invalid_email" }, 400, origin);

  const sql = postgres(dbUrl, { prepare:false, max:1 });
  const forwarded = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
  const ua = clean(req.headers.get("user-agent"), 300);
  const rateKey = await sha256(`${forwarded}|${ua}`);

  try {
    const rows = await sql`select window_started_at, count from rio_contact_rate_limits where key=${rateKey}`;
    const now = new Date();
    if (rows.length) {
      const started = new Date(rows[0].window_started_at);
      const withinHour = now.getTime() - started.getTime() < 3600000;
      if (withinHour && Number(rows[0].count) >= 5) return json({ ok:false, error:"rate_limited" }, 429, origin);
      if (withinHour) await sql`update rio_contact_rate_limits set count=count+1 where key=${rateKey}`;
      else await sql`update rio_contact_rate_limits set count=1, window_started_at=${now.toISOString()} where key=${rateKey}`;
    } else {
      await sql`insert into rio_contact_rate_limits (key,count,window_started_at) values (${rateKey},1,${now.toISOString()})`;
    }

    if (clientToken) {
      const dup = await sql`select id,status from rio_contact_submissions where user_agent like ${`%token:${clientToken}%`} order by created_at desc limit 1`;
      if (dup.length && ["sent","received"].includes(String(dup[0].status))) return json({ ok:true, duplicate:true }, 200, origin);
    }

    const stampedUA = clientToken ? `${ua} token:${clientToken}` : ua;
    const inserted = await sql`
      insert into rio_contact_submissions
      (inquiry_type,name,company,email,tel,message,ip_hash,user_agent,status)
      values (${inquiryType},${name},${company || null},${email},${tel || null},${message},${rateKey},${stampedUA},'received')
      returning id
    `;
    const id = inserted[0].id;

    const subject = `【株式会社吏央HP】${inquiryType}｜${name}`;
    const body = [
      "株式会社吏央 公式サイトからお問い合わせが届きました。",
      "",
      `お問い合わせ種別：${inquiryType}`,
      `お名前：${name}`,
      `会社名：${company || "-"}`,
      `メール：${email}`,
      `電話：${tel || "-"}`,
      "",
      "お問い合わせ内容：",
      message,
    ].join("\n");

    const resp = await fetch(FORM_ENDPOINT, {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Accept":"application/json",
        "Origin":"https://infoworks-jp.github.io",
        "Referer":"https://infoworks-jp.github.io/rio-corporate-site/"
      },
      body: JSON.stringify({
        name,
        email,
        message: body,
        _subject: subject,
        _template: "table",
        _captcha: "false"
      })
    });
    const data = await resp.json().catch(() => ({}));
    const success = resp.ok && (data.success === true || data.success === "true");
    if (!success) {
      await sql`update rio_contact_submissions set status='mail_failed' where id=${id}`;
      return json({ ok:false, error:"mail_failed", saved:true }, 502, origin);
    }

    await sql`update rio_contact_submissions set status='sent' where id=${id}`;
    return json({ ok:true }, 200, origin);
  } catch (e) {
    console.error("contact error", e instanceof Error ? e.message : String(e));
    return json({ ok:false, error:"server_error" }, 500, origin);
  } finally {
    await sql.end({ timeout:1 }).catch(() => {});
  }
});
