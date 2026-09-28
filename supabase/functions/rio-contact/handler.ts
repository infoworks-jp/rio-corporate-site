import type postgres from 'npm:postgres@3.4.5';
import { ORIGINS, validatePayload, classifySpam, readPayload, sha256, verifyTurnstile } from './security.ts';

type Dependencies = { env:(key:string)=>string|undefined; connect:()=>postgres.Sql; request:typeof fetch };
export function createHandler({ env, connect, request }: Dependencies) {
  return async (req: Request): Promise<Response> => {
    const origin = req.headers.get('origin');
    const headers: Record<string,string> = {
      'Access-Control-Allow-Origin':origin && ORIGINS.has(origin) ? origin : 'https://rio-works.com',
      'Access-Control-Allow-Headers':'content-type', 'Access-Control-Allow-Methods':'GET, POST, OPTIONS',
      'Access-Control-Expose-Headers':'Retry-After', 'Vary':'Origin', 'Content-Type':'application/json; charset=utf-8',
      'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff',
    };
    const json = (body: unknown, status=200) => new Response(JSON.stringify(body), {status, headers:{...headers, ...(status===429 ? {'Retry-After':'3600'} : {})}});
    if (req.method === 'OPTIONS') return new Response(null,{status:204,headers});
    if (!['GET','POST'].includes(req.method)) return json({ok:false,error:'method_not_allowed'},405);
    if (req.method==='POST' && (!origin || !ORIGINS.has(origin))) return json({ok:false,error:'origin_not_allowed'},403);
    const siteKey = env('TURNSTILE_SITE_KEY') || '';
    const secret = env('TURNSTILE_SECRET_KEY') || '';
    if (!!siteKey !== !!secret || !env('SUPABASE_DB_URL')) return json({ok:false,error:'server_config'},503);
    if (req.method==='GET') {
      const sql = connect();
      try {
        await sql`select 1`;
        return json({ok:true,service:'rio-contact',protectionVersion:2,turnstileSiteKey:siteKey});
      } catch { return json({ok:false,error:'database_unavailable'},503); }
      finally { await sql.end({timeout:1}).catch(()=>{}); }
    }
    if (!req.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return json({ok:false,error:'invalid_content_type'},415);
    let raw: unknown;
    try { raw = await readPayload(req); }
    catch (e) { return json({ok:false,error:e instanceof Error && e.message==='payload_too_large'?'payload_too_large':'invalid_json'},e instanceof Error && e.message==='payload_too_large'?413:400); }
    const data = validatePayload(raw);
    if (!data) return json({ok:false,error:'invalid_fields'},400);
    if (data.website) return json({ok:true});
    if (secret) {
      try {
        if (!await verifyTurnstile(data.turnstileToken,secret,origin!,request)) return json({ok:false,error:'verification_required'},403);
      } catch { return json({ok:false,error:'verification_unavailable'},503); }
    }
    // Use the gateway-forwarded IP without the mutable browser UA. Never store the raw IP.
    const ip = (req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('cf-connecting-ip') || 'unknown').trim();
    const ipHash = await sha256(`ip:${ip}`);
    const emailHash = await sha256(`email:${data.email}`);
    const fingerprint = await sha256(JSON.stringify([data.type,data.name,data.company,data.email,data.tel,data.message.normalize('NFKC').replace(/\s+/g,' ')]));
    const spam = classifySpam(data.message);
    const ua = (req.headers.get('user-agent') || '').slice(0,300);
    const sql = connect();
    let saved = false;
    try {
      const receipt = await sql.begin(async tx => {
        // Serialize identical submissions, including concurrent retries from different IPs.
        await tx`select pg_advisory_xact_lock(hashtextextended(${fingerprint}, 0))`;
        const previous = await tx`select id,status from public.rio_contact_submissions where content_hash=${fingerprint} and created_at > now()-interval '24 hours' order by created_at desc limit 1`;
        if (previous.length) return {duplicate:true,status:String(previous[0].status),id:String(previous[0].id)};
        // Atomic counters cannot be bypassed with parallel submissions or a changed UA.
        for (const [key,limit] of [[ipHash,10],[emailHash,5]] as const) {
          const allowed = await tx`
            insert into public.rio_contact_rate_limits as limits (key,count,window_started_at) values (${key},1,now())
            on conflict (key) do update set
              count=case when limits.window_started_at <= now()-interval '1 hour' then 1 else limits.count+1 end,
              window_started_at=case when limits.window_started_at <= now()-interval '1 hour' then now() else limits.window_started_at end
            where limits.window_started_at <= now()-interval '1 hour' or limits.count < ${limit}
            returning count`;
          if (!allowed.length) throw new Error('rate_limited');
        }
        const status = spam.quarantined ? 'quarantined' : 'received';
        const rows = await tx`insert into public.rio_contact_submissions
          (inquiry_type,name,company,email,tel,message,ip_hash,user_agent,status,content_hash,spam_score,spam_reasons)
          values (${data.type},${data.name},${data.company||null},${data.email},${data.tel||null},${data.message},${ipHash},${ua},${status},${fingerprint},${spam.score},${spam.reasons.join(',')}) returning id`;
        return {duplicate:false,status,id:String(rows[0].id)};
      });
      saved = true;
      if (receipt.duplicate) {
        if (['received','mail_failed'].includes(receipt.status)) return json({ok:false,saved:true,duplicate:true,error:'mail_pending'},202);
        return json({ok:true,duplicate:true});
      }
      if (receipt.status==='quarantined') return json({ok:true});
      const body = ['株式会社吏央 公式サイトからお問い合わせが届きました。','',`お問い合わせ種別：${data.type}`,`お名前：${data.name}`,`会社名：${data.company||'-'}`,`メール：${data.email}`,`電話：${data.tel||'-'}`,'','お問い合わせ内容：',data.message].join('\n');
      try {
        const response = await request('https://formsubmit.co/ajax/info@rio-works.com', {
          method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json','Origin':'https://infoworks-jp.github.io','Referer':'https://infoworks-jp.github.io/rio-corporate-site/'},
          body:JSON.stringify({name:data.name,email:data.email,message:body,_subject:`【株式会社吏央HP】${data.type}｜${data.name}`,_template:'table',_captcha:'false'}),
          signal:AbortSignal.timeout(12000),
        });
        const result = await response.json().catch(()=>({}));
        if (!response.ok || ![true,'true'].includes(result.success)) throw new Error('mail_failed');
      } catch {
        await sql`update public.rio_contact_submissions set status='mail_failed' where id=${receipt.id}`;
        return json({ok:false,error:'mail_failed',saved:true},502);
      }
      await sql`update public.rio_contact_submissions set status='sent' where id=${receipt.id}`;
      return json({ok:true});
    } catch (e) {
      if (e instanceof Error && e.message==='rate_limited') return json({ok:false,error:'rate_limited'},429);
      console.error('rio-contact processing failed'); // Do not log message bodies, addresses or secrets.
      return json({ok:false,error:'server_error',saved},500);
    } finally { await sql.end({timeout:1}).catch(()=>{}); }
  };
}
