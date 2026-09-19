(() => {
  const SAPPORO='/recruit/';
  const YOKOHAMA='/recruit/yokohama/';
  const ENDPOINT='https://xxhgerxugsjoxkbuuqhb.supabase.co/functions/v1/rio-contact';
  const css=document.createElement('style');
  css.textContent=`
  .recruit-links{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:24px}.recruit-links a{display:flex;justify-content:space-between;align-items:center;padding:17px 18px;border:1px solid rgba(255,255,255,.3);color:inherit;text-decoration:none;font-size:12px;letter-spacing:.08em}.recruit-links a:hover{border-color:#d05b49;color:#d05b49}
  .contact-form-modal{position:fixed;inset:0;z-index:1200;display:none;align-items:center;justify-content:center;background:rgba(5,5,6,.96);backdrop-filter:blur(8px);padding:24px}.contact-form-modal.is-open{display:flex}.contact-form-card{width:min(94vw,720px);max-height:92dvh;overflow:auto;background:#eee8dc;color:#17181c;padding:clamp(28px,5vw,54px);position:relative}.contact-form-card h3{font:500 clamp(26px,4vw,42px)/1.3 "Yu Mincho","Hiragino Mincho ProN",serif;margin:0 0 8px}.contact-form-card>p{font-size:11px;line-height:1.8;margin:0 0 28px}.contact-form-close{position:absolute;right:20px;top:16px;border:0;background:none;font-size:30px;cursor:pointer}.rio-contact-form{display:grid;gap:16px}.rio-contact-form label{font-size:10px;letter-spacing:.12em}.rio-contact-form input,.rio-contact-form textarea,.rio-contact-form select{box-sizing:border-box;width:100%;margin-top:7px;padding:13px 12px;border:1px solid rgba(23,24,28,.28);background:rgba(255,255,255,.45);font:inherit;font-size:14px}.rio-contact-form textarea{min-height:150px;resize:vertical}.rio-contact-form button{margin-top:8px;padding:15px;border:1px solid #17181c;background:#17181c;color:#f4eee2;cursor:pointer;letter-spacing:.14em}.rio-contact-form button[disabled]{opacity:.55;cursor:wait}.contact-note{font-size:10px;line-height:1.7;color:rgba(23,24,28,.65)}.contact-result{display:none;margin-top:8px;padding:12px 14px;border:1px solid rgba(23,24,28,.2);font-size:12px;line-height:1.8}.contact-result.show{display:block}.contact-hp{position:absolute!important;left:-9999px!important;width:1px!important;height:1px!important;overflow:hidden!important}
  .partner-fields{border:0;padding:0;margin:0;display:grid;gap:16px;min-width:0}.partner-fields[hidden]{display:none}.partner-fields legend{font-size:11px;margin-bottom:12px;color:#8e3025}
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
    document.querySelectorAll('[data-partner-office]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();openForm(link.dataset.partnerOffice)}));
    const link=document.querySelector('#contact .contact-link');
    if(link){link.href='#contact-form';link.removeAttribute('target');link.addEventListener('click',e=>{e.preventDefault();openForm()});}
  };

  const modal=document.createElement('div');modal.className='contact-form-modal';modal.id='contact-form';modal.setAttribute('aria-hidden','true');
  modal.innerHTML=`<div class="contact-form-card" role="dialog" aria-modal="true" aria-labelledby="contact-form-title"><button class="contact-form-close" aria-label="閉じる">×</button><h3 id="contact-form-title">お問い合わせ</h3><p data-form-intro>株式会社吏央へのお問い合わせはこちらから。<br>「必須」の項目をご記入ください。</p><form class="rio-contact-form"><label>お問い合わせ種別<select name="type"><option>工事・お見積りについて</option><option>協力会社について</option><option>採用について</option><option>その他</option></select></label><label>お名前（必須）<input name="name" required autocomplete="name" maxlength="100"></label><label>会社名<span data-company-required hidden>（必須）</span><input name="company" autocomplete="organization" maxlength="140"></label><label>メールアドレス（必須）<input name="email" type="email" required autocomplete="email" maxlength="254"></label><label>電話番号<input name="tel" type="tel" autocomplete="tel" maxlength="50"></label><fieldset class="partner-fields" hidden disabled><legend>協力会社のご相談</legend><label>希望拠点（必須）<select name="partnerOffice" required><option value="">お選びください</option><option>札幌本社</option><option>横浜支店</option><option>両拠点について相談</option></select></label><label>得意な工事（必須）<input name="specialty" required maxlength="200" placeholder="例：内装解体、土工事、足場工事"></label></fieldset><label>お問い合わせ内容（必須）<textarea name="message" required maxlength="5000"></textarea></label><label class="contact-hp" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label><button type="submit">送信する →</button><div class="contact-note">送信先：info@rio-works.com　この画面のまま送信できます。</div><div class="contact-result" role="status" aria-live="polite"></div></form></div>`;
  document.body.appendChild(modal);
  const form=modal.querySelector('form'), submit=form.querySelector('button[type="submit"]'), result=form.querySelector('.contact-result');
  let submitting=false;
  const syncType=()=>{
    const partner=form.elements.type.value==='協力会社について';
    const fields=form.querySelector('.partner-fields');fields.hidden=!partner;fields.disabled=!partner;
    form.elements.company.required=partner;
    form.querySelector('[data-company-required]').hidden=!partner;
    form.elements.message.maxLength=partner?4400:5000;
    modal.querySelector('#contact-form-title').textContent=partner?'協力会社のご相談':'お問い合わせ';
    modal.querySelector('[data-form-intro]').textContent=partner?'得意な工事や対応地域などをお聞かせください。「必須」の項目をご記入ください。':'株式会社吏央へのお問い合わせはこちらから。「必須」の項目をご記入ください。';
  };
  form.elements.type.addEventListener('change',syncType);
  const openForm=office=>{
    if(office){form.elements.type.value='協力会社について';form.elements.partnerOffice.value=office;}
    syncType();result.className='contact-result';result.textContent='';
    modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');
  };
  const closeForm=()=>{if(submitting||!modal.classList.contains('is-open'))return;modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open')};
  modal.querySelector('.contact-form-close').addEventListener('click',closeForm);modal.addEventListener('click',e=>{if(e.target===modal)closeForm()});
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    if(submitting)return;
    submitting=true;result.className='contact-result';result.textContent='';submit.disabled=true;submit.textContent='送信中…';
    const d=new FormData(form);const payload=Object.fromEntries(d.entries());
    const phone=payload.partnerOffice==='横浜支店'?'横浜支店 045-930-3366':'札幌本社 011-374-8012';
    if(payload.type==='協力会社について'){
      payload.message=`希望拠点：${payload.partnerOffice}\n得意な工事：${payload.specialty}\n\nご相談内容：\n${payload.message}`;
    }
    delete payload.partnerOffice;delete payload.specialty;
    payload.clientToken=(crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`);
    try{
      const r=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const data=await r.json().catch(()=>({}));
      if(r.ok&&data.ok){form.reset();syncType();result.textContent='送信しました。お問い合わせありがとうございます。担当者よりご連絡いたします。';result.className='contact-result show';}
      else if(data.saved){result.textContent='内容は受け付けましたが、メール送信処理で一時的なエラーが発生しました。担当者が確認できるよう保存されています。';result.className='contact-result show';}
      else if(r.status===429){result.textContent='短時間に送信回数が多くなっています。しばらくしてからもう一度お試しください。';result.className='contact-result show';}
      else throw new Error(data.error||'send_failed');
    }catch(err){result.textContent=`送信できませんでした。時間をおいて再度お試しいただくか、${phone} までご連絡ください。`;result.className='contact-result show';}
    finally{submitting=false;submit.disabled=false;submit.textContent='送信する →';}
  });
  addEventListener('keydown',e=>{if(e.key==='Escape')closeForm()});
  if(document.readyState==='loading')addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();

// Brave-safe mouse ink layer: independent of WebGL/pointer-drag handling.
(() => {
  if(matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches)return;
  const c=document.createElement('canvas');
  c.id='rio-mouse-ink';
  Object.assign(c.style,{position:'fixed',inset:'0',width:'100vw',height:'100dvh',zIndex:'0',pointerEvents:'none'});
  document.body.appendChild(c);
  const ctx=c.getContext('2d',{alpha:true});
  let dpr=1,w=0,h=0,last=null,raf=0;
  const drops=[];
  const fit=()=>{dpr=Math.min(devicePixelRatio||1,2);w=c.width=Math.max(1,innerWidth*dpr);h=c.height=Math.max(1,innerHeight*dpr)};
  const add=(x,y,dx,dy)=>{
    const speed=Math.min(1,Math.hypot(dx,dy)/18);
    const n=2+Math.round(speed*3);
    for(let i=0;i<n;i++)drops.push({x:(x+(Math.random()-.5)*18)*dpr,y:(y+(Math.random()-.5)*18)*dpr,r:(24+speed*54+Math.random()*22)*dpr,a:.16+speed*.18,life:1,red:Math.random()>.94});
    if(drops.length>90)drops.splice(0,drops.length-90);
    if(!raf)raf=requestAnimationFrame(draw);
  };
  const draw=()=>{
    raf=0;
    ctx.clearRect(0,0,w,h);
    for(let i=drops.length-1;i>=0;i--){const p=drops[i];p.life-=.018;p.r*=1.006;if(p.life<=0){drops.splice(i,1);continue}const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);const alpha=p.a*p.life;g.addColorStop(0,p.red?`rgba(169,45,31,${alpha})`:`rgba(10,12,18,${alpha})`);g.addColorStop(.38,p.red?`rgba(169,45,31,${alpha*.45})`:`rgba(17,20,27,${alpha*.42})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(p.x-p.r,p.y-p.r,p.r*2,p.r*2)}
    if(drops.length)raf=requestAnimationFrame(draw);
  };
  addEventListener('mousemove',e=>{if(document.hidden)return;if(last)add(e.clientX,e.clientY,e.clientX-last.x,e.clientY-last.y);last={x:e.clientX,y:e.clientY}},{passive:true});
  addEventListener('mouseleave',()=>{last=null},{passive:true});
  addEventListener('resize',fit,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;drops.length=0;last=null;ctx.clearRect(0,0,w,h)}});
  fit();
})();