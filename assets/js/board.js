(() => {
  const $ = s => document.querySelector(s);
  const vp = $('#vp'), world = $('#world'), svg = $('#links');
  const frames = [...document.querySelectorAll('.frame')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MIN = 0.08, MAX = 2.5;
  const KEY = 'wl-board-notes-v1';

  let x = 0, y = 0, k = 1;
  const apply = () => {
    world.style.transform = `translate(${x}px, ${y}px) scale(${k})`;
    const g = 28 * k;
    vp.style.setProperty('--g', (g < 10 ? g * 4 : g) + 'px');
    vp.style.setProperty('--gx', x + 'px');
    vp.style.setProperty('--gy', y + 'px');
    $('#zPct').textContent = Math.round(k * 100) + ' %';
  };

  /* Zoom around a screen point */
  const zoomAt = (nk, cx, cy) => {
    nk = Math.min(MAX, Math.max(MIN, nk));
    x = cx - (cx - x) * (nk / k);
    y = cy - (cy - y) * (nk / k);
    k = nk; apply();
  };

  /* Animated camera move */
  let anim = null;
  const fly = (tx, ty, tk, ms = 650) => {
    cancelAnimationFrame(anim);
    if (reduce) { x = tx; y = ty; k = tk; apply(); return; }
    const sx = x, sy = y, sk = k, t0 = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 4);
    const step = now => {
      const t = Math.min(1, (now - t0) / ms), e = ease(t);
      k = sk + (tk - sk) * e; x = sx + (tx - sx) * e; y = sy + (ty - sy) * e; apply();
      if (t < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  };
  const fitRect = (r, pad = 60) => {
    const W = innerWidth, H = innerHeight;
    const left = panelOpen() && W > 900 ? 260 : 0;
    const top = 80, bottom = 70;
    const tk = Math.min(MAX, Math.max(MIN, Math.min((W - left - pad * 2) / r.w, (H - top - bottom - pad) / r.h)));
    const tx = left + (W - left - r.w * tk) / 2 - r.x * tk;
    const ty = top + (H - top - bottom - r.h * tk) / 2 - r.y * tk;
    return [tx, ty, tk];
  };
  const frameRect = f => ({ x: f.offsetLeft, y: f.offsetTop - 50, w: f.offsetWidth, h: f.offsetHeight + 50 });
  const titleRect = () => [...document.querySelectorAll('.lane__title')].map(t => ({ x: t.offsetLeft, y: t.offsetTop, w: t.offsetWidth, h: t.offsetHeight }));
  const allRect = () => {
    const rs = frames.map(frameRect).concat(titleRect());
    const x0 = Math.min(...rs.map(r => r.x)), y0 = Math.min(...rs.map(r => r.y));
    const x1 = Math.max(...rs.map(r => r.x + r.w)), y1 = Math.max(...rs.map(r => r.y + r.h));
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  };
  const fitAll = (animate = true) => { const [a, b, c] = fitRect(allRect(), 40); animate ? fly(a, b, c) : (x = a, y = b, k = c, apply()); setCurrent(-1); };
  const goFrame = i => { const [a, b, c] = fitRect(frameRect(frames[i]), 30); fly(a, b, c); setCurrent(i); };

  /* Frames panel, grouped by lane */
  const list = $('#frameList');
  const lanes = [...document.querySelectorAll('.lane')];
  lanes.forEach(lane => {
    const g = document.createElement('li');
    g.className = 'panel__group';
    g.innerHTML = `<p>${lane.dataset.lane}</p><ol></ol>`;
    lane.querySelectorAll('.frame').forEach(f => {
      const i = frames.indexOf(f);
      const li = document.createElement('li');
      li.innerHTML = `<button type="button" data-i="${i}">${f.dataset.title}</button>`;
      li.firstChild.addEventListener('click', () => goFrame(i));
      g.querySelector('ol').appendChild(li);
      f.querySelector('.frame__label').addEventListener('click', () => goFrame(i));
    });
    list.appendChild(g);
  });
  let current = -1;
  function setCurrent(i) {
    current = i;
    list.querySelectorAll('button').forEach(b => b.setAttribute('aria-current', String(+b.dataset.i === i)));
    const cur = list.querySelector('[aria-current="true"]'); if (cur) cur.scrollIntoView({ block: 'nearest' });
    $('#pLabel').textContent = i >= 0 ? `${i + 1} / ${frames.length} · ${frames[i].dataset.title}` : 'Přehled';
  }
  const panel = $('#panel');
  const panelOpen = () => !panel.classList.contains('is-hidden');
  $('#panelToggle').addEventListener('click', e => {
    panel.classList.toggle('is-hidden');
    e.currentTarget.setAttribute('aria-expanded', String(panelOpen()));
  });
  if (innerWidth < 720) { panel.classList.add('is-hidden'); $('#panelToggle').setAttribute('aria-expanded', 'false'); }

  /* Zoom controls */
  const center = () => [innerWidth / 2, innerHeight / 2];
  $('#zIn').addEventListener('click', () => zoomAt(k * 1.25, ...center()));
  $('#zOut').addEventListener('click', () => zoomAt(k / 1.25, ...center()));
  $('#zFit').addEventListener('click', () => fitAll());
  $('#zPct').addEventListener('click', () => fitAll());

  vp.addEventListener('wheel', e => {
    e.preventDefault();
    // Mouse wheel and pinch zoom; fine-grained trackpad scrolling pans.
    const isZoom = e.ctrlKey || e.deltaMode === 1 || (e.deltaX === 0 && Math.abs(e.deltaY) >= 40 && Number.isInteger(e.deltaY));
    if (isZoom) {
      zoomAt(k * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), e.clientX, e.clientY);
    } else { x -= e.deltaX; y -= e.deltaY; apply(); } // trackpad two-finger pan
  }, { passive: false });

  /* Pan + pinch anywhere on the canvas (nothing on the board can be moved) */
  const pts = new Map();
  let pan = null, pinch = null, panMoved = 0;
  // A drag that started on a link pans the board and must not open the link.
  // Links are opened by us on pointerup: a small wobble during the click must still open them,
  // a real drag must not. The browser's own click on links is always suppressed to avoid doubles.
  let downLink = null;
  vp.addEventListener('click', e => {
    if (e.detail === 0) return; // keyboard activation: let the browser follow the link
    if (e.target.closest('a') || downLink) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  const openLink = a => {
    const href = a.href;
    if (a.target === '_blank') { const w = window.open(href, '_blank'); if (w) w.opener = null; else location.href = href; }
    else location.href = href;
  };
  vp.addEventListener('dragstart', e => e.preventDefault());
  try { localStorage.removeItem(KEY); } catch {}

  vp.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    panMoved = 0;
    downLink = e.button === 0 ? e.target.closest('a') : null;
    // Capture only once the pointer really drags, so a plain click still reaches links.
    if (e.pointerType === 'touch') vp.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, [e.clientX, e.clientY]);
    cancelAnimationFrame(anim);
    if (pts.size === 2) {
      pan = null;
      const [a, b] = [...pts.values()];
      pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), k, cx: (a[0] + b[0]) / 2, cy: (a[1] + b[1]) / 2, x, y };
      return;
    }
    pan = { sx: e.clientX, sy: e.clientY, x, y };
    vp.classList.add('is-panning');
  });
  vp.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pinch && pts.size === 2) {
      const [a, b] = [...pts.values()];
      const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      const cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2;
      const nk = Math.min(MAX, Math.max(MIN, pinch.k * d / pinch.d));
      x = cx - (pinch.cx - pinch.x) * (nk / pinch.k);
      y = cy - (pinch.cy - pinch.y) * (nk / pinch.k);
      k = nk; apply();
    } else if (pan) {
      x = pan.x + e.clientX - pan.sx; y = pan.y + e.clientY - pan.sy; apply();
      panMoved = Math.max(panMoved, Math.hypot(e.clientX - pan.sx, e.clientY - pan.sy));
      if (panMoved > 10 && !vp.hasPointerCapture(e.pointerId)) vp.setPointerCapture(e.pointerId);
    }
  });
  const end = e => {
    if (e.type === 'pointerup' && downLink && panMoved <= 10) openLink(downLink);
    if (e.type === 'pointerup') setTimeout(() => (downLink = null), 0); else downLink = null;
    pts.delete(e.pointerId);
    if (pts.size < 2) pinch = null;
    if (!pts.size) { pan = null; vp.classList.remove('is-panning'); }
  };
  vp.addEventListener('pointerup', end);
  vp.addEventListener('pointercancel', end);

  /* Connectors between frames / elements (world coordinates) */
  const LINKS = [
    { from: 'h1', fs: 'r', to: 'h2', ts: 'l', label: 'Měříme v dashboardu' },
  ];
  const wrect = el => {
    const r = el.getBoundingClientRect();
    return { x: (r.left - x) / k, y: (r.top - y) / k, w: r.width / k, h: r.height / k };
  };
  const anchor = (r, s) => s === 'r' ? [r.x + r.w, r.y + r.h / 2] : s === 'l' ? [r.x, r.y + r.h / 2] : s === 't' ? [r.x + r.w / 2, r.y] : [r.x + r.w / 2, r.y + r.h];
  const dir = s => s === 'r' ? [1, 0] : s === 'l' ? [-1, 0] : s === 't' ? [0, -1] : [0, 1];
  function drawLinks() {
    let out = '';
    LINKS.forEach(l => {
      const a = document.getElementById(l.from), b = document.getElementById(l.to);
      if (!a || !b) return;
      const [x1, y1] = anchor(wrect(a), l.fs), [x2, y2] = anchor(wrect(b), l.ts);
      const [d1x, d1y] = dir(l.fs), [d2x, d2y] = dir(l.ts);
      const c = Math.max(60, Math.hypot(x2 - x1, y2 - y1) * 0.4);
      const p1 = [x1 + d1x * 8, y1 + d1y * 8], p2 = [x2 + d2x * 16, y2 + d2y * 16];
      const path = `M${p1} C${p1[0] + d1x * c},${p1[1] + d1y * c} ${p2[0] + d2x * c},${p2[1] + d2y * c} ${p2}`;
      // arrow head pointing into the target
      const ang = Math.atan2(-d2y, -d2x);
      const hx = x2 + d2x * 4, hy = y2 + d2y * 4;
      const head = [[hx, hy], [hx - 16 * Math.cos(ang - .45), hy - 16 * Math.sin(ang - .45)], [hx - 16 * Math.cos(ang + .45), hy - 16 * Math.sin(ang + .45)]];
      // label at bezier midpoint
      const mx = .125 * p1[0] + .375 * (p1[0] + d1x * c) + .375 * (p2[0] + d2x * c) + .125 * p2[0];
      const my = .125 * p1[1] + .375 * (p1[1] + d1y * c) + .375 * (p2[1] + d2y * c) + .125 * p2[1];
      const tw = l.label.length * 9.2 + 20;
      out += `<path d="${path}"/><polygon class="head" points="${head.map(p => p.join(',')).join(' ')}"/>
        <rect class="lbl-bg" x="${mx - tw / 2}" y="${my - 16}" width="${tw}" height="30" rx="6"/>
        <text x="${mx}" y="${my + 6}" text-anchor="middle">${l.label}</text>`;
    });
    svg.innerHTML = out;
  }

  /* Presentation mode */
  const pnav = $('#pnav');
  const present = on => {
    document.body.classList.toggle('presenting', on);
    pnav.hidden = !on;
    if (on) goFrame(current < 0 ? 0 : current);
    else fitAll();
  };
  $('#present').addEventListener('click', () => present(true));
  $('#pExit').addEventListener('click', () => present(false));
  $('#pNext').addEventListener('click', () => goFrame(Math.min(frames.length - 1, current + 1)));
  $('#pPrev').addEventListener('click', () => current <= 0 ? fitAll() : goFrame(current - 1));
  addEventListener('keydown', e => {
    if (e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && document.body.classList.contains('presenting'))) { e.preventDefault(); goFrame(Math.min(frames.length - 1, current + 1)); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); current <= 0 ? fitAll() : goFrame(current - 1); }
    else if (e.key === 'Escape' && document.body.classList.contains('presenting')) present(false);
    else if (e.key === '0') fitAll();
    else if (e.key === '+' || e.key === '=') zoomAt(k * 1.25, ...center());
    else if (e.key === '-') zoomAt(k / 1.25, ...center());
  });

  /* Layout: one lane per row, small frames side by side, lane title on the left above */
  const GAP = 90, LANE_GAP = 230;
  const layout = () => {
    let top = 0;
    lanes.forEach(lane => {
      const fs = [...lane.querySelectorAll('.frame')];
      fs.forEach(f => (f.style.minHeight = ''));
      let t = lane.querySelector('.lane__title');
      if (!t) { t = document.createElement('h2'); t.className = 'lane__title'; t.textContent = lane.dataset.lane; lane.prepend(t); }
      t.style.left = '0px'; t.style.top = top + 'px';
      top += 130;
      const h = Math.max(...fs.map(f => f.offsetHeight));
      let left = 0;
      fs.forEach(f => { f.style.left = left + 'px'; f.style.top = top + 'px'; left += f.offsetWidth + GAP; });
      top += h + LANE_GAP;
    });
  };

  /* Start: whole board in view */
  const start = () => {
    x = 0; y = 0; k = 1; apply();
    layout();
    const all = allRect();
    svg.setAttribute('width', all.x + all.w + 400); svg.setAttribute('height', all.y + all.h + 400);
    drawLinks();
    const hf = location.hash && document.getElementById(location.hash.slice(1));
    if (hf && hf.classList.contains('frame')) { fitAll(false); goFrame(frames.indexOf(hf)); } else fitAll(false);
  };
  (document.fonts?.ready || Promise.resolve()).then(() => {
    if (document.readyState === 'complete') start(); else addEventListener('load', start, { once: true });
  });
  addEventListener('resize', () => { if (current >= 0) goFrame(current); else fitAll(false); });
})();
