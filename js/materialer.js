/* Materiallogg v2 – EKSEMPELDATA i localStorage. */
(() => {
  const K = 'olsenbygg_materiallogg_v2';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const nå = () => new Date().toLocaleString('nb-NO', { dateStyle: 'short', timeStyle: 'short' });

  const EKS = () => ({
    lager: [
      { navn: 'Belegningsstein grå', lager: 120, enhet: 'm²', min: 50, prosjekt: 'Eksempelprosjekt A' },
      { navn: 'Terrassebord 28x120', lager: 300, enhet: 'lm', min: 400, prosjekt: 'Eksempelprosjekt B' },
      { navn: 'Isolasjon 200 mm', lager: 40, enhet: 'pk', min: 20, prosjekt: '' },
      { navn: 'Ferdigplen', lager: 0, enhet: 'm²', min: 0, prosjekt: 'Eksempelprosjekt A' },
      { navn: 'Konstruksjonsvirke 48x198', lager: 85, enhet: 'lm', min: 120, prosjekt: 'Eksempelprosjekt B' }
    ],
    best: [
      { navn: 'Terrassebord 28x120', ant: 500, enhet: 'lm', lev: 'Leverandør A (eksempel)', status: 'Bestilt', dato: '(eksempel)' },
      { navn: 'Konstruksjonsvirke 48x198', ant: 200, enhet: 'lm', lev: 'Byggevare Grimstad (eksempel)', status: 'Bekreftet', dato: '(eksempel)' }
    ],
    hist: ['Eksempeldata lastet']
  });

  const rensTilstand = raw => {
    if (!raw || typeof raw !== 'object' || !Array.isArray(raw.lager) || !Array.isArray(raw.best)) return EKS();
    return {
      lager: raw.lager.filter(m => m && typeof m === 'object' && m.navn).map(m => ({
        navn: String(m.navn),
        lager: Math.max(0, Number(m.lager) || 0),
        enhet: String(m.enhet || 'stk'),
        min: Math.max(0, Number(m.min) || 0),
        prosjekt: String(m.prosjekt || '')
      })),
      best: raw.best.filter(b => b && typeof b === 'object' && b.navn).map(b => ({
        navn: String(b.navn),
        ant: Math.max(1, Number(b.ant) || 1),
        enhet: String(b.enhet || 'stk'),
        lev: String(b.lev || 'Byggevare Grimstad (eksempel)'),
        status: ['Bestilt', 'Bekreftet', 'Levert'].includes(b.status) ? b.status : 'Bestilt',
        dato: String(b.dato || '')
      })),
      hist: Array.isArray(raw.hist) ? raw.hist.map(h => String(h)) : ['Eksempeldata lastet']
    };
  };

  let d;
  try {
    d = rensTilstand(JSON.parse(localStorage.getItem(K) || 'null'));
  } catch (_) {
    d = EKS();
  }

  let bestFilter = 'alle';
  const STEG = ['Bestilt', 'Bekreftet', 'Levert'];

  const meld = txt => {
    const el = $('#mstatus');
    if (el) el.textContent = txt;
  };

  const logg = t => {
    if (!Array.isArray(d.hist)) d.hist = [];
    d.hist.unshift(nå() + ' – ' + t);
    d.hist = d.hist.slice(0, 30);
  };

  const lagre = () => {
    try { localStorage.setItem(K, JSON.stringify(d)); } catch (_) {}
    vis();
  };

  const statusKlasse = s => (s === 'Levert' ? 'ok' : s === 'Bekreftet' ? 'conf' : 'wait');

  function oppdaterDatalist() {
    const dl = $('#mat-forslag');
    if (!dl) return;
    const navnSet = new Set(d.lager.map(m => m.navn));
    if (window.MATERIALER) Object.values(window.MATERIALER).forEach(m => navnSet.add(m.navn));
    dl.innerHTML = [...navnSet].map(n => `<option value="${esc(n)}">`).join('');
  }

  function vis() {
    const q = ($('#sok')?.value || '').toLowerCase();
    const lav = Boolean($('#bareLav')?.checked);
    const under = d.lager.filter(m => m.lager < m.min).length;
    const åpne = d.best.filter(b => b.status !== 'Levert').length;
    const levert = d.best.filter(b => b.status === 'Levert').length;

    $('#kpi').innerHTML = `
      <div><b>${d.lager.length}</b>materialer</div>
      <div><b class="${under ? 'warnc' : ''}">${under}</b>under minimum</div>
      <div><b>${åpne}</b>åpne bestillinger</div>
      <div><b>${levert}</b>levert</div>`;

    const filtrertLager = d.lager
      .map((m, i) => ({ m, i }))
      .filter(({ m }) => (!q || (m.navn + ' ' + m.prosjekt).toLowerCase().includes(q)) && (!lav || m.lager < m.min));

    $('#lager').innerHTML = '<tr><th>Materiale</th><th>Prosjekt</th><th>Lager</th><th>Min.</th><th>Status</th><th>Handlinger</th></tr>' +
      (filtrertLager.map(({ m, i }) => {
        const pct = m.min ? Math.min(100, Math.round((m.lager / m.min) * 100)) : 100;
        return `<tr>
          <td><b>${esc(m.navn)}</b></td>
          <td>${esc(m.prosjekt || '–')}</td>
          <td>
            <button type="button" class="mini" data-dec="${i}" aria-label="Minus ${esc(m.navn)}">−</button>
            <b class="${m.lager < m.min ? 'low' : ''}" style="display:inline-block;min-width:28px;text-align:center">${m.lager}</b> ${esc(m.enhet)}
            <button type="button" class="mini" data-inc="${i}" aria-label="Pluss ${esc(m.navn)}">+</button>
          </td>
          <td>${m.min || 0}</td>
          <td><div class="bar" title="${pct}% av minimum"><span style="width:${pct}%;background:${pct < 100 ? '#f5365c' : '#2dce89'}"></span></div></td>
          <td>
            <button type="button" class="mini" data-b="${i}">Bestill</button>
            <button type="button" class="mini del" data-del="${i}" aria-label="Slett ${esc(m.navn)}">✕</button>
          </td>
        </tr>`;
      }).join('') || '<tr><td colspan="6">Ingen materialer matcher filteret</td></tr>');

    const filtrertBest = d.best
      .map((b, i) => ({ b, i }))
      .filter(({ b }) => bestFilter === 'alle' || b.status === bestFilter);

    $('#best').innerHTML = '<tr><th>Materiale</th><th>Antall</th><th>Leverandør</th><th>Dato</th><th>Status</th><th>Handling</th></tr>' +
      (filtrertBest.map(({ b, i }) => {
        const neste = STEG[STEG.indexOf(b.status) + 1];
        return `<tr>
          <td><b>${esc(b.navn)}</b></td>
          <td>${b.ant} ${esc(b.enhet)}</td>
          <td>${esc(b.lev)}</td>
          <td>${esc(b.dato || '')}</td>
          <td>
            <span class="pill ${statusKlasse(b.status)}">${esc(b.status)}${b.status === 'Levert' ? ' ✓' : ''}</span>
            <select data-status-sel="${i}" aria-label="Status for ${esc(b.navn)}" style="width:auto;padding:4px 8px;margin-left:6px;font-size:.82rem">
              ${STEG.map(st => `<option value="${st}" ${st === b.status ? 'selected' : ''}>${st}</option>`).join('')}
            </select>
          </td>
          <td>
            ${neste ? `<button type="button" class="mini" data-s="${i}">${b.status} → ${neste}</button>` : '<span style="font-size:.82rem;color:#0f6848;font-weight:700">Mottatt på lager</span>'}
            <button type="button" class="mini del" data-del-best="${i}" aria-label="Slett bestilling ${esc(b.navn)}">✕</button>
          </td>
        </tr>`;
      }).join('') || '<tr><td colspan="6">Ingen bestillinger i valgt visning</td></tr>');

    $('#hist').innerHTML = (Array.isArray(d.hist) ? d.hist : []).map(h => `<li>${esc(h)}</li>`).join('');
    oppdaterDatalist();
  }

  function settBestillingStatus(idx, nyStatus) {
    const x = d.best[idx];
    if (!x || !STEG.includes(nyStatus) || x.status === nyStatus) return;
    const gammel = x.status;
    x.status = nyStatus;
    const ant = Number(x.ant) || 0;
    if (nyStatus === 'Levert' && gammel !== 'Levert') {
      let m = d.lager.find(item => item.navn.toLowerCase() === x.navn.toLowerCase());
      if (m) {
        m.lager += ant;
      } else {
        d.lager.push({ navn: x.navn, lager: ant, enhet: x.enhet || 'stk', min: 0, prosjekt: '' });
      }
      const txt = `Mottatt ${x.ant} ${x.enhet} ${x.navn} (lagt til på lager)`;
      logg(txt);
      meld(txt);
    } else if (gammel === 'Levert' && nyStatus !== 'Levert') {
      const m = d.lager.find(item => item.navn.toLowerCase() === x.navn.toLowerCase());
      if (m) {
        m.lager = Math.max(0, m.lager - ant);
      }
      const txt = `${x.navn}: status endret tilbake til ${x.status} (trukket ${ant} ${x.enhet} fra lager)`;
      logg(txt);
      meld(txt);
    } else {
      const txt = `${x.navn}: status endret til ${x.status}`;
      logg(txt);
      meld(txt);
    }
    lagre();
  }

  document.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const t = btn.dataset;
    if (!t) return;

    if (t.inc != null) {
      const m = d.lager[+t.inc];
      if (!m) return;
      m.lager++;
      logg(`Innlegg +1 ${m.enhet} ${m.navn}`);
      meld(`Økte lager for ${m.navn} til ${m.lager} ${m.enhet}.`);
      lagre();
    } else if (t.dec != null) {
      const m = d.lager[+t.dec];
      if (m && m.lager > 0) {
        m.lager--;
        logg(`Uttak 1 ${m.enhet} ${m.navn}`);
        meld(`Registrerte uttak av 1 ${m.enhet} ${m.navn}.`);
        lagre();
      }
    } else if (t.del != null) {
      const m = d.lager[+t.del];
      if (!m) return;
      d.lager.splice(+t.del, 1);
      logg('Slettet ' + m.navn);
      meld(`Slettet ${m.navn} fra lagerlisten.`);
      lagre();
    } else if (t.delBest != null) {
      const b = d.best[+t.delBest];
      if (!b) return;
      d.best.splice(+t.delBest, 1);
      logg(`Slettet bestilling: ${b.navn}`);
      meld(`Bestilling på ${b.navn} ble fjernet.`);
      lagre();
    } else if (t.b != null) {
      const m = d.lager[+t.b];
      if (!m) return;
      const ant = Math.max((m.min || 25) * 2 - m.lager, 20);
      const lev = 'Byggevare Grimstad (eksempel)';
      d.best.unshift({ navn: m.navn, ant, enhet: m.enhet, lev, status: 'Bestilt', dato: nå() });
      const txt = `Bestilt ${ant} ${m.enhet} ${m.navn}`;
      logg(txt);
      meld(`${txt} hos ${lev}.`);
      lagre();
    } else if (t.s != null) {
      const x = d.best[+t.s];
      if (!x) return;
      const neste = STEG[STEG.indexOf(x.status) + 1];
      if (neste) settBestillingStatus(+t.s, neste);
    } else if (t.bf != null) {
      bestFilter = t.bf;
      $$('[data-bf]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.bf === bestFilter)));
      vis();
    }
  });

  document.addEventListener('change', e => {
    const sel = e.target.closest('[data-status-sel]');
    if (!sel) return;
    settBestillingStatus(+sel.dataset.statusSel, sel.value);
  });

  $('#nymat').onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const navn = (f.get('navn') || '').trim();
    if (!navn) return;
    const nyPost = {
      navn,
      lager: Math.max(0, +f.get('lager') || 0),
      enhet: (f.get('enhet') || 'stk').trim(),
      min: Math.max(0, +f.get('min') || 0),
      prosjekt: (f.get('prosjekt') || '').trim()
    };
    d.lager.push(nyPost);
    logg('La til ' + navn);
    meld(`La til ${navn} (${nyPost.lager} ${nyPost.enhet}) i lageret.`);
    lagre();
    e.target.reset();
  };

  const nybestForm = $('#nybest');
  if (nybestForm) {
    const navnInput = nybestForm.querySelector('input[name="navn"]');
    const enhetInput = nybestForm.querySelector('input[name="enhet"]');
    if (navnInput && enhetInput) {
      navnInput.addEventListener('input', () => {
        const eksLager = d.lager.find(m => m.navn.toLowerCase() === navnInput.value.toLowerCase());
        if (eksLager) enhetInput.value = eksLager.enhet;
      });
    }
    nybestForm.onsubmit = e => {
      e.preventDefault();
      const f = new FormData(e.target);
      const navn = (f.get('navn') || '').trim();
      const ant = Math.max(1, +f.get('ant') || 1);
      const enhet = (f.get('enhet') || 'stk').trim();
      const lev = (f.get('lev') || 'Byggevare Grimstad (eksempel)').trim();
      const status = f.get('status') || 'Bestilt';
      if (!navn) return;
      d.best.unshift({ navn, ant, enhet, lev, status, dato: nå() });
      if (status === 'Levert') {
        const m = d.lager.find(item => item.navn.toLowerCase() === navn.toLowerCase());
        if (m) m.lager += ant;
        else d.lager.push({ navn, lager: ant, enhet, min: 0, prosjekt: '' });
      }
      const txt = `Bestilt ${ant} ${enhet} ${navn} (${status})`;
      logg(txt);
      meld(`La til bestilling: ${ant} ${enhet} ${navn} (${status}).`);
      lagre();
      e.target.reset();
      if (enhetInput) enhetInput.value = 'lm';
      const levInput = nybestForm.querySelector('input[name="lev"]');
      if (levInput) levInput.value = 'Byggevare Grimstad (eksempel)';
    };
  }

  $('#sok').oninput = vis;
  $('#bareLav').onchange = vis;

  if (window.MATERIALER) {
    $('#ft').innerHTML = Object.entries(window.MATERIALER).map(([k, m]) => `<option value="${k}">${m.navn}</option>`).join('');
  }

  const beregnForslag = () => {
    const k = $('#ft').value;
    const m = window.MATERIALER && window.MATERIALER[k];
    if (!m) return;
    const a = Math.max(1, +$('#fa').value || 1);
    const q = Math.ceil(a * m.pr * (1 + m.svinn));
    const kr = Math.round(q * m.pris);
    const pÅ = d.lager.find(x => x.navn.toLowerCase().includes(m.navn.split(' ')[0].toLowerCase()));
    const mangler = pÅ ? Math.max(0, q - pÅ.lager) : q;

    $('#fres').innerHTML = `<div class="res">
      <p style="margin:0 0 8px"><b>${q} ${esc(m.enhet)}</b> ${esc(m.navn.toLowerCase())} for ${a} ${m.lopende ? 'løpemeter' : 'm²'} (inkl. ${Math.round(m.svinn * 100)} % svinn · grovestimat ${kr.toLocaleString('nb-NO')} kr).
      ${pÅ ? ` På lager: ${pÅ.lager} ${esc(pÅ.enhet)}${pÅ.lager < q ? ` – <b class="low">mangler ${q - pÅ.lager} ${esc(pÅ.enhet)}</b>` : ' – nok på lager'}.` : ''}</p>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button type="button" class="mini" id="fbest">Bestill ${mangler > 0 ? mangler : q} ${esc(m.enhet)} ${esc(m.navn)}</button>
        <small>Estimat – kontroller mot tegning.</small>
      </div>
    </div>`;

    const fbestBtn = $('#fbest');
    if (fbestBtn) {
      fbestBtn.onclick = () => {
        const bestAnt = mangler > 0 ? mangler : q;
        const bestNavn = pÅ ? pÅ.navn : m.navn;
        d.best.unshift({
          navn: bestNavn,
          ant: bestAnt,
          enhet: m.enhet,
          lev: 'Byggevare Grimstad (eksempel)',
          status: 'Bestilt',
          dato: nå()
        });
        logg(`Bestilt ${bestAnt} ${m.enhet} ${bestNavn} (fra KI-forslag)`);
        meld(`La til bestilling på ${bestAnt} ${m.enhet} ${bestNavn}.`);
        lagre();
      };
    }
  };

  $('#fbtn').onclick = beregnForslag;

  $('#csv').onclick = () => {
    const lagerRows = [
      ['Kategori', 'Materiale', 'Prosjekt / Leverandør', 'Antall / Lager', 'Enhet', 'Minimum / Dato', 'Status'],
      ...d.lager.map(m => ['Lager', m.navn, m.prosjekt || '-', m.lager, m.enhet, m.min || 0, m.lager < m.min ? 'Under minimum' : 'OK']),
      ...d.best.map(b => ['Bestilling', b.navn, b.lev || '-', b.ant, b.enhet, b.dato || '-', b.status])
    ];
    const csv = '\ufeff# EKSEMPELDATA – Olsenbygg-konsept materiallogg\n' +
      lagerRows.map(r => r.map(v => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(';')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'materiallogg-eksempel.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      a.remove();
      URL.revokeObjectURL(url);
    }, 100);
    logg('Eksporterte CSV');
    meld('CSV-fil eksportert (materiallogg-eksempel.csv).');
    vis();
  };

  $('#reset').onclick = () => {
    d = EKS();
    bestFilter = 'alle';
    $$('[data-bf]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.bf === 'alle')));
    meld('Tilbakestilt til opprinnelige eksempeldata.');
    lagre();
  };

  vis();
})();
