// Helpers
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const $ = (sel, ctx = document) => ctx.querySelector(sel);

// Remove no-js class
document.documentElement.classList.remove('no-js');

// Theme: auto / dark / light
(function theme() {
  const root = document.documentElement;
  const btn = $('#themeToggle');
  const stored = localStorage.getItem('theme-pref') || 'auto';
  root.setAttribute('data-theme', stored);
  btn.textContent = stored[0].toUpperCase() + stored.slice(1);
  btn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next = current === 'auto' ? 'dark' : current === 'dark' ? 'light' : 'auto';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme-pref', next);
    btn.textContent = next[0].toUpperCase() + next.slice(1);
  });
})();

// Reveal on scroll
(function reveal() {
  const items = $$('.reveal');
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.12 });
  items.forEach(el => io.observe(el));
})();

// Smooth internal links
(function smoothAnchors() {
  $$('.nav a, .cta a, .logo, .link[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const target = $(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', href);
      }
    });
  });
})();

// Typewriter headline
(function typewriter() {
  const el = document.querySelector('.typewriter');
  if (!el) return;
  const node = el.childNodes[0]; // text node
  const full = node.nodeValue.trim();
  node.nodeValue = '';
  let i = 0;
  function step() {
    i += Math.max(1, Math.round(Math.random() * 2));
    node.nodeValue = full.slice(0, i);
    if (i < full.length) setTimeout(step, 26 + Math.random() * 50);
  }
  setTimeout(step, 400);
})();

// Scroll progress bar
(function progress() {
  const bar = $('#progress');
  function update() {
    const h = document.documentElement;
    const scrolled = (h.scrollTop || document.body.scrollTop);
    const height = h.scrollHeight - h.clientHeight;
    const pct = height ? (scrolled / height) * 100 : 0;
    bar.style.width = pct + '%';
  }
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
})();

// Tilt cards (3D)
(function tilt() {
  const cards = $$('.tilt');
  const MAX = 10; // deg
  function handle(e) {
    const rect = this.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - y) * (MAX * 2);
    const ry = (x - 0.5) * (MAX * 2);
    this.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
  }
  function reset() { this.style.transform = ''; }
  cards.forEach(c => {
    c.addEventListener('mousemove', handle);
    c.addEventListener('mouseleave', reset);
  });
})();

// Magnetic buttons
(function magnetic() {
  const magnets = $$('.magnet');
  const STRENGTH = 18; // px
  function onMove(e) {
    magnets.forEach(m => {
      const r = m.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(mx, my);
      const radius = Math.max(r.width, r.height) * 1.2;
      if (dist < radius) {
        m.style.transform = `translate(${(mx / radius) * STRENGTH}px, ${(my / radius) * STRENGTH}px)`;
      } else {
        m.style.transform = '';
      }
    });
  }
  window.addEventListener('mousemove', onMove, { passive: true });
})();

// Custom cursor (lerp)
(function cursor() {
  const c = $('#cursor');
  let x = window.innerWidth / 2, y = window.innerHeight / 2;
  let tx = x, ty = y;
  function lerp(a, b, t) { return a + (b - a) * t; }
  window.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  function loop() {
    x = lerp(x, tx, 0.2); y = lerp(y, ty, 0.2);
    c.style.transform = `translate(${x - 0}px, ${y - 0}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  }
  loop();
})();

// Project filters
(function filters() {
  const btns = $$('.filter-btn');
  const cards = $$('.project');
  function apply(filter) {
    cards.forEach(card => {
      const tags = (card.dataset.tags || '').split(/\s+/);
      const show = filter === 'all' || tags.includes(filter);
      card.classList.toggle('hidden', !show);
    });
  }
  btns.forEach(b => b.addEventListener('click', () => {
    btns.forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    apply(b.dataset.filter);
  }));
})();

// Command palette (Ctrl/Cmd + K)
(function palette() {
  const modal = $('#palette');
  const input = $('#paletteInput');
  const list = $('#paletteList');
  const openBtn = $('#openPalette');
  const items = $$('#paletteList li');

  function open() {
    modal.setAttribute('aria-hidden', 'false');
    input.value = '';
    filter('');
    setTimeout(() => input.focus(), 0);
  }
  function close() { modal.setAttribute('aria-hidden', 'true'); }
  function filter(q) {
    const query = q.trim().toLowerCase();
    items.forEach(li => {
      const text = li.textContent.toLowerCase();
      li.style.display = text.includes(query) ? '' : 'none';
    });
    items.forEach(li => li.removeAttribute('aria-selected'));
    const first = items.find(li => li.style.display !== 'none');
    if (first) first.setAttribute('aria-selected', 'true');
  }
  function go(target) {
    close();
    const el = document.querySelector(target);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  openBtn.addEventListener('click', open);
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const openNow = modal.getAttribute('aria-hidden') === 'false';
      openNow ? close() : open();
    } else if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
      close();
    }
  });
  input.addEventListener('input', () => filter(input.value));
  list.addEventListener('click', (e) => {
    const li = e.target.closest('li'); if (!li) return;
    go(li.dataset.target);
  });
  input.addEventListener('keydown', (e) => {
    if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) return;
    e.preventDefault();
    const visible = items.filter(li => li.style.display !== 'none');
    let idx = visible.findIndex(li => li.getAttribute('aria-selected') === 'true');
    if (e.key === 'ArrowDown') idx = Math.min(idx + 1, visible.length - 1);
    if (e.key === 'ArrowUp') idx = Math.max(idx - 1, 0);
    if (e.key === 'Enter' && idx >= 0) return go(visible[idx].dataset.target);
    visible.forEach(li => li.removeAttribute('aria-selected'));
    if (visible[idx]) visible[idx].setAttribute('aria-selected', 'true');
  });
})();

// Footer year
$('#year').textContent = new Date().getFullYear();
