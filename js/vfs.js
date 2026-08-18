import{COMMAND_GUIDE}from"./guide.js"

const STORAGE_KEY="eka.windows7.vfs.v2"
const ROOTS={
  desktop:"C:\\Users\\Eka\\Desktop",
  documents:"C:\\Users\\Eka\\Documents",
  downloads:"C:\\Users\\Eka\\Downloads",
  github:"G:\\Workspace",
  recycle:"C:\\$Recycle.Bin"
}

const DEFAULTS=[
  {path:`${ROOTS.desktop}\\Eka Command Deck.txt`,content:COMMAND_GUIDE},
  {path:`${ROOTS.desktop}\\hello.py`,content:`from datetime import datetime\n\nprint("Hello from Eka's Windows 7 desktop.")\nprint("Python is running locally in this browser tab.")\nprint("Time:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))\n`},
  {path:`${ROOTS.desktop}\\hello.html`,content:`<!doctype html>\n<html>\n<head>\n<meta charset="utf-8">\n<title>Eka Browser Lab</title>\n<style>body{font-family:Segoe UI,Arial,sans-serif;background:#eef7ff;color:#123;padding:40px}main{max-width:620px;margin:auto;background:white;padding:28px;border:1px solid #9bb8cf;border-radius:8px}code{background:#eef1f4;padding:2px 5px}</style>\n</head>\n<body>\n<main>\n<h1>Hello from Notepad</h1>\n<p>Edit this file, save it, then double-click it or run <code>start hello.html</code>.</p>\n<p>Mahdi Ghahremani · Eka @GitHub</p>\n</main>\n</body>\n</html>\n`}
]

let entries=load()
ensureDefaults()

function load(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY)
    const parsed=raw?JSON.parse(raw):null
    return parsed&&typeof parsed==="object"?parsed:{}
  }catch{return {}}
}

function cloneEntries(value){
  if(typeof structuredClone==="function")return structuredClone(value)
  return JSON.parse(JSON.stringify(value))
}

function notifyStorageError(error){
  if(typeof window!=="undefined")window.dispatchEvent(new CustomEvent("win7:vfs-error",{detail:{message:"Virtual disk changes could not be saved.",error:String(error?.message||error||"")}}))
}

function persist(){
  try{
    localStorage.setItem(STORAGE_KEY,JSON.stringify(entries))
  }catch(error){notifyStorageError(error);return false}
  if(typeof window!=="undefined")window.dispatchEvent(new CustomEvent("win7:vfs-changed"))
  return true
}

function commit(mutator,failureValue=null){
  const previous=entries
  entries=cloneEntries(entries)
  try{
    const result=mutator()
    if(!persist()){entries=previous;return failureValue}
    return result
  }catch(error){
    entries=previous
    notifyStorageError(error)
    return failureValue
  }
}

function ensureDefaults(){
  let changed=false
  for(const item of DEFAULTS){
    const key=keyOf(item.path)
    if(!entries[key]){
      const now=Date.now()
      entries[key]={path:normalizePath(item.path),kind:kindForName(item.path),content:item.content,created:now,updated:now}
      changed=true
    }
  }
  if(changed)persist()
}

function keyOf(path){return normalizePath(path).toLowerCase()}
function basename(path){const parts=normalizePath(path).split("\\");return parts.pop()||normalizePath(path)}
function parent(path){
  const value=normalizePath(path)
  if(/^[A-Z]:\\$/.test(value))return value
  const parts=value.split("\\")
  parts.pop()
  return parts.join("\\")||value.slice(0,3)
}

function isRoot(path){
  const value=normalizePath(path).toLowerCase()
  return Object.values(ROOTS).some(root=>normalizePath(root).toLowerCase()===value)
}

function directoryExists(path){
  const value=normalizePath(path)
  return isRoot(value)||entries[keyOf(value)]?.kind==="folder"
}

function validCreatePath(path){
  const full=normalizePath(path)
  return validFileName(basename(full))&&directoryExists(parent(full))
}

function treeEntries(root){
  const full=normalizePath(root)
  const lower=full.toLowerCase(),prefix=`${lower}\\`
  return Object.values(entries).filter(item=>item.path.toLowerCase()===lower||item.path.toLowerCase().startsWith(prefix))
}

function destinationPath(source,destination,cwd){
  const src=resolvePath(cwd,source)
  let dest=resolvePath(cwd,destination)
  const lower=normalizePath(dest).toLowerCase()
  const isContainer=Object.values(ROOTS).some(root=>normalizePath(root).toLowerCase()===lower)||isFolder(dest)
  if(isContainer)dest=resolvePath(dest,basename(src))
  return {src,dest}
}

function invalidTreeDestination(src,dest){
  const source=normalizePath(src).toLowerCase(),target=normalizePath(dest).toLowerCase()
  return target===source||target.startsWith(`${source}\\`)
}

export function normalizePath(path){
  let value=String(path||"").trim().replace(/^"|"$/g,"").replaceAll("/","\\")
  value=value.replace(/\\+/g,"\\")
  if(/^[a-z]:$/i.test(value))value+="\\"
  if(/^[a-z]:/i.test(value))value=value[0].toUpperCase()+value.slice(1)
  if(value.length>3)value=value.replace(/\\+$/,"")
  return value
}

export function resolvePath(cwd,input){
  let raw=String(input||"").trim().replace(/^"|"$/g,"")
  if(!raw)return normalizePath(cwd)
  raw=raw.replaceAll("/","\\")
  if(/^[a-z]:/i.test(raw))return collapse(normalizePath(raw))
  if(raw.startsWith("\\"))return collapse(`${normalizePath(cwd).slice(0,2)}${raw}`)
  return collapse(`${normalizePath(cwd).replace(/\\+$/,"")}\\${raw}`)
}

function collapse(path){
  const value=normalizePath(path)
  const drive=value.slice(0,2)
  const rest=value.slice(2).split("\\")
  const out=[]
  for(const part of rest){
    if(!part||part===".")continue
    if(part===".."){if(out.length)out.pop();continue}
    out.push(part)
  }
  return `${drive}\\${out.join("\\")}`.replace(/\\+$/,out.length?"":"\\")
}

export function validFileName(name){
  const value=String(name||"").trim()
  if(!value||value==="."||value===".."||/[<>:"/\\|?*\x00-\x1f]/.test(value)||/[. ]$/.test(value))return false
  return !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i.test(value)
}

export function kindForName(name){
  const lower=basename(name).toLowerCase()
  if(!lower.includes("."))return "text"
  if(lower.endsWith(".py"))return "python"
  if(lower.endsWith(".html")||lower.endsWith(".htm"))return "html"
  if(lower.endsWith(".url"))return "link"
  if(lower.endsWith(".zip"))return "zip"
  if(/\.(png|jpg|jpeg|gif|webp|svg)$/.test(lower))return "photo"
  return "text"
}

export function folderPath(target){
  if(target?.startsWith("vfs:"))return normalizePath(target.slice(4))
  return ROOTS[target]||null
}

export function listVirtual(targetOrPath){
  const dir=targetOrPath?.includes("\\")?normalizePath(targetOrPath):folderPath(targetOrPath)
  if(!dir)return []
  const lower=dir.toLowerCase()
  return Object.values(entries)
    .filter(entry=>parent(entry.path).toLowerCase()===lower)
    .sort((a,b)=>a.kind==="folder"&&b.kind!=="folder"?-1:a.kind!=="folder"&&b.kind==="folder"?1:basename(a.path).localeCompare(basename(b.path)))
    .map(entry=>({
      name:basename(entry.path),
      type:entry.kind==="folder"?"folder":entry.kind,
      target:entry.kind==="folder"?`vfs:${entry.path}`:undefined,
      virtualPath:entry.path,
      writable:true,
      size:entry.kind==="folder"?0:String(entry.content??"").length,
      updated:entry.updated
    }))
}

export function getEntry(path,cwd=ROOTS.desktop){return entries[keyOf(resolvePath(cwd,path))]||null}
export function exists(path,cwd=ROOTS.desktop){return Boolean(getEntry(path,cwd))}
export function isFolder(path,cwd=ROOTS.desktop){return getEntry(path,cwd)?.kind==="folder"}
export function isVirtualDirectory(path){return directoryExists(path)}

export function readFile(path,cwd=ROOTS.desktop){
  const entry=getEntry(path,cwd)
  return entry&&entry.kind!=="folder"?entry.content:null
}

export function writeFile(path,content,cwd=ROOTS.desktop,metadata={}){
  const full=resolvePath(cwd,path)
  if(!validCreatePath(full))return null
  const key=keyOf(full)
  return commit(()=>{
    const old=entries[key]
    const now=Date.now()
    entries[key]={...old,...metadata,path:full,kind:kindForName(full),content:String(content??""),created:old?.created||now,updated:now}
    return entries[key]
  },null)
}

export function trashPath(path,cwd=ROOTS.desktop){
  const full=resolvePath(cwd,path)
  const entry=entries[keyOf(full)]
  if(!entry)return false
  const destination=uniquePath(resolvePath(ROOTS.recycle,basename(full)))
  return commit(()=>{
    const current=entries[keyOf(full)]
    const affected=current.kind==="folder"?treeEntries(full):[current]
    for(const item of affected)delete entries[keyOf(item.path)]
    for(const item of affected){
      const original=item.path
      item.originalPath=original
      item.deleted=Date.now()
      item.path=`${destination}${original.slice(full.length)}`
      entries[keyOf(item.path)]=item
    }
    return true
  },false)
}

export function restorePath(path){
  const full=normalizePath(path)
  const entry=entries[keyOf(full)]
  if(!entry||!entry.originalPath||!directoryExists(parent(entry.originalPath)))return false
  const destination=uniquePath(entry.originalPath)
  return commit(()=>{
    const current=entries[keyOf(full)]
    const affected=current.kind==="folder"?treeEntries(full):[current]
    for(const item of affected)delete entries[keyOf(item.path)]
    for(const item of affected){
      const suffix=item.path.slice(full.length)
      delete item.deleted
      delete item.originalPath
      item.path=`${destination}${suffix}`
      item.updated=Date.now()
      entries[keyOf(item.path)]=item
    }
    return true
  },false)
}

export function emptyRecycleBin(){
  const root=ROOTS.recycle.toLowerCase(),prefix=`${root}\\`
  const keys=Object.keys(entries).filter(key=>key===root||key.startsWith(prefix))
  if(!keys.length)return 0
  return commit(()=>{keys.forEach(key=>delete entries[key]);return keys.length},0)
}

export function makeFolder(path,cwd=ROOTS.desktop){
  const full=resolvePath(cwd,path)
  if(!validCreatePath(full))return false
  const key=keyOf(full)
  if(entries[key])return false
  return commit(()=>{
    const now=Date.now()
    entries[key]={path:full,kind:"folder",content:"",created:now,updated:now}
    return true
  },false)
}

export function deletePath(path,cwd=ROOTS.desktop){
  const full=resolvePath(cwd,path)
  const key=keyOf(full)
  const entry=entries[key]
  if(!entry)return false
  if(entry.kind==="folder"){
    const prefix=`${full.toLowerCase()}\\`
    if(Object.values(entries).some(item=>item.path.toLowerCase().startsWith(prefix)))return false
  }
  return commit(()=>{delete entries[key];return true},false)
}

export function deleteTree(path,cwd=ROOTS.desktop){
  const full=resolvePath(cwd,path)
  const entry=entries[keyOf(full)]
  if(!entry)return false
  return commit(()=>{
    for(const item of(entry.kind==="folder"?treeEntries(full):[entry]))delete entries[keyOf(item.path)]
    return true
  },false)
}

export function renamePath(path,newName,cwd=ROOTS.desktop){
  const full=resolvePath(cwd,path)
  const entry=entries[keyOf(full)]
  if(!entry||!validFileName(newName))return null
  const dest=resolvePath(parent(full),newName)
  if(entries[keyOf(dest)]||invalidTreeDestination(full,dest)||!validCreatePath(dest))return null
  return commit(()=>{
    const current=entries[keyOf(full)]
    const affected=current.kind==="folder"?treeEntries(full):[current]
    for(const item of affected)delete entries[keyOf(item.path)]
    const now=Date.now()
    for(const item of affected){
      const suffix=item.path.slice(full.length)
      item.path=`${dest}${suffix}`
      if(item===current&&current.kind!=="folder")item.kind=kindForName(dest)
      item.updated=now
      entries[keyOf(item.path)]=item
    }
    return entries[keyOf(dest)]
  },null)
}

export function copyPath(source,destination,cwd=ROOTS.desktop){
  let{src,dest}=destinationPath(source,destination,cwd)
  const entry=entries[keyOf(src)]
  if(!entry||normalizePath(dest).toLowerCase().startsWith(`${normalizePath(src).toLowerCase()}\\`)||!validCreatePath(dest))return null
  dest=uniquePath(dest)
  if(invalidTreeDestination(src,dest)||!validCreatePath(dest))return null
  return commit(()=>{
    const affected=entry.kind==="folder"?treeEntries(src):[entry]
    const now=Date.now()
    for(const item of affected){
      const suffix=item.path.slice(src.length)
      const path=`${dest}${suffix}`
      const clone={...item,path,created:now,updated:now}
      delete clone.deleted
      delete clone.originalPath
      entries[keyOf(path)]=clone
    }
    return entries[keyOf(dest)]
  },null)
}

export function movePath(source,destination,cwd=ROOTS.desktop){
  let{src,dest}=destinationPath(source,destination,cwd)
  const entry=entries[keyOf(src)]
  if(!entry)return null
  if(normalizePath(dest).toLowerCase()===normalizePath(src).toLowerCase())return entry
  if(invalidTreeDestination(src,dest)||!validCreatePath(dest))return null
  dest=uniquePath(dest)
  if(!validCreatePath(dest))return null
  return commit(()=>{
    const current=entries[keyOf(src)]
    const affected=current.kind==="folder"?treeEntries(src):[current]
    for(const item of affected)delete entries[keyOf(item.path)]
    const now=Date.now()
    for(const item of affected){
      const suffix=item.path.slice(src.length)
      item.path=`${dest}${suffix}`
      if(item===current&&current.kind!=="folder")item.kind=kindForName(dest)
      item.updated=now
      entries[keyOf(item.path)]=item
    }
    return entries[keyOf(dest)]
  },null)
}

export function uniquePath(path){
  const full=normalizePath(path)
  if(!entries[keyOf(full)])return full
  const dir=parent(full)
  const name=basename(full)
  const dot=name.lastIndexOf(".")
  const stem=dot>0?name.slice(0,dot):name
  const ext=dot>0?name.slice(dot):""
  let i=2
  let candidate
  do{candidate=resolvePath(dir,`${stem} (${i++})${ext}`)}while(entries[keyOf(candidate)])
  return candidate
}

export function allVirtualFiles(){return Object.values(entries).filter(entry=>entry.kind!=="folder").map(entry=>({...entry}))}
export function roots(){return {...ROOTS}}
export function fileName(path){return basename(path)}
export function parentPath(path){return parent(path)}
