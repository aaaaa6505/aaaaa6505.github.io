(() => {
  'use strict';
  const root = document.documentElement;
  const storageKey = 'wewayfinders-reading-size-v2';
  const menu = document.getElementById('site-menu-panel');
  const toggle = document.getElementById('site-menu-toggle');
  const slider = document.getElementById('font-size-range');
  const output = document.getElementById('font-size-value');
  const reset = document.getElementById('font-size-reset');
  const stepButtons = [...document.querySelectorAll('[data-font-step]')];
  const MIN_FONT = 16, MAX_FONT = 24, DEFAULT_FONT = 18;

  function setFont(value) {
    const px = Math.max(MIN_FONT, Math.min(MAX_FONT, Math.round(Number(value) || DEFAULT_FONT)));
    root.style.setProperty('--reading-size', `${px}px`);
    slider.value = String(px);
    output.value = `${px}px`;
    output.textContent = `${px}px`;
    for (const button of stepButtons) {
      button.disabled = (px === MIN_FONT && button.dataset.fontStep === '-1') ||
                        (px === MAX_FONT && button.dataset.fontStep === '1');
    }
    try { localStorage.setItem(storageKey, String(px)); } catch (_) {}
  }
  function setMenu(isOpen) {
    menu.hidden = !isOpen;
    toggle.setAttribute('aria-expanded', String(isOpen));
  }
  toggle.addEventListener('click', () => setMenu(menu.hidden));
  document.addEventListener('pointerdown', e => {
    if (!e.target.closest('.site-menu')) setMenu(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !menu.hidden) {
      setMenu(false);
      toggle.focus();
    }
  });
  slider.addEventListener('input', e => setFont(e.target.value));
  for (const button of stepButtons) {
    button.addEventListener('click', () => setFont(Number(slider.value) + Number(button.dataset.fontStep)));
  }
  reset.addEventListener('click', () => setFont(DEFAULT_FONT));
  try { setFont(localStorage.getItem(storageKey) || DEFAULT_FONT); }
  catch (_) { setFont(DEFAULT_FONT); }

  /* All sections are present in document flow; anchors navigate without hiding content. */
})();
