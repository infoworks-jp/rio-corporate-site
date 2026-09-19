(() => {
  'use strict';
  const section=document.querySelector('#rebirth');
  if(!section)return;
  const canvas=section.querySelector('canvas'),ctx=canvas.getContext('2d');
  if(!ctx)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const buttons=[...section.querySelectorAll('[data-phase]')], pause=section.querySelector('[data-pause]'), drawButton=section.querySelector('[data-draw]'), inkHint=section.querySelector('.ink-hint'), stageLabel=section.querySelector('.rebirth-scene');
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
  function progress(){if(manual!==null)return manual;if(reduced.matches)return 0;const r=section.getBoundingClientRect();return Math.max(0,Math.min(3,-r.top/Math.max(1,section.offsetHeight-innerHeight)*3));}
  const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
  const strokes=[],brushPath=[];
  let drawing=false,penDown=false,penId=null,lastPen=null,inkTime=0,textPoints=[],collecting=false;
  const hintDefault='押して描く。手を離すと、言葉へつながる。';
  function setDraw(on){
    drawing=on;canvas.classList.toggle('is-drawing',on);drawButton.setAttribute('aria-pressed',String(on));
    drawButton.textContent=on?'描画を終える':'墨を描く';
    inkHint.textContent=on?'指やマウスで、一筆どうぞ。':hintDefault;
    if(!on){penDown=false;penId=null;lastPen=null;}
  }
  function lettering(){
    const heading=section.querySelector('h2'),b=heading.getBoundingClientRect(),r=canvas.getBoundingClientRect();
    const sample=document.createElement('canvas');sample.width=Math.ceil(b.width);sample.height=Math.ceil(b.height);
    const c=sample.getContext('2d'),css=getComputedStyle(heading);
    c.font=`${css.fontWeight} ${css.fontSize} ${css.fontFamily}`;c.textBaseline='middle';
    c.fillText(heading.textContent,0,b.height/2);
    const data=c.getImageData(0,0,sample.width,sample.height).data;textPoints=[];
    for(let y=0;y<sample.height;y+=2)for(let x=0;x<sample.width;x+=2)if(data[(y*sample.width+x)*4+3]>100)textPoints.push([x+b.left-r.left,y+b.top-r.top]);
  }
  function collect(){
    setDraw(false);if(!strokes.length)return;
    lettering();inkTime=0;collecting=true;inkHint.textContent='あなたの一筆が、真心へ。';
    if(paused||reduced.matches){strokes.length=0;brushPath.length=0;collecting=false;paint(0);}else wake();
  }
  function mark(x,y,speed){
    const width=Math.max(3,Math.min(21,18-speed*.18));
    brushPath.push({x,y,width});if(brushPath.length>1200)brushPath.shift();
    for(let n=0;n<7;n++){const angle=random()*Math.PI*2,radius=Math.sqrt(random())*width*.5;strokes.push({x:x+Math.cos(angle)*radius,y:y+Math.sin(angle)*radius,r:.4+random()*1.6,alpha:.3+random()*.5,seed:random()*7});}
    if(strokes.length>4200)strokes.splice(0,strokes.length-4200);
  }
  function penPoint(e){
    const b=canvas.getBoundingClientRect(),x=e.clientX-b.left,y=e.clientY-b.top;
    const previous=lastPen||{x,y},distance=Math.hypot(x-previous.x,y-previous.y),steps=Math.max(1,Math.ceil(distance/2));
    for(let i=1;i<=steps;i++)mark(previous.x+(x-previous.x)*i/steps,previous.y+(y-previous.y)*i/steps,distance);
    lastPen={x,y};
  }
  function paintInk(dt){
    if(collecting)inkTime+=dt;
    if(!collecting&&brushPath.length>1){
      ctx.strokeStyle='rgba(33,30,26,.5)';ctx.lineCap='round';ctx.lineJoin='round';
      for(let i=1;i<brushPath.length;i++){const a=brushPath[i-1],b=brushPath[i];ctx.lineWidth=(a.width+b.width)*.36;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    }
    const t=collecting?smooth((inkTime-.4)/1.8):0;
    for(let i=0;i<strokes.length;i++){
      const p=strokes[i],target=textPoints[i%textPoints.length]||[w*.3,150];
      const x=p.x+(target[0]-p.x)*t+Math.sin(t*Math.PI)*Math.sin(p.seed)*80;
      const y=p.y+(target[1]-p.y)*t-Math.sin(t*Math.PI)*55;
      ctx.globalAlpha=p.alpha*(inkTime>2.2?Math.max(0,1-(inkTime-2.2)*2):1);
      ctx.fillStyle='#211e1a';ctx.beginPath();ctx.arc(x,y,p.r*(1-t*.5),0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
    if(collecting&&inkTime>2.8){strokes.length=0;brushPath.length=0;collecting=false;inkHint.textContent=hintDefault;}
  }
  function corridor(amount,alpha){
    if(alpha<.005)return;
    ctx.save();ctx.globalAlpha=alpha;
    const vx=w*(w>700?.62:.5),vy=h*.51,f=Math.min(w*.95,h*.82),travel=amount*710;
    const project=(x,y,z)=>[vx+x*f/z,vy+y*f/z];
    const segment=(x1,y1,z1,x2,y2,z2,opacity=.4)=>{
      const a=project(x1,y1,z1),b=project(x2,y2,z2);ctx.strokeStyle=`rgba(48,40,30,${opacity})`;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();
    };
    // Perspective bays are a creative interior, not a reconstruction of the monument.
    const floor=ctx.createLinearGradient(0,vy,0,h*.9);floor.addColorStop(0,'rgba(126,101,69,0)');floor.addColorStop(1,'rgba(126,101,69,.09)');
    ctx.fillStyle=floor;ctx.beginPath();ctx.moveTo(vx,vy);ctx.lineTo(w,h*.85);ctx.lineTo(0,h*.85);ctx.closePath();ctx.fill();
    for(let bay=9;bay>=0;bay--){
      const z=260+bay*260-(travel%260),near=Math.max(75,z),far=near+24;
      ctx.lineWidth=Math.max(.5,2.2*(1-near/3100));
      for(const side of [-1,1]){
        const x=side*245;
        const corners=[[x-10,-205,near],[x+10,-205,near],[x+10,210,near],[x-10,210,near]].map(p=>project(...p));
        ctx.fillStyle=`rgba(45,37,27,${.08+(1-near/3000)*.17})`;ctx.beginPath();corners.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(37,31,24,.38)';ctx.stroke();
        const depthFace=[[x+10,-205,near],[x+10,-205,far+30],[x+10,210,far+30],[x+10,210,near]].map(p=>project(...p));
        ctx.fillStyle='rgba(36,30,22,.18)';ctx.beginPath();depthFace.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fill();
        for(let grain=0;grain<3;grain++)segment(x-6+grain*6,-195,near,x-6+grain*6,205,near,.09);
        segment(x,-205,near,x,-205,far);segment(x,210,near,x,210,far);
        segment(x-side*75,-205,near,x,-130,near,.5);
        segment(x,-200,near,x,-200,near+260,.25);segment(x,210,near,x,210,near+260,.2);
      }
      segment(-255,-205,near,255,-205,near,.55);segment(-255,-187,near,255,-187,near,.35);
      segment(-245,210,near,245,210,near,.17);
      for(let x=-180;x<=180;x+=90)segment(x,-195,near,x,-195,near+260,.2);
    }
    const glow=ctx.createRadialGradient(vx,vy,0,vx,vy,Math.min(w,h)*.17);glow.addColorStop(0,'rgba(248,242,229,.92)');glow.addColorStop(1,'rgba(248,242,229,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
    // Keep the title and navigation calm while the perspective fills the frame.
    ctx.globalCompositeOperation='destination-out';ctx.globalAlpha=1;
    const mask=ctx.createLinearGradient(0,0,0,h);mask.addColorStop(0,'#000');mask.addColorStop(.2,'#000');mask.addColorStop(.38,'transparent');mask.addColorStop(.75,'transparent');mask.addColorStop(1,'#000');
    ctx.fillStyle=mask;ctx.fillRect(0,0,w,h);
    ctx.restore();
  }
  function paint(dt){
    if(!targets[1].length)return;
    phase=progress();current=paused?phase:current+(phase-current)*Math.min(1,dt*7);
    scatter=paused?0:Math.max(0,scatter-dt*.45);ctx.clearRect(0,0,w,h);
    const c=Math.max(0,Math.min(3,current)),entrance=smooth(c/.9),logoProgress=smooth(c-2);
    const exteriorAlpha=1-smooth((c-.58)/.38),logoAlpha=smooth(c-2);
    const cx=w*(w>700?.64:.5),cy=h*.56;
    corridor(Math.max(0,c-.65),smooth((c-.52)/.4)*(1-smooth((c-1.4)/.6)));
    // Push the camera toward the entrance before revealing the spatial bays.
    if(exteriorAlpha>.005||logoAlpha>.005){
      const isLogo=c>2,alpha=isLogo?logoAlpha:exteriorAlpha,zoom=1+entrance*5.5;
      for(let i=0;i<count;i++){
        const d=dots[i],p=targets[isLogo?1:0][i];
        const burst=isLogo?(1-logoProgress)*190:scatter*300;
        let x=isLogo?p[0]+Math.cos(d.seed+logoProgress*5)*burst:(p[0]-entrance*63)*zoom;
        let y=isLogo?p[1]+Math.sin(d.seed+logoProgress*5)*burst*.7:(p[1]-entrance*88)*zoom;
        if(!isLogo){x+=Math.cos(d.seed)*scatter*300;y+=Math.sin(d.seed)*scatter*200;}
        const sx=cx+x*scale,sy=cy+y*scale;
        if(sx<-100||sx>w+100||sy<-100||sy>h+100)continue;
        const dist=Math.hypot(sx-pointer.x,sy-pointer.y);
        if(!paused&&!drawing&&dist<85){const power=(1-dist/85)*65;d.dx+=(sx-pointer.x)/(dist||1)*power*dt*5;d.dy+=(sy-pointer.y)/(dist||1)*power*dt*5;}
        d.dx*=Math.exp(-dt*3);d.dy*=Math.exp(-dt*3);
        ctx.fillStyle=isLogo&&d.red?'#a92d1f':'#28241f';ctx.globalAlpha=alpha*(isLogo?1:d.shade);
        const size=Math.max(.65,d.r*scale*1.3)*(isLogo?1.08:Math.min(2,zoom));ctx.fillRect(sx+d.dx,sy+d.dy,size,size);
      }
    }
    ctx.globalAlpha=1;
    const inkPhase=c>1.75&&c<2.25;
    section.classList.toggle('is-ink-phase',inkPhase);
    if(!inkPhase&&drawing)collect();
    paintInk(dt);
    buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===Math.round(phase))));
    section.dataset.phase=String(Math.round(phase));
    stageLabel.textContent=['赤れんが、その奥へ。','現場を支える、柱と梁。','あなたの一筆を、真心へ。','人と人を、つなぐ。'][Math.round(phase)];
  }
  function tick(time){raf=0;const dt=Math.max(0,Math.min(.04,(time-last)/1000||.016));last=time;paint(dt);if(visible&&!paused&&!document.hidden)raf=requestAnimationFrame(tick);}
  function wake(){if(visible&&!document.hidden&&!raf){last=performance.now();if(paused)paint(0);else raf=requestAnimationFrame(tick);}}
  const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)wake();else{cancelAnimationFrame(raf);raf=0;}},{threshold:0});observer.observe(section);
  addEventListener('resize',()=>{resize();wake();});
  addEventListener('scroll',()=>{if(manual!==null&&!reduced.matches)manual=null;if(paused&&visible)paint(0);},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else wake();});
  let soundTime=0;
  canvas.addEventListener('pointermove',e=>{if(drawing&&penDown&&e.pointerId===penId){penPoint(e);if(paused)paint(0);}const b=canvas.getBoundingClientRect();pointer.x=e.clientX-b.left;pointer.y=e.clientY-b.top;if(!paused&&performance.now()-soundTime>180){soundTime=performance.now();dispatchEvent(new CustomEvent('rio:ink',{detail:{kind:'brush',speed:.06,x:pointer.x/w}}));}wake();},{passive:true});
  canvas.addEventListener('pointerleave',()=>{pointer.x=pointer.y=-1000;});
  canvas.addEventListener('pointerdown',e=>{if(drawing){strokes.length=0;brushPath.length=0;collecting=false;inkTime=0;penDown=true;penId=e.pointerId;lastPen=null;canvas.setPointerCapture(e.pointerId);penPoint(e);if(paused)paint(0);}if(paused)return;const b=canvas.getBoundingClientRect();pointer.x=e.clientX-b.left;pointer.y=e.clientY-b.top;dispatchEvent(new CustomEvent('rio:ink',{detail:{kind:'drop',x:pointer.x/w,strength:.25}}));},{passive:true});
  canvas.addEventListener('pointerup',e=>{if(drawing&&e.pointerId===penId){if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);collect();}if(e.pointerType!=='mouse')pointer.x=pointer.y=-1000;});
  canvas.addEventListener('pointercancel',()=>{if(drawing)collect();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drawing)collect();});
  drawButton.addEventListener('click',()=>{if(drawing){collect();return;}manual=2;current=2;strokes.length=0;brushPath.length=0;collecting=false;inkTime=0;setDraw(true);paint(0);wake();});
  section.querySelector('[data-ink-demo]').addEventListener('click',()=>{manual=2;current=2;strokes.length=0;brushPath.length=0;for(let i=0;i<180;i++){const t=i/179;mark(w*(.2+t*.6),h*(.54+Math.sin(t*Math.PI*2)*.085),8+t*15);}collect();wake();});
  buttons.forEach(b=>b.addEventListener('click',()=>{setDraw(false);manual=Number(b.dataset.phase);if(paused){current=manual;dots.forEach(d=>{d.dx=0;d.dy=0;});paint(0);}else wake();}));
  function label(){pause.textContent=paused?'動きを再生':'動きを止める';pause.setAttribute('aria-pressed',String(paused));}
  pause.addEventListener('click',()=>{paused=!paused;label();if(paused){cancelAnimationFrame(raf);raf=0;paint(0);}else wake();});
  reduced.addEventListener('change',()=>{paused=reduced.matches;label();if(paused){cancelAnimationFrame(raf);raf=0;paint(0);}else wake();});
  label();resize();
})();
