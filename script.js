/* Lumen Air — interactions */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- nav + scroll progress ---------- */
  const nav = document.getElementById('nav');
  const progress = document.getElementById('progress');
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle('scrolled', y > 40);
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal:not(.hero-text .reveal)');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach((el) => io.observe(el));

  /* ---------- count-up numbers ---------- */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const dur = 1600;
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = (target * eased).toFixed(decimals);
        if (p < 1) requestAnimationFrame(tick);
      };
      reduce ? (el.textContent = target.toFixed(decimals)) : requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach((el) => countIO.observe(el));

  /* ---------- hero parallax (mouse) ---------- */
  const stage = document.getElementById('stage');
  if (stage && !reduce) {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      stage.style.transform = `translate(${x * 14}px, ${y * 10}px) rotate(${x * 2}deg)`;
    });
  }

  /* ---------- card spotlight + tilt ---------- */
  document.querySelectorAll('.tilt').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', `${px * 100}%`);
      card.style.setProperty('--my', `${py * 100}%`);
      if (!reduce && card.classList.contains('in')) {
        card.style.transform = `perspective(800px) rotateX(${(0.5 - py) * 8}deg) rotateY(${(px - 0.5) * 8}deg) translateY(-4px)`;
      }
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  /* ---------- ANC demo ---------- */
  const wave = document.getElementById('wave');
  const panel = wave.closest('.anc-panel');
  const sw = document.getElementById('ancSwitch');
  const stateEl = document.getElementById('ancState');
  const dbEl = document.getElementById('ancDb');
  const BARS = 56;
  for (let i = 0; i < BARS; i++) wave.appendChild(document.createElement('span'));
  const bars = [...wave.children];

  let anc = false;
  let level = 1;          // current amplitude (animated)
  let dbShown = 72;

  sw.addEventListener('click', () => {
    anc = !anc;
    sw.setAttribute('aria-checked', anc);
    panel.classList.toggle('on', anc);
    stateEl.textContent = anc ? 'On · Adaptive ANC' : 'Off · Ambient noise';
  });

  let t = 0;
  const loop = () => {
    t += 0.045;
    const targetLevel = anc ? 0.07 : 1;
    level += (targetLevel - level) * 0.06;
    bars.forEach((b, i) => {
      const n = Math.sin(t * 1.7 + i * 0.55) * 0.5 + Math.sin(t * 2.9 + i * 1.3) * 0.35 + Math.sin(t * 0.8 + i * 0.2) * 0.25;
      const h = 8 + Math.abs(n) * 92 * level + (anc ? 1.5 : 0);
      b.style.height = h + '%';
    });
    const targetDb = anc ? 24 : 72;
    dbShown += (targetDb - dbShown) * 0.05;
    dbEl.textContent = Math.round(dbShown);
    requestAnimationFrame(loop);
  };
  reduce ? (dbEl.textContent = '72') : loop();

  /* ---------- colour picker + case lid ---------- */
  const names = {
    midnight: 'Midnight — deep, matte, quiet.',
    pearl: 'Pearl — bright, soft-touch, clean.',
    coral: 'Coral — warm and impossible to lose.',
    sage: 'Sage — calm, natural, easy on the eyes.'
  };
  const colorName = document.getElementById('colorName');
  document.querySelectorAll('.sw').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sw').forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      document.body.dataset.color = btn.dataset.color;
      colorName.textContent = names[btn.dataset.color];
    });
  });

  const caseWrap = document.getElementById('caseWrap');
  new IntersectionObserver((entries) => {
    entries.forEach((e) => caseWrap.classList.toggle('open', e.isIntersecting));
  }, { threshold: 0.5 }).observe(caseWrap);
  caseWrap.addEventListener('click', () => caseWrap.classList.toggle('open'));
})();