const origins = new Set(['https://rio-works.com', 'https://www.rio-works.com', 'https://infoworks-jp.github.io']);
Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin') || '';
  const headers: Record<string,string> = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, private','Pragma':'no-cache','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow','Vary':'Origin'};
  if (origins.has(origin)) headers['Access-Control-Allow-Origin'] = origin;
  const reply = (status:number, data:unknown) => new Response(JSON.stringify(data),{status,headers});
  if (origin && !origins.has(origin)) return reply(403,{error:'Forbidden'});
  if (req.method === 'OPTIONS') return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'content-type','Access-Control-Max-Age':'600'}});
  if (req.method !== 'POST') return reply(405,{error:'Method not allowed'});
  try {
    const raw = await req.text();
    if (raw.length > 256) return reply(400,{error:'Invalid request'});
    const body = JSON.parse(raw);
    const password = typeof body.password === 'string' && /^[0-9]{4}$/.test(body.password) ? body.password : '';
    // A global DB limit also applies, so changing address headers cannot bypass all limits.
    const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
    const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const key = await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
    const digest = await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(ip));
    const ipHash = Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');
    const response = await fetch(Deno.env.get('SUPABASE_URL')+'/rest/v1/rpc/rio_internal_unlock',{
      method:'POST',headers:{'Content-Type':'application/json','apikey':secret,'Authorization':'Bearer '+secret},
      body:JSON.stringify({p_password:password,p_ip_hash:ipHash})
    });
    if (!response.ok) return reply(503,{error:'Unavailable'});
    const result = await response.json();
    if (result.status === 200) return reply(200,result.data);
    return reply(result.status === 429 ? 429 : 401,{error:result.status===429?'Too many attempts':'Unauthorized'});
  } catch { return reply(400,{error:'Invalid request'}); }
});
