(() => {
  'use strict';
  const source = document.currentScript;
  const id = source?.dataset.gaId;
  const hosts = (source?.dataset.gaHosts || '').split(',');
  if (!/^G-[A-Z0-9]+$/.test(id || '') || !hosts.includes(location.hostname) || window.top !== window || window.__siteAnalytics) return;
  window.__siteAnalytics = true;
  const key = 'site-analytics-consent-v1';
  const disabled = 'ga-disable-' + id;
  const cleanURL = value => { try { const u = new URL(value); return u.origin + u.pathname; } catch { return ''; } };
  const read = () => { try { return localStorage.getItem(key); } catch { return null; } };
  const save = value => { try { localStorage.setItem(key, value); } catch { /* Choice applies to this visit if storage is unavailable. */ } };
  let loaded = false;
  function enable() {
    window[disabled] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('consent', loaded ? 'update' : 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('set', 'allow_google_signals', false);
    window.gtag('set', 'allow_ad_personalization_signals', false);
    if (loaded) return;
    loaded = true;
    window.gtag('js', new Date());
    window.gtag('config', id, { page_location: cleanURL(location.href), page_referrer: cleanURL(document.referrer), allow_google_signals: false, allow_ad_personalization_signals: false });
    const tag = document.createElement('script'); tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.append(tag);
  }
  function decline() {
    window[disabled] = true;
    if (loaded) window.gtag('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    // Remove first-party GA cookies at each domain/path used by this site.
    const names = document.cookie.split(';').map(v=>v.trim().split('=')[0]).filter(n=>/^_ga(?:_|$)|^_gid$|^_gat/.test(n));
    const labels=location.hostname.split('.');const domains=['',...labels.map((_,i)=>labels.slice(i).join('.')).flatMap(d=>[d,'.'+d])];
    const parts=location.pathname.split('/');const paths=['/',...parts.map((_,i)=>parts.slice(0,i+1).join('/')||'/')];
    for(const name of names)for(const domain of domains)for(const path of paths)document.cookie=name+'=;Max-Age=0;path='+path+(domain?';domain='+domain:'')+';SameSite=Lax';
  }
  const english = document.documentElement.lang.startsWith('en');
  const style = document.createElement('style');style.textContent = '#site-analytics-notice{position:fixed;z-index:2147483000;left:12px;right:12px;bottom:max(12px,env(safe-area-inset-bottom));box-sizing:border-box;max-width:680px;padding:16px 18px;background:#f8f5ef;color:#211e1b;border:1px solid #8c8478;border-radius:8px;box-shadow:0 5px 25px #0003;font:14px/1.6 system-ui,sans-serif;text-align:left}#site-analytics-notice p{margin:0 0 10px;color:inherit;font:inherit}#site-analytics-notice button,#site-analytics-settings{font:inherit;cursor:pointer;min-height:44px}#site-analytics-notice button{padding:8px 15px;border:1px solid #574d43;border-radius:4px;background:#fff;color:#211e1b;margin:0 8px 0 0}#site-analytics-notice button[data-accept]{background:#28231f;color:#fff}#site-analytics-settings{display:block;position:relative;z-index:10;width:max-content;max-width:100%;margin:12px auto;padding:8px 12px;background:transparent;border:1px solid currentColor;border-radius:4px;color:inherit;font-size:12px}';document.head.append(style);
  const settings = document.createElement('button');settings.id='site-analytics-settings';settings.type='button';settings.textContent=english?'Analytics preferences':'アクセス解析の設定';
  function show() {
    if(document.getElementById('site-analytics-notice'))return;
    const panel=document.createElement('section');panel.id='site-analytics-notice';panel.setAttribute('aria-label',english?'Analytics preferences':'アクセス解析の設定');
    const p=document.createElement('p');p.textContent=english?'With your permission, we use Google Analytics cookies to understand visits and page views. Form entries are not collected. You can change your choice using “Analytics preferences”.':'閲覧状況の把握のため、許可いただいた場合にGoogle AnalyticsとCookieを使用します。フォームの入力内容は収集しません。選択は「アクセス解析の設定」から変更できます。';panel.append(p);
    for(const [value,label] of [['accepted',english?'Allow':'許可する'],['declined',english?'Do not allow':'許可しない']]){
      const b=document.createElement('button');b.type='button';b.textContent=label;if(value==='accepted')b.dataset.accept='';b.onclick=()=>{save(value);value==='accepted'?enable():decline();panel.remove();settings.focus({preventScroll:true});};panel.append(b);
    }
    const a=document.createElement('a');a.href='https://policies.google.com/technologies/partner-sites?hl='+ (english?'en':'ja');a.target='_blank';a.rel='noopener noreferrer';a.textContent=english?'Google data use':'Googleのデータ利用';a.style.cssText='display:inline-block;min-height:44px;padding:8px 0;color:inherit;text-decoration:underline';panel.append(a);document.body.append(panel);
  }
  settings.onclick=show;document.body.append(settings);
  window.addEventListener('storage',e=>{if(e.key===key){if(e.newValue==='accepted')enable();else decline();document.getElementById('site-analytics-notice')?.remove();}});
  const choice=read();
  if(choice==='accepted')enable();else{decline();if(choice!=='declined')show();}
})();
