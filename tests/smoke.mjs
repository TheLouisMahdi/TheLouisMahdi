import assert from"node:assert/strict"
import{existsSync,readFileSync,readdirSync,statSync}from"node:fs"
import{dirname,resolve}from"node:path"
import{fileURLToPath}from"node:url"
import{WINDOWS7_WALLPAPERS,wallpaperAsset,wallpaperThumbnail}from"../js/wallpapers.js"

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..")
const read=path=>readFileSync(resolve(root,path),"utf8")
const index=read("index.html")
const app=read("js/app.js")
const apps=read("js/apps.js")
const data=read("js/data.js")
const explorer=read("js/explorer.js")
const system=read("js/system.js")
const systemApps=read("js/system-apps.js")
const receipt=read("js/receipt.js")
const python=read("js/python.js")
const games=read("js/games.js")
const comfy=read("js/comfy-cakes.js")
const interaction=read("js/interaction.js")
const gadgets=read("js/gadgets.js")
const personalization=read("js/personalization.js")
const fileActions=read("js/file-actions.js")
const receiptCss=read("css/receipt.css")
const runtimeCss=read("css/runtime.css")
const fidelityApps=read("js/fidelity-apps.js")
const controlPages=read("js/control-pages.js")
const taskManager=read("js/task-manager.js")
const terminal=read("js/terminal.js")

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
assert.match(app,/comfy:"comfyWindow"/,"missing Comfy Cakes app mapping")
assert.ok(app.includes("mountComfyCakes()")&&app.includes("initComfyCakes()"),"Comfy Cakes must mount and initialize")
assert.ok(comfy.includes('section.id="comfyWindow"')&&comfy.includes("Games · Purble Place"),"Purble Place window or Start entry is missing")
assert.ok(comfy.includes("Select Difficulty")&&comfy.includes("Beginner")&&comfy.includes("Intermediate")&&comfy.includes("Advanced"),"Comfy Cakes difficulty dialog is incomplete")
assert.ok(comfy.includes("One cake at a time in Intermediate, Advanced")&&comfy.includes("Statistics")&&comfy.includes("Return to Main Menu"),"Comfy Cakes menu surfaces are incomplete")
assert.ok(index.includes('assets/windows7/cursors/aero_arrow.png'),"the exact Windows 7 Aero cursor is not mounted")
assert.ok(interaction.includes('querySelectorAll("iframe")')&&interaction.includes('classList.remove("pointer-active")'),"the parent cursor must yield to iframe cursors")
assert.ok(interaction.includes('pointermove",event=>{place(event);screen.classList.add("pointer-active")}'),"the parent cursor must return after leaving an iframe")
assert.ok(runtimeCss.includes(".fake-cursor.left-click:after")&&runtimeCss.includes(".fake-cursor.right-click:after"),"cursor click feedback is missing")
assert.ok(comfy.includes('sandbox="allow-scripts"'),"the embedded game must not share the parent origin")
assert.ok(comfy.includes('event.detail.state==="closed"')&&comfy.includes('frame.removeAttribute("src")'),"closing Comfy Cakes must unload its iframe")
assert.ok(comfy.includes('event.detail.state==="minimized"')&&comfy.includes('State:"paused"'),"minimizing Comfy Cakes must pause it")
assert.ok(comfy.includes('resultRecorded')&&comfy.includes('stats.played++'),"Comfy Cakes results must be counted once when a game finishes")
const cursor=readFileSync(resolve(root,"assets/windows7/cursors/aero_arrow.png"));assert.equal(cursor.subarray(1,4).toString(),"PNG","invalid Aero cursor PNG")
for(const asset of["icon.png","main-background.jpg","main-foreground.png","comfy-hover.png","comfy-down.png"])assert.ok(statSync(resolve(root,"assets/windows7/games/purble-place",asset)).size>5000,`missing Purble Place asset ${asset}`)
const comfyIndex=read("games/comfy-cakes/index.html")
assert.ok(comfyIndex.includes('Type: "shortcut"')&&comfyIndex.includes('message.Type !== "visibility"'),"the game iframe must bridge shortcuts and lifecycle messages")
for(const src of[...comfyIndex.matchAll(/src=["']([^"']+)["']/g)].map(match=>match[1]))assert.ok(existsSync(resolve(root,"games/comfy-cakes",src)),`missing Comfy Cakes bundle ${src}`)
for(const asset of["assets/bg.png","assets/comfy-spritesheet.png","assets/aero_arrow.png"])assert.ok(existsSync(resolve(root,"games/comfy-cakes",asset)),`missing Comfy Cakes runtime asset ${asset}`)
const comfySounds=["CAKEBATTERBUTTON","CAKEBOXED","CAKEBUTTONS","CAKEDUMPED","CAKEFILLINGBUTTON","CAKEPANBUTTON","CHEFENTER","CHEFEXIT","COMFYWIN","CONVEYOR","DECORATIONSBUTTONS","FLAMEBUTTON","FROSTINGBUTTON","LEFTARROWBUTTON","RIGHTARROWBUTTON","ROTATEBUTTON","SHAKERBUTTON","TVON_DING"]
for(const name of comfySounds){const sound=readFileSync(resolve(root,`games/comfy-cakes/assets/sounds/PURBLES_${name}.ogg`));assert.equal(sound.subarray(0,4).toString(),"OggS",`invalid Comfy Cakes sound ${name}`)}
const comfyManifest=JSON.parse(read("docs/comfy-cakes-original-resource-manifest.json"));assert.equal(comfyManifest.length,354,"original Comfy Cakes manifest must cover every matched resource")

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
assert.equal(WINDOWS7_WALLPAPERS.reduce((total,group)=>total+group.files.length,0),37,"the complete Windows 7 Aero wallpaper set must contain 37 files")
for(const group of WINDOWS7_WALLPAPERS)for(const [index] of group.files.entries()){
  const asset=resolve(root,wallpaperAsset(group.name,index))
  const thumbnail=resolve(root,wallpaperThumbnail(group.name,index))
  assert.ok(existsSync(asset),`missing Windows 7 wallpaper ${asset}`)
  assert.ok(statSync(asset).size>200000,`Windows 7 wallpaper is unexpectedly small: ${asset}`)
  assert.ok(existsSync(thumbnail)&&statSync(thumbnail).size>5000,`missing Windows 7 wallpaper thumbnail ${thumbnail}`)
  for(const path of[asset,thumbnail]){const jpeg=readFileSync(path);assert.equal(jpeg[0],0xff,`invalid JPEG start: ${path}`);assert.equal(jpeg[1],0xd8,`invalid JPEG start: ${path}`);assert.equal(jpeg.at(-2),0xff,`truncated JPEG: ${path}`);assert.equal(jpeg.at(-1),0xd9,`truncated JPEG: ${path}`)}
}
assert.ok(data.includes('name:"Windows 7 Wallpapers"')&&data.includes("WINDOWS7_WALLPAPERS.map"),"Pictures must expose the complete Windows 7 wallpaper library")
assert.ok(explorer.includes("file-thumbnail")&&explorer.includes('loading="lazy"'),"Pictures must render lazy-loaded image thumbnails")
for(const item of["Administrative Tools","BitLocker Drive Encryption","Color Management","Credential Manager","Device Manager","Indexing Options","Performance Information and Tools","Speech Recognition","Sync Center","Windows Defender"])assert.ok(systemApps.includes(item),`All Control Panel Items is missing ${item}`)
assert.ok(systemApps.includes("CONTROL_ITEMS.filter")&&systemApps.includes("CONTROL_ITEM_BY_ID"),"Large and Small icons must use the complete Control Panel item registry")
assert.ok(gadgets.includes('addGadget("clock")')&&gadgets.includes("gadget-cpu")&&gadgets.includes("gadget-calendar"),"desktop gadgets are incomplete")
for(const item of["View  ›","Sort by  ›","Refresh","Screen resolution","Gadgets","Personalize"])assert.ok(fileActions.includes(item),`desktop context menu item missing: ${item}`)
for(const appName of["Private Character Editor","Windows Journal","Windows PowerShell ISE","Remote Desktop Connection","Windows Memory Diagnostic","Registry Editor"])assert.ok(fidelityApps.includes(appName),`missing documented Windows accessory: ${appName}`)
for(const control of["windows-features","biometric","credential-manager","tablet-settings","windows-defender"])assert.ok(controlPages.includes(control),`missing documented Control Panel surface: ${control}`)
for(const tab of["applications","processes","services","performance","networking","users"])assert.ok(taskManager.includes(`\"${tab}\"`),`Task Manager is missing ${tab}`)
assert.ok(index.includes("Windows 7 Professional")&&systemApps.includes("32-bit Operating System")&&terminal.includes("6.1.7600 Build 7600"),"the locked Professional x86 RTM profile is inconsistent")
assert.ok(apps.includes("Scientific")&&apps.includes("Programmer")&&apps.includes("Statistics"),"Calculator modes are incomplete")
assert.ok(app.includes("pointerenter")&&app.includes("Connect to a Projector"),"Aero Peek or Win+P integration is incomplete")

const ids=[...index.matchAll(/\sid=["']([^"']+)["']/g)].map(match=>match[1])
assert.equal(new Set(ids).size,ids.length,"duplicate static DOM id")

console.log("Windows 7 simulator smoke checks passed")
