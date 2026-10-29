(() => {
  'use strict';
  const hero = document.querySelector('.arm-recruit');
  if (!hero) return;
  const video = hero.querySelector('.arm-video');
  const button = hero.querySelector('.arm-toggle');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  let visible = false;
  let blocked = false;
  let failed = false;
  video.muted = true;
  const renderButton = () => {
    button.hidden = reduced.matches || failed;
    button.setAttribute('aria-pressed', String(paused || blocked));
    button.textContent = paused || blocked ? '動画を再生する' : '動画を止める';
  };
  const sync = () => {
    const shouldPlay = !paused && visible && !document.hidden && !reduced.matches && !failed;
    if (!shouldPlay) {
      video.pause();
      renderButton();
      return;
    }
    if (!video.getAttribute('src')) video.src = video.dataset.src;
    if (video.paused) {
      const attempt = video.play();
      if (attempt) attempt.catch(() => { blocked = true; renderButton(); });
    }
    renderButton();
  };
  video.addEventListener('playing', () => {
    blocked = false;
    video.classList.add('is-playing');
    if (paused || !visible || document.hidden || reduced.matches) video.pause();
    renderButton();
  });
  video.addEventListener('error', () => {
    failed = true;
    video.classList.remove('is-playing');
    renderButton();
  });
  button.addEventListener('click', () => {
    paused = blocked ? false : !paused;
    blocked = false;
    sync();
  });
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    const mobile = matchMedia('(max-width: 768px)');
    // Observe the visible layout container; a background video inside a
    // display:contents wrapper is not a reliable intersection target.
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      document.body.classList.toggle('arm-in-view', visible);
      sync();
    });
    const watch = () => {
      observer.disconnect();
      observer.observe(mobile.matches ? hero.querySelector('.arm-scene') : hero);
    };
    mobile.addEventListener('change', watch);
    watch();
  } else {
    visible = true;
  }
  sync();
})();

window.addEventListener('load',()=>{if(location.hash==='#recruit')document.fonts.ready.then(()=>document.querySelector('.arm-recruit').scrollIntoView({block:'start',behavior:'instant'}))});

