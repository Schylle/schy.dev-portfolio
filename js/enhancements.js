document.addEventListener('DOMContentLoaded', () => {

  // SKILL RADAR CHART
  const radarCnv = document.getElementById('radar-canvas');
  if (radarCnv) {
    const ctx = radarCnv.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const SIZE = 500;
    radarCnv.width  = SIZE * dpr;
    radarCnv.height = SIZE * dpr;
    radarCnv.style.width  = SIZE + 'px';
    radarCnv.style.height = SIZE + 'px';
    ctx.scale(dpr, dpr);

    const cx = SIZE / 2, cy = SIZE / 2;
    const R = 160;       // chart radius
    const LPAD = 52;     // label padding from chart edge

    const AXES = [
      { label: 'Design & Creative', value: 0.88, color: '#a259ff' },
      { label: 'Dev',        value: 0.82, color: '#5bc8ff' },
      { label: 'Cybersecurity',      value: 0.37, color: '#ff6b9d' },
      { label: 'Data / AI',          value: 0.50, color: '#f7df1e' },
      { label: 'Ent.', value: 0.70, color: '#28c841' },
    ];
    const N = AXES.length;
    let animProg = 1;  
    let hoveredIdx = -1;
    let animId;

    function angleOf(i) { return (Math.PI * 2 * i / N) - Math.PI / 2; }

    function drawRadar(progress) {
      ctx.clearRect(0, 0, SIZE, SIZE);

      // rings 
      for (let ring = 1; ring <= 5; ring++) {
        const r = (ring / 5) * R;
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          const a = angleOf(i);
          i === 0 ? ctx.moveTo(cx + Math.cos(a)*r, cy + Math.sin(a)*r)
                  : ctx.lineTo(cx + Math.cos(a)*r, cy + Math.sin(a)*r);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(100,150,255,${0.07 + ring * 0.025})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        // ring % label
        ctx.fillStyle = 'rgba(150,170,220,0.4)';
        ctx.font = `500 9px DM Sans,sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((ring * 20) + '%', cx, cy - r + 1);
      }

      // spoke
      AXES.forEach((ax, i) => {
        const a = angleOf(i);
        const isHov = (i === hoveredIdx);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a)*R, cy + Math.sin(a)*R);
        ctx.strokeStyle = isHov ? ax.color + '55' : 'rgba(100,150,255,0.13)';
        ctx.lineWidth = isHov ? 2 : 1;
        ctx.stroke();
      });

      // Draw a subtle highlight wedge for hovered axis using arc
      if (hoveredIdx >= 0 && progress >= 1) {
        const hax = AXES[hoveredIdx];
        const halfAngle = (Math.PI * 2 / N) / 2;   // half the slice angle
        const aCenter   = angleOf(hoveredIdx);
        const aStart    = aCenter - halfAngle;
        const aEnd      = aCenter + halfAngle;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, R, aStart, aEnd);
        ctx.closePath();
        ctx.fillStyle = hax.color + '20';
        ctx.fill();
        // also highlight the spoke
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(aCenter)*R, cy + Math.sin(aCenter)*R);
        ctx.strokeStyle = hax.color + '80';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // main filled shape
      ctx.beginPath();
      AXES.forEach((ax, i) => {
        const a = angleOf(i);
        const r = ax.value * R * progress;
        i === 0 ? ctx.moveTo(cx + Math.cos(a)*r, cy + Math.sin(a)*r)
                : ctx.lineTo(cx + Math.cos(a)*r, cy + Math.sin(a)*r);
      });
      ctx.closePath();
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      grad.addColorStop(0, 'rgba(91,200,255,0.40)');
      grad.addColorStop(1, 'rgba(162,89,255,0.12)');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = hoveredIdx >= 0 ? 'rgba(91,200,255,0.95)' : 'rgba(91,200,255,0.75)';
      ctx.lineWidth = hoveredIdx >= 0 ? 2.5 : 2;
      ctx.stroke();

      // dots + labels 
      AXES.forEach((ax, i) => {
        const a = angleOf(i);
        const r = ax.value * R * progress;
        const px = cx + Math.cos(a)*r;
        const py = cy + Math.sin(a)*r;
        const isHov = (i === hoveredIdx);
        const dotR = isHov ? 8 : 5;

        // glow halo
        const dg = ctx.createRadialGradient(px, py, 0, px, py, isHov ? 20 : 12);
        dg.addColorStop(0, ax.color + (isHov ? 'cc' : '88'));
        dg.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(px, py, isHov ? 20 : 12, 0, Math.PI*2);
        ctx.fillStyle = dg; ctx.fill();

        // dot
        ctx.beginPath(); ctx.arc(px, py, dotR, 0, Math.PI*2);
        ctx.fillStyle = ax.color;
        if (isHov) { ctx.shadowColor = ax.color; ctx.shadowBlur = 12; }
        ctx.fill();
        ctx.shadowBlur = 0;

        // axis label 
        const lx = cx + Math.cos(a) * (R + LPAD);
        const ly = cy + Math.sin(a) * (R + LPAD);
        const cos = Math.cos(a), sin = Math.sin(a);
        ctx.fillStyle = isHov ? ax.color : ax.color + 'cc';
        ctx.font = `${isHov ? '700' : '600'} ${isHov ? '12' : '11'}px DM Sans,sans-serif`;
        ctx.textAlign = cos > 0.15 ? 'left' : cos < -0.15 ? 'right' : 'center';
        ctx.textBaseline = sin > 0.2 ? 'top' : sin < -0.2 ? 'bottom' : 'middle';
        ctx.fillText(ax.label, lx, ly);
      });
    }

    // animate on scroll into view 
    const radarIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        cancelAnimationFrame(animId);
        animProg = 0;
        const start = performance.now();
        const step = ts => {
          animProg = Math.min((ts - start) / 1200, 1);
          const ease = 1 - Math.pow(1 - animProg, 3);
          drawRadar(ease);
          if (animProg < 1) animId = requestAnimationFrame(step);
          else { animProg = 1; drawRadar(1); }
        };
        animId = requestAnimationFrame(step);
        radarIO.unobserve(e.target);
      });
    }, { threshold: 0.3 });
    radarIO.observe(radarCnv);
    drawRadar(1);

    // legend hover → highlight canvas axis
    const legendItems = document.querySelectorAll('.radar-legend-item');
    legendItems.forEach((item, i) => {
      item.addEventListener('mouseenter', () => {
        hoveredIdx = i;
        drawRadar(animProg);
        item.style.transform = 'translateX(10px)';
        item.style.borderColor = AXES[i].color;
        item.style.boxShadow = `0 0 16px ${AXES[i].color}55`;
      });
      item.addEventListener('mouseleave', () => {
        hoveredIdx = -1;
        drawRadar(animProg);
        item.style.transform = '';
        item.style.borderColor = '';
        item.style.boxShadow = '';
      });
    });

    // canvas mouse move: highlight nearest axis
    radarCnv.addEventListener('mousemove', e => {
      const rect = radarCnv.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (SIZE / rect.width);
      const my = (e.clientY - rect.top)  * (SIZE / rect.height);
      const dx = mx - cx, dy = my - cy;
      if (Math.sqrt(dx*dx + dy*dy) < 20) { hoveredIdx = -1; drawRadar(1); return; }
      // find nearest axis
      let best = -1, bestDist = Infinity;
      AXES.forEach((ax, i) => {
        const a = angleOf(i);
        const px = cx + Math.cos(a)*ax.value*R;
        const py = cy + Math.sin(a)*ax.value*R;
        const d = Math.hypot(mx-px, my-py);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      if (bestDist < 48 && best !== hoveredIdx) {
        hoveredIdx = best;
        // sync legend highlight
        legendItems.forEach((li, i) => {
          li.style.borderColor = i === best ? AXES[i].color : '';
          li.style.boxShadow   = i === best ? `0 0 16px ${AXES[i].color}55` : '';
          li.style.transform   = i === best ? 'translateX(10px)' : '';
        });
        drawRadar(1);
      } else if (bestDist >= 48 && hoveredIdx !== -1) {
        hoveredIdx = -1;
        legendItems.forEach(li => { li.style.borderColor=''; li.style.boxShadow=''; li.style.transform=''; });
        drawRadar(1);
      }
    });
    radarCnv.addEventListener('mouseleave', () => {
      hoveredIdx = -1;
      legendItems.forEach(li => { li.style.borderColor=''; li.style.boxShadow=''; li.style.transform=''; });
      drawRadar(1);
    });
    radarCnv.style.cursor = 'crosshair';
  }

  // NOW LEARNING CARD
  const nlCard = document.getElementById('now-learning-card');
  const nlClose = document.getElementById('nl-close');
  const nlShow  = document.getElementById('now-learning-show');

  if (nlCard && nlClose) {
    // Auto-hide after 8s on home page to be non-intrusive
    const autoHide = setTimeout(() => {
      nlCard.classList.add('hidden-card');
      if (nlShow) nlShow.classList.add('visible');
    }, 8000);

    nlClose.addEventListener('click', () => {
      clearTimeout(autoHide);
      nlCard.classList.add('hidden-card');
      if (nlShow) nlShow.classList.add('visible');
    });

    nlShow && nlShow.addEventListener('click', () => {
      nlCard.classList.remove('hidden-card');
      nlShow.classList.remove('visible');
    });
  }

  // TERMINAL TYPER — animate lines into view
  const terminalBody = document.querySelector('.terminal-body');
  if (terminalBody) {
    const lines = terminalBody.querySelectorAll('.t-line.typed');
    let revealed = false;

    const termIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting || revealed) return;
        revealed = true;
        lines.forEach((line, i) => {
          setTimeout(() => {
            line.classList.add('visible');
          }, i * 180);
        });
      });
    }, { threshold: 0.2 });

    if (terminalBody.closest) termIO.observe(terminalBody);
  }

  // TOOLS WIDGET — hover tooltips already via CSS
  const activeTools = document.querySelectorAll('.tool-chip.active-tool');
  activeTools.forEach((chip, i) => {
    setInterval(() => {
      chip.style.boxShadow = `0 0 20px var(--glow)`;
      setTimeout(() => { chip.style.boxShadow = ''; }, 600);
    }, 3000 + i * 700);
  });

  // TIMELINE — animated dot pulse on scroll
  const timelineItems = document.querySelectorAll('.timeline-item');
  if (timelineItems.length) {
    const tlIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        e.target.style.opacity = e.isIntersecting ? '1' : '0';
        e.target.style.transform = e.isIntersecting ? 'translateX(0)' : 'translateX(-16px)';
      });
    }, { threshold: 0.2 });
    timelineItems.forEach((item, i) => {
      item.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`;
      item.style.opacity = '0';
      item.style.transform = 'translateX(-16px)';
      tlIO.observe(item);
    });
  }

  // MATRIX RAIN  
  const matrixCnv = document.getElementById('matrix-canvas');
  if (matrixCnv) {
    const mCtx = matrixCnv.getContext('2d');
    let mW = matrixCnv.offsetWidth;
    let mH = matrixCnv.offsetHeight;
    const dpr = window.devicePixelRatio || 1;
    matrixCnv.width  = mW * dpr;
    matrixCnv.height = mH * dpr;
    mCtx.scale(dpr, dpr);

    const CHARS  = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF<>/{}[]';
    const FSIZE  = 13;
    const cols   = Math.floor(mW / FSIZE);
    const drops  = Array(cols).fill(1);

    function drawMatrix() {
      mCtx.fillStyle = 'rgba(4, 8, 20, 0.18)';
      mCtx.fillRect(0, 0, mW, mH);
      mCtx.font = `${FSIZE}px 'Courier New', monospace`;
      drops.forEach((y, i) => {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        // head char brighter
        mCtx.fillStyle = '#5bc8ff';
        mCtx.fillText(ch, i * FSIZE, y * FSIZE);
        // body
        mCtx.fillStyle = `rgba(40, 200, 65, ${0.3 + Math.random() * 0.4})`;
        mCtx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], i * FSIZE, (y - 1) * FSIZE);
        if (y * FSIZE > mH && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    }

    // Only run when card is hovered or in view
    let matrixInterval;
    const matrixCard = matrixCnv.closest('.play-card');
    if (matrixCard) {
      matrixCard.addEventListener('mouseenter', () => {
        matrixInterval = setInterval(drawMatrix, 50);
      });
      matrixCard.addEventListener('mouseleave', () => {
        clearInterval(matrixInterval);
        // keep last frame
      });
    }

    // also start on scroll into view
    const mIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !matrixInterval) {
          matrixInterval = setInterval(drawMatrix, 50);
          setTimeout(() => { clearInterval(matrixInterval); matrixInterval = null; }, 3000);
        }
      });
    }, { threshold: 0.5 });
    if (matrixCard) mIO.observe(matrixCard);
  }

  // COLOUR ORB ON WHAT I CREATE — interactive mouse track
  const orbDemo = document.querySelector('.play-orb-demo');
  if (orbDemo) {
    const parent = orbDemo.closest('.play-card-canvas');
    if (parent) {
      parent.addEventListener('mousemove', e => {
        const r  = parent.getBoundingClientRect();
        const x  = ((e.clientX - r.left) / r.width  - 0.5) * 40;
        const y  = ((e.clientY - r.top)  / r.height - 0.5) * 40;
        orbDemo.style.transform = `translate(${x}px, ${y}px) scale(1.15)`;
        const hue = 200 + (e.clientX - r.left) / r.width * 80;
        orbDemo.style.background = `radial-gradient(circle at 35% 35%, oklch(0.72 0.22 ${hue}), oklch(0.45 0.20 ${hue + 40}))`;
        orbDemo.style.boxShadow = `0 0 50px oklch(0.68 0.18 ${hue} / 0.6)`;
      });
      parent.addEventListener('mouseleave', () => {
        orbDemo.style.transform = '';
        orbDemo.style.background = '';
        orbDemo.style.boxShadow = '';
      });
    }
  }

});
