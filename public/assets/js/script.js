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

/* ── BG CANVAS — fixed, full-page, scroll-reactive ── */
class BgCanvas {
  constructor(canvas) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d');
    this.nodes = [];
    this.nodeCount = 28;
    this.maxDist = 220;
    this.lastScrollY = window.scrollY;
    this.running = false;
    this.raf = null;
    this.resize();
    this.init();
    window.addEventListener('resize', () => { this.resize(); this.init(); });
    window.addEventListener('scroll', () => {
      const delta = window.scrollY - this.lastScrollY;
      this.lastScrollY = window.scrollY;
      for (const n of this.nodes) {
        n.vy += delta * 0.009;
      }
    }, { passive: true });
  }

  resize() {
    this.w = this.c.width = window.innerWidth;
    this.h = this.c.height = window.innerHeight;
  }

  init() {
    this.nodes = Array.from({ length: this.nodeCount }, () => ({
      x: Math.random() * this.w,
      y: Math.random() * this.h,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.4 + 0.5,
    }));
  }

  draw() {
    const { ctx, w, h, nodes, maxDist } = this;
    ctx.clearRect(0, 0, w, h);

    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      // wrap-around so particles are always on screen
      if (n.x < -8) n.x = w + 8;
      if (n.x > w + 8) n.x = -8;
      if (n.y < -8) n.y = h + 8;
      if (n.y > h + 8) n.y = -8;
      // friction damps scroll nudge over time
      n.vx *= 0.992;
      n.vy *= 0.992;
      const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      if (spd > 0.7) { n.vx *= 0.7 / spd; n.vy *= 0.7 / spd; }
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,212,255,${(1 - d / maxDist) * 0.9})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    for (const n of nodes) {
      ctx.beginPath();
      ctx.fillStyle = 'rgba(0,212,255,1)';
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

/* ── CURSOR GLOW ── */
function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow || !window.matchMedia('(hover: hover)').matches) return;

  let mx = -999, my = -999, cx = -999, cy = -999, visible = false;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (!visible) { glow.style.opacity = '1'; visible = true; }
  });
  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0'; visible = false;
  });

  const tick = () => {
    cx += (mx - cx) * 0.09;
    cy += (my - cy) * 0.09;
    glow.style.left = cx + 'px';
    glow.style.top  = cy + 'px';
    requestAnimationFrame(tick);
  };
  tick();
}

/* ── MASCOT SINTA ── */
function initMascot() {
  const wrap    = document.getElementById('mascotWrap');
  const bubble  = document.getElementById('mascotBubble');
  const textEl  = document.getElementById('mascotText');
  const closeBtn= document.getElementById('mascotClose');
  const mascot  = document.getElementById('mascot');
  if (!wrap || !bubble || !textEl || !mascot) return;

  const messages = {
    'beranda'    : 'Halo! Selamat datang di Sintesa! 👋',
    'filosofi'   : 'Nama kami punya makna yang dalam 💡',
    'cara-kerja' : 'Prosesnya simpel dan transparan ✅',
    'layanan'    : '7 layanan lengkap untuk bisnis Anda 🛠️',
    'kapabilitas': 'Ini keahlian inti tim kami ✨',
    'kenapa'     : 'Banyak alasan untuk pilih kami 💪',
    'tentang'    : 'Kenalan lebih dekat yuk! 😊',
    'faq'        : 'Ada pertanyaan? Saya bantu! 🤔',
    'merch'      : 'Cek koleksi merchandise branded kami! 🎁',
    'kontak'     : 'Yuk hubungi kami — gratis! 🚀',
  };

  let hideTimer = null;
  let lastSection = null;

  function showBubble(text, ms) {
    textEl.textContent = text;
    bubble.classList.add('show');
    clearTimeout(hideTimer);
    if (ms) hideTimer = setTimeout(() => bubble.classList.remove('show'), ms);
  }

  function hideBubble() {
    clearTimeout(hideTimer);
    bubble.classList.remove('show');
  }

  // Greeting on page load
  setTimeout(() => showBubble(messages['beranda'], 5000), 2000);

  // Change message as user scrolls into each section
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && messages[e.target.id] && e.target.id !== lastSection) {
        lastSection = e.target.id;
        showBubble(messages[e.target.id], 3800);
      }
    });
  }, { threshold: 0.45 });

  document.querySelectorAll('[id]').forEach(el => {
    if (messages[el.id]) obs.observe(el);
  });

  // Click mascot → toggle bubble
  mascot.addEventListener('click', () => {
    if (bubble.classList.contains('show')) {
      hideBubble();
    } else {
      showBubble('Ada yang bisa saya bantu? 😊', 3500);
    }
  });

  // Close button
  closeBtn.addEventListener('click', e => {
    e.stopPropagation();
    hideBubble();
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

/* ── MERCHANDISE TABS ── */
function initMerch() {
  const tabs  = document.querySelectorAll('.merch-tab');
  const cards = document.querySelectorAll('.merch-card');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.cat;
      cards.forEach(card => {
        const match = cat === 'all' || card.dataset.cat === cat;
        card.classList.toggle('hidden', !match);
      });
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
  initCursorGlow();
  initMascot();
  initMerch();

  // Hero canvas — pause when scrolled out of view (performance)
  const heroCanvas = document.getElementById('networkCanvas');
  if (heroCanvas) {
    const heroNet = new NetworkCanvas(heroCanvas);
    heroNet.start();
    const heroObs = new IntersectionObserver(entries => {
      entries.forEach(e => e.isIntersecting ? heroNet.start() : heroNet.stop());
    }, { rootMargin: '200px' });
    heroObs.observe(heroCanvas.closest('section') || heroCanvas);
    document.addEventListener('visibilitychange', () => {
      document.hidden ? heroNet.stop() : heroNet.start();
    });
  }

  // Background canvas — always on, scroll-reactive, skip on reduced-motion
  const bgCanvas = document.getElementById('bgCanvas');
  if (bgCanvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const bg = new BgCanvas(bgCanvas);
    bg.start();
    document.addEventListener('visibilitychange', () => {
      document.hidden ? bg.stop() : bg.start();
    });
  }
});
