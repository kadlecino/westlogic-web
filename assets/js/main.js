(() => {
  // ?still renders the settled state (used for screenshots).
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || location.search.includes('still');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* Header: border on scroll, mobile menu */
  const top = $('.top');
  const burger = $('.top__burger');
  const onScrollHeader = () => top.classList.toggle('is-scrolled', scrollY > 8);
  burger.addEventListener('click', () => {
    const open = top.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Zavřít menu' : 'Otevřít menu');
  });
  $$('.top__nav a').forEach(a => a.addEventListener('click', () => {
    top.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }));

  /* Deck: opens on load, closes as the hero scrolls away */
  const deck = $('.deck');
  let target = 1;
  let current = reduce ? 1 : 0;
  const setOpen = v => deck.style.setProperty('--open', v.toFixed(3));
  setOpen(current);

  const deckScroll = () => {
    // Close only once the deck itself starts leaving the viewport.
    const r = deck.getBoundingClientRect();
    const p = Math.min(Math.max(-r.top / r.height, 0), 1);
    target = 1 - p * 0.75;
  };

  if (!reduce) {
    // Blades start closed (visible), then fan out once fonts are ready.
    const blades = $$('.blade', deck);
    blades.forEach(b => (b.style.transitionDuration = '0s'));
    requestAnimationFrame(() => {
      blades.forEach(b => (b.style.transitionDuration = ''));
      (document.fonts?.ready || Promise.resolve()).then(() => {
        setTimeout(() => {
          blades.forEach((b, i) => (b.style.transitionDelay = `${i * 70}ms`));
          setOpen(1);
          current = 1;
          setTimeout(() => blades.forEach(b => {
            b.style.transitionDelay = '';
            b.style.transition = 'filter .3s, transform .5s cubic-bezier(.16,1,.3,1)';
          }), 1400);
        }, 180);
      });
    });
  }

  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      onScrollHeader();
      if (!reduce && current === 1) {
        deckScroll();
        setOpen(target);
      }
      ticking = false;
    });
  }, { passive: true });
  onScrollHeader();

  deck.addEventListener('pointerover', e => { if (e.target.closest('.blade')) deck.classList.add('is-hovering'); });
  deck.addEventListener('pointerout', e => { if (!e.relatedTarget || !e.relatedTarget.closest?.('.blade')) deck.classList.remove('is-hovering'); });

  /* Brand strips: accordion; deck blades open their strip */
  const toggle = (li, force) => {
    const btn = $('.strip__bar', li);
    const body = $('.strip__body', li);
    const open = force ?? btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    li.classList.toggle('is-open', open);
    body.hidden = !open;
  };
  $$('.strip').forEach(li => $('.strip__bar', li).addEventListener('click', () => toggle(li)));
  $$('.blade').forEach(b => b.addEventListener('click', () => {
    const li = $(b.getAttribute('href'));
    if (li) toggle(li, true);
  }));

  /* Reveal on scroll (content stays visible without JS) */
  if (!reduce && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-motion');
    const items = $$('.sec__head, .strips, .strip-test, .inhouse, .chips, .partners, .people, .news__list, .contact__in, .places');
    items.forEach(el => el.classList.add('rv'));
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    items.forEach(el => io.observe(el));
  }

  /* Active nav item */
  const links = $$('.top__nav a[href^="#"]');
  const secs = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
  const nio = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    links.forEach(a => a.toggleAttribute('aria-current', a.getAttribute('href') === '#' + en.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach(s => nio.observe(s));

  /* Contact form: validate, then hand off to the mail client (no backend yet) */
  const form = $('#form');
  const rules = [
    ['f-name', v => v.trim().length > 1],
    ['f-mail', v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())],
    ['f-msg', v => v.trim().length > 4],
  ];
  const check = (id, ok) => {
    const el = $('#' + id);
    const err = $('#' + id + '-e');
    el.setAttribute('aria-invalid', String(!ok));
    if (ok) el.removeAttribute('aria-describedby'); else el.setAttribute('aria-describedby', id + '-e');
    err.hidden = ok;
    return ok;
  };
  rules.forEach(([id, fn]) => $('#' + id).addEventListener('blur', e => {
    if (e.target.value) check(id, fn(e.target.value));
  }));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const results = rules.map(([id, fn]) => check(id, fn($('#' + id).value)));
    if (results.includes(false)) {
      $('#' + rules[results.indexOf(false)][0]).focus();
      return;
    }
    const d = new FormData(form);
    const data = {
      name: d.get('name').trim(), email: d.get('email').trim(), company: (d.get('company') || '').trim(),
      type: d.get('type') || 'jine', message: d.get('message').trim(),
    };
    // Demo: the inquiry goes to the in-browser inbox. In production this POSTs to the form endpoint.
    const ok = $('.form__ok');
    if (window.WLInq) {
      const item = window.WLInq.add(data);
      const t = window.WLInq.typeById[item.type];
      ok.innerHTML = `Děkujeme, poptávka <b>${item.id}</b> dorazila. Přebírá ji ${t.owner}. <a href="poptavky.html#${item.id}">Podívat se, kam dorazila</a>`;
      form.reset();
    } else {
      location.href = `mailto:office@westlogic.eu?subject=${encodeURIComponent('Zpráva z webu – ' + data.name)}&body=${encodeURIComponent(data.message)}`;
      ok.textContent = 'Otevřeli jsme váš e-mailový program s připravenou zprávou.';
    }
    ok.hidden = false;
  });

  $('#y').textContent = new Date().getFullYear();
})();
