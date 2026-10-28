(() => {
  'use strict';
  const hero = document.querySelector('.sakura-hero');
  if (!hero) return;
  const video = hero.querySelector('.sakura-video');
  const button = hero.querySelector('.sakura-motion');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  let visible = true;
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
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(hero);
  }
  sync();
})();
