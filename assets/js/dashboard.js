(() => {
  const { months, monthLabel, brands } = window.WL;
  const $ = s => document.querySelector(s);
  const nf = new Intl.NumberFormat('cs-CZ');
  const nf1 = new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  const eur = v => v >= 1e6 ? nf1.format(v / 1e6) + ' mil. €' : v >= 1e4 ? nf.format(Math.round(v / 1000)) + ' tis. €' : nf.format(Math.round(v)) + ' €';
  const eurFull = v => nf.format(Math.round(v)) + ' €';
  const pct = (v, d = 1) => new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: d, minimumFractionDigits: d }).format(v) + ' %';

  const PERIODS = {
    '12m': { idx: [0,1,2,3,4,5,6,7,8,9,10,11], prev: null, text: 'Listopad 2025 – říjen 2026', vs: 'proti předchozím 12 měsícům' },
    'q':   { idx: [8,9,10], prev: [5,6,7], text: 'Q3 2026 (červenec – září)', vs: 'proti Q2 2026' },
    'm':   { idx: [11], prev: [10], text: 'Říjen 2026', vs: 'proti září 2026' },
  };
  const MARKETS = ['CZ','SK','PL','DE','AT','HU','RO','BG','FR','ES','NL','UK'];
  const MARKET_NAMES = { CZ:'Česko', SK:'Slovensko', PL:'Polsko', DE:'Německo', AT:'Rakousko', HU:'Maďarsko', RO:'Rumunsko', BG:'Bulharsko', FR:'Francie', ES:'Španělsko', NL:'Nizozemsko', UK:'Velká Británie' };

  const state = { period: '12m', brand: 'all', market: 'all', table: false };

  /* Filters */
  const bs = $('#brandSel');
  brands.forEach(b => bs.add(new Option(b.name, b.id)));
  const ms = $('#marketSel');
  MARKETS.forEach(m => ms.add(new Option(`${m} – ${MARKET_NAMES[m]}`, m)));
  document.querySelectorAll('#period button').forEach(btn => btn.addEventListener('click', () => {
    state.period = btn.dataset.p;
    document.querySelectorAll('#period button').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    render();
  }));
  bs.addEventListener('change', () => { state.brand = bs.value; render(); });
  ms.addEventListener('change', () => { state.market = ms.value; render(); });
  $('#tableToggle').addEventListener('click', e => {
    state.table = !state.table;
    e.currentTarget.setAttribute('aria-expanded', String(state.table));
    e.currentTarget.textContent = state.table ? 'Zobrazit jako graf' : 'Zobrazit jako tabulku';
    render();
  });

  /* Aggregation */
  const share = (b, market) => market === 'all' ? 1 : (b.markets[market] || 0);
  const sumIdx = (b, idx, market) => {
    const k = share(b, market);
    return idx.reduce((a, i) => {
      const m = b.monthly[i];
      a.revenue += m.revenue * k; a.orders += m.orders * k; a.sessions += m.sessions * k;
      return a;
    }, { revenue: 0, orders: 0, sessions: 0 });
  };
  const sumPrev = (b, market) => {
    const p = PERIODS[state.period];
    if (p.prev) return sumIdx(b, p.prev, market);
    const cur = sumIdx(b, p.idx, market);
    const r = b.prevYear / b.year;
    return { revenue: cur.revenue * r, orders: cur.orders * r * 1.03, sessions: cur.sessions * r * 1.06 };
  };
  const selBrands = () => state.brand === 'all' ? brands : brands.filter(b => b.id === state.brand);
  const total = (list, fn) => list.reduce((a, b) => { const s = fn(b); a.revenue += s.revenue; a.orders += s.orders; a.sessions += s.sessions; return a; }, { revenue: 0, orders: 0, sessions: 0 });

  const arrow = up => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${up ? 'M12 19V5M6 11l6-6 6 6' : 'M12 5v14M6 13l6 6 6-6'}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const delta = (cur, prev, unit = 'pct') => {
    if (!prev) return '<span class="kpi__d"><span class="muted">bez srovnání</span></span>';
    const d = unit === 'pp' ? cur - prev : (cur / prev - 1) * 100;
    const up = d >= 0;
    const txt = unit === 'pp' ? (up ? '+' : '−') + nf1.format(Math.abs(d)) + ' p. b.' : (up ? '+' : '−') + nf1.format(Math.abs(d)) + ' %';
    return `<span class="kpi__d ${up ? 'up' : 'down'}">${arrow(up)}${txt}</span>`;
  };

  /* KPIs */
  function renderKpis(cur, prev) {
    const aov = cur.revenue / cur.orders, aovP = prev.revenue / prev.orders;
    const cr = cur.orders / cur.sessions * 100, crP = prev.orders / prev.sessions * 100;
    const inq = window.WLInq.all().filter(x => x.at.startsWith('2026-11')).length;
    $('#kpis').innerHTML = `
      <div class="kpi"><dt>Tržby</dt><dd><span class="kpi__v">${eur(cur.revenue)}</span>${delta(cur.revenue, prev.revenue)}</dd></div>
      <div class="kpi"><dt>Objednávky</dt><dd><span class="kpi__v">${nf.format(Math.round(cur.orders))}</span>${delta(cur.orders, prev.orders)}</dd></div>
      <div class="kpi"><dt>Průměrná objednávka</dt><dd><span class="kpi__v">${eurFull(aov)}</span>${delta(aov, aovP)}</dd></div>
      <div class="kpi"><dt>Konverzní poměr</dt><dd><span class="kpi__v">${pct(cr, 2)}</span>${delta(cr, crP, 'pp')}</dd></div>
      <div class="kpi"><dt>Poptávky z webu (listopad)</dt><dd><span class="kpi__v">${inq}</span><span class="kpi__d"><a class="linkbtn" href="poptavky.html">otevřít inbox</a></span></dd></div>`;
  }

  /* Line chart: monthly revenue, one series (ink) */
  function renderTrend(list) {
    const series = months.map((m, i) => list.reduce((a, b) => a + b.monthly[i].revenue * share(b, state.market), 0));
    const sel = new Set(PERIODS[state.period].idx);
    const name = state.brand === 'all' ? 'Všechny značky' : list[0].name;
    $('#trendSub').textContent = `${name}${state.market === 'all' ? '' : ' · ' + MARKET_NAMES[state.market]} · zvýrazněné vybrané období`;

    if (state.table) {
      $('#trend').hidden = true; $('#trendTable').hidden = false;
      $('#trendTable').innerHTML = `<table class="datatable"><thead><tr><th>Měsíc</th><th>Tržby</th></tr></thead><tbody>${months.map((m, i) => `<tr><td>${monthLabel(m)}</td><td>${eurFull(series[i])}</td></tr>`).join('')}</tbody></table>`;
      return;
    }
    $('#trend').hidden = false; $('#trendTable').hidden = true;

    const W = 760, H = 280, ml = 64, mr = 12, mt = 12, mb = 28;
    const max = Math.max(...series);
    const step = niceStep(max / 4);
    const top = Math.ceil(max / step) * step;
    const x = i => ml + (i + .5) * (W - ml - mr) / months.length;
    const y = v => mt + (1 - v / top) * (H - mt - mb);
    const bw = (W - ml - mr) / months.length;
    const ticks = []; for (let v = 0; v <= top + 1; v += step) ticks.push(v);
    const pts = series.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
    const area = `M${x(0)},${y(0)} L${pts.join(' L')} L${x(months.length - 1)},${y(0)} Z`;

    $('#trend').innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Tržby po měsících, ${name}">
        ${[...sel].length < 12 ? [...sel].map(i => `<rect x="${ml + i * bw}" y="${mt}" width="${bw}" height="${H - mt - mb}" fill="#E2E5DF" opacity=".7"/>`).join('') : ''}
        <g class="axis">${ticks.map(v => `<line class="gridline" x1="${ml}" x2="${W - mr}" y1="${y(v)}" y2="${y(v)}"/><text x="${ml - 8}" y="${y(v) + 4}" text-anchor="end">${v === 0 ? '0' : eur(v).replace(' €', '')}</text>`).join('')}</g>
        <line class="baseline" x1="${ml}" x2="${W - mr}" y1="${y(0)}" y2="${y(0)}"/>
        <g class="axis">${months.map((m, i) => `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${monthLabel(m)}</text>`).join('')}</g>
        <path class="series-area" d="${area}"/>
        <polyline class="series" points="${pts.join(' ')}"/>
        <line class="cross" id="cross" y1="${mt}" y2="${y(0)}" visibility="hidden"/>
        <circle class="dot" id="dot" r="5" visibility="hidden"/>
        <rect id="hit" x="${ml}" y="${mt}" width="${W - ml - mr}" height="${H - mt - mb}" fill="transparent"/>
      </svg>
      <div class="tip" id="tip"></div>`;

    const svg = $('#trend svg'), tip = $('#tip'), cross = $('#cross'), dot = $('#dot');
    const show = i => {
      const r = svg.getBoundingClientRect(), k = r.width / W;
      cross.setAttribute('x1', x(i)); cross.setAttribute('x2', x(i)); cross.setAttribute('visibility', 'visible');
      dot.setAttribute('cx', x(i)); dot.setAttribute('cy', y(series[i])); dot.setAttribute('visibility', 'visible');
      const prevV = i > 0 ? series[i - 1] : null;
      tip.innerHTML = `<small>${monthLabel(months[i])}</small><b>${eurFull(series[i])}</b>${prevV ? `<small>${series[i] >= prevV ? '+' : '−'}${nf1.format(Math.abs(series[i] / prevV - 1) * 100)} % proti předchozímu měsíci</small>` : ''}`;
      tip.style.left = Math.min(Math.max(x(i) * k, 90), r.width - 90) + 'px';
      tip.style.top = y(series[i]) * k + 'px';
      tip.classList.add('on');
    };
    const hide = () => { tip.classList.remove('on'); cross.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); };
    $('#hit').addEventListener('pointermove', e => {
      const r = svg.getBoundingClientRect();
      const px = (e.clientX - r.left) / (r.width / W);
      show(Math.max(0, Math.min(months.length - 1, Math.floor((px - ml) / bw))));
    });
    $('#hit').addEventListener('pointerleave', hide);
  }
  function niceStep(raw) {
    const p = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / p;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
  }

  /* Markets: horizontal bars, ink */
  function renderMarkets(list) {
    const idx = PERIODS[state.period].idx;
    const rows = MARKETS.map(m => ({ m, v: list.reduce((a, b) => a + sumIdx(b, idx, 'all').revenue * (b.markets[m] || 0), 0) }))
      .filter(r => r.v > 0).sort((a, b) => b.v - a.v);
    const max = rows[0]?.v || 1;
    $('#mkSub').textContent = state.brand === 'all' ? 'Všechny značky' : list[0].name;
    $('#markets').innerHTML = rows.map(r => `
      <div class="hbar" title="${MARKET_NAMES[r.m]}: ${eurFull(r.v)}" ${state.market === r.m ? 'style="font-weight:700"' : ''}>
        <b>${r.m}</b><span class="hbar__track"><span class="hbar__fill" style="width:${(r.v / max * 100).toFixed(1)}%${state.market !== 'all' && state.market !== r.m ? ';opacity:.3' : ''}"></span></span><span>${eur(r.v)}</span>
      </div>`).join('');
  }

  /* Brand table */
  function renderBrands() {
    const idx = PERIODS[state.period].idx;
    const rows = brands.map(b => ({ b, cur: sumIdx(b, idx, state.market), prev: sumPrev(b, state.market) })).filter(r => r.cur.revenue > 0);
    const tot = rows.reduce((a, r) => a + r.cur.revenue, 0);
    rows.sort((a, b) => b.cur.revenue - a.cur.revenue);
    $('#brands tbody').innerHTML = rows.map(({ b, cur, prev }) => {
      const d = (cur.revenue / prev.revenue - 1) * 100;
      const s = cur.revenue / tot * 100;
      return `<tr class="brandrow" tabindex="0" data-id="${b.id}" aria-selected="${state.brand === b.id}">
        <td><div class="brandcell"><img src="assets/img/brands/${b.id === 'fexi' ? 'fexi-mark' : b.id}.svg" alt="${b.name}"><span>${b.cat}</span></div></td>
        <td>${eur(cur.revenue)}</td>
        <td><span class="share"><i style="width:${s.toFixed(1)}%"></i></span>${pct(s, 0)}</td>
        <td class="${d >= 0 ? 'up' : 'down'}">${d >= 0 ? '+' : '−'}${nf1.format(Math.abs(d))} %</td>
        <td>${nf.format(Math.round(cur.orders))}</td>
        <td>${eurFull(cur.revenue / cur.orders)}</td>
        <td>${pct(cur.orders / cur.sessions * 100, 2)}</td>
      </tr>`;
    }).join('') || '<tr><td colspan="7">Na tomto trhu žádná značka neprodává.</td></tr>';
    document.querySelectorAll('.brandrow').forEach(tr => {
      const pick = () => { state.brand = state.brand === tr.dataset.id ? 'all' : tr.dataset.id; bs.value = state.brand; render(); };
      tr.addEventListener('click', pick);
      tr.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
  }

  /* Inquiries by type */
  function renderInq() {
    const list = window.WLInq.all().filter(x => x.at.startsWith('2026-11'));
    const rows = window.WLInq.types.map(t => ({ t, n: list.filter(x => x.type === t.id).length })).sort((a, b) => b.n - a.n);
    const max = Math.max(1, ...rows.map(r => r.n));
    $('#inq').innerHTML = rows.map(r => `
      <div class="hbar" style="grid-template-columns:minmax(0,9rem) minmax(0,1fr) 2rem">
        <span>${r.t.label}</span><span class="hbar__track"><span class="hbar__fill" style="width:${r.n / max * 100}%"></span></span><span>${r.n}</span>
      </div>`).join('');
  }

  function render() {
    const list = selBrands();
    const p = PERIODS[state.period];
    $('#periodText').textContent = `${p.text} · změny ${p.vs}`;
    const cur = total(list, b => sumIdx(b, p.idx, state.market));
    const prev = total(list, b => sumPrev(b, state.market));
    if (cur.revenue === 0) {
      $('#kpis').innerHTML = '<div class="kpi" style="grid-column:1/-1"><dt>Bez dat</dt><dd>Vybraná značka na tomto trhu neprodává. Zkus jiný trh.</dd></div>';
    } else renderKpis(cur, prev);
    renderTrend(list);
    renderMarkets(list);
    renderBrands();
    renderInq();
  }
  render();
})();
