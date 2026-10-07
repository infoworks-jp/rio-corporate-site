(() => {
 const base=document.currentScript.src;
 import(new URL('./ai/rio-entry.js?v=20261007-airwork2',base).href).catch(()=>{const a=document.createElement('a');a.href='/recruit/';a.textContent='求人ページ';a.className='rio-guide-launch';document.body.append(a);});
})();
