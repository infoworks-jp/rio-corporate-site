(() => {
  const script = document.currentScript || [...document.scripts].find(el => /work-photos\.js/.test(el.src));
  const root = new URL('.', script.src);
  const dialog = document.createElement('dialog');
  dialog.className = 'work-photo-dialog';
  dialog.setAttribute('aria-labelledby', 'work-photo-title');
  dialog.innerHTML = `<div class="work-photo-header"><h2 id="work-photo-title">札幌市白石区北郷2条12丁目</h2><button class="work-photo-close" type="button">閉じる ×</button></div><p>木造二階建て 一軒家解体工事<br>36坪 ／ 令和8年10月</p><div class="work-photo-grid"></div>`;
  document.body.append(dialog);
  let opener;
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-work-photos="kitago"]');
    if (!button) return;
    opener = button;
    if (!dialog.querySelector('img')) {
      [['kitago-before', '解体前'], ['kitago-during', '解体工事中']].forEach(([name, caption]) => {
        const figure = document.createElement('figure');
        const img = document.createElement('img');
        img.src = new URL(`assets/works/${name}.webp`, root).href;
        img.alt = `札幌市白石区北郷の木造二階建て一軒家・${caption}`;
        img.width = name === 'kitago-before' ? 1477 : 1350;
        img.height = name === 'kitago-before' ? 1108 : 1800;
        const label = document.createElement('figcaption'); label.textContent = caption;
        figure.append(img, label); dialog.querySelector('.work-photo-grid').append(figure);
      });
    }
    dialog.showModal(); document.body.classList.add('work-photo-open');
  });
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => { document.body.classList.remove('work-photo-open'); opener?.focus({preventScroll:true}); });
})();
