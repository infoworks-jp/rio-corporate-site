// One logo: stippled entrance, exact artwork at rest, local spring-back on touch.
(() => {
  'use strict';
  const stage = document.querySelector('.hero-mark');
  if (!stage) return;
  const hero = stage.closest('.hero');
  const image = stage.querySelector('img'), canvas = hero.querySelector('.hero-logo-field');
  if (!image || !canvas) return;
  const ctx = canvas.getContext('2d');
  const replay = document.querySelector('[data-logo-replay]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  const smooth = n => { n = Math.max(0, Math.min(1, n)); return n * n * (3 - 2 * n); };
  let points = [], width = 0, height = 0, sourceWidth = 1200, sourceHeight = 800;
  const INTRO_DURATION = 4.8;
  let fieldWidth = 0, fieldHeight = 0, logoX = 0, logoY = 0;
  let elapsed = 0, last = 0, raf = 0, visible = false, ready = false, disturbed = false;
  const pointer = {x:-9999, y:-9999, time:0};
  let cell = 3, soundTime = 0;
  if (!ctx || !replay) return;

  function nativeLogo() {
    ctx.clearRect(0, 0, fieldWidth, fieldHeight);
    stage.classList.remove('is-animating');
    hero.classList.remove('is-logo-animating', 'is-logo-gathering');
    stage.dataset.logoState = 'complete';
  }
  function resize() {
    const box = stage.getBoundingClientRect(), field = hero.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    width = box.width; height = box.height;
    fieldWidth = field.width; fieldHeight = field.height;
    logoX = box.left-field.left; logoY = box.top-field.top;
    canvas.width = Math.round(fieldWidth * dpr); canvas.height = Math.round(fieldHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    points.forEach(p => { p.dx = p.dy = p.vx = p.vy = 0; });
    disturbed = false; pointer.time = 0;
    if (elapsed >= INTRO_DURATION || reduced.matches) nativeLogo();
    wake();
  }
  function prepare() {
    if (ready || !image.naturalWidth) return;
    try {
      const sample = document.createElement('canvas');
      sourceWidth = coarse.matches ? 900 : 1200;
      sourceHeight = Math.round(sourceWidth * image.naturalHeight / image.naturalWidth);
      sample.width = sourceWidth; sample.height = sourceHeight;
      const c = sample.getContext('2d', {willReadFrequently:true});
      c.drawImage(image, 0, 0, sourceWidth, sourceHeight);
      const pixels = c.getImageData(0, 0, sourceWidth, sourceHeight).data;
      for (let y = 0; y < sourceHeight; y += cell) for (let x = 0; x < sourceWidth; x += cell) {
        let best = -1, ink = 0;
        for (let iy = 0; iy < cell && y+iy < sourceHeight; iy++) for (let ix = 0; ix < cell && x+ix < sourceWidth; ix++) {
          const k = ((y+iy)*sourceWidth+x+ix)*4;
          // Keep opaque white seal lettering attached to the red ink as it moves.
          const strength = pixels[k+3]/255 * (.2+.8*(1-(pixels[k]+pixels[k+1]+pixels[k+2])/765));
          if (strength > ink) { ink = strength; best = k; }
        }
        if (ink < .16) continue;
        const originAngle = Math.random()*Math.PI*2, originRadius = Math.sqrt(Math.random());
        points.push({x:x+cell/2, y:y+cell/2, ink, color:`rgba(${pixels[best]},${pixels[best+1]},${pixels[best+2]},${pixels[best+3]/255})`,
          angle:Math.random()*Math.PI*2, delay:Math.random()*.6,
          startX:Math.cos(originAngle)*originRadius, startY:Math.sin(originAngle)*originRadius, depth:Math.random(),
          dx:0, dy:0, vx:0, vy:0, active:false});
      }
      ready = true;
      stage.classList.add('is-ready');
      replay.hidden = false;
      if (reduced.matches) elapsed = INTRO_DURATION;
      resize();
    } catch (_) { nativeLogo(); }
  }
  function frame(now) {
    raf = 0;
    if (!visible || document.hidden || reduced.matches || !ready) return;
    const delta = Math.max(.001, (now-last)/1000), dt = Math.min(.035, delta); last = now;
    elapsed += Math.min(delta,.25);
    const intro = elapsed < INTRO_DURATION, merge = smooth((elapsed-3.7)/1.1);
    const sx = width/sourceWidth, sy = height/sourceHeight;
    const fieldRadius = Math.hypot(fieldWidth,fieldHeight)*.58;
    const radius = coarse.matches ? 58 : 80;
    const interacting = now-pointer.time < 140 && !document.body.classList.contains('modal-open');
    let activeCount = 0;
    for (const p of points) {
      if (!p.active && !interacting) continue;
      const x = p.x*sx, y = p.y*sy, dx = x+p.dx-pointer.x, dy = y+p.dy-pointer.y;
      const distance = Math.hypot(dx, dy);
      if (interacting && distance < radius) {
        const force = (1-distance/radius)*5600;
        p.vx += (distance > .01 ? dx/distance : Math.cos(p.angle))*force*dt;
        p.vy += (distance > .01 ? dy/distance : Math.sin(p.angle))*force*dt;
      }
      p.vx = (p.vx-p.dx*34*dt)*Math.exp(-dt*6);
      p.vy = (p.vy-p.dy*34*dt)*Math.exp(-dt*6);
      p.dx += p.vx*dt; p.dy += p.vy*dt;
      p.active = Math.abs(p.dx)+Math.abs(p.dy)+Math.abs(p.vx)+Math.abs(p.vy) > .15;
      if (p.active) activeCount++; else p.dx = p.dy = p.vx = p.vy = 0;
    }
    disturbed = activeCount > 0;
    if (!intro && !disturbed) { nativeLogo(); return; }
    stage.classList.add('is-animating');
    hero.classList.add('is-logo-animating');
    hero.classList.toggle('is-logo-gathering', intro && elapsed < 3.5);
    stage.dataset.logoState = intro ? 'forming' : 'scattered';
    ctx.clearRect(0, 0, fieldWidth, fieldHeight);
    // The final state always uses the actual logo, including fine lettering.
    ctx.globalAlpha = intro ? merge : 1;
    ctx.drawImage(image, logoX, logoY, width, height);
    ctx.globalAlpha = 1;
    for (const p of points) if (p.active) {
      ctx.clearRect(logoX+(p.x-cell/2)*sx-.2, logoY+(p.y-cell/2)*sy-.2, cell*sx+.4, cell*sy+.4);
    }
    let color = '';
    for (const p of points) {
      if (!intro && !p.active) continue;
      const progress = intro ? Math.max(0,Math.min(1,(elapsed-p.delay)/3.2)) : 1;
      const gather = smooth(progress), remaining = 1-gather;
      const targetX = logoX+p.x*sx, targetY = logoY+p.y*sy;
      // Spawn throughout the full hero, including its edges. Curved paths give
      // the assembly a large, clockwise sweep before settling into exact detail.
      const dx = fieldWidth*.5+p.startX*fieldRadius-targetX;
      const dy = fieldHeight*.5+p.startY*fieldRadius-targetY;
      const turn = Math.sin(progress*Math.PI)*(.5+p.depth*.65);
      const cosine = Math.cos(turn), sine = Math.sin(turn);
      const x = targetX+(dx*cosine-dy*sine)*remaining+p.dx;
      const y = targetY+(dx*sine+dy*cosine)*remaining+p.dy;
      if(x < -4 || x > fieldWidth+4 || y < -4 || y > fieldHeight+4) continue;
      ctx.globalAlpha = (p.active ? 1 : 1-merge)*(.2+.8*smooth(elapsed/.2))*(.38+.62*gather);
      if (color !== p.color) { color = p.color; ctx.fillStyle = color; }
      const baseSize = Math.max(.55,cell*sx*(.25+p.ink*.22));
      const size = baseSize+remaining*p.depth*1.65;
      // Round only the large foreground grains; subpixel detail stays cheap.
      if(intro && size > 1.25){ctx.beginPath();ctx.arc(x,y,size,0,Math.PI*2);ctx.fill();}
      else ctx.fillRect(x-size,y-size,size*2,size*2);
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }
  function wake() {
    if (ready && visible && !document.hidden && !reduced.matches && !raf && (elapsed < INTRO_DURATION || disturbed || performance.now()-pointer.time < 140)) {
      last = performance.now(); raf = requestAnimationFrame(frame);
    }
  }
  function touch(e) {
    if (!ready || reduced.matches) return;
    const box = stage.getBoundingClientRect();
    pointer.x = e.clientX-box.left; pointer.y = e.clientY-box.top; pointer.time = performance.now();
    if (pointer.time-soundTime > 220) {
      soundTime = pointer.time;
      dispatchEvent(new CustomEvent('rio:ink',{detail:{kind:'brush',speed:.04,x:e.clientX/innerWidth}}));
    }
    wake();
  }
  stage.addEventListener('pointermove',touch,{passive:true});
  stage.addEventListener('pointerdown',touch,{passive:true});
  for (const event of ['pointerleave','pointercancel','pointerup']) stage.addEventListener(event,()=>{pointer.time=0;},{passive:true});
  replay.addEventListener('click',()=>{
    if (reduced.matches) { nativeLogo(); return; }
    hero.scrollIntoView({behavior:'smooth',block:'start'});
    elapsed=0; pointer.time=0; points.forEach(p=>{p.dx=p.dy=p.vx=p.vy=0;}); wake();
  });
  new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;
    if (visible) wake(); else { cancelAnimationFrame(raf); raf=0; pointer.time=0; }
  }).observe(stage);
  const observer = new ResizeObserver(resize);
  observer.observe(stage); observer.observe(hero);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;pointer.time=0;}else wake();});
  reduced.addEventListener('change',()=>{
    if(reduced.matches){cancelAnimationFrame(raf);raf=0;elapsed=INTRO_DURATION;nativeLogo();}else wake();
  });
  image.addEventListener('load',prepare,{once:true});
  if (image.complete) prepare();
  // Keep old shared links useful after removing the separate rebirth section.
  if(location.hash==='#rebirth') { history.replaceState(null,'','#top'); document.getElementById('top').scrollIntoView(); }
})();
