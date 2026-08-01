/* =========================================================
   for Manaar — interactions
   Ambient sky, scroll reveals, and the gallery lightbox.
   ========================================================= */

const SVG_NS = 'http://www.w3.org/2000/svg';

function createStar(container) {
  const star = document.createElement('div');
  star.className = 'star';
  const size = (1 + Math.random() * 2).toFixed(1) + 'px';
  star.style.left = (Math.random() * 100).toFixed(2) + 'vw';
  star.style.top = (Math.random() * 100).toFixed(2) + 'vh';
  star.style.width = size;
  star.style.height = size;
  star.style.animationDuration = (2.2 + Math.random() * 4).toFixed(1) + 's';
  star.style.animationDelay = (-Math.random() * 6).toFixed(1) + 's';
  star.style.setProperty('--o-min', (0.08 + Math.random() * 0.12).toFixed(2));
  star.style.setProperty('--o-max', (0.55 + Math.random() * 0.35).toFixed(2));
  container.appendChild(star);
}

function createPetal(container) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.classList.add('petal-ambient');
  svg.setAttribute('viewBox', '0 0 200 200');
  const use = document.createElementNS(SVG_NS, 'use');
  use.setAttribute('href', '#petal-single');
  svg.appendChild(use);

  const size = 12 + Math.random() * 20;
  const duration = 16 + Math.random() * 14;
  const delay = -(Math.random() * duration);
  const dx = (Math.random() * 220 - 110).toFixed(0) + 'px';
  const rot = (180 + Math.random() * 360).toFixed(0) + 'deg';

  svg.style.left = (Math.random() * 100).toFixed(2) + 'vw';
  svg.style.width = size.toFixed(0) + 'px';
  svg.style.height = size.toFixed(0) + 'px';
  svg.style.animationDuration = duration.toFixed(1) + 's';
  svg.style.animationDelay = delay.toFixed(1) + 's';
  svg.style.setProperty('--dx', dx);
  svg.style.setProperty('--rot', rot);
  svg.style.color = Math.random() > 0.5 ? 'var(--orchid)' : 'var(--periwinkle)';

  container.appendChild(svg);
}

function spawnTrailPetal(x, y) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.classList.add('trail-petal');
  svg.setAttribute('viewBox', '0 0 200 200');
  const use = document.createElementNS(SVG_NS, 'use');
  use.setAttribute('href', '#petal-single');
  svg.appendChild(use);
  svg.style.left = x + 'px';
  svg.style.top = y + 'px';
  svg.style.color = Math.random() > 0.5 ? 'var(--orchid)' : 'var(--periwinkle)';
  document.body.appendChild(svg);
  requestAnimationFrame(() => svg.classList.add('fade'));
  setTimeout(() => svg.remove(), 950);
}

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- ambient night sky ---------- */
  const starField = document.getElementById('ambient-stars');
  const petalField = document.getElementById('ambient-petals');
  if (!reduceMotion && starField && petalField) {
    const isSmall = window.innerWidth < 640;
    const starCount = isSmall ? 30 : 60;
    const petalCount = isSmall ? 6 : 13;
    for (let i = 0; i < starCount; i++) createStar(starField);
    for (let i = 0; i < petalCount; i++) createPetal(petalField);
  }

  /* ---------- cursor petal trail (desktop only) ---------- */
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    let lastSpawn = 0;
    window.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - lastSpawn < 110) return;
      lastSpawn = now;
      spawnTrailPetal(e.clientX, e.clientY);
    });
  }

  /* ---------- scroll reveals ---------- */
  const revealItems = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
  revealItems.forEach((el) => revealObserver.observe(el));

  /* ---------- closing bloom cascade ---------- */
  const closingBlooms = document.getElementById('closing-blooms');
  if (closingBlooms) {
    const bloomObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.closing-bloom').forEach((b) => b.classList.add('animate'));
          bloomObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    bloomObserver.observe(closingBlooms);
  }

  /* ---------- gallery photo loading ---------- */
  document.querySelectorAll('.gallery-photo').forEach((img) => {
    img.addEventListener('load', () => {
      if (img.naturalWidth > 0) img.classList.add('loaded');
    });
  });

  /* ---------- lightbox ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close');
  let lastFocused = null;

  function onKeydown(e) {
    if (e.key === 'Escape') closeLightbox();
  }

  function openLightbox(frame) {
    const idx = frame.getAttribute('data-index');
    const caption = frame.getAttribute('data-caption');

    lightboxImg.classList.remove('loaded');
    lightboxImg.src = `images/photo-${idx}.jpg`;
    lightboxImg.alt = caption;
    lightboxCaption.textContent = caption;

    lastFocused = document.activeElement;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
    document.addEventListener('keydown', onKeydown);
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKeydown);
    if (lastFocused) lastFocused.focus();
  }

  lightboxImg.addEventListener('load', () => {
    if (lightboxImg.naturalWidth > 0) lightboxImg.classList.add('loaded');
  });

  document.querySelectorAll('.gallery-frame').forEach((frame) => {
    frame.addEventListener('click', () => openLightbox(frame));
  });

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
});
