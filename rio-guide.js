(() => {
  const facts = [
    { label: '札幌の工事', terms: /札幌|内装|解体|北海道/, answer: '札幌本社では内装解体を中心に、ビル・商業施設・教育施設などの工事を行っています。施工実績は札幌本社のページでご覧いただけます。', href: 'sapporo/', link: '札幌本社の工事内容を見る' },
    { label: '横浜の工事', terms: /横浜|土工|根切|基礎|とび|足場|仮設/, answer: '横浜支店では新築現場の土工事を中心に、とび・仮設工事に取り組んでいます。', href: 'yokohama/', link: '横浜支店の工事内容を見る' },
    { label: '工事の相談', terms: /相談|見積|依頼|発注|工事を頼|問い合わせ|問合せ/, answer: '工事の内容、場所、希望時期をお問い合わせ窓口からお知らせください。担当者が確認してご連絡します。金額や対応可否は内容を確認してからご案内します。', href: 'https://www.rio-works.com/お問い合わせ', link: 'お問い合わせ窓口を開く' },
    { label: '採用', terms: /採用|求人|応募|未経験|仕事を探|働きたい/, answer: '札幌・横浜の両拠点で現場スタッフを募集しています。経験者と未経験者向けの募集内容をご確認ください。', href: 'recruit/', link: '求人一覧を見る' },
    { label: '電話', terms: /電話|連絡先|tel|番号/, answer: '札幌本社は 011-374-8012、横浜支店は 045-930-3366 です。', href: '#contact', link: '連絡先を見る' }
  ];
  const dialog = document.createElement('dialog');
  dialog.className = 'rio-guide-dialog';
  dialog.setAttribute('aria-labelledby', 'rio-guide-title');
  dialog.innerHTML = `<div class="rio-guide-head"><div><small>RIO / TRIAL GUIDE</small><h2 id="rio-guide-title">吏央 案内チャット</h2></div><button type="button" class="rio-guide-close" aria-label="閉じる">×</button></div><div class="rio-guide-body"><p class="rio-guide-note">サイトに掲載した情報からご案内します。まず項目を選ぶか、短い質問を入力してください。</p><div class="rio-guide-topics"></div><form class="rio-guide-form"><label class="rio-guide-sr" for="rio-guide-question" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">質問</label><input id="rio-guide-question" name="question" maxlength="120" placeholder="例：札幌ではどんな工事？" autocomplete="off"><button type="submit">送信</button></form><div class="rio-guide-answer" role="status" aria-live="polite">ご相談内容を選んでください。</div><p class="rio-guide-caption">試験版：現在はFAQ検索で、生成AIは接続していません。入力内容は送信・保存されません。個別の見積や工期は担当者にご相談ください。</p></div>`;
  document.body.appendChild(dialog);
  const answer = dialog.querySelector('.rio-guide-answer');
  const topicBox = dialog.querySelector('.rio-guide-topics');
  function show(fact) {
    answer.replaceChildren();
    const p = document.createElement('p'); p.textContent = fact.answer; answer.appendChild(p);
    const a = document.createElement('a'); a.href = fact.href; a.textContent = fact.link + ' ↗'; answer.appendChild(a);
  }
  for (const fact of facts) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = fact.label;
    b.addEventListener('click', () => show(fact)); topicBox.appendChild(b);
  }
  dialog.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    const value = dialog.querySelector('input').value.normalize('NFKC').trim();
    if (!value) return;
    const fact = [facts[2], facts[4], facts[3], facts[0], facts[1]].find(item => item.terms.test(value));
    if (fact) show(fact);
    else show({ answer: '掲載情報からは確認できませんでした。個別の内容はお問い合わせ窓口からご相談ください。', href: 'https://www.rio-works.com/お問い合わせ', link: 'お問い合わせ窓口を開く' });
  });
  const launch = document.createElement('button');
  launch.type = 'button'; launch.className = 'rio-guide-launch'; launch.textContent = '工事・採用のご案内';
  launch.setAttribute('aria-haspopup', 'dialog'); launch.setAttribute('aria-controls', 'rio-guide-title');
  document.body.appendChild(launch);
  function open() { if (!dialog.open) dialog.showModal(); }
  launch.addEventListener('click', open);
  document.querySelectorAll('[data-rio-guide-open]').forEach(b => b.addEventListener('click', open));
  dialog.querySelector('.rio-guide-close').addEventListener('click', () => dialog.close());
})();
