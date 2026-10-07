export function mountChat(config,provider) {
 const dialog=document.createElement('dialog');
 dialog.className='tsubasa-guide-dialog';dialog.id=`${config.id}-ai-dialog`;
 dialog.setAttribute('aria-labelledby',`${config.id}-ai-title`);
 dialog.innerHTML=`<div class="tsubasa-guide-head"><div><small>FAQ / 登録情報</small><h2 id="${config.id}-ai-title"></h2></div><button class="tsubasa-guide-close" type="button" aria-label="閉じる">×</button></div><div class="tsubasa-guide-body"><p class="tsubasa-guide-note"></p><div class="tsubasa-guide-topics"></div><div class="ai-chat-history" role="log" aria-live="polite" aria-label="会話"></div><form class="tsubasa-guide-form"><label class="ai-chat-label">質問<input maxlength="300" autocomplete="off" placeholder="例：初めて。おすすめは？"></label><button type="submit">送信</button></form><p class="tsubasa-guide-caption">営業変更・提供状況は店舗へご確認ください。個人情報は入力しないでください。</p></div>`;
 dialog.querySelector('h2').textContent=config.title;
 dialog.querySelector('.tsubasa-guide-note').textContent=config.note;
 if(config.footer)dialog.querySelector('.tsubasa-guide-caption').textContent=config.footer;
 const enable=document.createElement('button');enable.type='button';enable.className='ai-chat-enable';enable.textContent='端末内AIを使う（初回ダウンロード最大約240MB）';
 const status=document.createElement('p');status.className='ai-chat-status';status.setAttribute('role','status');status.textContent='通常の案内はすぐ使えます。AIは端末性能によって数分かかります。';
 const cancel=document.createElement('button');cancel.type='button';cancel.className='ai-chat-stop';cancel.textContent='AIを停止';cancel.hidden=true;
 dialog.querySelector('.tsubasa-guide-note').after(enable,status,cancel);
 let loading=false,loadVersion=0;
 cancel.addEventListener('click',()=>{loadVersion++;provider.stop();loading=false;enable.disabled=false;enable.textContent='端末内AIを使う（初回ダウンロード最大約240MB）';cancel.hidden=true;status.textContent='AIを停止しました。通常の案内は引き続き使えます。';});
 enable.addEventListener('click',async()=>{
  if(loading)return;const version=++loadVersion;loading=true;enable.disabled=true;cancel.hidden=false;
  status.textContent='モデルを読み込んでいます…（初回は通信が必要です）';
  try{const model=await provider.enable(config,(p,phase)=>{status.textContent=phase==='index'?`登録情報を準備しています… ${p}%`:`モデルを読み込んでいます… ${p}%`;});if(version!==loadVersion)return;status.textContent=`端末内AIが使えます（${model}）。質問はこの端末で処理します。`;enable.textContent='端末内AI：有効';}
  catch{if(version!==loadVersion)return;if(loading)status.textContent='AIを読み込めませんでした。通常の案内をご利用いただけます。';enable.disabled=false;}
  finally{if(version===loadVersion)loading=false;}
 });
 window.addEventListener('pagehide',()=>provider.stop());
 const history=dialog.querySelector('.ai-chat-history'),form=dialog.querySelector('form'),input=dialog.querySelector('input');
 let busy=false,controller;
 const message=(text,kind)=>{
  const row=document.createElement('div');row.className=`ai-chat-message ai-chat-${kind}`;
  const caption=document.createElement('small');caption.textContent=kind==='user'?'あなた':config.title;
  const p=document.createElement('p');p.textContent=text;row.append(caption,p);history.append(row);
  while(history.children.length>20) history.firstChild.remove();
  row.scrollIntoView({block:'nearest'});return row;
 };
 async function ask(question) {
  if(busy || !question.trim())return;
  busy=true;controller=new AbortController();
  const controls=[...dialog.querySelectorAll('.tsubasa-guide-topics button,form button')];controls.forEach(el=>el.disabled=true);
  message(question,'user');input.value='';
  const row=message('登録情報を確認しています…','assistant');
  const timeout=setTimeout(()=>controller.abort(),60000);
  try {
   const result=await provider.answer({question,config,signal:controller.signal});
   row.querySelector('p').textContent=result.text;
   const nav=document.createElement('div');nav.className='ai-chat-actions';
   for(const key of result.cta??[]) {
    const link=config.links[key];if(!link)continue;
    const a=document.createElement('a');a.textContent=link.label;a.href=link.href;
    if(link.href.startsWith('https://')){a.target='_blank';a.rel='noopener noreferrer';}
    if(link.href.endsWith('#contact-form'))a.addEventListener('click',event=>{
     const contact=document.querySelector('.contact-link');
     if(contact){event.preventDefault();dialog.close();contact.click();}
    });
    nav.append(a);
   }
   row.append(nav);
  }catch{row.querySelector('p').textContent='回答できませんでした。時間を置いてもう一度お試しください。';}
  finally{clearTimeout(timeout);busy=false;controls.forEach(el=>el.disabled=false);}
 }
 config.topics.forEach(topic=>{
  const b=document.createElement('button');b.type='button';b.textContent=topic.label;
  b.addEventListener('click',()=>ask(topic.label));dialog.querySelector('.tsubasa-guide-topics').append(b);
 });
 form.addEventListener('submit',e=>{e.preventDefault();ask(input.value.trim());});
 dialog.querySelector('.tsubasa-guide-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>controller?.abort());
 const launch=document.createElement('button');launch.className='tsubasa-guide-launch';launch.type='button';launch.textContent=config.launch;
 launch.setAttribute('aria-haspopup','dialog');launch.setAttribute('aria-controls',dialog.id);
 launch.addEventListener('click',()=>{if(!dialog.open)dialog.showModal();});
 document.body.append(dialog,launch);
 return {dialog,launch};
}
