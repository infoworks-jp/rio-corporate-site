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

  const desktop = document.querySelector('.rio-desktop-menu');
  if (!desktop) return;

  document.addEventListener('click', event => {
    const group = desktop.querySelector('details[open]');
    if (!group) return;

    if (!group.contains(event.target)) group.open = false;
    else if (event.target.closest('a')) {
      group.querySelector('summary').focus({ preventScroll: true });
      group.open = false;
    }
  });

  desktop.addEventListener('keydown', event => {
    const group = event.target.closest('details[open]');
    if (event.key !== 'Escape' || !group) return;

    group.querySelector('summary').focus();
    group.open = false;
  });
})();
