(() => {
  const menu = document.querySelector('#rio-menu');
  if (!menu) return;

  const trigger = menu.querySelector('summary');

  document.addEventListener('click', (event) => {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
  });

  menu.addEventListener('click', (event) => {
    if (!event.target.closest('a')) return;
    menu.open = false;
    trigger.focus({ preventScroll: true });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || event.defaultPrevented || !menu.open) return;
    menu.open = false;
    if (menu.contains(document.activeElement)) trigger.focus();
  });
})();
