import{FILE_SYSTEM,PROFILE,profileText,repoText}from"./data.js"
import{icon}from"./icons.js"
import{openWindow}from"./window-manager.js"
import{bindSelectableSurface,refreshSurface}from"./interaction.js"
import{backgroundContextItems,deleteSelected,fileContextItems,openVirtual,renameSelected}from"./file-actions.js"
import{fileName,folderPath,getEntry,isFolder,listVirtual,normalizePath,resolvePath,roots}from"./vfs.js"

let current="computer"
let history=["computer"]
let historyIndex=0
let visibleItems=[]

const byId=id=>document.getElementById(id)
const DESKTOP=roots().desktop

function fileIcon(item){
  const map={computer:"computer",drive:"drive",folder:"folder",github:"github",telegram:"telegram",photo:"photo",zip:"zip",text:"text",python:"python",html:"html",recycle:"recycle",cmd:"cmd",powershell:"powershell",notepad:"notepad",calculator:"calculator",link:"link",paint:"paint",wordpad:"wordpad",sticky:"sticky",snipping:"snipping",media:"media",taskmanager:"taskmanager",printer:"printer"}
  return icon(map[item.type]||"text")
}

function openExternal(url){window.open(url,"_blank","noopener,noreferrer")}

function openText(item){
  let text=""
  if(item.text==="profile")text=profileText()
  else if(item.text?.startsWith("repo:"))text=repoText(item.text.slice(5))
  window.dispatchEvent(new CustomEvent("win7:open-text",{detail:{name:item.name,text}}))
}

function openImage(item){
  byId("imageTitle").textContent=`${item.name} - Windows Photo Viewer`
  const image=byId("imageView")
  image.src=item.image
  image.alt=item.name
  openWindow("imageWindow")
}

function activate(item){
  if(!item)return
  if(item.virtualPath){openVirtual(item);return}
  if(item.target){navigate(item.target);return}
  if(item.app){window.dispatchEvent(new CustomEvent("win7:open-app",{detail:item.app}));return}
  if(item.text){openText(item);return}
  if(item.image){openImage(item);return}
  if(item.external)openExternal(item.external)
}

function folderFor(target){
  if(FILE_SYSTEM[target]){
    const base=FILE_SYSTEM[target]
    const dynamic=listVirtual(target)
    return {...base,items:[...base.items,...dynamic]}
  }
  if(target?.startsWith("vfs:")){
    const path=normalizePath(target.slice(4))
    return {title:fileName(path)||path,path,type:"folder",items:listVirtual(path)}
  }
  return FILE_SYSTEM.computer
}

function itemKey(item){return item.virtualPath||`${item.name}|${item.target||item.external||item.app||""}`}

function renderDrives(items){
  return `<div class="drive-list">${items.map((item,index)=>{
    const free=item.total-item.used
    const width=Math.min(100,Math.round(item.used/item.total*100))
    return `<button class="drive-row" data-item-index="${index}" data-key="${encodeURIComponent(itemKey(item))}"><span class="file-icon">${fileIcon(item)}</span><span><span class="drive-name">${item.name}</span><span class="drive-meter"><i style="width:${width}%"></i></span><span class="drive-meta">${free} GB free of ${item.total} GB</span></span></button>`
  }).join("")}</div>`
}

function renderFiles(items){
  if(!items.length)return `<div class="empty-folder">This folder is empty.</div>`
  return `<div class="file-grid">${items.map((item,index)=>`<button class="file-item" data-item-index="${index}" data-key="${encodeURIComponent(itemKey(item))}"><span class="file-icon">${fileIcon(item)}</span><span class="file-name">${item.name}</span></button>`).join("")}</div>`
}

function render(){
  const folder=folderFor(current)
  const query=byId("explorerSearch").value.trim().toLowerCase()
  byId("explorerTitle").textContent=folder.title
  byId("addressBar").textContent=folder.path
  byId("explorerSearch").placeholder=`Search ${folder.title}`
  visibleItems=folder.items.filter(item=>item.name.toLowerCase().includes(query))
  byId("fileArea").innerHTML=folder.type==="drives"?renderDrives(visibleItems):renderFiles(visibleItems)
  byId("explorerStatus").textContent=`${visibleItems.length} item${visibleItems.length===1?"":"s"}`
  refreshSurface(byId("fileArea"))
}

export function navigate(target,push=true){
  if(!FILE_SYSTEM[target]&&!target?.startsWith("vfs:"))return
  if(target?.startsWith("vfs:")&&!isFolder(target.slice(4)))return
  current=target
  if(push){history=history.slice(0,historyIndex+1);history.push(target);historyIndex=history.length-1}
  render()
  openWindow("explorerWindow")
}

export function resolveFolderFromPath(path){
  const value=normalizePath(String(path||"")).toLowerCase()
  const table={
    "c:\\":"cdrive","c:":"cdrive","d:\\":"ddrive","d:":"ddrive","g:\\":"github","g:":"github",
    "c:\\users\\eka\\desktop":"desktop","c:\\users\\eka\\documents":"documents","c:\\users\\eka\\downloads":"downloads",
    "g:\\workspace":"github",
    "c:\\windows":"windows","c:\\windows\\system32":"system32","c:\\program files":"programfiles"
  }
  if(table[value])return table[value]
  const entry=getEntry(value)
  if(entry?.kind==="folder")return `vfs:${entry.path}`
  return null
}

function backgroundTarget(){return current.startsWith("vfs:")?current:folderPath(current)?current:null}

function initSelection(){
  const area=byId("fileArea")
  bindSelectableSurface(area,".file-item,.drive-row",{
    key:node=>decodeURIComponent(node.dataset.key||""),
    item:node=>visibleItems[Number(node.dataset.itemIndex)],
    activate,
    context:(item,selected)=>fileContextItems(item,selected,{open:activate}),
    background:(_,helpers)=>{
      const target=backgroundTarget()
      if(!target)return [{label:"Refresh",action:render},{label:"Properties",action:()=>window.dispatchEvent(new CustomEvent("win7:toast",{detail:folderFor(current).path}))}]
      return backgroundContextItems(target,{selectAll:helpers.selectAll,clear:helpers.clear,refresh:render})
    },
    deleteSelected,
    renameSelected,
    onSelection:keys=>{
      const total=visibleItems.length
      byId("explorerStatus").textContent=keys.length?`${keys.length} item${keys.length===1?"":"s"} selected · ${total} total`:`${total} item${total===1?"":"s"}`
    }
  })
}

function navigatePath(path){
  const target=resolveFolderFromPath(path)
  if(target){navigate(target);return true}
  const full=path.includes(":")?normalizePath(path):resolvePath(DESKTOP,path)
  const entry=getEntry(full)
  if(entry){
    if(entry.kind==="folder")navigate(`vfs:${entry.path}`)
    else window.dispatchEvent(new CustomEvent("win7:open-file",{detail:{path:entry.path}}))
    return true
  }
  window.dispatchEvent(new CustomEvent("win7:toast",{detail:`Windows cannot find '${path}'.`}))
  return false
}

export function initExplorer(){
  render()
  initSelection()
  byId("backBtn").addEventListener("click",()=>{if(historyIndex<=0)return;historyIndex-=1;current=history[historyIndex];render()})
  byId("forwardBtn").addEventListener("click",()=>{if(historyIndex>=history.length-1)return;historyIndex+=1;current=history[historyIndex];render()})
  byId("explorerSearch").addEventListener("input",render)
  document.querySelectorAll("[data-open]").forEach(node=>node.addEventListener("click",()=>{navigate(node.dataset.open);byId("startMenu").classList.add("hidden")}))
  document.querySelectorAll("[data-external]").forEach(node=>node.addEventListener("click",()=>openExternal(node.dataset.external)))
  byId("organizeBtn").addEventListener("click",()=>window.dispatchEvent(new CustomEvent("win7:toast",{detail:"Organize · Cut · Copy · Paste · Layout · Folder and search options"})))
  byId("explorerWindow").addEventListener("keydown",event=>{
    if(event.altKey&&event.key==="ArrowLeft"){event.preventDefault();byId("backBtn").click();return}
    if(event.altKey&&event.key==="ArrowRight"){event.preventDefault();byId("forwardBtn").click();return}
    if((event.ctrlKey||event.metaKey)&&["e","f"].includes(event.key.toLowerCase())){event.preventDefault();byId("explorerSearch").focus();byId("explorerSearch").select();return}
    if(event.key==="F5"){event.preventDefault();render();return}
    if(event.key==="Backspace"&&!event.target.matches("input,textarea")){event.preventDefault();byId("backBtn").click()}
  })
  window.addEventListener("win7:vfs-changed",render)
  window.addEventListener("win7:explorer-path",event=>navigatePath(event.detail))
}

export function profileUrl(){return PROFILE.github}
