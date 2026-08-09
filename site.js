(() => {
  const CORE='https://raw.githubusercontent.com/infoworks-jp/rio-corporate-site/6242a77a0783baa7e08141a5984059b2089c6934/site.js';
  fetch(CORE,{cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error('core '+r.status);return r.text()}).then(code=>{(0,eval)(code)}).catch(err=>console.error('RIO core load failed',err));

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
  .credential-view{appearance:none;border:0;background:none;padding:0;color:#17181c;font:inherit;font-size:9px;letter-spacing:.18em;cursor:pointer;border-bottom:1px solid #a92d1f;padding-bottom:4px}.credential-view:hover{color:#a92d1f}
  .recognition-note{font:400 14px/2.05 "Yu Mincho","Hiragino Mincho ProN",serif}
  .credential-modal{position:fixed;inset:0;z-index:1000;display:none;align-items:center;justify-content:center;padding:clamp(10px,2vw,28px);background:rgba(5,5,6,.96);backdrop-filter:blur(8px)}.credential-modal.is-open{display:flex}
  .credential-card{position:relative;width:min(96vw,1100px);height:min(94dvh,920px);overflow:hidden;background:#17181c;color:#f4eee2;box-shadow:0 24px 90px rgba(0,0,0,.42);border:1px solid rgba(255,255,255,.14);display:flex;flex-direction:column}
  .credential-meta{padding:20px 58px 14px 22px;border-bottom:1px solid rgba(255,255,255,.14);flex:0 0 auto}.credential-meta small{display:block;color:#d05b49;letter-spacing:.22em;margin-bottom:5px;font-size:8px}.credential-meta h3{font:500 clamp(18px,2.5vw,27px)/1.3 "Yu Mincho","Hiragino Mincho ProN",serif;margin:0}
  .credential-pdf{display:block;width:100%;height:100%;border:0;background:#fff;flex:1 1 auto;min-height:0}
  .credential-fallback{display:none;padding:18px 22px;font-size:11px;line-height:1.8}.credential-fallback a{color:#f4eee2;text-decoration:underline}
  .credential-close{position:fixed;right:max(22px,env(safe-area-inset-right));top:max(18px,env(safe-area-inset-top));z-index:1001;border:0;background:none;color:#f4eee2;font-size:32px;line-height:1;cursor:pointer;font-weight:200}
  .rio-seal-image{display:block;width:76px;height:auto;object-fit:contain;margin:28px auto 0;mix-blend-mode:normal;transform:none;background:transparent}body.modal-open{overflow:hidden}
  @media(max-width:768px){.credentials-head,.credential-groups{grid-template-columns:1fr}.credentials-head{gap:20px;margin-bottom:42px}.credential-group,.credential-group+.credential-group{padding:26px 0;border-right:0;border-top:1px solid rgba(23,24,28,.22)}.credential-group:first-child{border-top:0}.credentials{padding-top:86px;padding-bottom:80px}.credential-modal{padding:0}.credential-card{width:100vw;height:100dvh;border:0}.credential-meta{padding-top:max(18px,env(safe-area-inset-top));padding-left:16px}.rio-seal-image{width:68px;height:auto}}
  `;
  document.head.appendChild(style);

  const oldSeal=document.querySelector('.principles .seal');
  if(oldSeal){const img=document.createElement('img');img.className='rio-seal-image';img.src='assets/rio-seal-original.jpg?v=20260809-original';img.alt='吏央 篆刻';oldSeal.replaceWith(img)}

  const records={
    demolition:{kicker:'TECHNICAL QUALIFICATIONS / 技術資格',title:'解体工事施工技士',pdf:'assets/certificates/original/kaitai-register.pdf'},
    civil:{kicker:'TECHNICAL QUALIFICATIONS / 技術資格',title:'2級土木施工管理技士',pdf:'assets/certificates/original/civil-engineer.pdf'},
    waste:{kicker:'TECHNICAL QUALIFICATIONS / 技術資格',title:'産業廃棄物収集運搬課程 修了',pdf:'assets/certificates/original/qualification-set.pdf'},
    recognition:{kicker:'RECOGNITION / 表彰・感謝状',title:'札幌保護観察所 感謝状',pdf:'assets/certificates/original/social-letter.pdf'}
  };

  const section=document.createElement('section');section.className='credentials';section.id='credentials';
  section.innerHTML=`<div class="credentials-wrap"><div class="credentials-head"><div><div class="section-no">CREDENTIALS — LICENSE / CERTIFICATION / RECOGNITION</div><h2>信頼を、<br>実績で。</h2></div><p class="credentials-intro">許可、技術資格、そして社会からの評価。必要な情報を端正にまとめ、証書は確認したい方だけが原本を閲覧できる形で公開しています。</p></div><div class="credential-groups">
  <div class="credential-group"><div class="credential-kicker">COMPANY LICENSE / 会社許可・登録</div><article class="credential-item"><h3>建設業許可</h3><p>北海道知事許可（般-25）石第21656号</p><span class="credential-view">TEXT RECORD</span></article></div>
  <div class="credential-group"><div class="credential-kicker">TECHNICAL QUALIFICATIONS / 技術資格</div><article class="credential-item"><h3>解体工事施工技士</h3><p>登録番号 第25010020号｜登録有効期限 令和13年4月30日</p><button class="credential-view" data-record="demolition">VIEW ORIGINAL ↗</button></article><article class="credential-item"><h3>2級土木施工管理技士</h3><p>2級技術検定合格証明書｜番号 97150759</p><button class="credential-view" data-record="civil">VIEW ORIGINAL ↗</button></article><article class="credential-item"><h3>産業廃棄物収集運搬課程 修了</h3><p>許可申請に関する講習（新規）収集運搬課程｜2026年2月18日修了・発行日より5年間有効</p><button class="credential-view" data-record="waste">VIEW ORIGINAL ↗</button></article></div>
  <div class="credential-group"><div class="credential-kicker">RECOGNITION / 表彰・感謝状</div><article class="credential-item"><h3>札幌保護観察所 感謝状</h3><p class="recognition-note">人を育て、社会へつなぐ。非行少年の就職支援および改善更生への協力に対し、札幌保護観察所より感謝状を拝受。</p><button class="credential-view" data-record="recognition">VIEW ORIGINAL ↗</button></article></div>
  </div></div>`;
  const mount=()=>{const c=document.getElementById('company');if(!c)return setTimeout(mount,50);if(!document.getElementById('credentials'))c.insertAdjacentElement('afterend',section);const nav=document.querySelector('.side-nav a[href="#works"]');if(nav&&!document.querySelector('.side-nav a[href="#credentials"]')){const a=document.createElement('a');a.href='#credentials';a.textContent='信用情報';nav.before(a)}};if(document.readyState==='loading')addEventListener('DOMContentLoaded',mount,{once:true});else mount();

  const modal=document.createElement('div');modal.className='credential-modal';modal.setAttribute('aria-hidden','true');modal.innerHTML='<button class="credential-close" aria-label="閉じる">×</button><div class="credential-card" role="dialog" aria-modal="true"><div class="credential-meta"><small></small><h3></h3></div><iframe class="credential-pdf" title="原本証書"></iframe><div class="credential-fallback">PDFを表示できない場合は <a target="_blank" rel="noopener">原本PDFを開く ↗</a></div></div>';document.body.appendChild(modal);
  const frame=modal.querySelector('.credential-pdf'),fallback=modal.querySelector('.credential-fallback'),fallbackLink=fallback.querySelector('a');
  const close=()=>{modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');frame.src='about:blank'};
  document.addEventListener('click',e=>{const b=e.target.closest('[data-record]');if(!b)return;const r=records[b.dataset.record];if(!r)return;modal.querySelector('small').textContent=r.kicker;modal.querySelector('h3').textContent=r.title;frame.src=r.pdf+'#view=FitH';fallbackLink.href=r.pdf;modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open')});
  modal.querySelector('.credential-close').addEventListener('click',close);modal.addEventListener('click',e=>{if(e.target===modal)close()});addEventListener('keydown',e=>{if(e.key==='Escape')close()});
})();