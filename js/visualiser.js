/* Sci-Fi Lab v2: flere soner, hurtigvalg for belegningsstein/hekk/terrasse, dra/flytt punkter, teksturer med skygge, før/etter, PNG-nedlasting. */
(() => {
  const $ = s => document.querySelector(s);
  const M = window.MATERIALER;
  const cv = $('#vcanvas');
  if (!cv || !M) return;
  const cx = cv.getContext('2d');
  const W = cv.width, H = cv.height;

  let img = null, soner = [], aktiv = 0, drag = null, visFor = false;
  const cfg = window.AI_CONFIG || {};

  // Standard-koordinater for nye soner slik at de vises umiddelbart på lerretet
  const standardPunkter = (idx, lopende) => {
    const dx = ((idx % 3) - 1) * 70;
    const dy = Math.floor(idx / 3) * 35;
    if (lopende) {
      return [[180 + dx, 450 + dy], [420 + dx, 450 + dy], [320 + dx, 660 + dy]];
    }
    return [
      [320 + dx, 460 + dy],
      [620 + dx, 460 + dy],
      [700 + dx, 660 + dy],
      [240 + dx, 660 + dy]
    ];
  };

  const ny = (mat = 'belegningsstein', idx = soner.length) => {
    const m = M[mat] || M.belegningsstein;
    return {
      mat,
      areal: m.lopende ? 20 : 25,
      lop: m.lopende ? 12 : 10,
      pts: standardPunkter(idx, Boolean(m.lopende))
    };
  };

  function rnd(seed) {
    let x = seed;
    return () => (x = (x * 16807) % 2147483647) / 2147483647;
  }

  const cache = {};
  function pat(t) {
    if (cache[t]) return cache[t];
    const c = document.createElement('canvas'), S = 96;
    c.width = c.height = S;
    const g = c.getContext('2d'), r = rnd(t.length * 999 + 7);
    const fill = f => { g.fillStyle = f; g.fillRect(0, 0, S, S); };
    const noise = (cols, n, w, h) => {
      for (let i = 0; i < n; i++) {
        g.fillStyle = cols[i % cols.length];
        g.fillRect(r() * S, r() * S, w, h);
      }
    };
    if (t === 'stein') {
      fill('#72757a');
      for (let y = 0; y < S; y += 16) {
        for (let x = ((y / 16) % 2) * 16 - 32; x < S; x += 32) {
          g.fillStyle = `hsl(220,4%,${48 + r() * 14}%)`;
          g.fillRect(x + 1, y + 1, 30, 14);
          g.fillStyle = 'rgba(255,255,255,.12)';
          g.fillRect(x + 1, y + 1, 30, 2);
        }
      }
    } else if (t === 'skifer') {
      fill('#3c444c');
      for (let i = 0; i < 14; i++) {
        g.fillStyle = `hsl(210,9%,${24 + r() * 14}%)`;
        g.beginPath();
        const x = r() * S, y = r() * S;
        g.moveTo(x, y);
        for (let k = 0; k < 5; k++) g.lineTo(x + (r() - 0.5) * 50, y + (r() - 0.5) * 50);
        g.fill();
      }
      g.strokeStyle = '#23292f';
      g.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) {
        g.beginPath();
        g.moveTo(r() * S, 0);
        g.lineTo(r() * S, S);
        g.stroke();
      }
    } else if (t === 'grus') {
      fill('#a99a80');
      noise(['#c4b79e', '#8c7f68', '#d8ccb4', '#776b57'], 700, 2.2, 2.2);
    } else if (t === 'plen') {
      fill('#4a8a2c');
      for (let i = 0; i < 500; i++) {
        g.strokeStyle = ['#5fa03a', '#3d7324', '#6cb045'][i % 3];
        g.beginPath();
        const x = r() * S, y = r() * S;
        g.moveTo(x, y);
        g.lineTo(x + (r() - 0.5) * 3, y - 4 - r() * 4);
        g.stroke();
      }
    } else if (t === 'tre' || t === 'kompositt') {
      const b = t === 'tre' ? [30, 45] : [20, 8];
      fill(`hsl(${b[0]},${b[1]}%,40%)`);
      for (let y = 0; y < S; y += 12) {
        g.fillStyle = `hsl(${b[0]},${b[1]}%,${38 + r() * 12}%)`;
        g.fillRect(0, y, S, 11);
        g.fillStyle = 'rgba(0,0,0,.35)';
        g.fillRect(0, y + 11, S, 1);
        if (t === 'tre') {
          for (let k = 0; k < 4; k++) {
            g.fillStyle = 'rgba(60,30,10,.25)';
            g.fillRect(r() * S, y + 2 + r() * 7, 20 + r() * 30, 1);
          }
        }
      }
    } else if (t === 'heller') {
      fill('#8f908b');
      for (let y = 0; y < S; y += 48) {
        for (let x = 0; x < S; x += 48) {
          g.fillStyle = `hsl(60,3%,${60 + r() * 8}%)`;
          g.fillRect(x + 1.5, y + 1.5, 45, 45);
        }
      }
      noise(['rgba(0,0,0,.08)'], 200, 1, 1);
    } else if (t === 'hekk') {
      fill('#24491b');
      for (let i = 0; i < 180; i++) {
        g.fillStyle = ['#3c7a2c', '#2a5a1f', '#4f9238', '#1d3d15'][i % 4];
        g.beginPath();
        g.arc(r() * S, r() * S, 3 + r() * 4.5, 0, 7);
        g.fill();
      }
    } else if (t === 'mur') {
      fill('#6b6b66');
      for (let y = 0; y < S; y += 24) {
        for (let x = ((y / 24) % 2) * 24 - 48; x < S; x += 48) {
          g.fillStyle = `hsl(40,3%,${52 + r() * 12}%)`;
          g.fillRect(x + 2, y + 2, 44, 20);
        }
      }
    } else if (t === 'kant') {
      fill('#bdbdb8');
      for (let x = 0; x < S; x += 24) {
        g.fillStyle = 'rgba(0,0,0,.25)';
        g.fillRect(x, 0, 1.5, S);
      }
    } else if (t === 'gjerde') {
      fill('#6b5335');
      for (let x = 0; x < S; x += 12) {
        g.fillStyle = `hsl(35,35%,${62 + r() * 10}%)`;
        g.fillRect(x, 0, 9, S);
      }
    }
    return cache[t] = cx.createPattern(c, 'repeat');
  }

  function sti(p) {
    cx.beginPath();
    p.forEach((q, i) => (i ? cx.lineTo(q[0], q[1]) : cx.moveTo(q[0], q[1])));
  }

  function senter(p) {
    if (!p.length) return [W / 2, H / 2];
    const sx = p.reduce((a, q) => a + q[0], 0) / p.length;
    const sy = p.reduce((a, q) => a + q[1], 0) / p.length;
    return [sx, sy];
  }

  function tegnPille(tekst, x, y, bg = 'rgba(23,43,77,.82)', fg = '#fff', font = 'bold 14px system-ui') {
    cx.save();
    cx.font = font;
    const tw = cx.measureText(tekst).width;
    const pw = tw + 22, ph = 28;
    const rx = Math.max(8, Math.min(W - pw - 8, x - pw / 2));
    const ry = Math.max(8, Math.min(H - ph - 8, y - ph / 2));
    cx.fillStyle = bg;
    cx.beginPath();
    if (cx.roundRect) cx.roundRect(rx, ry, pw, ph, 7);
    else cx.rect(rx, ry, pw, ph);
    cx.fill();
    cx.fillStyle = fg;
    cx.textBaseline = 'middle';
    cx.fillText(tekst, rx + 11, ry + ph / 2);
    cx.restore();
  }

  function tegn() {
    cx.clearRect(0, 0, W, H);
    if (img) {
      const k = Math.max(W / img.width, H / img.height), w = img.width * k, h = img.height * k;
      cx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
    } else {
      const g = cx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#24365a');
      g.addColorStop(1, '#141b2e');
      cx.fillStyle = g;
      cx.fillRect(0, 0, W, H);
      cx.fillStyle = '#8fb3d1';
      cx.font = '24px system-ui';
      cx.textAlign = 'center';
      cx.fillText('Last opp et bilde av tomta – eller tegn rett her', W / 2, H / 2);
      cx.textAlign = 'left';
    }

    if (!visFor) {
      soner.forEach((z, zi) => {
        const m = M[z.mat] || M.belegningsstein;
        const p = z.pts;
        if (!p.length) return;

        if (!m.lopende && p.length > 2) {
          cx.save();
          sti(p);
          cx.closePath();
          cx.shadowColor = 'rgba(0,0,0,.45)';
          cx.shadowBlur = 18;
          cx.shadowOffsetY = 6;
          cx.fillStyle = pat(m.tekstur);
          cx.globalAlpha = 0.92;
          cx.fill();
          cx.restore();

          cx.save();
          sti(p);
          cx.closePath();
          cx.clip();
          const ys = p.map(q => q[1]), y0 = Math.min(...ys), y1 = Math.max(...ys);
          const lg = cx.createLinearGradient(0, y0, 0, y1 || y0 + 1);
          lg.addColorStop(0, 'rgba(0,0,0,.26)');
          lg.addColorStop(1, 'rgba(255,255,255,.08)');
          cx.fillStyle = lg;
          cx.fillRect(0, y0, W, Math.max(1, y1 - y0));
          cx.lineWidth = 4;
          cx.strokeStyle = 'rgba(255,255,255,.35)';
          sti(p);
          cx.closePath();
          cx.stroke();
          cx.restore();
        }

        if (m.lopende && p.length >= 2) {
          cx.save();
          sti(p);
          cx.lineCap = 'round';
          cx.lineJoin = 'round';
          const tyk = m.tekstur === 'hekk' ? 36 : m.tekstur === 'mur' ? 26 : m.tekstur === 'gjerde' ? 20 : 12;
          cx.shadowColor = 'rgba(0,0,0,.5)';
          cx.shadowBlur = 14;
          cx.shadowOffsetY = 8;
          cx.lineWidth = tyk;
          cx.strokeStyle = pat(m.tekstur);
          cx.stroke();
          cx.restore();
        }

        if (zi === aktiv) {
          if (p.length >= 2) {
            cx.save();
            sti(p);
            if (!m.lopende && p.length > 2) cx.closePath();
            cx.strokeStyle = '#11cdef';
            cx.lineWidth = 2.5;
            cx.setLineDash([8, 6]);
            cx.stroke();
            cx.restore();
          }

          p.forEach(q => {
            cx.beginPath();
            cx.arc(q[0], q[1], 9, 0, 7);
            cx.fillStyle = '#fff';
            cx.fill();
            cx.beginPath();
            cx.arc(q[0], q[1], 6, 0, 7);
            cx.fillStyle = '#fb6340';
            cx.fill();
          });
        }

        // Vis valgt materiale og areal/lengde direkte på sonen i bildet
        const [cx0, cy0] = senter(p);
        const mengdeTxt = m.lopende ? `${z.lop} m` : `${z.areal} m²`;
        tegnPille(
          `Sone ${zi + 1}: ${m.navn} · ${mengdeTxt}`,
          cx0,
          cy0,
          zi === aktiv ? 'rgba(17, 24, 39, 0.88)' : 'rgba(23, 43, 77, 0.78)'
        );
      });
    }

    // Vannmerke øverst til venstre (dynamisk bredde så tekst aldri kuttes)
    const wmTxt = visFor ? 'FØR (original)' : 'ILLUSTRASJON – estimat, ikke tilbud';
    cx.save();
    cx.font = 'bold 16px system-ui';
    const wmW = cx.measureText(wmTxt).width + 28;
    cx.fillStyle = 'rgba(23,43,77,.82)';
    cx.beginPath();
    if (cx.roundRect) cx.roundRect(12, 12, wmW, 36, 8);
    else cx.rect(12, 12, wmW, 36);
    cx.fill();
    cx.fillStyle = '#fff';
    cx.textBaseline = 'middle';
    cx.fillText(wmTxt, 26, 30);
    cx.restore();
  }

  const pos = e => {
    const r = cv.getBoundingClientRect();
    return [(e.clientX - r.left) * W / (r.width || W), (e.clientY - r.top) * H / (r.height || H)];
  };

  const naer = p => {
    const z = soner[aktiv];
    if (!z) return -1;
    const r = cv.getBoundingClientRect();
    const tol = 20 * W / (r.width || W);
    return z.pts.findIndex(q => Math.hypot(q[0] - p[0], q[1] - p[1]) < tol);
  };

  let dragPointerId = null;

  cv.addEventListener('pointerdown', e => {
    if (drag != null) return;
    const p = pos(e), i = naer(p);
    if (i >= 0) {
      drag = i;
      dragPointerId = e.pointerId;
      if (cv.setPointerCapture && e.pointerId != null) {
        try { cv.setPointerCapture(e.pointerId); } catch (_) {}
      }
    } else if (soner[aktiv]) {
      soner[aktiv].pts.push(p);
      tegn();
      oppdater();
      $('#vstatus').textContent = `Punkt ${soner[aktiv].pts.length} satt i Sone ${aktiv + 1}.`;
    }
  });

  cv.addEventListener('pointermove', e => {
    if (drag == null) {
      cv.style.cursor = naer(pos(e)) >= 0 ? 'grab' : 'crosshair';
      return;
    }
    if (dragPointerId != null && e.pointerId != null && e.pointerId !== dragPointerId) return;
    if (soner[aktiv]) {
      soner[aktiv].pts[drag] = pos(e);
      tegn();
    }
  });

  const avsluttDrag = e => {
    if (drag == null) return;
    if (dragPointerId != null && e.pointerId != null && e.pointerId !== dragPointerId) return;
    drag = null;
    dragPointerId = null;
  };
  cv.addEventListener('pointerup', avsluttDrag);
  cv.addEventListener('pointercancel', avsluttDrag);
  cv.addEventListener('dblclick', e => {
    const i = naer(pos(e));
    if (i >= 0 && soner[aktiv]) {
      soner[aktiv].pts.splice(i, 1);
      tegn();
      $('#vstatus').textContent = `Punkt fjernet fra Sone ${aktiv + 1} (${soner[aktiv].pts.length} punkter igjen).`;
    }
  });

  // Hurtigvalg-knapper for aktiv sone
  const HURTIG_KEYS = ['belegningsstein', 'hekk', 'terrasse', 'plen', 'skifer', 'stottemur', 'grus', 'gjerde'];
  function oppdaterHurtigvalg() {
    const boks = $('#mat-hurtig');
    if (!boks) return;
    const aktMat = soner[aktiv]?.mat;
    if (!boks.children.length) {
      boks.innerHTML = HURTIG_KEYS.filter(k => M[k]).map(k => {
        const m = M[k];
        return `<button type="button" data-hmat="${k}" aria-pressed="${k === aktMat}">
          <span class="dot" style="background:${m.farge};margin-right:2px"></span>${m.navn}
        </button>`;
      }).join('');
    } else {
      boks.querySelectorAll('[data-hmat]').forEach(b => {
        b.setAttribute('aria-pressed', String(b.dataset.hmat === aktMat));
      });
    }
  }

  function settMaterialeForSone(idx, nyMat) {
    const z = soner[idx];
    if (!z || !M[nyMat]) return;
    z.mat = nyMat;
    const m = M[nyMat];
    if (m.lopende && (!z.lop || z.lop <= 0)) z.lop = z.areal || 12;
    if (!m.lopende && (!z.areal || z.areal <= 0)) z.areal = z.lop || 25;
    if (!m.lopende && z.pts.length < 3) {
      z.pts = standardPunkter(idx, false);
    } else if (m.lopende && z.pts.length < 2) {
      z.pts = standardPunkter(idx, true);
    }
  }

  const hurtigBoks = $('#mat-hurtig');
  if (hurtigBoks) {
    hurtigBoks.addEventListener('click', e => {
      const btn = e.target.closest('[data-hmat]');
      if (!btn || !soner[aktiv]) return;
      settMaterialeForSone(aktiv, btn.dataset.hmat);
      const z = soner[aktiv], m = M[z.mat];
      liste();
      oppdaterHurtigvalg();
      tegn();
      oppdater();
      $('#vstatus').textContent = `Sone ${aktiv + 1} satt til ${m.navn.toLowerCase()} (${m.lopende ? z.lop + ' m' : z.areal + ' m²'}).`;
    });
  }

  function liste() {
    $('#soner').innerHTML = soner.map((z, i) => {
      const m = M[z.mat] || M.belegningsstein;
      return `<div class="sone ${i === aktiv ? 'on' : ''}" data-i="${i}">
        <button type="button" class="sel" data-i="${i}" aria-pressed="${i === aktiv}">Sone ${i + 1}</button>
        <select data-f="mat" data-i="${i}" aria-label="Materiale sone ${i + 1}">${Object.entries(M).map(([k, v]) => `<option value="${k}" ${k === z.mat ? 'selected' : ''}>${v.navn}${v.lopende ? ' (linje)' : ''}</option>`).join('')}</select>
        <label>${m.lopende ? 'Lengde, m' : 'Areal, m²'}<input type="number" min="0" step="0.5" data-f="${m.lopende ? 'lop' : 'areal'}" data-i="${i}" value="${m.lopende ? z.lop : z.areal}"></label>
        <button type="button" class="x" data-del="${i}" aria-label="Slett sone ${i + 1}">✕</button>
      </div>`;
    }).join('');
    oppdaterHurtigvalg();
  }

  $('#soner').addEventListener('click', e => {
    const t = e.target;
    if (t.dataset.del != null) {
      soner.splice(+t.dataset.del, 1);
      if (!soner.length) soner.push(ny('belegningsstein', 0));
      aktiv = Math.min(aktiv, soner.length - 1);
    } else if (t.classList.contains('sel')) {
      aktiv = +t.dataset.i;
    } else {
      return;
    }
    liste();
    tegn();
    oppdater();
  });

  const haandterSoneEndring = e => {
    const t = e.target;
    if (!t || t.dataset.i == null) return;
    const idx = +t.dataset.i;
    const z = soner[idx];
    if (!z) return;
    aktiv = idx;
    if (t.dataset.f === 'mat') {
      if (z.mat === t.value) return;
      settMaterialeForSone(idx, t.value);
      liste();
    } else if (t.dataset.f === 'areal' || t.dataset.f === 'lop') {
      const nyVerdi = Math.max(0, parseFloat(t.value) || 0);
      if (z[t.dataset.f] === nyVerdi) return;
      z[t.dataset.f] = nyVerdi;
      oppdaterHurtigvalg();
    } else {
      return;
    }
    const m = M[z.mat];
    tegn();
    oppdater();
    $('#vstatus').textContent = `Sone ${idx + 1}: ${m.navn} (${m.lopende ? z.lop + ' m' : z.areal + ' m²'}) oppdatert direkte.`;
  };

  $('#soner').addEventListener('input', haandterSoneEndring);
  $('#soner').addEventListener('change', haandterSoneEndring);

  $('#nysone').onclick = () => {
    soner.push(ny('plen', soner.length));
    aktiv = soner.length - 1;
    liste();
    tegn();
    oppdater();
    $('#vstatus').textContent = `Sone ${aktiv + 1} lagt til. Velg materiale og tilpass punkter i bildet.`;
  };

  $('#nullstill').onclick = () => {
    if (!soner[aktiv]) return;
    soner[aktiv].pts = [];
    tegn();
    $('#vstatus').textContent = `Sone ${aktiv + 1} tømt. Klikk i bildet for å sette nye punkter.`;
  };

  $('#angre').onclick = () => {
    if (!soner[aktiv]) return;
    soner[aktiv].pts.pop();
    tegn();
    $('#vstatus').textContent = `Angret siste punkt i Sone ${aktiv + 1} (${soner[aktiv].pts.length} punkter).`;
  };

  const feBtn = $('#forEtter');
  let holdStart = 0;
  let varSynligForTrykk = false;
  const settVisFor = nyVerdi => {
    visFor = Boolean(nyVerdi);
    if (feBtn) feBtn.setAttribute('aria-pressed', String(visFor));
    tegn();
    $('#vstatus').textContent = visFor ? 'Viser originalt bilde (før).' : 'Viser visualisering med valgte soner (etter).';
  };
  if (feBtn) {
    feBtn.setAttribute('aria-pressed', 'false');
    feBtn.addEventListener('pointerdown', () => {
      holdStart = Date.now();
      varSynligForTrykk = visFor;
      if (!visFor) settVisFor(true);
    });
    const avsluttHold = evType => {
      if (!holdStart) return;
      const varighet = Date.now() - holdStart;
      holdStart = 0;
      if (evType === 'pointerleave' || evType === 'pointercancel') {
        if (!varSynligForTrykk && visFor) settVisFor(false);
        return;
      }
      if (varSynligForTrykk) {
        settVisFor(false);
      } else if (varighet >= 250) {
        settVisFor(false);
      }
    };
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => feBtn.addEventListener(ev, () => avsluttHold(ev)));
    feBtn.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'Enter') {
        settVisFor(!visFor);
        e.preventDefault();
      }
    });
  }

  $('#last').onclick = () => {
    const a = document.createElement('a');
    a.download = 'tomt-illustrasjon.png';
    a.href = cv.toDataURL('image/png');
    document.body.appendChild(a);
    a.click();
    setTimeout(() => a.remove(), 100);
    $('#vstatus').textContent = 'PNG-illustrasjon lastet ned (tomt-illustrasjon.png).';
  };

  $('#foto').addEventListener('change', e => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const fr = new FileReader();
    fr.onload = () => {
      const i = new Image();
      i.onload = () => {
        img = i;
        tegn();
        $('#vstatus').textContent = `Eget bilde lastet inn (${f.name}). Dra i punktene for å tilpasse sonene.`;
      };
      i.src = fr.result;
    };
    fr.readAsDataURL(f);
  });

  const eksBtn = $('#eksempelbilde');
  if (eksBtn) {
    eksBtn.onclick = () => {
      const d = new Image();
      d.onload = () => {
        img = d;
        tegn();
        $('#vstatus').textContent = 'Eksempeltomt (KI-illustrasjon) lastet inn.';
      };
      d.src = 'img/for-tomt.webp';
    };
  }

  function oppdater() {
    let sum = 0;
    const rad = soner.map((z, i) => {
      const m = M[z.mat] || M.belegningsstein;
      const b = m.lopende ? z.lop : z.areal;
      const q = m.enhet === 'stk' ? Math.ceil(b * m.pr * (1 + m.svinn)) : Math.ceil(b * m.pr * (1 + m.svinn) * 10) / 10;
      const kr = Math.round(q * m.pris);
      sum += kr;
      return `<tr><td><span class="dot" style="background:${m.farge}"></span>Sone ${i + 1}: ${m.navn} (${b} ${m.lopende ? 'm' : 'm²'})</td><td>${q.toLocaleString('nb-NO')} ${m.enhet}</td><td>${kr.toLocaleString('nb-NO')} kr</td></tr>`;
    });
    $('#esttab').innerHTML = `<caption class="sr">Grovestimat per sone</caption><tr><th>Sone / materiale</th><th>Mengde inkl. svinn</th><th>Grovestimat*</th></tr>${rad.join('')}<tr class="sum"><th>Sum materialer (estimat)</th><th></th><th>${sum.toLocaleString('nb-NO')} kr</th></tr>`;
    $('#sumbig').textContent = sum.toLocaleString('nb-NO') + ' kr';
  }

  $('#modusinfo').textContent = cfg.endpoint
    ? 'Proxy satt opp: ' + cfg.endpoint
    : 'Ingen proxy konfigurert – KI-modus faller tilbake til demo.';

  async function ai() {
    const f = $('#foto').files && $('#foto').files[0];
    if (!cfg.endpoint || !f) return false;
    $('#vstatus').textContent = 'Sender til proxy …';
    const b64 = await new Promise(r => {
      const fr = new FileReader();
      fr.onload = () => r(fr.result);
      fr.readAsDataURL(f);
    });
    const prompt = 'Rediger bildet realistisk og behold huset og perspektivet. Legg til: ' + soner.map(z => `${M[z.mat].navn.toLowerCase()} (${M[z.mat].lopende ? z.lop + ' m' : z.areal + ' m²'})`).join(', ') + '.';
    try {
      const r = await fetch(cfg.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: b64, prompt })
      });
      const j = await r.json();
      if (!r.ok || !j.image) throw Error(j.error || r.status);
      const i = new Image();
      i.onload = () => {
        img = i;
        soner.forEach(z => { z.pts = []; });
        tegn();
        $('#vstatus').textContent = 'KI-generert bilde (Grok) – illustrasjon, ikke garanti.';
      };
      i.src = j.image;
      return true;
    } catch (e) {
      $('#vstatus').textContent = 'Proxy feilet (' + e.message + ') – viser demo.';
      return false;
    }
  }

  $('#kjor').onclick = async () => {
    oppdater();
    if ($('#modus').value === 'ai' && await ai()) return;
    tegn();
    $('#vstatus').textContent = 'Demo: teksturer lagt på markerte soner. Dra punktene for å justere.';
    $('#mengde').scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth',
      block: 'nearest'
    });
  };

  /* Startdemo */
  soner = [
    { mat: 'belegningsstein', areal: 40, lop: 12, pts: [[300, 440], [680, 440], [800, 690], [170, 690]] },
    { mat: 'hekk', areal: 20, lop: 12, pts: [[120, 420], [290, 420], [160, 690]] },
    { mat: 'plen', areal: 30, lop: 10, pts: [[700, 430], [930, 430], [940, 690], [820, 690]] }
  ];
  liste();
  tegn();
  oppdater();

  const d = new Image();
  d.onload = () => {
    if (!img) {
      img = d;
      tegn();
      $('#vstatus').textContent = 'Eksempeltomt (KI-illustrasjon). Last opp ditt eget bilde eller bruk hurtigvalgene for å prøve.';
    }
  };
  d.src = 'img/for-tomt.webp';
})();
