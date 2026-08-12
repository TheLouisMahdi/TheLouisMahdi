import{askConfirm,askText}from"./interaction.js"
import{copyPath,deletePath,emptyRecycleBin,fileName,folderPath,getEntry,movePath,parentPath,readFile,renamePath,resolvePath,restorePath,roots,trashPath,uniquePath,writeFile,makeFolder}from"./vfs.js"

let clipboard={mode:null,paths:[]}

const editable=/\.(txt|py|html?|css|js|json|md|bat|cmd|ps1)$/i
const toast=text=>window.dispatchEvent(new CustomEvent("win7:toast",{detail:text}))
const separator={separator:true}

function pathOf(item){return item?.virtualPath||null}
function directoryFor(target){return folderPath(target)||String(target||"").replace(/^vfs:/,"")||null}

export function openVirtual(item,forceNotepad=false){
  const path=pathOf(item)
  if(!path)return false
  if(item.type==="folder"){window.dispatchEvent(new CustomEvent("win7:navigate",{detail:item.target}));return true}
  if(item.type==="python"&&!forceNotepad){runPython(path);return true}
  window.dispatchEvent(new CustomEvent("win7:open-file",{detail:{path,forceNotepad}}))
  return true
}

export function runPython(path){window.dispatchEvent(new CustomEvent("win7:cmd-run",{detail:`python "${path}"`}))}

export async function renameVirtual(item){
  const path=pathOf(item)
  if(!path)return
  const name=await askText("Rename","Type a new name for this item:",fileName(path))
  if(!name||name===fileName(path))return
  const result=renamePath(path,name)
  if(!result)toast("A file with that name already exists.")
}

export async function deleteVirtual(items){
  const paths=items.map(pathOf).filter(Boolean)
  if(!paths.length)return
  const permanent=paths.every(path=>path.toLowerCase().startsWith(roots().recycle.toLowerCase()))
  const ok=await askConfirm(permanent?"Delete File":"Move to Recycle Bin",paths.length===1?`${permanent?"Permanently delete":"Move"} '${fileName(paths[0])}'${permanent?"?":" to the Recycle Bin?"}`:`${permanent?"Permanently delete":"Move to Recycle Bin"} these ${paths.length} items?`)
  if(!ok)return
  let failed=0
  for(const path of paths)if(!(permanent?deletePath(path):trashPath(path)))failed+=1
  if(failed)toast(`${failed} item(s) could not be deleted because a folder is not empty.`)
}

function copySelection(items,mode){
  clipboard={mode,paths:items.map(pathOf).filter(Boolean)}
  if(clipboard.paths.length)toast(`${clipboard.paths.length} item(s) ${mode==="cut"?"cut":"copied"}.`)
}

export function canPaste(){return clipboard.paths.length>0}

export function pasteInto(target){
  const dir=directoryFor(target)
  if(!dir||!clipboard.paths.length)return
  const old=[...clipboard.paths]
  let done=0
  for(const path of old){
    const entry=getEntry(path)
    if(!entry||entry.kind==="folder")continue
    const destination=resolvePath(dir,fileName(path))
    const result=clipboard.mode==="cut"?movePath(path,destination):copyPath(path,destination)
    if(result)done+=1
  }
  if(clipboard.mode==="cut")clipboard={mode:null,paths:[]}
  toast(`${done} item(s) pasted.`)
}

async function newFile(target,kind){
  const dir=directoryFor(target)
  if(!dir)return
  const defaults={text:"New Text Document.txt",python:"script.py",html:"page.html",folder:"New folder"}
  const name=await askText(kind==="folder"?"New Folder":"New File","Name:",defaults[kind])
  if(!name)return
  const path=uniquePath(resolvePath(dir,name))
  if(kind==="folder"){makeFolder(path);return}
  const templates={
    text:"",
    python:'print("Hello from Eka Windows 7")\n',
    html:'<!doctype html>\n<html>\n<head><meta charset="utf-8"><title>New page</title></head>\n<body>\n<h1>Hello from Notepad</h1>\n</body>\n</html>\n'
  }
  writeFile(path,templates[kind]||"")
  window.dispatchEvent(new CustomEvent("win7:open-file",{detail:{path,forceNotepad:true}}))
}

function downloadVirtual(item){
  const path=pathOf(item)
  const content=readFile(path)
  if(content===null)return
  const blob=new Blob([content],{type:"text/plain;charset=utf-8"})
  const url=URL.createObjectURL(blob)
  const link=document.createElement("a")
  link.href=url
  link.download=fileName(path)
  link.click()
  setTimeout(()=>URL.revokeObjectURL(url),1000)
}

function properties(item){
  if(item.virtualPath){
    const entry=getEntry(item.virtualPath)
    const size=new Blob([entry?.content||""]).size
    toast(`${fileName(item.virtualPath)} · ${entry?.kind||item.type} · ${size} bytes · C:\\Users\\Eka`)
    return
  }
  toast(`${item.name} · Windows item`)
}

export function fileContextItems(item,selected,{open}){
  const writable=selected.filter(entry=>entry?.writable&&entry.virtualPath)
  const allWritable=writable.length===selected.length&&writable.length>0
  const path=pathOf(item)
  const recycled=path?.toLowerCase().startsWith(roots().recycle.toLowerCase())
  const isEditable=path&&editable.test(path)
  const items=[
    recycled?{label:"Restore",action:()=>restorePath(path)}:{label:"Open",action:()=>open(item)},
    isEditable?{label:"Open with Notepad",action:()=>openVirtual(item,true)}:null,
    item.type==="python"?{label:"Run with Python",action:()=>runPython(path)}:null,
    separator,
    {label:"Cut",disabled:!allWritable,action:()=>copySelection(writable,"cut")},
    {label:"Copy",disabled:!allWritable,action:()=>copySelection(writable,"copy")},
    path&&item.type!=="folder"?{label:"Download",action:()=>downloadVirtual(item)}:null,
    separator,
    {label:"Delete",disabled:!allWritable,action:()=>deleteVirtual(writable)},
    {label:"Rename",disabled:selected.length!==1||!item.writable,action:()=>renameVirtual(item)},
    separator,
    {label:"Properties",action:()=>properties(item)}
  ]
  return items.filter(Boolean)
}

export function backgroundContextItems(target,{selectAll,clear,refresh}){
  if(directoryFor(target)?.toLowerCase()===roots().recycle.toLowerCase())return [
    {label:"Empty Recycle Bin",action:async()=>{if(await askConfirm("Empty Recycle Bin","Are you sure you want to permanently delete these items?"))emptyRecycleBin()}},
    separator,
    {label:"Select All",action:selectAll},{label:"Refresh",action:refresh},{label:"Clear selection",action:clear}
  ]
  return [
    {label:"Paste",disabled:!canPaste(),action:()=>pasteInto(target)},
    separator,
    {label:"New Folder",action:()=>newFile(target,"folder")},
    {label:"New Text Document",action:()=>newFile(target,"text")},
    {label:"New Python File",action:()=>newFile(target,"python")},
    {label:"New HTML File",action:()=>newFile(target,"html")},
    separator,
    {label:"Select All",action:selectAll},
    {label:"Refresh",action:refresh},
    {label:"Personalize",action:()=>toast("Windows 7 Aero · Eka desktop")},
    {label:"Screen resolution",action:()=>toast(`${Math.round(document.getElementById("screen").clientWidth)} × ${Math.round(document.getElementById("screen").clientHeight)} simulated display`)},
    {label:"Clear selection",action:clear}
  ]
}

export function deleteSelected(items){return deleteVirtual(items.filter(item=>item.writable))}
export function renameSelected(item){return item?.writable?renameVirtual(item):null}
