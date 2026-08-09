(() => {
  const show = document.getElementById('show-params');
  const hide = document.getElementById('hide-params');
  const fallback = document.getElementById('webgl-fallback');
  const modal = document.getElementById('certificate-modal');
  const modalSheet = document.getElementById('certificate-sheet');
  const modalTitle = document.getElementById('certificate-title');
  const modalMeta = document.getElementById('certificate-meta');
  const guiRoot = () => document.querySelector('.dg.ac');

  const certificates = {
    kaitai: {
      heading: '登録証',
      body: '解体工事施工技士',
      sub: '公益社団法人 全国解体工事業団体連合会',
      date: '登録有効期限　令和13年4月30日',
      note: '解体工事施工技士登録者名簿への登録を証するもの'
    },
    waste: {
      heading: '修了証書',
      body: '産業廃棄物処理業の許可申請に関する講習',
      sub: '（新規）収集運搬課程',
      date: '2026年2月18日　修了 / 有効期限 発行日より5年間',
      note: '一般社団法人 環境総合研究所'
    },
    social: {
      heading: '感謝状',
      body: '株式会社 吏央 様',
      sub: '更生保護事業への理解と、非行少年の就職・改善更生への協力',
      date: '令和5年10月31日',
      note: '札幌保護観察所'
    }
  };

  const setGui = (visible) => {
    const root = guiRoot();
    if (root) root.style.display = visible ? 'block' : 'none';
    show.style.display = visible ? 'none' : 'block';
    hide.style.display = visible ? 'block' : 'none';
  };

  const openCertificate = (trigger) => {
    if (!modal || !trigger) return;
    const item = certificates[trigger.dataset.certKind];
    if (!item) return;
    modalTitle.textContent = trigger.dataset.certTitle || 'CERTIFICATE';
    modalMeta.textContent = trigger.dataset.certMeta || 'CREDENTIAL';
    modalSheet.innerHTML = `
      <div class="certificate-paper">
        <p class="certificate-paper-heading">${item.heading}</p>
        <h3>${item.body}</h3>
        <p class="certificate-paper-sub">${item.sub}</p>
        <p class="certificate-paper-date">${item.date}</p>
        <p class="certificate-paper-note">${item.note}</p>
        <span class="certificate-seal" aria-hidden="true">証</span>
      </div>`;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    const close = modal.querySelector('.certificate-close');
    if (close) close.focus();
  };

  const closeCertificate = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    modalSheet.innerHTML = '';
  };

  window.addEventListener('load', () => {
    setTimeout(() => setGui(false), 100);
    try {
      const canvas = document.getElementById('fluid-canvas');
      const hasWebGL = !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
      if (!hasWebGL) fallback.style.display = 'block';
    } catch (_) { fallback.style.display = 'block'; }
    try { if (typeof splatStack !== 'undefined') splatStack.push(12); } catch (_) {}
  });

  show.addEventListener('click', () => setGui(true));
  hide.addEventListener('click', () => setGui(false));
  document.querySelectorAll('.certificate-trigger').forEach((trigger) => trigger.addEventListener('click', () => openCertificate(trigger)));
  if (modal) modal.querySelectorAll('[data-modal-close]').forEach((el) => el.addEventListener('click', closeCertificate));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) closeCertificate();
  });
  document.querySelectorAll('a,button').forEach((el) => el.addEventListener('pointerdown', (e) => e.stopPropagation()));
})();