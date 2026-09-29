(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('from') !== 'kaku-works') return;
  const lang = params.get('kaku_lang') === 'en' ? 'en' : 'ja';
  const link = document.createElement('a');
  link.id = 'kaku-portfolio-return';
  link.href = 'https://works.y-kaku590232.chatgpt.site/?lang=' + lang + '#works';
  link.textContent = lang === 'en' ? '← Back to Kaku’s work' : '← 加来広告事務所の制作事例へ戻る';
  link.setAttribute('aria-label', link.textContent);
  const style = document.createElement('style');
  style.textContent = '#kaku-portfolio-return{position:fixed;z-index:1000;left:16px;bottom:calc(78px + env(safe-area-inset-bottom));max-width:calc(100vw - 32px);box-sizing:border-box;display:flex;align-items:center;min-height:44px;padding:10px 16px;border:1px solid #c9bfa9;border-radius:4px;background:#f3efe5;color:#192c2c;font:500 13px/1.6 sans-serif;text-decoration:none;box-shadow:0 3px 18px #0003}#kaku-portfolio-return:hover{background:#fff}#kaku-portfolio-return:focus-visible{outline:3px solid #b55a2a;outline-offset:3px}';
  document.head.append(style);
  document.body.append(link);
  // Carry the visit marker only within this site. No cookies or persistent flag.
  document.addEventListener('click', event => {
    const a = event.target.closest('a[href]');
    if (!a || a === link) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return;
    url.searchParams.set('from', 'kaku-works');
    url.searchParams.set('kaku_lang', lang);
    a.href = url.href;
  }, true);
})();
