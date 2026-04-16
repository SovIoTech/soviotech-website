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
  '.solution-card, .project, .process__step, .team__member, .stack__col, .hero__stat'
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
