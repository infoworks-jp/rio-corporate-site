// Shared keyboard behavior for the existing certificate and contact overlays.
(() => {
  const modals = [...document.querySelectorAll('.credential-modal,.contact-form-modal')];
  let active = null, opener = null, saved = [];
  const controls = modal => [...modal.querySelectorAll('button,a[href],input,select,textarea,iframe,[tabindex]')]
    .filter(el => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length && !el.closest('[aria-hidden="true"]'));
  function update() {
    const next = modals.find(el => el.classList.contains('is-open')) || null;
    if (next === active) return;
    saved.forEach(([el, inert]) => { el.inert = inert; }); saved = [];
    if (next) {
      if (!active) opener = document.activeElement;
      active = next;
      for (const el of document.body.children) {
        if (el === next || /^(SCRIPT|STYLE)$/.test(el.tagName)) continue;
        saved.push([el, el.inert]); el.inert = true;
      }
      controls(next)[0]?.focus({preventScroll:true});
    } else {
      active = null;
      if (opener?.isConnected) opener.focus({preventScroll:true});
      opener = null;
    }
  }
  const observer = new MutationObserver(update);
  modals.forEach(el => observer.observe(el, {attributes:true, attributeFilter:['class']}));
  document.addEventListener('keydown', e => {
    if (!active || e.key !== 'Tab') return;
    const items = controls(active), first = items[0], last = items.at(-1);
    if (!first) return;
    if (e.shiftKey && (document.activeElement === first || !active.contains(document.activeElement))) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && (document.activeElement === last || !active.contains(document.activeElement))) {
      e.preventDefault(); first.focus();
    }
  });
})();
