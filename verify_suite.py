import os, glob, re, subprocess, json, urllib.request

print("=== TEST 1: HTML PARSING & LOCAL LINKS ===")
html_files = glob.glob("*.html")
errors = []

for hf in html_files:
    with open(hf, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Check scripts
    for m in re.finditer(r'<script[^>]+src=["\']([^"\']+)["\']', content):
        src = m.group(1)
        if not src.startswith("http") and not os.path.exists(src):
            errors.append(f"[{hf}] Missing script: {src}")
            
    # Check stylesheets
    for m in re.finditer(r'<link[^>]+rel=["\']stylesheet["\'][^>]+href=["\']([^"\']+)["\']', content):
        href = m.group(1)
        if href and not href.startswith("http") and not os.path.exists(href):
            errors.append(f"[{hf}] Missing css: {href}")
            
    # Check internal links
    for m in re.finditer(r'<a[^>]+href=["\']([^"\']+)["\']', content):
        href = m.group(1)
        if href.startswith(("#", "tel:", "mailto:", "http", "?", "javascript:")):
            continue
        clean_href = href.split("#")[0].split("?")[0]
        if clean_href and clean_href != "./" and not os.path.exists(clean_href):
            errors.append(f"[{hf}] Broken link: {href}")

    # Check images
    for m in re.finditer(r'<img[^>]+src=["\']([^"\']+)["\']', content):
        src = m.group(1)
        if not src.startswith(("http", "data:")) and not os.path.exists(src):
            errors.append(f"[{hf}] Missing image: {src}")

    # Check mobile menu button and meta description
    if 'class="burger"' not in content:
        errors.append(f"[{hf}] Missing mobile .burger button")
    if 'name="description"' not in content:
        errors.append(f"[{hf}] Missing meta description")

# Check sw.js precache files
with open("sw.js", "r", encoding="utf-8") as swf:
    swc = swf.read()
sw_list_match = re.search(r"F=\[([^\]]+)\]", swc)
if sw_list_match:
    for item in re.findall(r"'([^']+)'", sw_list_match.group(1)):
        if item != "./" and not os.path.exists(item):
            errors.append(f"[sw.js] Missing precache asset: {item}")
        if "js/ai-config.js" not in sw_list_match.group(1):
            errors.append("[sw.js] Missing js/ai-config.js in precache")

if errors:
    print("FAIL: Found errors:")
    for e in errors:
        print(" ", e)
else:
    print(f"PASS: All {len(html_files)} HTML files and sw.js precache assets have valid local links, images, meta descriptions, and mobile menus!")

print("\n=== TEST 2: SECRET LEAK SCAN ===")
secret_patterns = [
    r"sk-[a-zA-Z0-9]{20,}",
    r"ghp_[a-zA-Z0-9]{20,}",
    r"xox[baprs]-[0-9a-zA-Z]{10,}",
    r"AIzaSy[a-zA-Z0-9_-]{33}",
    r"Bearer\s+[a-zA-Z0-9_\-\.]{25,}"
]

leak_found = False
for root, dirs, files in os.walk("."):
    if ".git" in root:
        continue
    for file in files:
        if file.endswith((".html", ".js", ".css", ".md", ".json", ".txt", ".xml")):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                c = f.read()
            for pat in secret_patterns:
                m = re.search(pat, c)
                if m:
                    print(f"LEAK WARNING in {path}: {m.group(0)[:10]}...")
                    leak_found = True

if not leak_found:
    print("PASS: Zero secrets, private tokens, or credentials found in repository!")

print("\n=== TEST 3: REQUIRED CONTENT AUDIT ===")
required_facts = [
    ("Olsenbygg Grimstad AS", ["index.html", "js/data.js"]),
    ("415 15 588", ["index.html", "js/data.js"]),
    ("Industriveien 15", ["index.html", "js/data.js"]),
    ("EKSEMPEL", ["index.html", "materialer.html"]),
    ("ikke bestilt eller godkjent", ["index.html", "scifi-lab.html", "README.md"]),
    ("KI-illustrasjon", ["index.html"]),
    ("Sci-Fi Lab", ["index.html", "scifi-lab.html"]),
    ("XAI_API_KEY", ["server/xai-proxy.mjs"]),
]

all_facts_ok = True
for fact, files in required_facts:
    for f in files:
        with open(f, "r", encoding="utf-8") as fl:
            if fact not in fl.read():
                print(f"MISSING fact '{fact}' in {f}")
                all_facts_ok = False
if all_facts_ok:
    print("PASS: All required facts and AI modules verified present across pages!")

print("Done.")
