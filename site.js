(() => {
  const show = document.getElementById('show-params');
  const hide = document.getElementById('hide-params');
  const fallback = document.getElementById('webgl-fallback');
  const guiRoot = () => document.querySelector('.dg.ac');
  const setGui = (visible) => {
    const root = guiRoot();
    if (root) root.style.display = visible ? 'block' : 'none';
    show.style.display = visible ? 'none' : 'block';
    hide.style.display = visible ? 'block' : 'none';
  };
  window.addEventListener('load', () => {
    setTimeout(() => setGui(false), 100);
    try {
      const canvas = document.getElementById('fluid-canvas');
      const hasWebGL = !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
      if (!hasWebGL) fallback.style.display = 'block';
    } catch (_) { fallback.style.display = 'block'; }
    try { if (typeof splatStack !== 'undefined') splatStack.push(12); } catch (_) {}
  });
  show.addEventListener('click', () => setGui(true));
  hide.addEventListener('click', () => setGui(false));
  document.querySelectorAll('a,button').forEach((el) => el.addEventListener('pointerdown', (e) => e.stopPropagation()));
})();