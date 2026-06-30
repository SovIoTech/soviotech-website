// -- Theme toggle (persists in localStorage, respects OS preference on first visit) --
(() => {
  const root = document.documentElement;
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const allowed = ['dark', 'light'];
  const initial = allowed.includes(stored) ? stored : (prefersDark ? 'dark' : 'light');
  root.setAttribute('data-theme', initial);
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    // Auto-close mobile menu if it's open
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    if (navLinks && navLinks.classList.contains('open')) {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
})();

// -- Nav scroll effect --
const nav = document.getElementById('nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.classList.toggle('nav--scrolled', y > 60);
  nav.classList.toggle('nav--hidden', y > lastScroll && y > 400);
  lastScroll = y;
}, { passive: true });

// -- Mobile nav toggle --
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');

toggle.addEventListener('click', () => {
  const open = toggle.classList.toggle('open');
  links.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

links.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    toggle.classList.remove('open');
    links.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Tap on the overlay background (not on a link or button) closes the menu
links.addEventListener('click', (e) => {
  if (e.target === links) {
    toggle.classList.remove('open');
    links.classList.remove('open');
    document.body.style.overflow = '';
  }
});
// Esc also closes
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && links.classList.contains('open')) {
    toggle.classList.remove('open');
    links.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// -- Stat counter animation --
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    if (el.dataset.animated) return;
    const target = +el.dataset.count;
    const dur = 1600;
    const start = performance.now();

    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * ease);
      if (p < 1) requestAnimationFrame(tick);
      else el.dataset.animated = '1';
    }
    requestAnimationFrame(tick);
  });
}

// -- Scroll reveal --
const reveals = document.querySelectorAll(
  '.solution-card, .process__step, .team__member, .stack__col, .hero__stat, .oss__card'
);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

reveals.forEach(el => observer.observe(el));

// -- Terminal type-on-scroll --
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function tokenizeHTML(html) {
  const tokens = [];
  let i = 0;
  while (i < html.length) {
    if (html[i] === '<') {
      const end = html.indexOf('>', i);
      tokens.push({ tag: true, value: html.slice(i, end + 1) });
      i = end + 1;
    } else if (html[i] === '&') {
      const end = html.indexOf(';', i);
      if (end > -1 && end - i <= 8) {
        tokens.push({ tag: false, value: html.slice(i, end + 1) });
        i = end + 1;
        continue;
      }
      tokens.push({ tag: false, value: html[i] });
      i++;
    } else {
      tokens.push({ tag: false, value: html[i] });
      i++;
    }
  }
  return tokens;
}

const isMobile = window.matchMedia('(max-width: 820px)').matches;
const terminals = document.querySelectorAll('.project__terminal code');
const terminalState = new WeakMap();

terminals.forEach(code => {
  const original = code.innerHTML;
  terminalState.set(code, { original, tokens: tokenizeHTML(original), typed: false });
  // Mobile / reduced-motion: skip the typewriter entirely (it pegs CPU during scroll)
  if (!reduceMotion && !isMobile) {
    code.innerHTML = '<span class="t-caret">&nbsp;</span>';
  } else {
    terminalState.get(code).typed = true;
  }
});

function typeTerminal(code) {
  const state = terminalState.get(code);
  if (!state || state.typed) return;
  state.typed = true;

  if (reduceMotion) {
    code.innerHTML = state.original;
    return;
  }

  let buffer = '';
  let idx = 0;
  const charDelay = 8;
  const tagFlush = () => {
    while (idx < state.tokens.length && state.tokens[idx].tag) {
      buffer += state.tokens[idx++].value;
    }
  };

  function step() {
    tagFlush();
    if (idx >= state.tokens.length) {
      code.innerHTML = buffer + '<span class="t-caret">&nbsp;</span>';
      return;
    }
    buffer += state.tokens[idx++].value;
    code.innerHTML = buffer + '<span class="t-caret">&nbsp;</span>';
    setTimeout(step, charDelay);
  }
  step();
}

const terminalObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      typeTerminal(entry.target);
      terminalObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4, rootMargin: '0px 0px -10% 0px' });

terminals.forEach(code => terminalObserver.observe(code));

// Observe stats section for counter animation
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounters();
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const statsSection = document.querySelector('.hero__stats');
if (statsSection) statsObserver.observe(statsSection);

// -- Rotating tagline --
const phrases = ['what matters.', 'legacy systems.', 'the hard stuff.', 'entire stacks.', 'field operations.'];
let phraseIdx = 0;
const rotEl = document.getElementById('rotatingText');

function rotateText() {
  rotEl.classList.add('hero__title-accent--out');
  setTimeout(() => {
    phraseIdx = (phraseIdx + 1) % phrases.length;
    rotEl.textContent = phrases[phraseIdx];
    rotEl.classList.remove('hero__title-accent--out');
  }, 400);
}

setInterval(rotateText, 3000);

// -- Magnetic CTAs --
if (!reduceMotion) {
  document.querySelectorAll('.btn--magnetic').forEach(btn => {
    const strength = 0.25;
    const cap = 8;
    btn.addEventListener('pointermove', (e) => {
      const rect = btn.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width / 2) * strength;
      const dy = (e.clientY - rect.top - rect.height / 2) * strength;
      const tx = Math.max(-cap, Math.min(cap, dx));
      const ty = Math.max(-cap, Math.min(cap, dy));
      btn.style.transform = `translate(${tx}px, ${ty}px)`;
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.transform = '';
    });
  });
}

// -- Rolodex carousel — scroll-driven 3D stack --
(() => {
  const rail = document.querySelector('.stack-rail__cards');
  const stage = document.querySelector('.stack-stage');
  const cards = [...document.querySelectorAll('.stack-card')];
  const title = document.getElementById('stackTitle');
  if (!rail || !stage || !cards.length) return;

  const dateEl = title && title.querySelector('.stack-rail__date');
  const nameEl = title && title.querySelector('.stack-rail__name');

  const N = cards.length;
  let lastActive = -1;
  let raf = 0;

  function update() {
    const railRect = rail.getBoundingClientRect();
    const vh = window.innerHeight;
    // total scrollable distance inside the rail (rail height minus 1 sticky viewport)
    const driven = Math.max(1, rail.offsetHeight - vh);
    // how far we've scrolled past the rail top
    const scrolled = Math.min(Math.max(-railRect.top, 0), driven);
    const progress = scrolled / driven;            // 0..1 across whole carousel
    const activeFloat = progress * (N - 1);        // 0..N-1
    const active = Math.round(activeFloat);

    const mobile = window.innerWidth <= 820;
    cards.forEach((card, i) => {
      const d = i - activeFloat;
      const ad = Math.abs(d);
      if (mobile) {
        // Cheap 2D transform only — no perspective, no rotateX, no translateZ
        const ty = d * 70;
        const sc = Math.max(0.78, 1 - ad * 0.08);
        const op = ad < 0.5 ? 1 : (ad > 2 ? 0 : Math.max(0, 1 - Math.pow((ad - 0.5) / 1.7, 1.6)));
        card.style.transform = `translate(-50%, calc(-50% + ${ty}px)) scale(${sc})`;
        card.style.opacity = op.toFixed(3);
      } else {
        const ty = d * 60;
        const tz = -ad * 140;
        const rx = d * 10;
        const sc = Math.max(0.62, 1 - ad * 0.11);
        const op = ad < 0.5 ? 1 : (ad > 2.6 ? 0 : Math.max(0, 1 - Math.pow((ad - 0.5) / 2.3, 1.6)));
        card.style.transform =
          `translate(-50%, calc(-50% + ${ty}px)) translateZ(${tz}px) rotateX(${rx}deg) scale(${sc})`;
        card.style.opacity = op.toFixed(3);
      }
      card.style.zIndex = String(100 - Math.round(ad * 10));
      card.style.pointerEvents = ad < 0.5 ? 'auto' : 'none';
      card.classList.toggle('is-active', i === active);
    });

    if (active !== lastActive && title && dateEl && nameEl) {
      const c = cards[active];
      title.classList.add('swapping');
      setTimeout(() => {
        dateEl.textContent = c.dataset.date || '';
        nameEl.textContent = c.dataset.name || '';
        title.classList.remove('swapping');
      }, 180);
      lastActive = active;
    }
  }

  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = 0; update(); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

// -- Anchor scroll — instant jump (skip the long carousel scroll) --
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  });
});

document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
  a.addEventListener('click', e => { e.stopPropagation(); });
});
