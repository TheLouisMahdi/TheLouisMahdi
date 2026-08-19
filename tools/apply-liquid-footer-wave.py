from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def read(path):
    return (ROOT/path).read_text(encoding="utf-8")

def write(path,text):
    (ROOT/path).write_text(text,encoding="utf-8")

def replace_once(text,old,new,label):
    count=text.count(old)
    if count!=1:
        raise RuntimeError(f"{label}: expected one match, found {count}")
    return text.replace(old,new,1)

# Simplify the hero to the single line requested by the user.
path="index.html"
html=read(path)
old_intro='''  <div class="site-intro">\n    <div class="site-intro-kicker">TheLouisMahdi · Interactive Engineering Portfolio</div>\n    <h1>Engineering <span>across layers.</span></h1>\n    <p>Software, applied AI, embedded systems and digital hardware — built as one connected engineering stack.</p>\n    <div class="site-intro-tags" aria-label="Focus areas">\n      <span>Computer Vision</span>\n      <span>Embedded Systems</span>\n      <span>FPGA / Verilog</span>\n      <span>Engineering Automation</span>\n    </div>\n  </div>'''
new_intro='''  <div class="site-intro">\n    <h1>Engineering <span>across layers.</span></h1>\n  </div>'''
html=replace_once(html,old_intro,new_intro,"hero intro")

old_footer='''<footer class="site-footer" aria-label="Profile links">\n  <div class="site-footer-inner">\n    <div class="footer-identity">\n      <p class="footer-eyebrow">Engineering · Software · AI · Hardware</p>\n      <h2>Mahdi Ghahremani</h2>\n      <p>Electrical Engineering · University of Zanjan · building practical systems across software and hardware.</p>\n      <div class="footer-aliases" aria-label="Online aliases">\n        <span>TheLouisMahdi</span>\n        <span>poimu</span>\n        <span>Eka</span>\n        <span>Eka Francium</span>\n      </div>\n    </div>\n    <div class="footer-actions">\n      <a class="liquid-telegram" href="https://t.me/thelouis_mahdi" target="_blank" rel="noreferrer">\n        <span><strong>Telegram</strong><small>@thelouis_mahdi · primary contact</small></span>\n        <b aria-hidden="true">↗</b>\n      </a>\n      <a class="footer-github" href="https://github.com/TheLouisMahdi" target="_blank" rel="noreferrer">\n        <span>GitHub reference</span><strong>TheLouisMahdi ↗</strong>\n      </a>\n    </div>\n  </div>\n  <div class="footer-bottom">\n    <span>© Mahdi Ghahremani</span>\n    <span>Interactive Windows portfolio · GitHub Pages</span>\n  </div>\n</footer>'''
new_footer='''<footer class="site-footer" aria-label="Profile links">\n  <canvas class="footer-liquid" id="footerLiquid" aria-hidden="true"></canvas>\n  <div class="footer-content">\n    <div class="footer-identity">\n      <strong>Mahdi Ghahremani</strong>\n      <span class="footer-aliases">TheLouisMahdi · poimu · Eka · Eka Francium</span>\n    </div>\n    <nav class="footer-links" aria-label="External profile links">\n      <a href="https://t.me/thelouis_mahdi" target="_blank" rel="noreferrer">Telegram <span aria-hidden="true">↗</span></a>\n      <a href="https://github.com/TheLouisMahdi" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>\n    </nav>\n  </div>\n</footer>'''
html=replace_once(html,old_footer,new_footer,"footer")
html=replace_once(html,'<script type="module" src="js/app.js"></script>','<script type="module" src="js/app.js"></script>\n<script type="module" src="js/footer-liquid.js"></script>',"footer liquid script")
write(path,html)

# Update the smoke contract for the new minimal hero and true interactive liquid surface.
path="tests/smoke.mjs"
smoke=read(path)
smoke=replace_once(smoke,'const siteShell=read("css/site-shell.css")\n','const siteShell=read("css/site-shell.css")\nconst footerLiquid=read("js/footer-liquid.js")\n',"footer liquid test import")
old='''assert.ok(index.includes('class="site-footer"')&&index.includes('Eka Francium')&&index.includes('poimu'),"footer identity aliases are missing")\nassert.ok(index.includes('class="liquid-telegram"')&&siteShell.includes('backdrop-filter:blur(18px)'),"liquid Telegram footer CTA is missing")'''
new='''assert.ok(index.includes('class="site-footer"')&&index.includes('Eka Francium')&&index.includes('poimu'),"footer identity aliases are missing")\nassert.ok(index.includes('id="footerLiquid"')&&index.includes('js/footer-liquid.js'),"interactive liquid footer canvas is missing")\nassert.ok(footerLiquid.includes('pointermove')&&footerLiquid.includes('pointerdown')&&footerLiquid.includes('requestAnimationFrame'),"liquid footer pointer physics are incomplete")\nassert.ok(siteShell.includes('.footer-liquid')&&siteShell.includes('linear-gradient(180deg,#fff 0 48%'),"footer must fall back to a white-over-blue liquid split")\nassert.ok(!index.includes('site-intro-kicker')&&!index.includes('site-intro-tags')&&!index.includes('Software, applied AI, embedded systems'),"hero must contain only Engineering across layers")'''
smoke=replace_once(smoke,old,new,"footer smoke assertions")
write(path,smoke)

print("Liquid footer transformation completed")
