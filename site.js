(() => {
  const fallback = document.getElementById('webgl-fallback');

  function seedInk() {
    try {
      if (typeof splatStack !== 'undefined') {
        splatStack.push(18);
        setTimeout(() => splatStack.push(10), 700);
        setTimeout(() => splatStack.push(7), 1700);
      }
    } catch (e) {
      console.warn('Ink seed unavailable', e);
    }
  }

  window.addEventListener('load', () => {
    try {
      const canvas = document.getElementById('fluid-canvas');
      if (!canvas) return;
      const hasWebGL = !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
      if (!hasWebGL && fallback) fallback.style.display = 'block';
    } catch (_) {
      if (fallback) fallback.style.display = 'block';
    }
    seedInk();
  });
})();