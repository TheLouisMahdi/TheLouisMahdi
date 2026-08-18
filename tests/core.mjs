import assert from"node:assert/strict"

const storage=new Map()
globalThis.localStorage={
  getItem:key=>storage.has(key)?storage.get(key):null,
  setItem:(key,value)=>storage.set(key,String(value)),
  removeItem:key=>storage.delete(key),
  clear:()=>storage.clear()
}
if(typeof globalThis.CustomEvent!=="function"){
  globalThis.CustomEvent=class CustomEvent extends Event{constructor(type,options={}){super(type);this.detail=options.detail}}
}
globalThis.window=new EventTarget()

const{escapeHtml}=await import("../js/html.js")
assert.equal(escapeHtml('<img src=x onerror="boom">'),"&lt;img src=x onerror=&quot;boom&quot;&gt;")

const vfs=await import(`../js/vfs.js?regression=${Date.now()}`)
const roots=vfs.roots()
assert.equal(vfs.validFileName("CON.txt"),false)
assert.equal(vfs.validFileName("bad<name.txt"),false)
assert.equal(vfs.validFileName("normal-file.txt"),true)
const folder=vfs.resolvePath(roots.desktop,"Regression Folder")
const child=vfs.resolvePath(folder,"Child")
const file=vfs.resolvePath(child,"sample.txt")
assert.equal(vfs.makeFolder(folder),true)
assert.equal(vfs.makeFolder(child),true)
vfs.writeFile(file,"hello",roots.desktop,{encoding:"UTF-8"})

const copyRoot=vfs.resolvePath(roots.documents,"Regression Folder")
const copied=vfs.copyPath(folder,copyRoot)
assert.ok(copied&&copied.kind==="folder","folder copy must return copied root")
assert.equal(vfs.readFile(vfs.resolvePath(copyRoot,"Child\\sample.txt")),"hello","recursive folder copy lost nested file")

const duplicate=vfs.copyPath(folder,roots.desktop)
assert.ok(duplicate&&duplicate.path!==folder,"copying a folder beside itself must create a unique copy")
assert.equal(vfs.readFile(vfs.resolvePath(duplicate.path,"Child\\sample.txt")),"hello")

const movedRoot=vfs.resolvePath(roots.downloads,"Moved Regression Folder")
const moved=vfs.movePath(copyRoot,movedRoot)
assert.ok(moved&&moved.path===movedRoot,"folder move failed")
assert.equal(vfs.getEntry(copyRoot),null,"move left old root behind")
assert.equal(vfs.readFile(vfs.resolvePath(movedRoot,"Child\\sample.txt")),"hello","recursive move lost nested file")

assert.equal(vfs.deleteTree(movedRoot),true,"recursive folder deletion failed")
assert.equal(vfs.getEntry(vfs.resolvePath(movedRoot,"Child\\sample.txt")),null,"recursive delete left descendants")

console.log("Windows 7 simulator core regression checks passed")
