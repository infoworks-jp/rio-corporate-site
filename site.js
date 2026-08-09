(() => {
  const canvas = document.getElementById('fluid-canvas');
  const fallback = document.getElementById('webgl-fallback');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    if (fallback) fallback.style.display = 'block';
    return;
  }

  let w = 0, h = 0, dpr = 1;
  const particles = [];
  const maxParticles = 520;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, w, h);
  }

  function addInk(x, y, amount = 34, forceX = 0, forceY = 0) {
    for (let i = 0; i < amount; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = Math.random() * 1.8 + .15;
      particles.push({
        x: x + (Math.random() - .5) * 42,
        y: y + (Math.random() - .5) * 42,
        vx: Math.cos(a) * s + forceX * .08,
        vy: Math.sin(a) * s + forceY * .08,
        r: 18 + Math.random() * 56,
        life: 1,
        decay: .0022 + Math.random() * .0038,
        tone: 125 + Math.floor(Math.random() * 105)
      });
    }
    if (particles.length > maxParticles) particles.splice(0, particles.length - maxParticles);
  }

  let lastX = w/2, lastY = h/2;
  function pointer(e) {
    const p = e.touches ? e.touches[0] : e;
    const dx = p.clientX - lastX, dy = p.clientY - lastY;
    addInk(p.clientX, p.clientY, 10, dx, dy);
    lastX = p.clientX; lastY = p.clientY;
  }
  addEventListener('pointermove', pointer, {passive:true});
  addEventListener('pointerdown', e => addInk(e.clientX, e.clientY, 70), {passive:true});
  addEventListener('touchmove', pointer, {passive:true});
  addEventListener('resize', resize);

  function autoSeed() {
    addInk(w*.34 + Math.random()*w*.32, h*.34 + Math.random()*h*.28, 70);
  }

  function frame() {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(5,5,5,.035)';
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = 'screen';
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      p.vx *= .994; p.vy *= .994;
      p.vx += Math.sin((p.y + i) * .006) * .018;
      p.vy += Math.cos((p.x - i) * .006) * .018;
      p.life -= p.decay;
      p.r *= 1.0012;
      if (p.life <= 0) { particles.splice(i,1); continue; }
      const alpha = Math.max(0, Math.min(.075, p.life * .075));
      const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);
      g.addColorStop(0, `rgba(${p.tone},${p.tone},${p.tone},${alpha})`);
      g.addColorStop(.42, `rgba(${p.tone},${p.tone},${p.tone},${alpha*.65})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  resize();
  addInk(w*.5, h*.46, 150);
  setTimeout(autoSeed, 650);
  setTimeout(autoSeed, 1500);
  setInterval(autoSeed, 3300);
  frame();
})();