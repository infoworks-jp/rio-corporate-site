(() => {
  const SAPPORO='https://jp.indeed.com/cmp/%E6%A0%AA%E5%BC%8F%E4%BC%9A%E7%A4%BE-%E5%90%8F%E5%A4%AE-2/jobs?jk=91ce7644bf2afaab&start=0&clearPrefilter=1';
  const YOKOHAMA='https://jp.indeed.com/cmp/%E6%A0%AA%E5%BC%8F%E4%BC%9A%E7%A4%BE-%E5%90%8F%E5%A4%AE/jobs?jk=6342d3c5e932ba44&start=0&clearPrefilter=1';
  const TO='info@rio-works.com';
  const css=document.createElement('style');
  css.textContent=`
  .recruit-links{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:24px}.recruit-links a{display:flex;justify-content:space-between;align-items:center;padding:17px 18px;border:1px solid rgba(255,255,255,.3);color:inherit;text-decoration:none;font-size:12px;letter-spacing:.08em}.recruit-links a:hover{border-color:#d05b49;color:#d05b49}
  .contact-form-modal{position:fixed;inset:0;z-index:1200;display:none;align-items:center;justify-content:center;background:rgba(5,5,6,.96);backdrop-filter:blur(8px);padding:24px}.contact-form-modal.is-open{display:flex}.contact-form-card{width:min(94vw,720px);max-height:92dvh;overflow:auto;background:#eee8dc;color:#17181c;padding:clamp(28px,5vw,54px);position:relative}.contact-form-card h3{font:500 clamp(26px,4vw,42px)/1.3 "Yu Mincho","Hiragino Mincho ProN",serif;margin:0 0 8px}.contact-form-card>p{font-size:11px;line-height:1.8;margin:0 0 28px}.contact-form-close{position:absolute;right:20px;top:16px;border:0;background:none;font-size:30px;cursor:pointer}.rio-contact-form{display:grid;gap:16px}.rio-contact-form label{font-size:10px;letter-spacing:.12em}.rio-contact-form input,.rio-contact-form textarea,.rio-contact-form select{box-sizing:border-box;width:100%;margin-top:7px;padding:13px 12px;border:1px solid rgba(23,24,28,.28);background:rgba(255,255,255,.45);font:inherit;font-size:14px}.rio-contact-form textarea{min-height:150px;resize:vertical}.rio-contact-form button{margin-top:8px;padding:15px;border:1px solid #17181c;background:#17181c;color:#f4eee2;cursor:pointer;letter-spacing:.14em}.contact-note{font-size:10px;line-height:1.7;color:rgba(23,24,28,.65)}
  @media(max-width:600px){.recruit-links{grid-template-columns:1fr}.contact-form-modal{padding:0}.contact-form-card{width:100vw;max-height:100dvh;min-height:100dvh;box-sizing:border-box}}
  `;document.head.appendChild(css);

  const apply=()=>{
    const card=document.querySelector('#recruit .recruit-card');
    if(card&&!card.querySelector('.recruit-links')){
      const old=card.querySelector('.arrow-link'); if(old)old.remove();
      const box=document.createElement('div');box.className='recruit-links';
      box.innerHTML=`<a href="${SAPPORO}" target="_blank" rel="noopener">札幌｜求人を見る <span>↗</span></a><a href="${YOKOHAMA}" target="_blank" rel="noopener">横浜｜求人を見る <span>↗</span></a>`;
      card.appendChild(box);
    }
    const link=document.querySelector('#contact .contact-link');
    if(link){link.href='#contact-form';link.removeAttribute('target');link.addEventListener('click',e=>{e.preventDefault();openForm()});}
  };

  const modal=document.createElement('div');modal.className='contact-form-modal';modal.id='contact-form';modal.setAttribute('aria-hidden','true');
  modal.innerHTML=`<div class="contact-form-card" role="dialog" aria-modal="true" aria-labelledby="contact-form-title"><button class="contact-form-close" aria-label="閉じる">×</button><h3 id="contact-form-title">お問い合わせ</h3><p>株式会社吏央へのお問い合わせはこちらから。</p><form class="rio-contact-form"><label>お問い合わせ種別<select name="type"><option>工事・お見積りについて</option><option>採用について</option><option>その他</option></select></label><label>お名前<input name="name" required autocomplete="name"></label><label>会社名<input name="company" autocomplete="organization"></label><label>メールアドレス<input name="email" type="email" required autocomplete="email"></label><label>電話番号<input name="tel" type="tel" autocomplete="tel"></label><label>お問い合わせ内容<textarea name="message" required></textarea></label><button type="submit">メールを作成して送信へ →</button><div class="contact-note">送信先：${TO}　入力後、お使いのメールアプリが開きます。内容をご確認のうえ送信してください。</div></form></div>`;
  document.body.appendChild(modal);
  const openForm=()=>{modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open')};
  const closeForm=()=>{modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open')};
  modal.querySelector('.contact-form-close').addEventListener('click',closeForm);modal.addEventListener('click',e=>{if(e.target===modal)closeForm()});
  modal.querySelector('form').addEventListener('submit',e=>{e.preventDefault();const d=new FormData(e.currentTarget);const subject=`【株式会社吏央HP】${d.get('type')}｜${d.get('name')}`;const body=`お問い合わせ種別：${d.get('type')}\nお名前：${d.get('name')}\n会社名：${d.get('company')}\nメール：${d.get('email')}\n電話：${d.get('tel')}\n\nお問い合わせ内容：\n${d.get('message')}`;location.href=`mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;});
  addEventListener('keydown',e=>{if(e.key==='Escape')closeForm()});
  if(document.readyState==='loading')addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();