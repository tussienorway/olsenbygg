"""Playwright-tester: konsollfeil, 360 px, skjema, scifi-lab-feilhåndtering, CSV med æøå/semikolon."""
import os, sys, threading, http.server, functools, tempfile, struct, zlib
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
H = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
H.log_message = lambda self, *a: None
srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), H)
threading.Thread(target=srv.serve_forever, daemon=True).start()
B = f"http://127.0.0.1:{srv.server_port}/"
PAGES = ["index.html", "scifi-lab.html", "materialer.html", "personvern.html", "tilgjengelighet.html"]
res = []
def ok(name, cond, info=""):
    res.append((name, bool(cond))); print(("PASS " if cond else "FAIL ") + name + (f" – {info}" if info and not cond else ""))

def png(w, h):
    raw = b"".join(b"\0" + b"\x80\x90\xa0" * w for _ in range(h))
    ch = lambda t, d: struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xffffffff)
    return b"\x89PNG\r\n\x1a\n" + ch(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)) + ch(b"IDAT", zlib.compress(raw)) + ch(b"IEND", b"")

tmp = tempfile.mkdtemp()
with sync_playwright() as p:
    import glob as _g
    exe = os.environ.get("CHROME_PATH") or next(iter(_g.glob(os.path.expanduser("~/.cache/ms-playwright/chromium-*/chrome-linux*/chrome"))), None)
    br = p.chromium.launch(executable_path=exe) if exe else p.chromium.launch()
    for vp in [(360, 740), (1366, 900)]:
        ctx = br.new_context(viewport={"width": vp[0], "height": vp[1]}, service_workers="block")
        for pg_ in PAGES:
            pg = ctx.new_page(); errs = []
            pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
            pg.on("pageerror", lambda e: errs.append(str(e)))
            pg.goto(B + pg_); pg.wait_for_load_state("networkidle")
            ok(f"{pg_} @{vp[0]}px: 0 konsollfeil", not errs, str(errs))
            sw = pg.evaluate("document.documentElement.scrollWidth")
            ok(f"{pg_} @{vp[0]}px: ingen horisontal scroll", sw <= vp[0], f"scrollWidth={sw}")
            ok(f"{pg_} @{vp[0]}px: konseptmerke synlig", pg.locator(".concept").first.is_visible())
            pg.close()
        ctx.close()
    ctx = br.new_context(viewport={"width": 360, "height": 740}, service_workers="block", accept_downloads=True)
    pg = ctx.new_page(); pg.goto(B + "index.html")
    pg.click(".burger"); ok("mobilmeny åpner", pg.locator("#meny").is_visible())
    pg.keyboard.press("Escape"); ok("Escape lukker meny", pg.get_attribute(".burger", "aria-expanded") == "false")
    pg.goto(B + "index.html"); pg.keyboard.press("Tab")
    ok("første Tab gir hopp-lenke", pg.evaluate("document.activeElement.className") == "skip")
    pg.click("#tj [data-velg-tj='Arkitekttjenester']"); pg.wait_for_timeout(500)
    ok("velg tjeneste fyller skjema", pg.input_value("#tjsel") == "Arkitekttjenester")
    pg.evaluate("window.__m=null; HTMLAnchorElement.prototype.click=function(){window.__m=this.href}")
    pg.fill("#kform [name=navn]", "Åse Ødegård"); pg.fill("#kform [name=adr]", "Storgata 1")
    pg.reload(); ok("skjemautkast huskes lokalt", pg.input_value("#kform [name=navn]") == "Åse Ødegård")
    pg.evaluate("window.__m=null; HTMLAnchorElement.prototype.click=function(){window.__m=this.href}")
    pg.click("#kform button[type=submit]")
    m = pg.evaluate("window.__m") or ""
    ok("skjema lager mailto med æøå", m.startswith("mailto:rolf@olsenbygg.com") and "%C3%85se" in m and "Storgata" in m, m[:80])
    ok("kartlenke (ingen iframe)", pg.locator("iframe").count() == 0 and pg.locator("a[href*='openstreetmap.org/search']").count() == 1)
    # scifi-lab
    pg.goto(B + "scifi-lab.html")
    bad = os.path.join(tmp, "dok.txt"); open(bad, "w").write("hei")
    pg.set_input_files("#foto", bad); ok("feil filtype avvises", "støttes ikke" in pg.text_content("#vstatus"))
    br_ = os.path.join(tmp, "skadet.png"); open(br_, "wb").write(b"\x89PNG junk")
    pg.set_input_files("#foto", br_); pg.wait_for_timeout(500); ok("skadet bilde gir melding", "Kunne ikke lese" in pg.text_content("#vstatus"))
    big = os.path.join(tmp, "stor.png"); open(big, "wb").write(png(4000, 3000))
    pg.set_input_files("#foto", big); pg.wait_for_function("document.querySelector('#vstatus').textContent.includes('lastet inn')", timeout=15000)
    ok("stort bilde skaleres ned", "skalert ned" in pg.text_content("#vstatus"))
    with pg.expect_download() as dl: pg.click("#last")
    path = dl.value.path(); ok("PNG-eksport gir gyldig PNG", open(path, "rb").read(8) == b"\x89PNG\r\n\x1a\n")
    pg.click("#eksempelbilde"); pg.wait_for_timeout(500); ok("eksempeltomt lastes", "Eksempeltomt" in pg.text_content("#vstatus"))
    # materialer CSV
    pg.goto(B + "materialer.html"); pg.evaluate("localStorage.clear()"); pg.reload()
    pg.fill("#nymat [name=navn]", 'Skifer "Ødegård"; blå/grå'); pg.fill("#nymat [name=lager]", "7"); pg.fill("#nymat [name=enhet]", "m²")
    pg.fill("#nymat [name=prosjekt]", "Hytte på Fævik"); pg.click("#nymat button")
    with pg.expect_download() as dl: pg.click("#csv")
    raw = open(dl.value.path(), "rb").read()
    txt = raw.decode("utf-8")
    ok("CSV har BOM og semikolon", raw.startswith(b"\xef\xbb\xbf") and ";" in txt)
    ok("CSV bevarer æøå og sitat", '"Skifer ""Ødegård""; blå/grå"' in txt and "Fævik" in txt)
    pg.evaluate("localStorage.clear()"); pg.reload()
    pg.set_input_files("#csvinn", dl.value.path()); pg.wait_for_timeout(500)
    ok("CSV-import gjenoppretter rad med æøå/semikolon", 'Skifer "Ødegård"; blå/grå' in pg.text_content("#lager"), pg.text_content("#mstatus"))
    junk = os.path.join(tmp, "feil.csv"); open(junk, "w").write("a,b,c\n1,2,3")
    pg.set_input_files("#csvinn", junk); pg.wait_for_timeout(300)
    ok("feil CSV-format gir melding", "Import feilet" in pg.text_content("#mstatus"))
    br.close()
srv.shutdown()
p_ = sum(1 for _, c in res if c); f_ = len(res) - p_
print(f"RESULTAT: {p_} bestått, {f_} feilet")
sys.exit(1 if f_ else 0)
