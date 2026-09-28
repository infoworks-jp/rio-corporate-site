export const ORIGINS = new Set(['https://rio-works.com', 'https://www.rio-works.com', 'https://infoworks-jp.github.io']);
export const TYPES = new Set(['工事・お見積りについて', '協力会社について', '採用について', 'その他']);
export const LIMITS = { type:80, name:100, company:140, email:254, tel:50, message:5000, website:200, clientToken:120, turnstileToken:2048 };

export async function sha256(value: string) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
}

export function validatePayload(input: unknown): Record<string, string> | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const data: Record<string, string> = {};
  for (const [key, max] of Object.entries(LIMITS)) {
    const value = (input as Record<string, unknown>)[key] ?? '';
    if (typeof value !== 'string' || value.length > max || value.includes('\0')) return null;
    data[key] = value.trim();
  }
  if (data.website) return data; // Honeypot is acknowledged without saving or sending.
  if (!TYPES.has(data.type) || !data.name || !data.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return null;
  if (/[\r\n]/.test(data.name + data.email + data.company + data.tel)) return null;
  if (data.type === '協力会社について' && !data.company) return null;
  data.email = data.email.toLowerCase();
  return data;
}

export function classifySpam(message: string) {
  const text = message.normalize('NFKC').toLowerCase();
  const reasons: string[] = [];
  let score = 0;
  const add = (reason: string, points: number) => { reasons.push(reason); score += points; };
  if (/(seo対策|meo対策|集客支援|営業代行|被リンク|リード獲得|検索順位を上げ|seo services|buy backlinks|guest post service)/i.test(text)) add('marketing_service', 3);
  if (/(ご提案|ご紹介させて|無料診断|無料相談|無料トライアル|特別価格|初月無料|offer our|free trial|limited.time offer)/i.test(text)) add('sales_pitch', 3);
  const urls = text.match(/https?:\/\/[^\s<>]+/g) || [];
  if (urls.length >= 5) add('many_links', 3);
  if (/(https?:\/\/(bit\.ly|tinyurl\.com|t\.co)\/)/i.test(text)) add('shortened_link', 2);
  if (/(オンラインカジノ|絶対儲か|必ず儲か|guaranteed profit|buy viagra|casino bonus)/i.test(text)) add('high_risk_promotion', 6);
  if (/<a\s[^>]*href\s*=|\[url[=\]]/i.test(text)) add('link_markup', 3);
  return { score, reasons, quarantined: score >= 6 };
}

export async function readPayload(req: Request) {
  const max = 32768;
  if (Number(req.headers.get('content-length')) > max) throw new Error('payload_too_large');
  const reader = req.body?.getReader();
  if (!reader) throw new Error('invalid_json');
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > max) { await reader.cancel(); throw new Error('payload_too_large'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function verifyTurnstile(token: string, secret: string, origin: string, request: typeof fetch) {
  if (!token || token.length > 2048) return false;
  const response = await request('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method:'POST', body:new URLSearchParams({ secret, response:token }), signal:AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error('verification_unavailable');
  const result = await response.json();
  return result.success === true && result.hostname === new URL(origin).hostname && result.action === 'rio_contact';
}
