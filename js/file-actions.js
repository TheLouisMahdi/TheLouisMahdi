import{askConfirm,askText}from"./interaction.js"
import{copyPath,deletePath,deleteTree,emptyRecycleBin,fileName,folderPath,getEntry,makeFolder,movePath,readFile,renamePath,resolvePath,restorePath,roots,trashPath,uniquePath,validFileName,writeFile}from"./vfs.js"

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
  if(!result)toast("A file or folder with that name already exists, or the destination is invalid.")
}

export async function deleteVirtual(items){
  const paths=items.map(pathOf).filter(Boolean)
  if(!paths.length)return
  const permanent=paths.every(path=>path.toLowerCase().startsWith(roots().recycle.toLowerCase()))
  const ok=await askConfirm(permanent?"Delete File":"Move to Recycle Bin",paths.length===1?`${permanent?"Permanently delete":"Move"} '${fileName(paths[0])}'${permanent?"?":" to the Recycle Bin?"}`:`${permanent?"Permanently delete":"Move to Recycle Bin"} these ${paths.length} items?`)
  if(!ok)return
  let failed=0
  for(const path of paths)if(!(permanent?deleteTree(path):trashPath(path)))failed+=1
  if(failed)toast(`${failed} item(s) could not be deleted.`)
}

function copySelection(items,mode){
  clipboard={mode,paths:items.map(pathOf).filter(Boolean)}
  if(clipboard.paths.length)toast(`${clipboard.paths.length} item(s) ${mode==="cut"?"cut":"copied"}.`)
}

export function canPaste(){return clipboard.paths.length>0}

export function pasteInto(target){
  const dir=directoryFor(target)
  if(!dir||!clipboard.paths.length)return
  const sourcePaths=[...clipboard.paths]
  const moved=[]
  let done=0
  for(const path of sourcePaths){
    const entry=getEntry(path)
    if(!entry)continue
    const result=clipboard.mode==="cut"?movePath(path,dir):copyPath(path,dir)
    if(result){done+=1;if(clipboard.mode==="cut")moved.push(path)}
  }
  if(clipboard.mode==="cut"){
    clipboard.paths=clipboard.paths.filter(path=>!moved.includes(path))
    if(!clipboard.paths.length)clipboard={mode:null,paths:[]}
  }
  toast(`${done} item(s) pasted.`)
}

async function newItem(target,kind){
  const dir=directoryFor(target)
  if(!dir)return
  if(dir.toLowerCase()===roots().recycle.toLowerCase()){toast("You cannot create items in the Recycle Bin.");return}
  const defaults={text:"New Text Document.txt",python:"script.py",html:"page.html",folder:"New folder"}
  const name=await askText(kind==="folder"?"New Folder":"New File","Name:",defaults[kind])
  if(!name)return
  if(!validFileName(name)){toast("The file name contains invalid Windows characters or a reserved device name.");return}
  const path=uniquePath(resolvePath(dir,name))
  if(kind==="folder"){if(!makeFolder(path))toast("Windows could not create the folder in this location.");return}
  const templates={
    text:"",
    python:'print("Hello from Eka Windows 7")\n',
    html:'<!doctype html>\n<html>\n<head><meta charset="utf-8"><title>New page</title></head>\n<body>\n<h1>Hello from Notepad</h1>\n</body>\n</html>\n'
  }
  if(!writeFile(path,templates[kind]||"")){toast("Windows could not save the new file.");return}
  window.dispatchEvent(new CustomEvent("win7:open-file",{detail:{path,forceNotepad:true}}))
}

export function createItem(target,kind){return newItem(target,kind)}
export function createDesktopItem(kind){return newItem("desktop",kind)}

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


function restoreVirtual(items){
  const paths=items.map(pathOf).filter(path=>path?.toLowerCase().startsWith(roots().recycle.toLowerCase()))
  if(!paths.length)return
  let restored=0
  for(const path of paths)if(restorePath(path))restored+=1
  if(restored!==paths.length)toast(`${paths.length-restored} item(s) could not be restored.`)
}

function properties(item){
  if(item.virtualPath){
    const entry=getEntry(item.virtualPath)
    const size=entry?.kind==="folder"?0:new Blob([entry?.content||""]).size
    toast(`${fileName(item.virtualPath)} · ${entry?.kind||item.type} · ${size} bytes · ${item.virtualPath}`)
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
    recycled?{label:"Restore",action:()=>restoreVirtual(selected)}:{label:"Open",action:()=>open(item)},
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

export function backgroundContextItems(target,{selectAll,clear,refresh,surface="desktop",onNew}={}){
  if(directoryFor(target)?.toLowerCase()===roots().recycle.toLowerCase())return [
    {label:"Empty Recycle Bin",action:async()=>{if(await askConfirm("Empty Recycle Bin","Are you sure you want to permanently delete these items?"))emptyRecycleBin()}},
    separator,
    {label:"Select All",action:selectAll},{label:"Refresh",action:refresh},{label:"Clear selection",action:clear}
  ]

  const items=[]
  if(surface==="desktop")items.push(
    {label:"View  ›",action:()=>window.dispatchEvent(new CustomEvent("win7:desktop-menu",{detail:"view"}))},
    {label:"Sort by  ›",action:()=>window.dispatchEvent(new CustomEvent("win7:desktop-menu",{detail:"sort"}))}
  )
  items.push({label:"Refresh",action:refresh},separator,{label:"Paste",disabled:!canPaste(),action:()=>pasteInto(target)},{label:"Paste shortcut",disabled:true,action:()=>{}},separator)

  if(surface==="desktop")items.push({label:"New  ›",action:()=>window.dispatchEvent(new CustomEvent("win7:desktop-menu",{detail:"new"}))})
  else if(onNew)items.push(
    {label:"New folder",action:()=>onNew("folder")},
    {label:"New Text Document",action:()=>onNew("text")},
    {label:"New Python File",action:()=>onNew("python")},
    {label:"New HTML File",action:()=>onNew("html")}
  )

  if(surface==="desktop")items.push(
    separator,
    {label:"Screen resolution",action:()=>{window.dispatchEvent(new CustomEvent("win7:open-app",{detail:"control"}));window.dispatchEvent(new CustomEvent("win7:control-page",{detail:"display"}))}},
    {label:"Gadgets",action:()=>{window.dispatchEvent(new CustomEvent("win7:open-app",{detail:"control"}));window.dispatchEvent(new CustomEvent("win7:control-page",{detail:"desktop-gadgets"}))}},
    {label:"Personalize",action:()=>{window.dispatchEvent(new CustomEvent("win7:open-app",{detail:"control"}));window.dispatchEvent(new CustomEvent("win7:control-page",{detail:"personalization"}))}}
  )
  return items
}

export function deleteSelected(items){return deleteVirtual(items.filter(item=>item.writable))}
export function renameSelected(item){return item?.writable?renameVirtual(item):null}
