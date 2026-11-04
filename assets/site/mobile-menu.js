(() => {
  const navigation = document.querySelector('.rio-navigation');
  if (!navigation) return;

  const trigger = navigation.querySelector('.rio-menu-toggle');
  const groups = [...navigation.querySelectorAll('.rio-menu-group')];
  const mobile = matchMedia('(max-width: 768px)');

  function closeMenu() {
    groups.forEach(group => { group.open = false; });
    trigger.setAttribute('aria-expanded', 'false');
  }

  trigger.addEventListener('click', () => {
    if (trigger.getAttribute('aria-expanded') === 'true') closeMenu();
    else trigger.setAttribute('aria-expanded', 'true');
  });

  groups.forEach(group => {
    group.querySelector('summary').addEventListener('click', () => {
      groups.forEach(other => {
        if (other !== group) other.open = false;
      });
    });
  });

  document.addEventListener('click', event => {
    if (!navigation.contains(event.target)) closeMenu();
    else if (event.target.closest('a')) {
      const group = event.target.closest('details');
      if (group) (mobile.matches ? trigger : group.querySelector('summary')).focus({ preventScroll: true });
      closeMenu();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !navigation.contains(document.activeElement)) return;
    const group = groups.find(item => item.open);
    if (group) {
      group.open = false;
      group.querySelector('summary').focus();
    } else if (mobile.matches && trigger.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      trigger.focus();
    }
  });

  mobile.addEventListener('change', closeMenu);
  navigation.dataset.ready = '';
})();
