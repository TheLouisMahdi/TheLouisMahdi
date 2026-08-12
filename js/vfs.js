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

function save(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(entries))}catch{}
  if(typeof window!=="undefined")window.dispatchEvent(new CustomEvent("win7:vfs-changed"))
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
  if(changed)save()
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
      updated:entry.updated
    }))
}

export function getEntry(path,cwd=ROOTS.desktop){return entries[keyOf(resolvePath(cwd,path))]||null}
export function exists(path,cwd=ROOTS.desktop){return Boolean(getEntry(path,cwd))}
export function isFolder(path,cwd=ROOTS.desktop){return getEntry(path,cwd)?.kind==="folder"}

export function readFile(path,cwd=ROOTS.desktop){
  const entry=getEntry(path,cwd)
  return entry&&entry.kind!=="folder"?entry.content:null
}

export function writeFile(path,content,cwd=ROOTS.desktop,metadata={}){
  const full=resolvePath(cwd,path)
  const key=keyOf(full)
  const old=entries[key]
  const now=Date.now()
  entries[key]={...old,...metadata,path:full,kind:kindForName(full),content:String(content??""),created:old?.created||now,updated:now}
  save()
  return entries[key]
}

export function trashPath(path,cwd=ROOTS.desktop){
  const full=resolvePath(cwd,path)
  const entry=entries[keyOf(full)]
  if(!entry)return false
  const destination=uniquePath(resolvePath(ROOTS.recycle,basename(full)))
  const affected=entry.kind==="folder"?Object.values(entries).filter(item=>item.path.toLowerCase()===full.toLowerCase()||item.path.toLowerCase().startsWith(`${full.toLowerCase()}\\`)):[entry]
  for(const item of affected)delete entries[keyOf(item.path)]
  for(const item of affected){
    const original=item.path
    item.originalPath=original
    item.deleted=Date.now()
    item.path=`${destination}${original.slice(full.length)}`
    entries[keyOf(item.path)]=item
  }
  save()
  return true
}

export function restorePath(path){
  const full=normalizePath(path)
  const entry=entries[keyOf(full)]
  if(!entry||!entry.originalPath)return false
  const destination=uniquePath(entry.originalPath)
  const affected=entry.kind==="folder"?Object.values(entries).filter(item=>item.path.toLowerCase()===full.toLowerCase()||item.path.toLowerCase().startsWith(`${full.toLowerCase()}\\`)):[entry]
  for(const item of affected)delete entries[keyOf(item.path)]
  for(const item of affected){
    const suffix=item.path.slice(full.length)
    delete item.deleted
    delete item.originalPath
    item.path=`${destination}${suffix}`
    item.updated=Date.now()
    entries[keyOf(item.path)]=item
  }
  save()
  return true
}

export function emptyRecycleBin(){
  const prefix=`${ROOTS.recycle.toLowerCase()}\\`
  const keys=Object.keys(entries).filter(key=>key.startsWith(prefix))
  keys.forEach(key=>delete entries[key])
  if(keys.length)save()
  return keys.length
}

export function makeFolder(path,cwd=ROOTS.desktop){
  const full=resolvePath(cwd,path)
  const key=keyOf(full)
  if(entries[key])return false
  const now=Date.now()
  entries[key]={path:full,kind:"folder",content:"",created:now,updated:now}
  save()
  return true
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
  delete entries[key]
  save()
  return true
}

export function renamePath(path,newName,cwd=ROOTS.desktop){
  const full=resolvePath(cwd,path)
  const entry=entries[keyOf(full)]
  if(!entry)return null
  const dest=resolvePath(parent(full),newName)
  if(entries[keyOf(dest)])return null
  delete entries[keyOf(full)]
  entry.path=dest
  entry.kind=entry.kind==="folder"?"folder":kindForName(dest)
  entry.updated=Date.now()
  entries[keyOf(dest)]=entry
  if(entry.kind==="folder"){
    const prefix=`${full.toLowerCase()}\\`
    for(const item of Object.values(entries)){
      if(item.path.toLowerCase().startsWith(prefix))item.path=`${dest}${item.path.slice(full.length)}`
    }
    entries=Object.fromEntries(Object.values(entries).map(item=>[keyOf(item.path),item]))
  }
  save()
  return entry
}

export function copyPath(source,destination,cwd=ROOTS.desktop){
  const src=resolvePath(cwd,source)
  const entry=entries[keyOf(src)]
  if(!entry||entry.kind==="folder")return null
  let dest=resolvePath(cwd,destination)
  if(isFolder(dest))dest=resolvePath(dest,basename(src))
  return writeFile(uniquePath(dest),entry.content)
}

export function movePath(source,destination,cwd=ROOTS.desktop){
  const src=resolvePath(cwd,source)
  const entry=entries[keyOf(src)]
  if(!entry||entry.kind==="folder")return null
  let dest=resolvePath(cwd,destination)
  if(isFolder(dest))dest=resolvePath(dest,basename(src))
  const copied=writeFile(uniquePath(dest),entry.content)
  delete entries[keyOf(src)]
  save()
  return copied
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
