const menu = document.querySelector('.rio-dropdown');

if (menu) {
  const trigger = menu.querySelector('summary');

  document.addEventListener('click', (event) => {
    if (!menu.open) return;

    if (!menu.contains(event.target) || event.target.closest('.side-nav a')) {
      menu.open = false;
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.open) {
      menu.open = false;
      trigger.focus({ preventScroll: true });
    }
  });
}
