(() => {
  'use strict';
  const section=document.querySelector('#rebirth');
  if(!section)return;
  const canvas=section.querySelector('canvas'),ctx=canvas.getContext('2d');
  if(!ctx)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const buttons=[...section.querySelectorAll('[data-phase]')], pause=section.querySelector('[data-pause]');
  const count=matchMedia('(pointer:coarse)').matches?1400:2600;
  let w=0,h=0,scale=1,raf=0,visible=false,paused=reduced.matches,phase=0,current=0,last=0,manual=null,scatter=1;
  const pointer={x:-1000,y:-1000}, dots=[],targets=[[],[],[],[]];
  let seed=31;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  // Axonometric projection gives every construction stage real depth.
  const project=(x,y,z)=>[x*.87-z*.64, y+x*.24+z*.32];
  for(let i=0;i<count;i++){
    const face=i%3,u=random(),v=random();
    let x,y,z;
    if(face===0){x=(i%4===0?u-.5:(Math.floor(u*9)/8-.5))*260;y=110-(i%4===0?Math.floor(v*8)/7:v)*300;z=65;}
    else if(face===1){x=130;y=110-v*300;z=(u-.5)*130;}
    else{x=(u-.5)*260;y=-190;z=(v-.5)*130;}
    const p=project(x,y,z);targets[0].push(p);
    const floor=Math.floor(random()*7),column=Math.floor(random()*5);
    const beam=i%3;
    targets[1].push(project(beam===0?(column-2)*65:(u-.5)*260,beam===0?110-v*300:110-floor*50,beam===2?(v-.5)*130:(i%2?65:-65)));
    const block=Math.floor(random()*5),height=[125,230,310,190,140][block];
    const bx=(block-2)*95;
    targets[2].push(project(bx+(face===1?36:(u-.5)*72),110-(face===2?height:v*height),face===0?40:(v-.5)*80));
    dots.push({x:p[0],y:p[1],dx:0,dy:0,r:1+random()*1.1,seed:random()*Math.PI*2,red:false});
  }
  const logo=new Image();
  logo.src='assets/site/rio-hero-logo.png';
  logo.onload=()=>{
    const sample=document.createElement('canvas');sample.width=360;sample.height=240;
    const c=sample.getContext('2d');c.drawImage(logo,0,0,360,240);
    const pixels=c.getImageData(0,0,360,240).data,points=[];
    for(let y=0;y<240;y+=2)for(let x=0;x<360;x+=2){const k=(y*360+x)*4;if(pixels[k+3]>100&&(pixels[k]+pixels[k+1]+pixels[k+2])/3<155)points.push({x:(x-180)*1.55,y:(y-120)*1.55,red:pixels[k]>pixels[k+1]*1.4});}
    if(!points.length)return;
    for(let i=0;i<count;i++){const p=points[Math.floor(i*points.length/count)];targets[3].push([p.x,p.y]);dots[i].red=p.red;}
    section.classList.add('is-ready');resize();wake();
  };
  function resize(){const b=canvas.getBoundingClientRect();w=b.width;h=b.height;const d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);scale=Math.min(w/(w<700?540:650),h/650)*.83;paint(0);}
  function progress(){if(manual!==null)return manual;if(reduced.matches)return 0;const r=section.getBoundingClientRect();return Math.max(0,Math.min(3,-r.top/Math.max(1,section.offsetHeight-innerHeight)*3));}
  function paint(dt){
    if(!targets[3].length)return;
    phase=progress();current=paused?phase:current+(phase-current)*Math.min(1,dt*8);
    scatter=paused?0:Math.max(0,scatter-dt*.45);
    ctx.clearRect(0,0,w,h);
    const a=Math.max(0,Math.min(2,Math.floor(current))),t=current-a,e=t*t*(3-2*t),burst=Math.sin(t*Math.PI)*24;
    const cx=w*(w>700?.64:.5),cy=h*.56;
    ctx.strokeStyle='rgba(90,77,58,.13)';ctx.lineWidth=1;
    ctx.beginPath();ctx.ellipse(cx,cy+150*scale,240*scale,38*scale,0,0,Math.PI*2);ctx.stroke();
    for(let i=0;i<count;i++){
      const d=dots[i],p=targets[a][i],q=targets[a+1][i];
      let x=p[0]+(q[0]-p[0])*e+Math.cos(d.seed)*(burst+scatter*300),y=p[1]+(q[1]-p[1])*e+Math.sin(d.seed)*(burst+scatter*200);
      const sx=cx+x*scale,sy=cy+y*scale,dist=Math.hypot(sx-pointer.x,sy-pointer.y);
      if(!paused&&dist<85){const power=(1-dist/85)*65;d.dx+=(sx-pointer.x)/(dist||1)*power*dt*5;d.dy+=(sy-pointer.y)/(dist||1)*power*dt*5;}
      d.dx*=Math.exp(-dt*3);d.dy*=Math.exp(-dt*3);
      ctx.fillStyle=current>2.5&&d.red?'#a92d1f':`rgba(27,28,28,${.5+(i%5)*.1})`;
      const size=Math.max(w<700?1.2:1.15,d.r*scale)*(current>2.7?1.25:1);
      ctx.fillRect(sx+d.dx,sy+d.dy,size*1.3,size);
    }
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
