// One logo: stippled entrance, exact artwork at rest, local spring-back on touch.
(() => {
  'use strict';
  const stage = document.querySelector('.hero-mark');
  if (!stage) return;
  const image = stage.querySelector('img'), canvas = stage.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const replay = document.querySelector('[data-logo-replay]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  const smooth = n => { n = Math.max(0, Math.min(1, n)); return n * n * (3 - 2 * n); };
  let points = [], width = 0, height = 0, sourceWidth = 1200, sourceHeight = 800;
  let elapsed = 0, last = 0, raf = 0, visible = false, ready = false, disturbed = false;
  const pointer = {x:-9999, y:-9999, time:0};
  let cell = 3, soundTime = 0;
  if (!ctx) return;

  function nativeLogo() {
    ctx.clearRect(0, 0, width, height);
    stage.classList.remove('is-animating');
    stage.dataset.logoState = 'complete';
  }
  function resize() {
    const box = stage.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 1.75);
    width = box.width; height = box.height;
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    points.forEach(p => { p.dx = p.dy = p.vx = p.vy = 0; });
    disturbed = false; pointer.time = 0;
    if (elapsed >= 4.4 || reduced.matches) nativeLogo();
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
        points.push({x:x+cell/2, y:y+cell/2, ink, color:`rgba(${pixels[best]},${pixels[best+1]},${pixels[best+2]},${pixels[best+3]/255})`,
          angle:Math.random()*Math.PI*2, spread:35+Math.random()*125, delay:Math.random()*.55,
          dx:0, dy:0, vx:0, vy:0, active:false});
      }
      ready = true;
      stage.classList.add('is-ready');
      replay.hidden = false;
      if (reduced.matches) elapsed = 4.4;
      resize();
    } catch (_) { nativeLogo(); }
  }
  function frame(now) {
    raf = 0;
    if (!visible || document.hidden || reduced.matches || !ready) return;
    const dt = Math.min(.035, Math.max(.001, (now-last)/1000)); last = now;
    elapsed += dt;
    const intro = elapsed < 4.4, merge = smooth((elapsed-2.9)/1.5);
    const sx = width/sourceWidth, sy = height/sourceHeight;
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
    stage.dataset.logoState = intro ? 'forming' : 'scattered';
    ctx.clearRect(0, 0, width, height);
    // The final state always uses the actual logo, including fine lettering.
    ctx.globalAlpha = intro ? merge : 1;
    ctx.drawImage(image, 0, 0, width, height);
    ctx.globalAlpha = 1;
    for (const p of points) if (p.active) {
      ctx.clearRect((p.x-cell/2)*sx-.2, (p.y-cell/2)*sy-.2, cell*sx+.4, cell*sy+.4);
    }
    let color = '';
    for (const p of points) {
      if (!intro && !p.active) continue;
      const gather = intro ? 1-smooth((elapsed-p.delay)/2.3) : 0;
      const travel = gather*p.spread*Math.min(1,width/750);
      const x = p.x*sx + Math.cos(p.angle+gather*.7)*travel + p.dx;
      const y = p.y*sy + Math.sin(p.angle+gather*.7)*travel*.6 + p.dy;
      ctx.globalAlpha = (p.active ? 1 : 1-merge)*smooth(elapsed/.35);
      if (color !== p.color) { color = p.color; ctx.fillStyle = color; }
      const size = Math.max(.55,cell*sx*(.25+p.ink*.22));
      // Subpixel ink marks remain crisp without thousands of arc paths per frame.
      ctx.fillRect(x-size,y-size,size*2,size*2);
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }
  function wake() {
    if (ready && visible && !document.hidden && !reduced.matches && !raf && (elapsed < 4.4 || disturbed || performance.now()-pointer.time < 140)) {
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
    elapsed=0; pointer.time=0; points.forEach(p=>{p.dx=p.dy=p.vx=p.vy=0;}); wake();
  });
  new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;
    if (visible) wake(); else { cancelAnimationFrame(raf); raf=0; pointer.time=0; }
  }).observe(stage);
  new ResizeObserver(resize).observe(stage);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;pointer.time=0;}else wake();});
  reduced.addEventListener('change',()=>{
    if(reduced.matches){cancelAnimationFrame(raf);raf=0;elapsed=4.4;nativeLogo();}else wake();
  });
  image.addEventListener('load',prepare,{once:true});
  if (image.complete) prepare();
  // Keep old shared links useful after removing the separate rebirth section.
  if(location.hash==='#rebirth') { history.replaceState(null,'','#top'); document.getElementById('top').scrollIntoView(); }
})();
