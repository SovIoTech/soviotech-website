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
  '.solution-card, .project, .process__step, .process__connector, .team__member, .stack__col, .hero__stat, .oss__card'
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

const terminals = document.querySelectorAll('.project__terminal code');
const terminalState = new WeakMap();

terminals.forEach(code => {
  const original = code.innerHTML;
  terminalState.set(code, { original, tokens: tokenizeHTML(original), typed: false });
  if (!reduceMotion) {
    code.innerHTML = '<span class="t-caret">&nbsp;</span>';
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

// -- Smooth scroll --
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
