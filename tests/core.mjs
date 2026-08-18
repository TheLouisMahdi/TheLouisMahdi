import assert from"node:assert/strict"

const storage=new Map()
let failWrites=false
let changeEvents=0
let storageErrors=0
globalThis.localStorage={
  getItem:key=>storage.has(key)?storage.get(key):null,
  setItem:(key,value)=>{if(failWrites)throw new Error("quota exceeded");storage.set(key,String(value))},
  removeItem:key=>storage.delete(key),
  clear:()=>storage.clear()
}
if(typeof globalThis.CustomEvent!=="function"){
  globalThis.CustomEvent=class CustomEvent extends Event{constructor(type,options={}){super(type);this.detail=options.detail}}
}
globalThis.window=new EventTarget()
window.addEventListener("win7:vfs-changed",()=>changeEvents+=1)
window.addEventListener("win7:vfs-error",()=>storageErrors+=1)

const{escapeHtml}=await import("../js/html.js")
assert.equal(escapeHtml('<img src=x onerror="boom">'),"&lt;img src=x onerror=&quot;boom&quot;&gt;")

const vfs=await import(`../js/vfs.js?regression=${Date.now()}`)
const roots=vfs.roots()
assert.equal(vfs.validFileName("CON.txt"),false)
assert.equal(vfs.validFileName("bad<name.txt"),false)
assert.equal(vfs.validFileName("normal-file.txt"),true)

const orphan=vfs.resolvePath(roots.desktop,"Missing Parent\\orphan.txt")
assert.equal(vfs.writeFile(orphan,"orphan"),null,"writeFile must reject a missing parent directory")
assert.equal(vfs.makeFolder(vfs.resolvePath(roots.desktop,"Missing Parent\\Child")),false,"makeFolder must reject a missing parent directory")
assert.equal(vfs.getEntry(orphan),null,"orphan file leaked into the VFS")

const folder=vfs.resolvePath(roots.desktop,"Regression Folder")
const child=vfs.resolvePath(folder,"Child")
const file=vfs.resolvePath(child,"sample.txt")
assert.equal(vfs.makeFolder(folder),true)
assert.equal(vfs.makeFolder(child),true)
assert.ok(vfs.writeFile(file,"hello",roots.desktop,{encoding:"UTF-8"}))

const beforeCopyEvents=changeEvents
const copyRoot=vfs.resolvePath(roots.documents,"Regression Folder")
const copied=vfs.copyPath(folder,copyRoot)
assert.ok(copied&&copied.kind==="folder","folder copy must return copied root")
assert.equal(changeEvents,beforeCopyEvents+1,"folder copy must emit one atomic change event")
assert.equal(vfs.readFile(vfs.resolvePath(copyRoot,"Child\\sample.txt")),"hello","recursive folder copy lost nested file")

const duplicate=vfs.copyPath(folder,roots.desktop)
assert.ok(duplicate&&duplicate.path!==folder,"copying a folder beside itself must create a unique copy")
assert.equal(vfs.readFile(vfs.resolvePath(duplicate.path,"Child\\sample.txt")),"hello")
assert.equal(vfs.copyPath(folder,vfs.resolvePath(roots.documents,"bad<folder")),null,"copy must validate its destination name")

const movedRoot=vfs.resolvePath(roots.downloads,"Moved Regression Folder")
const beforeMoveEvents=changeEvents
const moved=vfs.movePath(copyRoot,movedRoot)
assert.ok(moved&&moved.path===movedRoot,"folder move failed")
assert.equal(changeEvents,beforeMoveEvents+1,"folder move must emit one atomic change event")
assert.equal(vfs.getEntry(copyRoot),null,"move left old root behind")
assert.equal(vfs.readFile(vfs.resolvePath(movedRoot,"Child\\sample.txt")),"hello","recursive move lost nested file")

const persistent=vfs.resolvePath(roots.desktop,"persistent.txt")
assert.ok(vfs.writeFile(persistent,"before"))
failWrites=true
assert.equal(vfs.writeFile(persistent,"after"),null,"failed persistence must report failure")
assert.equal(vfs.readFile(persistent),"before","failed persistence must roll back in-memory state")
const failedMoveTarget=vfs.resolvePath(roots.documents,"persistent-moved.txt")
assert.equal(vfs.movePath(persistent,failedMoveTarget),null,"failed move persistence must report failure")
assert.equal(vfs.readFile(persistent),"before","failed move persistence must restore the source")
assert.equal(vfs.getEntry(failedMoveTarget),null,"failed move persistence leaked a destination")
assert.equal(vfs.renamePath(persistent,"renamed.txt"),null,"failed rename persistence must report failure")
assert.equal(vfs.readFile(persistent),"before","failed rename persistence must restore the original path")
assert.ok(storageErrors>=3,"storage failures must emit win7:vfs-error")
failWrites=false

assert.equal(vfs.deleteTree(movedRoot),true,"recursive folder deletion failed")
assert.equal(vfs.getEntry(vfs.resolvePath(movedRoot,"Child\\sample.txt")),null,"recursive delete left descendants")

console.log("Windows 7 simulator core regression checks passed")
