'use strict';

const endpoint = 'https://xxhgerxugsjoxkbuuqhb.supabase.co/functions/v1/rio-work-rules';
const gate = document.getElementById('gate');
const workspace = document.getElementById('workspace');
const password = document.getElementById('password');
const message = document.getElementById('message');
const viewer = document.getElementById('document');
const openPdf = document.getElementById('open-pdf');
const prompt = message.textContent;
let pdfUrl;
let request;

function lock() {
  request?.abort();
  if (pdfUrl) URL.revokeObjectURL(pdfUrl);
  pdfUrl = undefined;
  viewer.removeAttribute('src');
  openPdf.removeAttribute('href');
  password.value = '';
  message.className = '';
  message.textContent = prompt;
  workspace.hidden = true;
  gate.hidden = false;
}

document.getElementById('login').addEventListener('submit', async event => {
  event.preventDefault();
  if (request) return;
  const button = event.submitter;
  request = new AbortController();
  button.disabled = true;
  message.className = '';
  message.textContent = '確認しています…';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password.value }),
      signal: request.signal,
      cache: 'no-store',
    });
    if (response.status === 401) throw new Error('暗証番号が違います。');
    if (response.status === 429) throw new Error('しばらく時間をおいてから入力してください。');
    if (!response.ok || !response.headers.get('Content-Type')?.startsWith('application/pdf')) {
      throw new Error('就業規則を開けませんでした。時間をおいて再度お試しください。');
    }

    pdfUrl = URL.createObjectURL(await response.blob());
    openPdf.href = pdfUrl;
    viewer.src = pdfUrl;
    password.value = '';
    gate.hidden = true;
    workspace.hidden = false;
    document.getElementById('document-title').focus();
  } catch (error) {
    if (request.signal.aborted) return;
    message.className = 'error';
    message.textContent = error instanceof TypeError ? '通信に失敗しました。再度お試しください。' : error.message;
    password.select();
    password.focus();
  } finally {
    request = undefined;
    button.disabled = false;
  }
});

document.getElementById('lock').addEventListener('click', () => {
  lock();
  password.focus();
});
window.addEventListener('pagehide', lock);
