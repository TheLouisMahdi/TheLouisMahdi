from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def write(path, text):
    (ROOT / path).write_text(text, encoding="utf-8")


def replace_once(text, old, new, label):
    if text.count(old) != 1:
        raise RuntimeError(f"{label}: expected exactly one match, found {text.count(old)}")
    return text.replace(old, new, 1)


# index.html
path = "index.html"
html = read(path)
html = replace_once(html, '<meta property="og:title" content="Eka @GitHub · TheLouisMahdi">', '<meta property="og:title" content="TheLouisMahdi · Interactive Engineering Portfolio">', "og title")
html = replace_once(html, '<title>Eka @GitHub · TheLouisMahdi</title>', '<title>TheLouisMahdi · Interactive Engineering Portfolio</title>', "document title")
html = replace_once(html, '<link rel="stylesheet" href="css/receipt.css">\n', '', "receipt stylesheet")
html = replace_once(
    html,
    '<link rel="stylesheet" href="css/runtime.css" data-win7-runtime>\n',
    '<link rel="stylesheet" href="css/runtime.css" data-win7-runtime>\n<link rel="stylesheet" href="css/mobile-fit.css" data-mobile-fit>\n<link rel="stylesheet" href="css/site-shell.css">\n',
    "responsive/site shell styles",
)
old_header = '''  <div class="hero-bar">\n    <a class="eka-link" href="https://github.com/TheLouisMahdi" target="_blank" rel="noreferrer">Eka @GitHub</a>\n    <span class="hero-name">Mahdi Ghahremani · TheLouisMahdi</span>\n  </div>'''
new_header = '''  <div class="site-intro">\n    <div class="site-intro-kicker">TheLouisMahdi · Interactive Engineering Portfolio</div>\n    <h1>Engineering <span>across layers.</span></h1>\n    <p>Software, applied AI, embedded systems and digital hardware — built as one connected engineering stack.</p>\n    <div class="site-intro-tags" aria-label="Focus areas">\n      <span>Computer Vision</span>\n      <span>Embedded Systems</span>\n      <span>FPGA / Verilog</span>\n      <span>Engineering Automation</span>\n    </div>\n  </div>'''
html = replace_once(html, old_header, new_header, "hero header")
html = replace_once(html, '              <span>Microsoft Windows 7 Professional</span>\n', '', "boot edition label")
html = replace_once(
    html,
    '<button data-toolbar-open="computer">Computer</button><button data-toolbar-open="documents">Documents</button><button data-toolbar-open="pictures">Pictures</button><button data-toolbar-app="notepad">Notepad</button><button data-toolbar-app="printprofile">Print Profile</button><button data-toolbar-external="https://github.com/TheLouisMahdi">Eka @GitHub</button>',
    '<button data-toolbar-open="computer">Computer</button><button data-toolbar-open="documents">Documents</button><button data-toolbar-open="pictures">Pictures</button><button data-toolbar-app="notepad">Notepad</button><button data-toolbar-external="https://github.com/TheLouisMahdi">GitHub · TheLouisMahdi</button>',
    "desktop toolbar printer",
)
printer_start = html.find('  <section class="printer-zone" id="printerZone">')
about_marker = '\n</section>\n\n<section class="readme" id="about">'
if printer_start < 0:
    raise RuntimeError("printer section start not found")
hero_close = html.find(about_marker, printer_start)
if hero_close < 0:
    raise RuntimeError("hero close after printer not found")
# Everything between printer start and the hero closing section belongs to the printer.
html = html[:printer_start] + html[hero_close:]
footer = '''\n<footer class="site-footer" aria-label="Profile links">\n  <div class="site-footer-inner">\n    <div class="footer-identity">\n      <p class="footer-eyebrow">Engineering · Software · AI · Hardware</p>\n      <h2>Mahdi Ghahremani</h2>\n      <p>Electrical Engineering · University of Zanjan · building practical systems across software and hardware.</p>\n      <div class="footer-aliases" aria-label="Online aliases">\n        <span>TheLouisMahdi</span>\n        <span>poimu</span>\n        <span>Eka</span>\n        <span>Eka Francium</span>\n      </div>\n    </div>\n    <div class="footer-actions">\n      <a class="liquid-telegram" href="https://t.me/thelouis_mahdi" target="_blank" rel="noreferrer">\n        <span><strong>Telegram</strong><small>@thelouis_mahdi · primary contact</small></span>\n        <b aria-hidden="true">↗</b>\n      </a>\n      <a class="footer-github" href="https://github.com/TheLouisMahdi" target="_blank" rel="noreferrer">\n        <span>GitHub reference</span><strong>TheLouisMahdi ↗</strong>\n      </a>\n    </div>\n  </div>\n  <div class="footer-bottom">\n    <span>© Mahdi Ghahremani</span>\n    <span>Interactive Windows portfolio · GitHub Pages</span>\n  </div>\n</footer>\n'''
html = replace_once(html, '\n</main>\n<script type="module" src="js/app.js"></script>', footer + '</main>\n<script type="module" src="js/app.js"></script>', "footer insertion")
write(path, html)

# app.js: remove the external profile-printer integration without touching the simulator core.
path = "js/app.js"
app = read(path)
app = replace_once(app, 'import{initReceipt,printReceipt}from"./receipt.js"\n', '', "receipt import")
app = replace_once(app, '  if(app==="printprofile"){byId("startMenu")?.classList.add("hidden");byId("allProgramsPanel")?.classList.add("hidden");printReceipt();document.getElementById("printerZone")?.scrollIntoView({behavior:"smooth",block:"center"});return}\n', '', "printprofile app branch")
app = replace_once(app, '  initReceipt()\n', '', "initReceipt")
write(path, app)

# data.js: remove the printer shortcut from the virtual desktop.
path = "js/data.js"
data = read(path)
data = replace_once(data, '    {name:"Print Profile",type:"printer",app:"printprofile"},\n', '', "desktop printer shortcut")
write(path, data)

# Notepad keeps Print, but delegates to the browser instead of the removed external printer UI.
path = "js/notepad.js"
notepad = read(path)
old = '  byId("notePrint").addEventListener("click",()=>{window.dispatchEvent(new CustomEvent("win7:print-document",{detail:{name:currentName(),text:byId("noteText").value}}));document.getElementById("printerZone")?.scrollIntoView({behavior:"smooth",block:"center")})'
notepad = replace_once(notepad, old, '  byId("notePrint").addEventListener("click",()=>window.print())', "notepad print handler")
write(path, notepad)

# PowerShell biography: stop making the site another full viewport tall.
path = "css/portfolio-liquid.css"
css = read(path)
css = replace_once(css, '.portfolio-liquid .ps-stage{position:relative;min-height:100vh;padding:74px 32px 90px;', '.portfolio-liquid .ps-stage{position:relative;min-height:0;padding:56px 32px 60px;', "desktop PowerShell stage")
css = replace_once(css, '.portfolio-liquid .ps-console{height:min(720px,72vh);min-height:520px;', '.portfolio-liquid .ps-console{height:min(650px,62vh);min-height:420px;', "desktop PowerShell console")
css = replace_once(css, '@media(max-width:760px){.portfolio-liquid .ps-stage{padding:64px 12px}', '@media(max-width:760px){.portfolio-liquid .ps-stage{padding:50px 10px 30px}', "mobile PowerShell stage")
css = replace_once(css, '.portfolio-liquid .ps-console{height:70vh;min-height:520px;', '.portfolio-liquid .ps-console{height:min(58svh,480px);min-height:340px;', "mobile PowerShell console")
write(path, css)

# Remove dead printer-specific runtime styling.
path = "css/runtime.css"
runtime = read(path)
start = runtime.find('.printer{overflow:hidden}')
end_marker = '\n\n.personalization-page>main'
end = runtime.find(end_marker, start)
if start < 0 or end < 0:
    raise RuntimeError("runtime printer block not found")
runtime = runtime[:start] + runtime[end + 2:]
runtime = runtime.replace('  .printer-zone{width:min(610px,96vw)}\n  .printer{padding:13px 14px 17px}.receipt{max-width:94%}.tear-zone,.torn-stack{max-width:94%}\n', '')
write(path, runtime)

# Remove the now obsolete printer-only print stylesheet from base CSS.
path = "css/base.css"
base = read(path)
print_start = base.find('@media print{body *{visibility:hidden!important}')
next_mobile = base.find('@media(max-width:760px){', print_start)
if print_start < 0 or next_mobile < 0:
    raise RuntimeError("printer print-media block not found")
base = base[:print_start] + base[next_mobile:]
write(path, base)

# Tests: convert printer fidelity checks into shell/mobile/boot checks.
path = "tests/smoke.mjs"
smoke = read(path)
smoke = replace_once(smoke, 'const receipt=read("js/receipt.js")\n', '', "receipt test import")
smoke = replace_once(smoke, 'const receiptCss=read("css/receipt.css")\n', '', "receipt CSS test import")
smoke = replace_once(smoke, 'const runtimeCss=read("css/runtime.css")\n', 'const runtimeCss=read("css/runtime.css")\nconst siteShell=read("css/site-shell.css")\n', "site shell test import")
for old in [
    'assert.ok(receipt.includes("Tear the current receipt before printing another."),"manual tear guard is missing")\n',
    'assert.ok(!app.includes("setTimeout(printReceipt"),"receipt must not print on page load")\n',
    'assert.ok(index.includes(\'id="printerProgress"\'),"reference printer progress track is missing")\n',
    'assert.ok(receipt.includes(\'easing:"linear"\')&&!receipt.includes("stage.animate"),"receipt feed must stay on compositor-only transforms")\n',
    'assert.ok(!/\\.receipt:after/.test(receiptCss),"the first receipt must have a flat lower edge")\n',
]:
    if old not in smoke:
        raise RuntimeError(f"missing old receipt test: {old.strip()}")
    smoke = smoke.replace(old, '', 1)
anchor = 'assert.ok(index.includes(\'assets/windows7/cursors/aero_arrow.png\'),"the exact Windows 7 Aero cursor is not mounted")\n'
new_checks = '''assert.ok(index.includes('css/site-shell.css'),"site shell stylesheet is missing")\nassert.ok(index.includes('css/mobile-fit.css" data-mobile-fit'),"mobile-fit stylesheet must be render-linked")\nassert.ok(!index.includes('id="printerZone"')&&!app.includes('./receipt.js')&&!data.includes('app:"printprofile"'),"profile printer must be fully removed")\nassert.ok(index.includes('class="site-footer"')&&index.includes('Eka Francium')&&index.includes('poimu'),"footer identity aliases are missing")\nassert.ok(index.includes('class="liquid-telegram"')&&siteShell.includes('backdrop-filter:blur(18px)'),"liquid Telegram footer CTA is missing")\nconst bootBlock=index.match(/<div class="windows-boot[\\s\\S]*?<\\/div>\\s*<\\/section>/)?.[0]||""\nassert.ok(bootBlock&&!bootBlock.includes("Windows 7 Professional"),"Starting Windows screen must not overlap edition branding")\n'''
smoke = replace_once(smoke, anchor, anchor + new_checks, "site shell smoke assertions")
write(path, smoke)

# Mobile regression test: verify the actual linked stylesheet and absence of printer UI.
path = "tests/mobile-layout.mjs"
mobile = read(path)
old_eval = '''      return{\n        innerWidth,\n        scrollWidth:document.documentElement.scrollWidth,\n        screenWidth:screen.width,\n        screenHeight:screen.height,\n        consoleHeight:consoleBox.height\n      }'''
new_eval = '''      const hero=document.querySelector(".hero").getBoundingClientRect()\n      return{\n        innerWidth,\n        scrollWidth:document.documentElement.scrollWidth,\n        screenWidth:screen.width,\n        screenHeight:screen.height,\n        consoleHeight:consoleBox.height,\n        heroHeight:hero.height,\n        hasPrinter:Boolean(document.getElementById("printerZone")),\n        hasFooter:Boolean(document.querySelector(".site-footer")),\n        mobileCssLoaded:[...document.styleSheets].some(sheet=>sheet.href?.includes("/css/mobile-fit.css"))\n      }'''
mobile = replace_once(mobile, old_eval, new_eval, "mobile geometry payload")
anchor = '    assert.ok(geometry.scrollWidth<=geometry.innerWidth+1,"mobile layout has horizontal page overflow")\n'
extra = '    assert.ok(geometry.mobileCssLoaded,"mobile-fit stylesheet is not loaded")\n    assert.equal(geometry.hasPrinter,false,"printer UI still exists on mobile")\n    assert.equal(geometry.hasFooter,true,"site footer is missing on mobile")\n    if(viewport.width<viewport.height)assert.ok(geometry.heroHeight<viewport.height*.82,"mobile hero leaves too much vertical space")\n'
mobile = replace_once(mobile, anchor, anchor + extra, "mobile composition assertions")
write(path, mobile)

# Validation workflow: printer files are no longer requirements; shell/mobile links are.
path = ".github/workflows/validate-site.yml"
workflow = read(path)
workflow = workflow.replace('          test -f js/receipt.js\n', '')
workflow = workflow.replace('          test -f css/receipt.css\n', '')
if '          test -f css/site-shell.css\n' not in workflow:
    workflow = workflow.replace('          test -f css/mobile-fit.css\n', '          test -f css/mobile-fit.css\n          test -f css/site-shell.css\n')
workflow = replace_once(workflow, '          grep -q \'type="module" src="js/app.js"\' index.html\n', '          grep -q \'type="module" src="js/app.js"\' index.html\n          grep -q \'css/mobile-fit.css" data-mobile-fit\' index.html\n          ! grep -q \'id="printerZone"\' index.html\n', "validation shell checks")
write(path, workflow)

# Delete obsolete printer module/style and this one-shot transformation machinery.
for obsolete in ["js/receipt.js", "css/receipt.css"]:
    target = ROOT / obsolete
    if target.exists():
        target.unlink()

for temporary in [ROOT / "tools/apply-site-shell-polish.py", ROOT / ".github/workflows/apply-site-shell-polish.yml"]:
    if temporary.exists():
        temporary.unlink()

print("Site shell transformation completed")
