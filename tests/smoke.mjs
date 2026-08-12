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

for(const shortcut of['key==="l"','key==="r"','key==="e"','"arrowleft"','event.key==="Pause"'])assert.ok(app.includes(shortcut),`missing shortcut ${shortcut}`)
assert.ok(apps.includes("askSaveAs"),"Notepad must use the common Save As dialog")
assert.ok(apps.includes("askOpenFile"),"Notepad must expose Open")
assert.ok(system.includes('setState("off")'),"power state machine is incomplete")
assert.ok(receipt.includes("Tear the current receipt before printing another."),"manual tear guard is missing")
assert.ok(!app.includes("setTimeout(printReceipt"),"receipt must not print on page load")

const ids=[...index.matchAll(/\sid=["']([^"']+)["']/g)].map(match=>match[1])
assert.equal(new Set(ids).size,ids.length,"duplicate static DOM id")

console.log("Windows 7 simulator smoke checks passed")
