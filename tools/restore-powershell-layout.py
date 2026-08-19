from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def read(path): return (ROOT/path).read_text(encoding="utf-8")
def write(path,text): (ROOT/path).write_text(text,encoding="utf-8")

# Replace the legacy long README block with the PowerShell mount target.
index=read("index.html")
start=index.index('<section class="readme" id="about">')
end=index.index('<footer class="site-footer"',start)
replacement='<section class="readme" id="about" aria-label="PowerShell profile assistant"></section>\n'
index=index[:start]+replacement+index[end:]

old='<script type="module" src="js/app.js"></script>\n<script type="module" src="js/footer-liquid.js"></script>'
new='<script type="module" src="js/app.js"></script>\n<script type="module" src="js/profile-assistant.js"></script>\n<script type="module" src="js/footer-liquid.js"></script>'
if old not in index: raise RuntimeError("expected app/footer scripts not found")
index=index.replace(old,new,1)
write("index.html",index)

# Extend smoke coverage for the intended three-part page architecture.
smoke=read("tests/smoke.mjs")
anchor='assert.ok(!index.includes(\'site-intro-kicker\')&&!index.includes(\'site-intro-tags\')&&!index.includes(\'Software, applied AI, embedded systems\'),"hero must contain only Engineering across layers")\n'
extra=(
    'assert.ok(index.includes(\'id="about" aria-label="PowerShell profile assistant"\')&&index.includes(\'js/profile-assistant.js\'),"PowerShell profile assistant mount is missing")\n'
    'assert.ok(!index.includes("Selected Projects")&&!index.includes("Tech Stack &amp; Tools")&&!index.includes("Current Roles"),"legacy long README content must not be rendered")\n'
    'assert.ok(index.indexOf(\'class="laptop"\')<index.indexOf(\'id="about"\')&&index.indexOf(\'id="about"\')<index.indexOf(\'class="site-footer"\'),"page order must be simulator, PowerShell assistant, liquid footer")\n'
)
if anchor not in smoke: raise RuntimeError("smoke anchor not found")
smoke=smoke.replace(anchor,anchor+extra,1)
write("tests/smoke.mjs",smoke)

print("PowerShell layout restored")
