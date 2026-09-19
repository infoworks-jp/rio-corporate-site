(() => {
  'use strict';
  const section=document.querySelector('#rebirth');
  if(!section)return;
  const canvas=section.querySelector('canvas'),ctx=canvas.getContext('2d');
  if(!ctx)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const buttons=[...section.querySelectorAll('[data-phase]')], pause=section.querySelector('[data-pause]');
  const count=matchMedia('(pointer:coarse)').matches?3400:5200;
  let w=0,h=0,scale=1,raf=0,visible=false,paused=reduced.matches,phase=0,current=0,last=0,manual=null,scatter=1;
  const pointer={x:-1000,y:-1000}, dots=[],targets=[[],[],[],[]];
  let seed=31;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  // Architectural elevations: explicit rooflines, arches and structural bays.
  const shapes=[[],[],[]];
  const line=(s,x1,y1,x2,y2)=>shapes[s].push([x1,y1,x2,y2]);
  const poly=(s,pts)=>{for(let i=1;i<pts.length;i++)line(s,...pts[i-1],...pts[i]);};
  const box=(s,x,y,w,h)=>poly(s,[[x,y],[x+w,y],[x+w,y+h],[x,y+h],[x,y]]);
  const arch=(s,x,y,w,h)=>{
    line(s,x,y+h,x,y+w/2);line(s,x+w,y+w/2,x+w,y+h);line(s,x,y+h,x+w,y+h);
    for(let j=0;j<12;j++){const a=Math.PI+j*Math.PI/12,b=Math.PI+(j+1)*Math.PI/12;line(s,x+w/2+Math.cos(a)*w/2,y+w/2+Math.sin(a)*w/2,x+w/2+Math.cos(b)*w/2,y+w/2+Math.sin(b)*w/2);}
    line(s,x+w/2,y+3,x+w/2,y+h);line(s,x,y+h*.55,x+w,y+h*.55);
  };
  // Red-brick government office motif, not a measured structural drawing.
  for(let k=0;k<2;k++){
    box(k,-265,-22,530,126);line(k,-276,108,276,108);line(k,-282,116,282,116);
    poly(k,[[-275,-22],[-249,-76],[-61,-76],[-45,-22]]);
    poly(k,[[45,-22],[61,-76],[249,-76],[275,-22]]);
    box(k,-56,-66,112,170);poly(k,[[-64,-66],[0,-112],[64,-66]]);
    box(k,-29,-170,58,66);poly(k,[[-39,-170],[-27,-208],[0,-228],[27,-208],[39,-170],[-39,-170]]);
    line(k,0,-228,0,-250);poly(k,[[0,-249],[22,-243],[0,-237]]);
    for(const y of [17,59,98])line(k,-265,y,265,y);
    for(const x of [-245,-205,-165,-125,-85,65,105,145,185,225]){
      if(k===0){arch(k,x,-10,20,30);arch(k,x,36,20,34);box(k,x-3,73,26,4);}
      else {line(k,x,-22,x,104);line(k,x,-22,x+40,59);line(k,x,59,x+40,104);}
    }
    for(const x of [-24,-4,16]){if(k===0)arch(k,x,-160,9,35);else line(k,x,-170,x,-104);}
    if(k===0){arch(k,-18,45,36,59);arch(k,-36,-42,20,32);arch(k,16,-42,20,32);}
    else {for(const x of [-48,-16,16,48])line(k,x,-60,x,104);poly(k,[[-48,104],[48,17],[-48,-60],[48,104]]);}
    for(const x of [-229,-149,-99,83,133,213])poly(k,[[x,-76],[x,-105],[x+10,-105],[x+10,-76]]);
  }
  // A legible skyline: spaced towers, stepped roofs, and a central lattice tower.
  for(const [x,y,width] of [[-275,-5,55],[-207,-82,59],[-133,-36,52],[77,-53,58],[150,-139,60],[226,-17,48]]){
    box(2,x,y,width,125-y);box(2,x+8,y-12,width-16,12);
    for(let yy=y+15;yy<112;yy+=22)for(let xx=x+10;xx<x+width-7;xx+=15)box(2,xx,yy,6,10);
  }
  poly(2,[[-47,125],[-17,-54],[-10,-178],[0,-231],[10,-178],[17,-54],[47,125]]);
  box(2,-29,-68,58,24);box(2,-20,-143,40,15);line(2,0,-231,0,-253);
  for(let y=-125;y<115;y+=29){const span=13+(y+125)*.12;poly(2,[[-span,y],[span,y+29],[-span-3,y+29],[span,y]]);}
  line(2,-285,126,285,126);
  for(let stage=0;stage<3;stage++){
    const segments=shapes[stage],lengths=segments.map(p=>Math.hypot(p[2]-p[0],p[3]-p[1]));
    const total=lengths.reduce((a,b)=>a+b,0);let j=0,start=0;
    for(let i=0;i<count;i++){const at=(i+.5)/count*total;while(j<segments.length-1&&at>start+lengths[j])start+=lengths[j++];const p=segments[j],t=(at-start)/lengths[j];targets[stage].push([p[0]+(p[2]-p[0])*t,p[1]+(p[3]-p[1])*t]);}
  }
  for(let i=0;i<count;i++)dots.push({dx:0,dy:0,r:.85+random()*.45,seed:random()*Math.PI*2,red:false});
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
      ctx.fillStyle=current<.5?'#91402e':current>2.5&&d.red?'#a92d1f':'#242523';
      const size=Math.max(w<700?.95:1.05,d.r*scale)*(current>2.7?1.25:1);
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
