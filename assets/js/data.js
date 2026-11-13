/* UKÁZKOVÁ DATA — vymyšlená, jen pro předvedení dashboardu.
   V ostrém provozu je nahradí napojení na Shoptet API (Fexi, Zuty, FOA, Diamondi),
   WordPress/WooCommerce (Atelix), billing Everbotu a GA4. */
(() => {
  // Deterministic pseudo-random so the demo looks the same on every load.
  let seed = 20261113;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);

  const months = ['2025-11','2025-12','2026-01','2026-02','2026-03','2026-04','2026-05','2026-06','2026-07','2026-08','2026-09','2026-10'];
  const monthLabel = m => {
    const [y, mo] = m.split('-').map(Number);
    return ['led','úno','bře','dub','kvě','čvn','čvc','srp','zář','říj','lis','pro'][mo - 1] + ' ' + String(y).slice(2);
  };

  // Seasonality per category (index by calendar month 1..12).
  const season = {
    hobby:   [1.15, .95, .9, .78, .72, .66, .7, .74, .86, 1.0, 1.35, 1.55],
    shading: [.6, .62, .82, 1.05, 1.3, 1.42, 1.38, 1.18, .95, .8, .66, .58],
    saas:    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  };

  const brands = [
    { id: 'zuty',     name: 'Zuty',     cat: 'Malování podle čísel', kind: 'hobby',   year: 3.40e6, aov: 34,  cr: 2.9, growth: .010, markets: { CZ: .17, SK: .07, PL: .12, DE: .18, AT: .05, HU: .06, RO: .07, BG: .03, FR: .11, ES: .06, NL: .04, UK: .04 } },
    { id: 'diamondi', name: 'Diamondi', cat: 'Diamantové malování',  kind: 'hobby',   year: 2.60e6, aov: 29,  cr: 2.6, growth: .014, markets: { CZ: .15, SK: .06, PL: .13, DE: .19, AT: .05, HU: .07, RO: .08, BG: .03, FR: .10, ES: .06, NL: .04, UK: .04 } },
    { id: 'fexi',     name: 'Fexi',     cat: 'Rolety den a noc',     kind: 'shading', year: 2.10e6, aov: 96,  cr: 1.8, growth: .006, markets: { CZ: .71, SK: .29 } },
    { id: 'foa',      name: 'FOA',      cat: 'Stínicí technika',     kind: 'shading', year: 1.40e6, aov: 112, cr: 1.5, growth: .022, markets: { CZ: .52, SK: .21, PL: .11, HU: .09, RO: .07 } },
    { id: 'atelix',   name: 'Atelix',   cat: 'Stínění na míru',      kind: 'shading', year: 0.60e6, aov: 640, cr: 0.7, growth: .012, markets: { CZ: 1 } },
    { id: 'everbot',  name: 'Everbot',  cat: 'AI platforma',         kind: 'saas',    year: 0.40e6, aov: 410, cr: 1.1, growth: .045, markets: { CZ: .82, SK: .18 } },
  ];

  brands.forEach(b => {
    const s = season[b.kind];
    const raw = months.map((m, i) => {
      const mo = Number(m.split('-')[1]);
      return s[mo - 1] * (1 + b.growth * (i - 6)) * (0.94 + rnd() * 0.12);
    });
    const k = b.year / raw.reduce((a, v) => a + v, 0);
    b.monthly = months.map((m, i) => {
      const revenue = Math.round(raw[i] * k);
      const aov = b.aov * (0.95 + rnd() * 0.1);
      const orders = Math.round(revenue / aov);
      const cr = b.cr * (0.9 + rnd() * 0.2);
      const sessions = Math.round(orders / (cr / 100));
      return { month: m, revenue, orders, sessions };
    });
    // Previous 12 months, for year-over-year deltas.
    b.prevYear = Math.round(b.year / (1 + b.growth * 12 * (0.7 + rnd() * 0.5)));
  });

  // Website inquiries (demo) for the last 30 days by type.
  const inquiryTypes = [
    { id: 'partner',  label: 'Partnerství a investice', owner: 'Jan Ptašek', role: 'CBDO' },
    { id: 'obchod',   label: 'Obchod a velkoodběr',     owner: 'Ondřej Holubec', role: 'CSO' },
    { id: 'dodavatel',label: 'Dodavatel a výroba',       owner: 'Monika Koloničná', role: 'Vedoucí výroby' },
    { id: 'kariera',  label: 'Kariéra',                  owner: 'Renata Kolářová', role: 'HR specialistka' },
    { id: 'media',    label: 'Média',                    owner: 'Petr Bednařík', role: 'CMO' },
    { id: 'ai',       label: 'Tip na využití AI',        owner: 'Lenka Šodková', role: 'Chief Digital Officer' },
    { id: 'jine',     label: 'Jiné',                     owner: 'office@westlogic.eu', role: 'Recepce' },
  ];

  window.WL = { months, monthLabel, brands, inquiryTypes };
})();
