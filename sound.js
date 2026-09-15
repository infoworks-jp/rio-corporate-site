/* Original procedural soundscape: earth, wet ink and falling drops. */
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
    bed('lowpass', 230, .17);
    // A very quiet, slowly breathing foundation, also audible on small speakers.
    const earth = ctx.createOscillator(), earthLevel = ctx.createGain();
    earth.frequency.value = 82; earthLevel.gain.value = .018;
    earth.connect(earthLevel); earthLevel.connect(master); earth.start();
    const breath = ctx.createOscillator(), depth = ctx.createGain();
    breath.frequency.value = .09; depth.gain.value = .008;
    breath.connect(depth); depth.connect(earthLevel.gain); breath.start();
    const ink = bed('bandpass', 780, 0);
    brush = ink.level; brushFilter = ink.filter; brushFilter.Q.value = .6;
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
    // Rising bubble resonance gives the liquid “po-chan”, rather than a notification beep.
    [0, .075, .14].forEach((delay, i) => {
      const tone = ctx.createOscillator(), level = ctx.createGain();
      const t = now + delay, base = [390, 780, 1150][i] * (.94 + Math.random() * .12);
      tone.frequency.setValueAtTime(base, t);
      tone.frequency.exponentialRampToValueAtTime(base * 1.8, t + .12);
      level.gain.setValueAtTime(0, t);
      level.gain.linearRampToValueAtTime([.19, .065, .025][i] * strength, t + .006);
      level.gain.exponentialRampToValueAtTime(.0001, t + .28);
      tone.connect(level); level.connect(pan); tone.start(t); tone.stop(t + .3);
      tone.onended = () => { tone.disconnect(); level.disconnect(); if(i === 2) pan.disconnect(); };
    });
    const splash = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), level = ctx.createGain();
    splash.buffer = noise; filter.type = 'bandpass'; filter.frequency.value = 1900; filter.Q.value = .7;
    level.gain.setValueAtTime(.16 * strength, now);
    level.gain.exponentialRampToValueAtTime(.0001, now + .2);
    splash.connect(filter); filter.connect(level); level.connect(master);
    splash.start(now); splash.stop(now + .22);
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
    brushFilter.frequency.setTargetAtTime(450 + speed * 1100, now, .08);
    brush.gain.cancelScheduledValues(now);
    brush.gain.setTargetAtTime(.04 + speed * .2, now, .04);
    brush.gain.setTargetAtTime(0, now + .07, .18);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) silence(); });
  addEventListener('pagehide', silence);
})();
