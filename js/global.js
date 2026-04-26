// THEME 
(function () {
  const stored = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', stored);
})();

document.addEventListener('DOMContentLoaded', () => {

  // THEME TOGGLE
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    const updateIcon = () => {
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      toggle.textContent = isDark ? '☀️' : '🌙';
    };
    updateIcon();
    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateIcon();
    });
  }

  // CURSOR 
  const orb   = document.getElementById('cursor-orb');
  const trail = document.getElementById('cursor-trail');
  if (orb && window.matchMedia('(pointer: fine)').matches) {
    let mx = 0, my = 0, tx = 0, ty = 0;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      orb.style.left = mx + 'px';
      orb.style.top  = my + 'px';
    });
    const animTrail = () => {
      tx += (mx - tx) * 0.14;
      ty += (my - ty) * 0.14;
      if (trail) { trail.style.left = tx + 'px'; trail.style.top = ty + 'px'; }
      requestAnimationFrame(animTrail);
    };
    animTrail();
    const hoverSel = [
      '[data-cursor="hover"]','a','button','input','textarea','select',
      '.filter-btn','.project-link','.social-btn','.cert-card',
      '.craft-card','.tilt-card','.project-card','.process-btn','.laptop-wrap'
    ].join(',');
    document.querySelectorAll(hoverSel).forEach(el => {
      el.addEventListener('mouseenter', () => orb.classList.add('hover'));
      el.addEventListener('mouseleave', () => orb.classList.remove('hover'));
    });
  }

  // STARFIELD 
  const starfield = document.getElementById('starfield');
  if (starfield) {
    for (let i = 0; i < 140; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      const size = Math.random() * 2.2 + 0.4;
      s.style.cssText = `
        left:${Math.random()*100}%;top:${Math.random()*100}%;
        width:${size}px;height:${size}px;
        --dur:${2+Math.random()*5}s;--delay:${-Math.random()*8}s;
        --from:${0.05+Math.random()*0.15};--to:${0.4+Math.random()*0.6};`;
      starfield.appendChild(s);
    }
  }

  // SCROLL REVEAL (re-triggers on scroll up too)
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('in-view');
        else                   e.target.classList.remove('in-view');
      });
    }, { threshold: 0.12 });
    reveals.forEach(el => io.observe(el));
  }

  // PARALLAX
  const parallaxEls = document.querySelectorAll('[data-speed]');
  if (parallaxEls.length) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      parallaxEls.forEach(el => {
        const spd = parseFloat(el.dataset.speed) || 0.3;
        el.style.transform = `translateY(${y * spd}px)`;
      });
    }, { passive: true });
  }

  // NAV SCROLL CLASS
  const nav = document.querySelector('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  // MOBILE NAV
  const navToggle = document.getElementById('nav-toggle');
  const navLinks  = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      navToggle.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
    });
  }

  // ACTIVE NAV LINK
  const currentFile = (window.location.pathname.split('/').pop() || 'index.html').replace(/\?.*$/, '');

  document.querySelectorAll('.nav-links a').forEach(a => {
    const hrefFile = (a.getAttribute('href') || '').split('/').pop() || 'index.html';
    const isActive = (hrefFile === currentFile) ||
                     (hrefFile === 'index.html' && currentFile === '');
    if (isActive) a.classList.add('active');
    else          a.classList.remove('active');
  });

  // PAGE TRANSITION 
  const overlay = document.getElementById('page-transition');
  document.querySelectorAll('.nav-links a[href*="index.html"], .nav-links a[href="./"]').forEach(a => {
    if (currentFile === 'index.html' || currentFile === '') {
      // Already on home page — skip intro, scroll to home content
      a.addEventListener('click', e => {
        e.preventDefault();
        const intro = document.getElementById('intro-screen');
        const homePage = document.getElementById('home-page');
        if (intro) { intro.style.display = 'none'; }
        if (homePage) {
          homePage.style.visibility = 'visible';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }
  });

  if (overlay) {
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('http') || a.target === '_blank') return;

      a.addEventListener('click', e => {
        const hrefFile = href.split('/').pop() || 'index.html';
        if ((hrefFile === 'index.html' || hrefFile === '') && (currentFile === 'index.html' || currentFile === '')) return;

        e.preventDefault();
        overlay.classList.add('visible');
        setTimeout(() => { window.location.href = href; }, 280);
      });
    });
    window.addEventListener('pageshow', () => overlay.classList.remove('visible'));
  }

  // TILT CARDS
  document.querySelectorAll('.tilt-card, .craft-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = (e.clientX - r.left) / r.width;
      const y  = (e.clientY - r.top)  / r.height;
      card.style.transform = `perspective(800px) rotateX(${(y-.5)*-10}deg) rotateY(${(x-.5)*10}deg) translateY(-6px)`;
      card.style.setProperty('--mx', (x*100)+'%');
      card.style.setProperty('--my', (y*100)+'%');
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  // SKILL BARS
  const bars = document.querySelectorAll('.skill-bar-fill');
  if (bars.length) {
    const barIO = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('animate'); });
    }, { threshold: 0.5 });
    bars.forEach(b => barIO.observe(b));
  }

  // ANIMATED COUNTER (hero stats)
  const statNums = document.querySelectorAll('.hero-stat-n');
  if (statNums.length) {
    const cIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el  = e.target;
        const raw = el.textContent.trim();
        const num = parseInt(raw);
        if (isNaN(num)) return;
        const suffix = raw.replace(String(num), '');
        let startTime = null;
        const step = ts => {
          if (!startTime) startTime = ts;
          const prog = Math.min((ts - startTime) / 1200, 1);
          const ease = 1 - Math.pow(1 - prog, 3);
          el.textContent = Math.round(ease * num) + suffix;
          if (prog < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        cIO.unobserve(el);
      });
    }, { threshold: 0.8 });
    statNums.forEach(n => cIO.observe(n));
  }

});
