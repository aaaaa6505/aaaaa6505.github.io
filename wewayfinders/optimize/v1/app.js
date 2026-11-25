(() => {
  'use strict';
  const root = document.documentElement;
  const fontStorage = 'wewayfinders-reading-size-v2';
  const lineStorage = 'wewayfinders-v3-line-spacing';
  const warmStorage = 'wewayfinders-v3-warm-paper';
  const MIN_FONT = 16, MAX_FONT = 24, DEFAULT_FONT = 18;
  const slider = document.getElementById('font-size-range');
  const output = document.getElementById('font-size-value');
  const reset = document.getElementById('font-size-reset');
  const steps = [...document.querySelectorAll('[data-font-step]')];
  const menu = document.getElementById('site-menu-panel');
  const menuToggle = document.getElementById('site-menu-toggle');
  const lineSelect = document.getElementById('line-spacing-select');
  const warm = document.getElementById('warm-paper');
  const site = document.getElementById('site');
  const modules = [...document.querySelectorAll('.lesson-section')];
  const allAnchors = [...document.querySelectorAll('.sidebar-outline a, .jump-nav-links a')];
  const backToTop = document.querySelector('.back-to-top');

  function getStored(key, fallback) {
    try { return localStorage.getItem(key) || fallback; } catch(_) { return fallback; }
  }
  function store(key, value) {
    try { localStorage.setItem(key, String(value)); } catch(_) {}
  }
  function setFont(value) {
    const px = Math.max(MIN_FONT, Math.min(MAX_FONT, Math.round(Number(value) || DEFAULT_FONT)));
    root.style.setProperty('--reading-size', `${px}px`);
    slider.value = String(px);
    output.value = `${px}px`;
    output.textContent = `${px}px`;
    steps.forEach(b => { b.disabled = (px === MIN_FONT && b.dataset.fontStep === '-1') || (px === MAX_FONT && b.dataset.fontStep === '1'); });
    store(fontStorage, px);
  }
  function setMenu(open) {
    if (!menu || !menuToggle) return;
    menu.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
  }
  if (menu && menuToggle) {
    menuToggle.addEventListener('click', () => setMenu(menu.hidden));
    document.addEventListener('pointerdown', e => { if (!e.target.closest('.site-menu')) setMenu(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuToggle.focus(); } });
  }
  slider.addEventListener('input', e => setFont(e.target.value));
  steps.forEach(b => b.addEventListener('click', () => setFont(Number(slider.value)+Number(b.dataset.fontStep))));
  reset.addEventListener('click', () => setFont(DEFAULT_FONT));
  setFont(getStored(fontStorage, DEFAULT_FONT));

  if (lineSelect) {
    const initial = getStored(lineStorage,'1.8');
    lineSelect.value = ['1.6','1.8','2'].includes(initial) ? initial : '1.8';
    root.style.setProperty('--reading-height',lineSelect.value);
    lineSelect.addEventListener('change', () => { root.style.setProperty('--reading-height',lineSelect.value);store(lineStorage,lineSelect.value); });
  }
  if (warm && site) {
    warm.checked = getStored(warmStorage,'false')==='true';
    site.classList.toggle('reader-warm',warm.checked);
    warm.addEventListener('change', () => { site.classList.toggle('reader-warm',warm.checked);store(warmStorage,warm.checked); });
  }

  // Optional module collapsing: all content remains expanded on initial load.
  modules.forEach(module => {
    const btn = module.querySelector('.module-toggle');
    const body = module.querySelector('.module-body');
    if (!btn || !body) return;
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded')==='true';
      btn.setAttribute('aria-expanded', String(!expanded));
      body.hidden = expanded;
      module.classList.toggle('is-collapsed', expanded);
      btn.textContent = expanded ? '展開' : '收合';
    });
  });
  function expandForTarget(target) {
    const parent = target && target.closest('.lesson-section');
    if (!parent) return;
    const body=parent.querySelector('.module-body');
    const btn=parent.querySelector('.module-toggle');
    if (body && body.hidden) {
      body.hidden=false;parent.classList.remove('is-collapsed');
      btn.setAttribute('aria-expanded','true');btn.textContent='收合';
    }
  }
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', () => {
    const target=document.getElementById(decodeURIComponent(a.hash.slice(1)));
    if (target) expandForTarget(target);
  }));
  if (location.hash) { const target=document.getElementById(decodeURIComponent(location.hash.slice(1))); if(target) expandForTarget(target); }
  window.addEventListener('hashchange', () => {
    const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if(target)expandForTarget(target);
  });

  const names=['課前預備','暖身活動','故事時間','影片','回應活動'];
  function updateLocation() {
    const topLimit=window.innerWidth<=1000?200:142;
    let active=0;
    modules.forEach((module,i)=>{ if (module.getBoundingClientRect().top<=topLimit) active=i; });
    const id=modules[active]?.id;
    allAnchors.forEach(a => {
      const yes=a.getAttribute('href')==='#'+id;
      a.classList.toggle('is-current',yes);
      if(yes)a.setAttribute('aria-current','location');
      else a.removeAttribute('aria-current');
    });
    const label=document.getElementById('current-location-label');
    if(label) label.textContent=`目前位置：${names[active]}`;
    if(backToTop)backToTop.classList.toggle('is-visible',window.scrollY>550);
  }
  let raf=0;
  window.addEventListener('scroll',()=>{
    if(!raf)raf=requestAnimationFrame(()=>{raf=0;updateLocation();});
  },{passive:true});
  window.addEventListener('resize',updateLocation);
  updateLocation();
})();
