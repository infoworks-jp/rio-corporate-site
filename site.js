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
  .credential-group+.credential-group{padding-left:30px}
  .credential-group:last-child{border-right:0;padding-right:0}
  .credential-kicker{font-size:9px;letter-spacing:.22em;color:#a92d1f;margin-bottom:20px}
  .credential-item{padding:22px 0;border-top:1px solid rgba(23,24,28,.18)}
  .credential-item:first-of-type{border-top:0}
  .credential-item h3{margin:0 0 7px;font:500 clamp(19px,2vw,27px)/1.45 "Yu Mincho","Hiragino Mincho ProN",serif}
  .credential-item p{margin:0 0 12px;font-size:11px;line-height:1.9;color:rgba(23,24,28,.72)}
  .credential-view{appearance:none;border:0;background:none;padding:0;color:#17181c;font:inherit;font-size:9px;letter-spacing:.18em;cursor:pointer;border-bottom:1px solid #a92d1f;padding-bottom:4px}
  .credential-view:hover{color:#a92d1f}
  .recognition-note{font:400 14px/2.05 "Yu Mincho","Hiragino Mincho ProN",serif}
  .credential-modal{position:fixed;inset:0;z-index:1000;display:none;align-items:center;justify-content:center;padding:clamp(18px,4vw,56px);background:rgba(5,5,6,.94);backdrop-filter:blur(8px)}
  .credential-modal.is-open{display:flex}
  .credential-card{position:relative;width:min(92vw,760px);max-height:86dvh;overflow:auto;background:#eee8dc;color:#17181c;padding:clamp(32px,6vw,72px);box-shadow:0 24px 90px rgba(0,0,0,.42);border:1px solid rgba(169,45,31,.3)}
  .credential-card:before{content:'';position:absolute;inset:16px;border:1px solid rgba(23,24,28,.16);pointer-events:none}
  .credential-card small{display:block;color:#a92d1f;letter-spacing:.22em;margin-bottom:20px}
  .credential-card h3{font:500 clamp(28px,5vw,50px)/1.35 "Yu Mincho","Hiragino Mincho ProN",serif;margin:0 0 28px}
  .credential-card dl{margin:0}.credential-card .row{display:grid;grid-template-columns:9em 1fr;gap:20px;padding:13px 0;border-top:1px solid rgba(23,24,28,.18)}
  .credential-card dt{font-size:9px;letter-spacing:.15em;color:#a92d1f}.credential-card dd{margin:0;font-size:13px}
  .credential-card .privacy{margin-top:28px;font-size:9px;letter-spacing:.08em;color:rgba(23,24,28,.55)}
  .credential-close{position:fixed;right:max(22px,env(safe-area-inset-right));top:max(18px,env(safe-area-inset-top));z-index:1001;border:0;background:none;color:#f4eee2;font-size:32px;line-height:1;cursor:pointer;font-weight:200}
  body.modal-open{overflow:hidden}
  @media(max-width:768px){.credentials-head,.credential-groups{grid-template-columns:1fr}.credentials-head{gap:20px;margin-bottom:42px}.credential-group,.credential-group+.credential-group{padding:26px 0;border-right:0;border-top:1px solid rgba(23,24,28,.22)}.credential-group:first-child{border-top:0}.credentials{padding-top:86px;padding-bottom:80px}.credential-card .row{grid-template-columns:1fr;gap:3px}}
  `;
  document.head.appendChild(style);

  const records={
    demolition:{kicker:'TECHNICAL QUALIFICATIONS / 技術資格',title:'解体工事施工技士',rows:[['氏名','大渕 吏央'],['登録番号','第25010020号'],['登録有効期限','令和13年4月30日'],['登録日','令和8年5月1日'],['発行','公益社団法人 全国解体工事業団体連合会']]},
    civil:{kicker:'TECHNICAL QUALIFICATIONS / 技術資格',title:'2級土木施工管理技士',rows:[['氏名','大渕 吏央'],['証明書番号','97150759'],['資格','2級土木施工管理技士'],['合格証明日','平成10年3月10日'],['発行','建設大臣']]},
    waste:{kicker:'TECHNICAL QUALIFICATIONS / 技術資格',title:'産業廃棄物収集運搬課程 修了',rows:[['会社名','株式会社 吏央'],['氏名','大渕 吏央'],['修了課程','産業廃棄物処理業の許可申請に関する講習（新規）収集運搬課程'],['修了日','2026年2月18日'],['有効期限','発行日より5年間'],['発行','一般社団法人 環境総合研究所']]},
    recognition:{kicker:'RECOGNITION / 表彰・感謝状',title:'札幌保護観察所 感謝状',rows:[['受領','株式会社 吏央'],['内容','更生保護事業の重要性に深い理解を示し、非行少年の就職を助け、その改善更生に協力'],['日付','令和5年11月30日'],['発行','札幌保護観察所長 吉原 克久']]}
  };

  function rowHtml(rows){return rows.map(([a,b])=>`<div class="row"><dt>${a}</dt><dd>${b}</dd></div>`).join('')}
  const section=document.createElement('section');
  section.className='credentials'; section.id='credentials';
  section.innerHTML=`<div class="credentials-wrap">
    <div class="credentials-head"><div><div class="section-no">CREDENTIALS — LICENSE / CERTIFICATION / RECOGNITION</div><h2>信頼を、<br>実績で。</h2></div><p class="credentials-intro">許可、技術資格、そして社会からの評価。必要な情報だけを端正に公開し、証書の個人情報は公開上必要な範囲に限定しています。</p></div>
    <div class="credential-groups">
      <div class="credential-group"><div class="credential-kicker">COMPANY LICENSE / 会社許可・登録</div><article class="credential-item"><h3>建設業許可</h3><p>北海道知事許可（般-25）石第21656号</p><span class="credential-view">TEXT RECORD</span></article></div>
      <div class="credential-group"><div class="credential-kicker">TECHNICAL QUALIFICATIONS / 技術資格</div>
        <article class="credential-item"><h3>解体工事施工技士</h3><p>登録番号 第25010020号｜登録有効期限 令和13年4月30日</p><button class="credential-view" data-record="demolition">VIEW CERTIFICATE ↗</button></article>
        <article class="credential-item"><h3>2級土木施工管理技士</h3><p>2級技術検定合格証明書｜番号 97150759</p><button class="credential-view" data-record="civil">VIEW CERTIFICATE ↗</button></article>
        <article class="credential-item"><h3>産業廃棄物収集運搬課程 修了</h3><p>許可申請に関する講習（新規）収集運搬課程｜2026年2月18日修了・発行日より5年間有効</p><button class="credential-view" data-record="waste">VIEW CERTIFICATE ↗</button></article>
      </div>
      <div class="credential-group"><div class="credential-kicker">RECOGNITION / 表彰・感謝状</div><article class="credential-item"><h3>札幌保護観察所 感謝状</h3><p class="recognition-note">人を育て、社会へつなぐ。非行少年の就職支援および改善更生への協力に対し、札幌保護観察所より感謝状を拝受。</p><button class="credential-view" data-record="recognition">VIEW LETTER ↗</button></article></div>
    </div></div>`;
  const company=document.getElementById('company');
  const mount=()=>{const c=document.getElementById('company');if(!c)return setTimeout(mount,50);c.insertAdjacentElement('afterend',section);const nav=document.querySelector('.side-nav a[href="#works"]');if(nav&&!document.querySelector('.side-nav a[href="#credentials"]')){const a=document.createElement('a');a.href='#credentials';a.textContent='信用情報';nav.before(a)}};
  if(company)mount(); else addEventListener('DOMContentLoaded',mount,{once:true});

  const modal=document.createElement('div');modal.className='credential-modal';modal.setAttribute('aria-hidden','true');modal.innerHTML='<button class="credential-close" aria-label="閉じる">×</button><div class="credential-card" role="dialog" aria-modal="true"><small></small><h3></h3><dl></dl><p class="privacy">PUBLIC VIEW — 生年月日等の個人情報は公開表示から除外しています。</p></div>';document.body.appendChild(modal);
  const close=()=>{modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open')};
  document.addEventListener('click',e=>{const b=e.target.closest('[data-record]');if(!b)return;const r=records[b.dataset.record];if(!r)return;modal.querySelector('small').textContent=r.kicker;modal.querySelector('h3').textContent=r.title;modal.querySelector('dl').innerHTML=rowHtml(r.rows);modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open')});
  modal.querySelector('.credential-close').addEventListener('click',close);modal.addEventListener('click',e=>{if(e.target===modal)close()});addEventListener('keydown',e=>{if(e.key==='Escape')close()});
})();