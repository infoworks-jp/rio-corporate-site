(() => {
  const style=document.createElement('style');
  style.textContent=`
  .credentials{background:rgba(238,232,220,.94);min-height:auto;padding-top:100px;padding-bottom:110px}
  .credentials-wrap{max-width:1180px;margin:auto}
  .credentials-head{display:grid;grid-template-columns:.8fr 1.2fr;gap:10vw;align-items:end;margin-bottom:64px}
  .credentials-head h2{margin-bottom:0}
  .credentials-intro{max-width:560px;font-size:13px;line-height:2.1}
  .credential-groups{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:1px solid rgba(23,24,28,.32)}
  .credential-group{padding:30px 30px 10px 0;border-right:1px solid rgba(23,24,28,.18)}
  .credential-group+.credential-group{padding-left:30px}.credential-group:last-child{border-right:0;padding-right:0}
  .credential-kicker{font-size:9px;letter-spacing:.22em;color:#a92d1f;margin-bottom:20px}
  .credential-item{padding:22px 0;border-top:1px solid rgba(23,24,28,.18)}.credential-item:first-of-type{border-top:0}
  .credential-item h3{margin:0 0 7px;font:500 clamp(19px,2vw,27px)/1.45 "Yu Mincho","Hiragino Mincho ProN",serif}
  .credential-item p{margin:0 0 12px;font-size:11px;line-height:1.9;color:rgba(23,24,28,.72)}
  .permit-notices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin-top:20px}
  .permit-notice{margin:0;min-width:0}.permit-notice a{display:block;overflow:hidden;background:#fff;border:1px solid rgba(23,24,28,.18);box-shadow:0 6px 18px rgba(23,24,28,.08)}
  .permit-notice img{display:block;width:100%;aspect-ratio:3/4;object-fit:cover;object-position:center 43%;transition:transform .25s ease}.permit-notice a:hover img{transform:scale(1.025)}
  .permit-notice figcaption{padding:10px 0 0;font-size:12px;line-height:1.7}.permit-notice small{display:block;color:rgba(23,24,28,.7);font-size:11px;line-height:1.65}
  .permit-notice a:focus-visible{outline:3px solid #a92d1f;outline-offset:3px}
  .credential-view{appearance:none;border:0;background:none;padding:0;color:#17181c;font:inherit;font-size:9px;letter-spacing:.18em;cursor:pointer;border-bottom:1px solid #a92d1f;padding-bottom:4px}.credential-view:hover{color:#a92d1f}
  .recognition-note{font:400 14px/2.05 "Yu Mincho","Hiragino Mincho ProN",serif}
  .credential-modal{position:fixed;inset:0;z-index:1000;display:none;align-items:center;justify-content:center;padding:clamp(10px,2vw,28px);background:rgba(5,5,6,.96);backdrop-filter:blur(8px)}.credential-modal.is-open{display:flex}
  .credential-card{position:relative;width:min(96vw,1100px);height:min(94dvh,920px);overflow:hidden;background:#17181c;color:#f4eee2;box-shadow:0 24px 90px rgba(0,0,0,.42);border:1px solid rgba(255,255,255,.14);display:flex;flex-direction:column}
  .credential-meta{padding:20px 58px 14px 22px;border-bottom:1px solid rgba(255,255,255,.14);flex:0 0 auto}.credential-meta small{display:block;color:#d05b49;letter-spacing:.22em;margin-bottom:5px;font-size:8px}.credential-meta h3{font:500 clamp(18px,2.5vw,27px)/1.3 "Yu Mincho","Hiragino Mincho ProN",serif;margin:0}
  .credential-pdf{display:block;width:100%;height:100%;border:0;background:#fff;flex:1 1 auto;min-height:0}
  .credential-fallback{display:block;flex:0 0 auto;padding:18px 22px;font-size:11px;line-height:1.8}.credential-fallback a{color:#f4eee2;text-decoration:underline}
  .credential-close{position:fixed;right:max(22px,env(safe-area-inset-right));top:max(18px,env(safe-area-inset-top));z-index:1001;border:0;background:none;color:#f4eee2;font-size:32px;line-height:1;cursor:pointer;font-weight:200}
  .rio-seal-image{display:block;width:76px;height:auto;object-fit:contain;margin:28px auto 0;mix-blend-mode:normal;transform:none;background:transparent}body.modal-open{overflow:hidden}
  @media(max-width:768px){.credentials-head,.credential-groups{grid-template-columns:1fr}.credentials-head{gap:20px;margin-bottom:42px}.credential-group,.credential-group+.credential-group{padding:26px 0;border-right:0;border-top:1px solid rgba(23,24,28,.22)}.credential-group:first-child{border-top:0}.credentials{padding-top:86px;padding-bottom:80px}.credential-modal{padding:0}.credential-card{width:100vw;height:100dvh;border:0}.credential-meta{padding-top:max(18px,env(safe-area-inset-top));padding-left:16px}.rio-seal-image{width:68px;height:auto}}
  `;
  document.head.appendChild(style);

  const oldSeal=document.querySelector('.principles .seal');
  if(oldSeal){const img=document.createElement('img');img.className='rio-seal-image';img.src='assets/rio-seal-original.jpg?v=20260809-original';img.alt='吏央 篆刻';oldSeal.replaceWith(img)}

  const records={
    construction:{kicker:'COMPANY LICENSE / 会社許可・登録',title:'建設業許可通知書',pdf:'assets/certificates/display/construction-permit.pdf'},
    demolition:{kicker:'TECHNICAL QUALIFICATIONS / 技術資格',title:'解体工事施工技士',pdf:'assets/certificates/display/demolition.pdf'},
    civil:{kicker:'TECHNICAL QUALIFICATIONS / 技術資格',title:'2級土木施工管理技士',pdf:'assets/certificates/display/civil.pdf'},
    waste:{kicker:'TECHNICAL QUALIFICATIONS / 技術資格',title:'産業廃棄物収集運搬課程 修了',pdf:'assets/certificates/display/waste.pdf'},
    recognition:{kicker:'RECOGNITION / 表彰・感謝状',title:'札幌保護観察所 感謝状',pdf:'assets/certificates/display/recognition.pdf'}
  };

  const section=document.createElement('section');section.className='credentials';section.id='credentials';
  section.innerHTML=`<div class="credentials-wrap"><div class="credentials-head"><div><div class="section-no">CREDENTIALS — LICENSE / CERTIFICATION / RECOGNITION</div><h2>信頼を、<br>実績で。</h2></div><p class="credentials-intro">許可、技術資格、そして社会からの評価。必要な情報を端正にまとめ、証書は確認したい方だけが原本を閲覧できる形で公開しています。</p></div><div class="credential-groups">
  <div class="credential-group"><div class="credential-kicker">COMPANY LICENSE / 会社許可・登録</div><article class="credential-item"><h3>建設業許可</h3><p>北海道知事許可（般－7）石第21656号</p><button class="credential-view" data-record="construction">現行の許可通知書を開く ↗</button><p style="margin-top:22px">追加許可時の通知書（記載内容は交付当時のもの）</p><div class="permit-notices"><figure class="permit-notice"><a href="assets/certificates/original/construction-permit-20240205.jpeg" target="_blank" rel="noopener noreferrer" aria-label="令和6年2月5日付 建設業許可通知書の原本写真を開く"><img src="assets/certificates/original/construction-permit-20240205.jpeg" alt="建設業許可通知書。土木工事業、しゅんせつ工事業、舗装工事業。" loading="lazy" width="864" height="1536"></a><figcaption>土木・しゅんせつ・舗装工事業<small>令和6年2月5日付／通知書の記載：令和11年2月4日まで</small></figcaption></figure><figure class="permit-notice"><a href="assets/certificates/original/construction-permit-20231108.jpeg" target="_blank" rel="noopener noreferrer" aria-label="令和5年11月8日付 建設業許可通知書の原本写真を開く"><img src="assets/certificates/original/construction-permit-20231108.jpeg" alt="建設業許可通知書。大工工事業、石工事業、鋼構造物工事業、とび・土工工事業、タイル・れんが・ブロック工事業、鉄筋工事業。" loading="lazy" width="864" height="1536"></a><figcaption>大工・石・鋼構造物・とび土工・タイルれんがブロック・鉄筋工事業<small>令和5年11月8日付／通知書の記載：令和10年11月7日まで</small></figcaption></figure></div></article><article class="credential-item"><h3>産業廃棄物収集運搬業許可</h3><a class="credential-view" href="assets/certificates/original/industrial-waste-transport-permit.png" target="_blank" rel="noopener noreferrer">産業廃棄物収集運搬業許可証を開く ↗</a></article></div>
  <div class="credential-group"><div class="credential-kicker">TECHNICAL QUALIFICATIONS / 技術資格</div><article class="credential-item"><h3>解体工事施工技士</h3><p>登録番号 第25010020号｜登録有効期限 令和13年4月30日</p><button class="credential-view" data-record="demolition">VIEW ORIGINAL ↗</button></article><article class="credential-item"><h3>2級土木施工管理技士</h3><p>2級技術検定合格証明書｜番号 97150759</p><button class="credential-view" data-record="civil">VIEW ORIGINAL ↗</button></article><article class="credential-item"><h3>産業廃棄物収集運搬課程 修了</h3><p>許可申請に関する講習（新規）収集運搬課程｜2026年2月18日修了・発行日より5年間有効</p><button class="credential-view" data-record="waste">VIEW ORIGINAL ↗</button></article></div>
  <div class="credential-group"><div class="credential-kicker">RECOGNITION / 表彰・感謝状</div><article class="credential-item"><h3>札幌保護観察所 感謝状</h3><p class="recognition-note">人を育て、社会へつなぐ。非行少年の就職支援および改善更生への協力に対し、札幌保護観察所より感謝状を拝受。</p><button class="credential-view" data-record="recognition">VIEW ORIGINAL ↗</button></article></div>
  </div></div>`;
  const mount=()=>{const c=document.getElementById('company');if(!c)return setTimeout(mount,50);if(!document.getElementById('credentials'))c.insertAdjacentElement('afterend',section);const nav=document.querySelector('.side-nav a[href="#works"]');if(nav&&!document.querySelector('.side-nav a[href="#credentials"]')){const a=document.createElement('a');a.href='#credentials';a.textContent='信用情報';nav.before(a)}};if(document.readyState==='loading')addEventListener('DOMContentLoaded',mount,{once:true});else mount();

  const modal=document.createElement('div');modal.className='credential-modal';modal.setAttribute('aria-hidden','true');modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','credential-title');modal.innerHTML='<button class="credential-close" aria-label="閉じる">×</button><div class="credential-card"><div class="credential-meta"><small></small><h3 id="credential-title"></h3></div><iframe class="credential-pdf" title="原本証書"></iframe><div class="credential-fallback">PDFを表示できない場合は <a href="assets/certificates/display/construction-permit.pdf" target="_blank" rel="noopener">原本PDFを開く ↗</a></div></div>';document.body.appendChild(modal);
  const frame=modal.querySelector('.credential-pdf'),fallback=modal.querySelector('.credential-fallback'),fallbackLink=fallback.querySelector('a');
  const close=()=>{if(!modal.classList.contains('is-open'))return;modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');frame.src='about:blank'};
  document.addEventListener('click',e=>{const b=e.target.closest('[data-record]');if(!b)return;const r=records[b.dataset.record];if(!r)return;modal.querySelector('small').textContent=r.kicker;modal.querySelector('h3').textContent=r.title;frame.src=r.pdf+'?v=20260809-single#page=1&view=Fit';fallbackLink.href=r.pdf;modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open')});
  modal.querySelector('.credential-close').addEventListener('click',close);modal.addEventListener('click',e=>{if(e.target===modal)close()});addEventListener('keydown',e=>{if(e.key==='Escape')close()});
})();
