(() => {
  const S = window.WLInq;
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const SLA = { partner: '1 pracovní den', obchod: '4 hodiny', dodavatel: '2 pracovní dny', kariera: '3 pracovní dny', media: '1 pracovní den', ai: '3 pracovní dny', jine: '1 pracovní den' };
  const STATUS = { nova: 'Nová', resime: 'Řešíme', vyrizeno: 'Vyřízeno' };
  const fmt = iso => new Date(iso).toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });

  /* Routing table */
  $('#routing tbody').innerHTML = S.types.map(t => `<tr><td>${t.label}</td><td>${esc(t.owner)}</td><td>${esc(t.role)}</td><td>${SLA[t.id]}</td></tr>`).join('');

  let filter = 'all';
  let selected = location.hash.startsWith('#P-') ? location.hash.slice(1) : null;

  document.querySelectorAll('#statusFilter button').forEach(b => b.addEventListener('click', () => {
    filter = b.dataset.s;
    document.querySelectorAll('#statusFilter button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    render();
  }));
  $('#reset').addEventListener('click', () => { S.reset(); selected = null; render(); });

  function render() {
    const all = S.all();
    const list = all.filter(x => filter === 'all' || x.status === filter);
    if (!selected || !all.find(x => x.id === selected)) selected = list[0]?.id || null;

    $('#list').innerHTML = list.length ? list.map(x => {
      const t = S.typeById[x.type] || S.typeById.jine;
      return `<li class="item" role="option" tabindex="0" data-id="${x.id}" aria-selected="${x.id === selected}">
        <span class="item__who">${x.status === 'nova' ? '<i class="newdot" aria-label="nová"></i>' : ''}<span>${esc(x.name)}${x.company ? ' · ' + esc(x.company) : ''}</span></span>
        <span class="item__time">${fmt(x.at)}</span>
        <span class="item__msg">${esc(x.message)}</span>
        <span class="item__meta"><span class="tag">${t.label}</span><span class="tag">${esc(t.owner)}</span>${x.web ? '<span class="tag tag--web">Z tvého testu</span>' : ''}</span>
      </li>`;
    }).join('') : '<li class="empty">Žádné poptávky v tomto stavu.</li>';

    document.querySelectorAll('.item').forEach(li => {
      const pick = () => { selected = li.dataset.id; history.replaceState(null, '', '#' + selected); render(); };
      li.addEventListener('click', pick);
      li.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
    renderDetail(all.find(x => x.id === selected));
  }

  function renderDetail(x) {
    const d = $('#detail');
    if (!x) { d.innerHTML = '<p class="empty">Vyber poptávku vlevo.</p>'; return; }
    const t = S.typeById[x.type] || S.typeById.jine;
    const to = t.owner.includes('@') ? t.owner : `${t.owner} (${t.role})`;
    d.innerHTML = `
      <div class="detail__top">
        <div>
          <h3>${esc(x.name)}</h3>
          <p class="detail__sub">${x.company ? esc(x.company) + ' · ' : ''}<a href="mailto:${esc(x.email)}">${esc(x.email)}</a></p>
        </div>
        <span class="tag st-${x.status}">${STATUS[x.status]}</span>
      </div>
      <p class="detail__msg">${esc(x.message)}</p>
      <dl class="kv">
        <dt>Číslo</dt><dd>${x.id}</dd>
        <dt>Přijato</dt><dd>${fmt(x.at)} přes formulář na westlogic.eu</dd>
        <dt>Typ</dt><dd>${t.label}</dd>
        <dt>Přiřazeno</dt><dd>${esc(t.owner)} (${esc(t.role)})</dd>
        <dt>Odpovědět do</dt><dd>${SLA[x.type] || SLA.jine}</dd>
      </dl>
      <div class="actions" role="group" aria-label="Stav poptávky">
        ${Object.entries(STATUS).map(([k, v]) => `<button type="button" data-st="${k}" aria-pressed="${x.status === k}">${v}</button>`).join('')}
        <a href="mailto:${esc(x.email)}?subject=${encodeURIComponent('Re: vaše poptávka ' + x.id)}">Odpovědět</a>
      </div>

      <div class="previews">
        <div class="preview">
          <div class="preview__bar"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>E-mail, který přijde</div>
          <div class="preview__body">
            <p class="preview__muted">Komu: ${esc(to)}<br>Kopie: office@westlogic.eu<br>Předmět: [${x.id}] ${t.label} – ${esc(x.name)}</p>
            <p>Nová poptávka z webu westlogic.eu.</p>
            <p><b>${esc(x.name)}</b>${x.company ? ', ' + esc(x.company) : ''}<br>${esc(x.email)}</p>
            <p>„${esc(x.message.length > 140 ? x.message.slice(0, 140) + '…' : x.message)}“</p>
            <p class="preview__muted">Odpovězte prosím do: ${SLA[x.type] || SLA.jine}.</p>
          </div>
        </div>
        <div class="preview">
          <div class="preview__bar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>#poptavky (Slack / Teams)</div>
          <div class="preview__body">
            <div class="slackmsg">
              <span class="slackmsg__av"><img src="assets/img/logo-footer.svg" alt=""></span>
              <div>
                <p><b>Web Westlogic</b> <span class="preview__muted">${new Date(x.at).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}</span></p>
                <p>Nová poptávka <b>${x.id}</b> · ${t.label} → @${esc(t.owner.split(' ')[0])}</p>
                <p class="slackmsg__q">${esc(x.name)}${x.company ? ' (' + esc(x.company) + ')' : ''}: ${esc(x.message.length > 90 ? x.message.slice(0, 90) + '…' : x.message)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    d.querySelectorAll('[data-st]').forEach(b => b.addEventListener('click', () => { S.update(x.id, { status: b.dataset.st }); render(); }));
  }

  render();
  if (location.hash.startsWith('#P-')) document.getElementById('inbox').scrollIntoView();
})();
