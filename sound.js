/* Original procedural soundscape: quiet water, wet ink and tiny drops. */
(() => {
  'use strict';
  const button = document.querySelector('#sound-toggle');
  const label = button.querySelector('span');
  const Audio = window.AudioContext || window.webkitAudioContext;
  let ctx, master, brush, brushFilter, noise, enabled = false, busy = false;
  let lastDrop = -10, lastBrush = -10;
  function display(on) {
    enabled = on;
    button.setAttribute('aria-pressed', String(on));
    button.setAttribute('aria-label', on ? '音をオフにする' : '音をオンにする');
    label.textContent = on ? 'SOUND ON' : 'SOUND OFF';
  }
  if (!Audio) { button.hidden = true; return; }
  button.hidden = false;
  function setup() {
    ctx = new Audio();
    master = ctx.createGain(); master.gain.value = 0;
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -18; limiter.knee.value = 12;
    limiter.ratio.value = 5; limiter.attack.value = .005; limiter.release.value = .25;
    master.connect(limiter); limiter.connect(ctx.destination);
    noise = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const samples = noise.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < samples.length; i++) {
      brown = (brown + (Math.random() * 2 - 1) * .025) / 1.025;
      samples[i] = brown * 3.5;
    }
    function bed(filterType, frequency, gain) {
      const source = ctx.createBufferSource(); source.buffer = noise; source.loop = true;
      const filter = ctx.createBiquadFilter(); filter.type = filterType; filter.frequency.value = frequency;
      const level = ctx.createGain(); level.gain.value = gain;
      source.connect(filter); filter.connect(level); level.connect(master); source.start();
      return {level, filter};
    }
    // A seamless, quiet water bed made from small overlapping bubble resonances.
    // Short liquid sounds provide movement without a continuous wind-like hiss.
    const waterBuffer = ctx.createBuffer(2, ctx.sampleRate * 16, ctx.sampleRate);
    const waterLeft = waterBuffer.getChannelData(0), waterRight = waterBuffer.getChannelData(1);
    for (let bubble = 0; bubble < 96; bubble++) {
      const start = Math.floor(Math.random() * waterBuffer.length);
      const duration = .12 + Math.random() * .22;
      const count = Math.floor(duration * ctx.sampleRate);
      const frequency = 480 + Math.random() * 1250;
      const volume = .016 + Math.random() * .024;
      const position = .25 + Math.random() * .5;
      let phase = 0;
      for (let i = 0; i < count; i++) {
        const t = i / ctx.sampleRate;
        const envelope = (1 - Math.exp(-t * 350)) * Math.exp(-t * 24)
          * Math.min(1, (duration - t) / .025);
        phase += 2 * Math.PI * frequency * (1 + .7 * t / duration) / ctx.sampleRate;
        const value = Math.sin(phase) * envelope * volume;
        const at = (start + i) % waterBuffer.length;
        waterLeft[at] += value * Math.sqrt(1 - position);
        waterRight[at] += value * Math.sqrt(position);
      }
    }
    const water = ctx.createBufferSource(), waterLevel = ctx.createGain();
    water.buffer = waterBuffer; water.loop = true; waterLevel.gain.value = .75;
    water.connect(waterLevel); waterLevel.connect(master); water.start();
    const ink = bed('lowpass', 420, 0);
    brush = ink.level; brushFilter = ink.filter; brushFilter.Q.value = .35;
    ctx.addEventListener('statechange', () => {
      if (ctx.state !== 'running' && enabled) silence();
    });
  }
  function silence() {
    display(false);
    if (!ctx) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(0, ctx.currentTime);
    brush.gain.cancelScheduledValues(ctx.currentTime);
    brush.gain.setValueAtTime(0, ctx.currentTime);
    void ctx.suspend().catch(() => {});
  }
  function drop(x = .5, strength = 1) {
    const now = ctx.currentTime;
    if (now - lastDrop < .24) return;
    lastDrop = now;
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
    if (pan.pan) pan.pan.value = (x - .5) * 1.1;
    pan.connect(master);
    // A tiny, short bubble: a light “pi-chan” with very little splash.
    [0, .045].forEach((delay, i) => {
      const tone = ctx.createOscillator(), level = ctx.createGain();
      const t = now + delay, base = [1250, 1850][i] * (.94 + Math.random() * .12);
      tone.frequency.setValueAtTime(base, t);
      tone.frequency.exponentialRampToValueAtTime(base * 1.25, t + .045);
      level.gain.setValueAtTime(0, t);
      level.gain.linearRampToValueAtTime([.055, .016][i] * strength, t + .004);
      level.gain.exponentialRampToValueAtTime(.0001, t + .14);
      tone.connect(level); level.connect(pan); tone.start(t); tone.stop(t + .16);
      tone.onended = () => { tone.disconnect(); level.disconnect(); if(i === 1) pan.disconnect(); };
    });
    const splash = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), level = ctx.createGain();
    splash.buffer = noise; filter.type = 'bandpass'; filter.frequency.value = 1900; filter.Q.value = .7;
    level.gain.setValueAtTime(.022 * strength, now);
    level.gain.exponentialRampToValueAtTime(.0001, now + .065);
    splash.connect(filter); filter.connect(level); level.connect(master);
    splash.start(now); splash.stop(now + .075);
    splash.onended = () => { splash.disconnect(); filter.disconnect(); level.disconnect(); };
  }
  button.addEventListener('click', async () => {
    if (busy) return;
    if (enabled) { silence(); return; }
    busy = true;
    try {
      if (!ctx) setup();
      await ctx.resume();
      if (document.hidden || ctx.state !== 'running') { silence(); return; }
      display(true);
      master.gain.setTargetAtTime(.65, ctx.currentTime, .2);
      drop(.5, .7);
    } catch (_) {
      silence();
      label.textContent = '再試行';
      button.setAttribute('aria-label', '音をオンにする（再試行）');
    } finally { busy = false; }
  });
  addEventListener('rio:ink', ({detail}) => {
    if (!enabled || document.hidden || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    if (detail.kind === 'drop') { drop(detail.x, detail.strength || .85); return; }
    if (now - lastBrush < .035) return;
    lastBrush = now;
    const speed = Math.max(0, Math.min(1, detail.speed || .1));
    brushFilter.frequency.setTargetAtTime(320 + speed * 300, now, .12);
    brush.gain.cancelScheduledValues(now);
    brush.gain.setTargetAtTime(.008 + speed * .035, now, .09);
    brush.gain.setTargetAtTime(0, now + .09, .22);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) silence(); });
  addEventListener('pagehide', silence);
})();
