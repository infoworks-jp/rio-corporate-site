(() => {
  'use strict';
  const hero = document.querySelector('.sakura-hero');
  if (!hero) return;
  const layer = hero.querySelector('.sakura-petals');
  const button = hero.querySelector('.sakura-motion');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  let visible = true;
  const sync = () => {
    hero.classList.toggle('is-paused', paused || !visible || document.hidden || reduced.matches);
    button.hidden = reduced.matches;
    button.setAttribute('aria-pressed', String(paused));
    button.textContent = paused ? '動きを再生する' : '動きを止める';
  };
  // Fixed stagger makes the first frame calm; mobile keeps a small particle count.
  const count = window.matchMedia('(max-width:650px)').matches ? 14 : 24;
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const petal = document.createElement('i');
    petal.className = 'sakura-petal';
    petal.style.cssText = `--x:${(i * 37) % 100}%;--size:${9 + (i * 7) % 19}px;--blur:${i % 5 === 0 ? 2 : 0}px;--duration:${13 + i % 9}s;--delay:${-i * 1.7}s`;
    fragment.append(petal);
  }
  layer.append(fragment);
  button.addEventListener('click', () => { paused = !paused; sync(); });
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(hero);
  }
  sync();
})();
