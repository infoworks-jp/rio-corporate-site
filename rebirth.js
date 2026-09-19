(() => {
  'use strict';
  const section=document.querySelector('#rebirth');
  if(!section)return;
  const canvas=section.querySelector('canvas'),ctx=canvas.getContext('2d');
  if(!ctx)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const buttons=[...section.querySelectorAll('[data-phase]')], pause=section.querySelector('[data-pause]');
  const count=matchMedia('(pointer:coarse)').matches?32000:60000;
  let w=0,h=0,scale=1,raf=0,visible=false,paused=reduced.matches,phase=0,current=0,last=0,manual=null,scatter=1;
  const pointer={x:-1000,y:-1000}, dots=[],targets=[[],[]];
  let seed=31;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  // Photo-derived stippling retains the actual facade, relief and roof shading.
  // Source: 663highland, Wikimedia Commons, CC BY 2.5 (see image credits).
  const photo=new Image(),logo=new Image();
  photo.decoding=logo.decoding='async';
  const ready=image=>new Promise((resolve,reject)=>{image.onload=()=>resolve(image);image.onerror=reject;});
  const loaded=Promise.all([ready(photo),ready(logo)]);
  photo.src='assets/site/hokkaido-663highland.jpg';logo.src='assets/site/rio-hero-logo.png';
  loaded.then(()=>{
    const sample=document.createElement('canvas');sample.width=1080;sample.height=720;
    const c=sample.getContext('2d',{willReadFrequently:true});
    c.drawImage(photo,0,0,1080,720);
    const outline=new Path2D();
    [[35,292],[84,272],[240,201],[264,236],[340,269],[440,272],[452,216],[468,183],[487,151],[486,140],[526,140],[546,181],[559,232],[588,221],[614,257],[678,291],[746,282],[793,270],[854,293],[941,346],[938,515],[812,548],[487,551],[43,548]].forEach(([x,y],i)=>i?outline.lineTo(x,y):outline.moveTo(x,y));outline.closePath();
    let pixels=c.getImageData(0,0,1080,720).data;
    for(let i=0;i<count;i++){
      let x,y,tone;
      for(let tries=0;tries<2000;tries++){
        x=24+random()*930;y=66+random()*500;
        if(!c.isPointInPath(outline,x,y))continue;
        const k=(Math.floor(y)*1080+Math.floor(x))*4,r=pixels[k],g=pixels[k+1],b=pixels[k+2];
        if(b>r*1.12&&b>g*1.02)continue;
        const lum=(.2126*r+.7152*g+.0722*b)/255;
        const foliage=y>290&&g>r*1.03;
        const edge=Math.min(1,(x-24)/65,(954-x)/65,(566-y)/90);
        tone=(.06+Math.pow(1-lum,2))*(foliage?.035:1)*Math.max(0,edge);
        if(random()<tone*.8)break;
      }
      targets[0].push([(x-489)*.67,(y-335)*.67]);
      dots.push({dx:0,dy:0,r:.5+random()*.45,seed:random()*Math.PI*2,red:false,shade:Math.min(1,.72+tone*.7)});
    }
    c.clearRect(0,0,1080,720);c.drawImage(logo,0,0,1080,720);
    pixels=c.getImageData(0,0,1080,720).data;
    for(let i=0;i<count;i++){
      let x,y,k;
      do{x=Math.floor(random()*1080);y=Math.floor(random()*720);k=(y*1080+x)*4;}while(pixels[k+3]<100||(pixels[k]+pixels[k+1]+pixels[k+2])/3>155);
      targets[1].push([(x-540)*.56,(y-360)*.56]);dots[i].red=pixels[k]>pixels[k+1]*1.4;
    }
    section.classList.add('is-ready');resize();wake();
  }).catch(()=>{section.classList.add('image-unavailable');});
  function resize(){const b=canvas.getBoundingClientRect();w=b.width;h=b.height;const d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);scale=Math.min(w/(w<700?540:650),h/650)*.83;paint(0);}
  function progress(){if(manual!==null)return manual;if(reduced.matches)return 0;const r=section.getBoundingClientRect();return Math.max(0,Math.min(1,-r.top/Math.max(1,section.offsetHeight-innerHeight)));}
  function paint(dt){
    if(!targets[1].length)return;
    phase=progress();current=paused?phase:current+(phase-current)*Math.min(1,dt*8);
    scatter=paused?0:Math.max(0,scatter-dt*.45);
    ctx.clearRect(0,0,w,h);
    const a=0,t=current,e=t*t*(3-2*t),burst=Math.pow(Math.sin(t*Math.PI),2)*155;
    const cx=w*(w>700?.64:.5),cy=h*.56;
    ctx.strokeStyle='rgba(90,77,58,.13)';ctx.lineWidth=1;
    ctx.beginPath();ctx.ellipse(cx,cy+150*scale,240*scale,38*scale,0,0,Math.PI*2);ctx.stroke();
    for(let i=0;i<count;i++){
      const d=dots[i],p=targets[a][i],q=targets[a+1][i];
      let x=p[0]+(q[0]-p[0])*e+Math.cos(d.seed+t*5)*(burst+scatter*300),y=p[1]+(q[1]-p[1])*e+Math.sin(d.seed+t*5)*(burst*.7+scatter*200);
      const sx=cx+x*scale,sy=cy+y*scale,dist=Math.hypot(sx-pointer.x,sy-pointer.y);
      if(!paused&&dist<85){const power=(1-dist/85)*65;d.dx+=(sx-pointer.x)/(dist||1)*power*dt*5;d.dy+=(sy-pointer.y)/(dist||1)*power*dt*5;}
      d.dx*=Math.exp(-dt*3);d.dy*=Math.exp(-dt*3);
      ctx.fillStyle=current>.65&&d.red?'#a92d1f':'#28241f';ctx.globalAlpha=d.shade+(1-d.shade)*e;
      const size=Math.max(.65,d.r*scale*1.3)*(current>.8?1.08:1);
      ctx.fillRect(sx+d.dx,sy+d.dy,size,size);
    }
    ctx.globalAlpha=1;
    buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===Math.round(phase))));
    section.dataset.phase=String(Math.round(phase));
  }
  function tick(time){raf=0;const dt=Math.max(0,Math.min(.04,(time-last)/1000||.016));last=time;paint(dt);if(visible&&!paused&&!document.hidden)raf=requestAnimationFrame(tick);}
  function wake(){if(visible&&!document.hidden&&!raf){last=performance.now();if(paused)paint(0);else raf=requestAnimationFrame(tick);}}
  const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)wake();else{cancelAnimationFrame(raf);raf=0;}},{threshold:0});observer.observe(section);
  addEventListener('resize',()=>{resize();wake();});
  addEventListener('scroll',()=>{if(manual!==null&&!reduced.matches)manual=null;if(paused&&visible)paint(0);},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else wake();});
  let soundTime=0;
  canvas.addEventListener('pointermove',e=>{const b=canvas.getBoundingClientRect();pointer.x=e.clientX-b.left;pointer.y=e.clientY-b.top;if(!paused&&performance.now()-soundTime>180){soundTime=performance.now();dispatchEvent(new CustomEvent('rio:ink',{detail:{kind:'brush',speed:.06,x:pointer.x/w}}));}wake();},{passive:true});
  canvas.addEventListener('pointerleave',()=>{pointer.x=pointer.y=-1000;});
  canvas.addEventListener('pointerdown',e=>{if(paused)return;const b=canvas.getBoundingClientRect();pointer.x=e.clientX-b.left;pointer.y=e.clientY-b.top;dispatchEvent(new CustomEvent('rio:ink',{detail:{kind:'drop',x:pointer.x/w,strength:.25}}));},{passive:true});
  canvas.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')pointer.x=pointer.y=-1000;});
  buttons.forEach(b=>b.addEventListener('click',()=>{manual=Number(b.dataset.phase);if(paused){current=manual;dots.forEach(d=>{d.dx=0;d.dy=0;});paint(0);}else wake();}));
  function label(){pause.textContent=paused?'動きを再生':'動きを止める';pause.setAttribute('aria-pressed',String(paused));}
  pause.addEventListener('click',()=>{paused=!paused;label();if(paused){cancelAnimationFrame(raf);raf=0;paint(0);}else wake();});
  reduced.addEventListener('change',()=>{paused=reduced.matches;label();if(paused){cancelAnimationFrame(raf);raf=0;paint(0);}else wake();});
  label();resize();
})();
