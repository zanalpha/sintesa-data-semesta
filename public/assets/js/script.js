/* ================================================
   PT Sintesa Data Semesta — script.js
   ================================================ */

/* ── NETWORK CANVAS ANIMATION ── */
class NetworkCanvas {
  constructor(canvas) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d');
    this.nodes = [];
    this.mouse = { x: null, y: null };
    this.nodeCount = 80;
    this.maxDist = 140;
    this.running = false;
    this.raf = null;
    this.resize();
    this.init();
    this.bindEvents();
  }

  resize() {
    this.w = this.c.width = this.c.offsetWidth;
    this.h = this.c.height = this.c.offsetHeight;
  }

  init() {
    this.nodes = Array.from({ length: this.nodeCount }, () => ({
      x: Math.random() * this.w,
      y: Math.random() * this.h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.6,
    }));
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.init();
    });
    this.c.addEventListener('mousemove', e => {
      const rect = this.c.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });
    this.c.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }

  draw() {
    const { ctx, w, h, nodes, maxDist, mouse } = this;
    ctx.clearRect(0, 0, w, h);

    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;

      if (mouse.x !== null) {
        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 90) {
          const f = (90 - d) / 90;
          n.vx += dx / d * f * 0.06;
          n.vy += dy / d * f * 0.06;
        }
      }

      const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      if (spd > 1.2) { n.vx *= 1.2 / spd; n.vy *= 1.2 / spd; }
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) {
          const a = (1 - d / maxDist) * 0.35;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,212,255,${a})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    for (const n of nodes) {
      ctx.beginPath();
      ctx.fillStyle = 'rgba(0,212,255,0.7)';
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  start() {
    if (this.running) return;
    this.running = true;
    const loop = () => {
      if (!this.running) return;
      this.draw();
      this.raf = requestAnimationFrame(loop);
    };
    loop();
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }
}

/* ── COUNTER ANIMATION ── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1400;
  const start = performance.now();
  const ease = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  const tick = now => {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(ease(p) * target);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  };
  requestAnimationFrame(tick);
}

/* ── TICKER CLONE (infinite scroll) ── */
function initTicker() {
  const track = document.querySelector('.ticker-track');
  if (!track) return;
  const clone = track.cloneNode(true);
  track.parentElement.appendChild(clone);
}

/* ── NAVBAR ── */
function initNav() {
  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.hamburger');
  const links = document.querySelector('.nav-links');

  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  if (hamburger && links) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('active');
      links.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('active');
        links.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  const sections = document.querySelectorAll('section[id]');
  const navAs = document.querySelectorAll('.nav-links a[href^="#"]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navAs.forEach(a => a.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => obs.observe(s));
}

/* ── SCROLL REVEAL ── */
function initReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ── COUNTER OBSERVER ── */
function initCounters() {
  const counters = document.querySelectorAll('.metric-val[data-target]');
  if (!counters.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}

/* ── CONTACT FORM ── */
function initForm() {
  const form = document.getElementById('contactForm');
  const ok = document.getElementById('formOk');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');
    btn.disabled = true;
    btn.textContent = 'Mengirim…';

    const data = Object.fromEntries(new FormData(form).entries());
    const subject = encodeURIComponent('[Sintesa] Pesan dari ' + (data.name || 'Website'));
    const body = encodeURIComponent(
      'Nama: ' + data.name + '\nEmail: ' + data.email +
      '\nLayanan: ' + data.service + '\n\nPesan:\n' + data.message
    );
    setTimeout(() => {
      window.location.href = 'mailto:sintesadatasemesta@gmail.com?subject=' + subject + '&body=' + body;
      form.reset();
      btn.disabled = false;
      btn.textContent = 'Kirim Pesan';
      if (ok) {
        ok.classList.add('show');
        setTimeout(() => ok.classList.remove('show'), 5000);
      }
    }, 600);
  });
}

/* ── PRELOADER ── */
function initPreloader() {
  const p = document.getElementById('preloader');
  if (!p) return;
  const hide = () => p.classList.add('hidden');
  if (document.readyState === 'complete') { setTimeout(hide, 200); return; }
  window.addEventListener('load', () => setTimeout(hide, 250));
  setTimeout(hide, 3000); // failsafe
}

/* ── COOKIE CONSENT ── */
function initCookieConsent() {
  const bar = document.getElementById('cookieBar');
  if (!bar || localStorage.getItem('sintesa_cookie')) return;
  setTimeout(() => bar.classList.add('show'), 2500);
  document.getElementById('cookieAccept').addEventListener('click', () => {
    localStorage.setItem('sintesa_cookie', 'accepted');
    bar.classList.remove('show');
  });
  document.getElementById('cookieDecline').addEventListener('click', () => {
    localStorage.setItem('sintesa_cookie', 'declined');
    bar.classList.remove('show');
  });
}

/* ── SCROLL PROGRESS ── */
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
  }, { passive: true });
}

/* ── BACK TO TOP ── */
function initBackTop() {
  const btn = document.getElementById('backTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── FAQ ACCORDION ── */
function initFAQ() {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initReveal();
  initCounters();
  initTicker();
  initForm();
  initScrollProgress();
  initBackTop();
  initFAQ();
  initPreloader();
  initCookieConsent();

  const canvas = document.getElementById('networkCanvas');
  if (canvas) {
    const net = new NetworkCanvas(canvas);
    net.start();
    document.addEventListener('visibilitychange', () => {
      document.hidden ? net.stop() : net.start();
    });
  }
});
