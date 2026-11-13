/* Inquiry store for the demo. In production this is the form endpoint + CRM;
   here it lives in the browser (localStorage) so the flow can be shown end to end. */
(() => {
  const KEY = 'wl-inquiries-v1';
  const types = window.WL.inquiryTypes;
  const typeById = Object.fromEntries(types.map(t => [t.id, t]));

  const day = (d, h, m) => new Date(2026, 10, d, h, m).toISOString();
  const seed = [
    { id: 'P-1042', at: day(13, 9, 12),  type: 'obchod',    name: 'Markéta Horáková', company: 'Hobbycentrum Brno', email: 'm.horakova@example.cz', message: 'Máme 14 prodejen a chtěli bychom do sortimentu zařadit malování podle čísel Zuty. Jaké máte podmínky pro velkoodběr?', status: 'nova' },
    { id: 'P-1041', at: day(12, 16, 40), type: 'partner',   name: 'Tomáš Veselý',     company: 'Northgate Capital', email: 'tvesely@example.com', message: 'Rádi bychom se potkali kvůli možnému vstupu do skupiny. Máte prostor příští týden?', status: 'resime' },
    { id: 'P-1040', at: day(12, 10, 5),  type: 'kariera',   name: 'Anna Dvořáková',   company: '',                  email: 'anna.dvorakova@example.cz', message: 'Hledáte do týmu performance marketéra? Posílám odkaz na portfolio.', status: 'nova' },
    { id: 'P-1039', at: day(11, 14, 22), type: 'dodavatel', name: 'Li Wei',           company: 'Ningbo Textile Co.', email: 'sales@example.cn', message: 'We produce blackout and day-night fabrics. Can we send samples to your production in Staré Město?', status: 'resime' },
    { id: 'P-1038', at: day(10, 8, 51),  type: 'ai',        name: 'Jakub Král',       company: 'Data Lab Ostrava',  email: 'jakub@example.cz', message: 'Máme nápad na AI predikci poptávky po stínění podle počasí. Stálo by to za krátký call?', status: 'vyrizeno' },
    { id: 'P-1037', at: day(7, 13, 3),   type: 'media',     name: 'Petra Novotná',    company: 'CzechCrunch',       email: 'petra@example.cz', message: 'Připravujeme článek o českých e-commerce skupinách. Mohl by se zapojit někdo z vedení?', status: 'vyrizeno' },
    { id: 'P-1036', at: day(5, 19, 47),  type: 'jine',      name: 'Karel Beneš',      company: '',                  email: 'k.benes@example.cz', message: 'Objednal jsem roletu Fexi a nevím, kam se obrátit s reklamací.', status: 'vyrizeno' },
  ];

  const load = () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  };
  const save = list => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {} };

  window.WLInq = {
    types, typeById,
    all() {
      const own = load();
      const ids = new Set(own.map(x => x.id));
      return [...own, ...seed.filter(x => !ids.has(x.id))].sort((a, b) => b.at.localeCompare(a.at));
    },
    add(data) {
      const own = load();
      const n = 1043 + own.filter(x => x.web).length;
      const item = { id: 'P-' + n, at: new Date().toISOString(), status: 'nova', web: true, ...data };
      own.unshift(item); save(own);
      return item;
    },
    update(id, patch) {
      const own = load();
      const i = own.findIndex(x => x.id === id);
      if (i >= 0) own[i] = { ...own[i], ...patch };
      else { const s = seed.find(x => x.id === id); if (s) own.push({ ...s, ...patch }); }
      save(own);
    },
    reset() { try { localStorage.removeItem(KEY); } catch {} },
  };
})();
