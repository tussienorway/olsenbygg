(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // 1. Mobilmeny på tvers av alle sider
  const burger = $('.burger');
  const meny = $('#meny');
  const lukkMeny = () => {
    if (!burger || !meny) return;
    burger.setAttribute('aria-expanded', 'false');
    burger.textContent = '☰';
    meny.classList.remove('on');
  };
  if (burger && meny) {
    burger.addEventListener('click', e => {
      e.stopPropagation();
      const open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      burger.textContent = open ? '☰' : '✕';
      meny.classList.toggle('on', !open);
    });
    $$('a', meny).forEach(a => a.addEventListener('click', lukkMeny));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') lukkMeny();
    });
    document.addEventListener('click', e => {
      if (meny.classList.contains('on') && !e.target.closest('header.top')) lukkMeny();
    });
  }

  // 2. Tjenester og målgruppefilter
  const tj = $('#tj');
  const tjsel = $('#tjsel');
  if (tj && window.TJENESTER) {
    tj.innerHTML = window.TJENESTER.map(t => `
      <div class="card hov" data-k="${esc(t.k)}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span class="kicker">${esc(t.kat || t.k)}</span>
          <span aria-hidden="true" style="font-size:1.4rem">${t.ico || '🔨'}</span>
        </div>
        <h3>${esc(t.t)}</h3>
        <p>${esc(t.d)}</p>
        <button type="button" class="mini" data-velg-tj="${esc(t.t)}">Velg til befaring →</button>
      </div>`).join('');

    if (tjsel) {
      tjsel.innerHTML = window.TJENESTER.map(t => `<option value="${esc(t.t)}">${esc(t.t)}</option>`).join('') + '<option value="Annet">Annet</option>';
    }

    tj.addEventListener('click', e => {
      const btn = e.target.closest('[data-velg-tj]');
      if (!btn) return;
      if (tjsel) tjsel.value = btn.dataset.velgTj;
      const k = $('#kontakt');
      if (k) k.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth' });
      const navnInput = $('#kform input[name="navn"]');
      if (navnInput) setTimeout(() => navnInput.focus(), 300);
    });
  }

  const filtrerTjenester = (seg, fremhev = false) => {
    $$('.tjfilt button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tf === seg)));
    $$('#velg [data-seg]').forEach(a => a.classList.toggle('active', a.dataset.seg === seg));
    $$('#tj .card').forEach(c => {
      const match = seg === 'alle' || c.dataset.k === seg;
      c.hidden = !match && !fremhev;
      c.classList.toggle('seg-match', fremhev && c.dataset.k === seg);
      c.style.outline = fremhev && c.dataset.k === seg ? '3px solid var(--g)' : '';
    });
    if (seg !== 'alle' && tjsel && window.TJENESTER) {
      const first = window.TJENESTER.find(x => x.k === seg);
      if (first) tjsel.value = first.t;
    }
  };

  $$('.tjfilt button').forEach(bt => bt.addEventListener('click', () => filtrerTjenester(bt.dataset.tf, false)));
  $$('#velg [data-seg]').forEach(a => a.addEventListener('click', () => filtrerTjenester(a.dataset.seg, true)));

  // 3. Åpningstid-status
  const st = $('#status');
  if (st && window.FIRMA) {
    const n = new Date(), d = n.getDay(), h = n.getHours() + n.getMinutes() / 60, a = window.FIRMA.apent[d];
    const erApent = Boolean(a && h >= a[0] && h < a[1]);
    st.textContent = erApent
      ? '🟢 Åpent nå (man–fre 07–15) · Ring 415 15 588'
      : '🕒 Stengt nå (åpent man–fre 07–15) – send forespørsel, så tar vi kontakt';
  }

  // 4. Før/etter-glider + hurtigknapper
  $$('.ba').forEach(ba => {
    const i = $('input', ba), bf = $('.before', ba), l = $('.line', ba);
    if (!i || !bf || !l) return;
    const u = () => {
      bf.style.clipPath = `inset(0 ${100 - i.value}% 0 0)`;
      l.style.left = i.value + '%';
      $$('.ba-ctrl button').forEach(b => b.classList.toggle('on', b.dataset.ba === String(i.value)));
    };
    i.addEventListener('input', u);
    i.addEventListener('change', u);
    $$('.ba-ctrl button').forEach(b => b.addEventListener('click', () => {
      i.value = b.dataset.ba;
      u();
    }));
    u();
  });

  // 5. Prosjektfilter
  $$('.pfilt button').forEach(bt => bt.addEventListener('click', () => {
    $$('.pfilt button').forEach(x => x.setAttribute('aria-pressed', String(x === bt)));
    $$('#plist .card').forEach(c => {
      c.hidden = !(bt.dataset.f === 'alle' || c.dataset.k === bt.dataset.f);
    });
  }));

  // 6. Kart ved forespørsel
  const vk = $('#vis-kart');
  if (vk && window.FIRMA) {
    vk.addEventListener('click', () => {
      const [la, lo] = window.FIRMA.geo;
      $('#kart').innerHTML = `<iframe title="Kart over Olsenbygg Grimstad AS, Industriveien 15" width="100%" height="300" style="border:0;border-radius:12px" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=${lo - 0.01},${la - 0.005},${lo + 0.01},${la + 0.005}&marker=${la},${lo}"></iframe>`;
    });
  }

  // 7. Kontaktskjema (befaring)
  const f = $('#kform');
  if (f && window.FIRMA) {
    f.addEventListener('submit', e => {
      e.preventDefault();
      const d = new FormData(f);
      const navn = (d.get('navn') || '').trim();
      const tlf = (d.get('tlf') || '').trim();
      const tjVal = d.get('tj') || 'Befaring';
      const msg = (d.get('msg') || '').trim();
      const emne = `Befaring: ${tjVal} – ${navn}`;
      const tekst = `Navn: ${navn}\nTlf: ${tlf || 'Ikke oppgitt'}\nGjelder: ${tjVal}\n\n${msg || 'Ønsker uforpliktende befaring.'}`;
      const mailto = `mailto:${window.FIRMA.epost}?subject=${encodeURIComponent(emne)}&body=${encodeURIComponent(tekst)}`;

      const okBox = $('#kform-ok');
      if (okBox) {
        okBox.innerHTML = `<div class="form-ok">
          <b>E-post klargjort til ${esc(window.FIRMA.epost)}!</b>
          <p style="margin:6px 0">Emne: <b>${esc(emne)}</b></p>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">
            <a class="btn" href="${mailto}" style="padding:8px 14px;font-size:.9rem">Åpne e-postprogram</a>
            <button type="button" class="mini" id="kopier-epost">Kopier tekst</button>
          </div>
        </div>`;
        const kopierBtn = $('#kopier-epost');
        if (kopierBtn) {
          kopierBtn.addEventListener('click', () => {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(tekst).catch(() => {});
            }
            kopierBtn.textContent = 'Kopiert til utklippstavle ✓';
          });
        }
      }
      const a = document.createElement('a');
      a.href = mailto;
      a.click();
    });
  }

  // 8. Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  // 9. Reveal-animasjoner og nøkkeltall
  const r = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion:reduce)').matches) {
    r.forEach(e => e.classList.add('in'));
  } else {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }), { threshold: 0.08 });
    r.forEach(e => io.observe(e));
  }

  if (!matchMedia('(prefers-reduced-motion:reduce)').matches) {
    document.querySelectorAll('.stats b').forEach(b => {
      const n = parseInt(b.textContent.replace(/\D/g, ''), 10);
      if (!n || n > 1900 || n < 10) return;
      const pre = b.textContent.startsWith('~') ? '~' : '';
      let i = 0;
      const t = setInterval(() => {
        i += Math.ceil(n / 25);
        if (i >= n) {
          i = n;
          clearInterval(t);
        }
        b.textContent = pre + i;
      }, 25);
    });
  }
})();
