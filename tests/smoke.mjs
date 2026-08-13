import assert from"node:assert/strict"
import{existsSync,readFileSync,readdirSync}from"node:fs"
import{dirname,resolve}from"node:path"
import{fileURLToPath}from"node:url"

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..")
const read=path=>readFileSync(resolve(root,path),"utf8")
const index=read("index.html")
const app=read("js/app.js")
const apps=read("js/apps.js")
const system=read("js/system.js")
const systemApps=read("js/system-apps.js")
const receipt=read("js/receipt.js")
const python=read("js/python.js")
const games=read("js/games.js")
const gadgets=read("js/gadgets.js")
const personalization=read("js/personalization.js")
const fileActions=read("js/file-actions.js")
const receiptCss=read("css/receipt.css")
const runtimeCss=read("css/runtime.css")

for(const file of readdirSync(resolve(root,"js")).filter(name=>name.endsWith(".js"))){
  const source=read(`js/${file}`)
  for(const match of source.matchAll(/from["'](\.\/[^"']+)["']/g))assert.ok(existsSync(resolve(root,"js",match[1])),`${file} imports missing ${match[1]}`)
}

for(const asset of[...index.matchAll(/(?:src|href)=["']((?:css|js)\/[^"']+)["']/g)].map(match=>match[1]))assert.ok(existsSync(resolve(root,asset)),`missing HTML asset ${asset}`)

for(const id of["bootScreen","welcomeScreen","lockScreen","shutdownScreen","powerOffScreen","laptopPower","shutdownBtn","noteFileDropdown"]){
  assert.match(index,new RegExp(`id=["']${id}["']`),`missing #${id}`)
}

for(const appName of["paint","wordpad","sticky","snipping","media","control","devices","taskmanager","minesweeper","systeminfo","charmap","keyboard","help"]){
  assert.match(app,new RegExp(`${appName}:`),`missing app mapping: ${appName}`)
  assert.match(systemApps,new RegExp(`windowNode\\(["']${appName}["']`),`missing app window: ${appName}`)
}
for(const appName of["solitaire","freecell","chess"]){
  assert.match(app,new RegExp(`${appName}:`),`missing game mapping: ${appName}`)
  assert.match(games,new RegExp(`gameWindow\\(["']${appName}["']`),`missing game window: ${appName}`)
}

for(const shortcut of['key==="l"','key==="r"','key==="e"','"arrowleft"','event.key==="Pause"'])assert.ok(app.includes(shortcut),`missing shortcut ${shortcut}`)
assert.ok(apps.includes("askSaveAs"),"Notepad must use the common Save As dialog")
assert.ok(apps.includes("askOpenFile"),"Notepad must expose Open")
assert.ok(system.includes('setState("off")'),"power state machine is incomplete")
assert.ok(receipt.includes("Tear the current receipt before printing another."),"manual tear guard is missing")
assert.ok(!app.includes("setTimeout(printReceipt"),"receipt must not print on page load")
assert.ok(app.includes('byId("startMenu").querySelectorAll("[data-app-open]")'),"Start handlers must not double-bind pinned taskbar buttons")
assert.ok(python.includes("roots().desktop,roots().documents,roots().downloads"),"relative Python scripts must resolve from user folders")
assert.ok(systemApps.includes("paint-clipboard")&&systemApps.includes("paint-shapes")&&systemApps.includes("paint-colors"),"Windows 7 Paint ribbon groups are missing")
assert.ok(systemApps.includes("System and Security")&&systemApps.includes("Network and Internet")&&systemApps.includes("Appearance and Personalization"),"Control Panel category view is incomplete")
assert.ok(index.includes('id="networkFlyout"')&&index.includes('id="volumeFlyout"')&&index.includes('id="batteryFlyout"'),"taskbar notification flyouts are missing")
assert.ok(index.includes('id="startSearchResults"')&&index.includes('data-control-open="personalization"'),"Start search or direct mobile Personalization access is missing")
assert.ok(app.includes("searchRecords")&&app.includes('event.key==="Enter"')&&app.includes('group:"Control Panel"'),"Start search must return and launch programs, settings, and files")
for(const icon of["trayOverflowBtn","actionCenterBtn","networkBtn","volumeBtn","batteryBtn"])assert.ok(runtimeCss.includes(".tray-button{display:grid!important"),`mobile notification area must keep ${icon} visible`)
assert.ok(index.includes('id="printerProgress"'),"reference printer progress track is missing")
assert.ok(receipt.includes('easing:"linear"')&&!receipt.includes("stage.animate"),"receipt feed must stay on compositor-only transforms")
assert.ok(!/\.receipt:after/.test(receiptCss),"the first receipt must have a flat lower edge")
assert.ok(games.includes("Array.from({length:10}"),"Chess Titans must expose all 10 Windows 7 difficulty levels")
assert.ok(games.includes("sequenceValid")&&games.includes("capacity"),"card-game move validation is missing")
assert.ok(systemApps.includes("9 × 9 · 10 mines")&&systemApps.includes("30 × 16 · 99 mines"),"Minesweeper presets are not faithful")
for(const brush of["calligraphy1","calligraphy2","airbrush","oil","crayon","marker","natural","watercolor"])assert.ok(systemApps.includes(`${brush}:`),`missing Paint brush sizing: ${brush}`)
for(const theme of["Windows 7","Architecture","Characters","Landscapes","Nature","Scenes","United States","Windows Classic","High Contrast Black"])assert.ok(personalization.includes(theme),`missing Windows 7 theme: ${theme}`)
assert.ok(personalization.includes("saveWallpaperPlaylist")&&personalization.includes("startSlideshow"),"wallpaper slideshow settings are missing")
assert.ok(personalization.includes("applyAccent")&&personalization.includes("--site-accent")&&runtimeCss.includes("Theme color is system-wide"),"theme colors must propagate beyond the wallpaper")
for(const item of["Administrative Tools","BitLocker Drive Encryption","Color Management","Credential Manager","Device Manager","Indexing Options","Performance Information and Tools","Speech Recognition","Sync Center","Windows Defender"])assert.ok(systemApps.includes(item),`All Control Panel Items is missing ${item}`)
assert.ok(systemApps.includes("CONTROL_ITEMS.filter")&&systemApps.includes("CONTROL_ITEM_BY_ID"),"Large and Small icons must use the complete Control Panel item registry")
assert.ok(gadgets.includes('addGadget("clock")')&&gadgets.includes("gadget-cpu")&&gadgets.includes("gadget-calendar"),"desktop gadgets are incomplete")
for(const item of["View  ›","Sort by  ›","Refresh","Screen resolution","Gadgets","Personalize"])assert.ok(fileActions.includes(item),`desktop context menu item missing: ${item}`)

const ids=[...index.matchAll(/\sid=["']([^"']+)["']/g)].map(match=>match[1])
assert.equal(new Set(ids).size,ids.length,"duplicate static DOM id")

console.log("Windows 7 simulator smoke checks passed")
