import{FILE_SYSTEM,PROFILE,profileText,repoText}from"./data.js"
import{icon}from"./icons.js"
import{openWindow}from"./window-manager.js"
import{bindSelectableSurface,invertSelection,refreshSurface,showContextMenu}from"./interaction.js"
import{backgroundContextItems,createItem,deleteSelected,fileContextItems,openVirtual,renameSelected}from"./file-actions.js"
import{fileName,folderPath,getEntry,isFolder,listVirtual,normalizePath,resolvePath,roots}from"./vfs.js"
import{escapeHtml}from"./html.js"

let current="computer"
let history=["computer"]
let historyIndex=0
let visibleItems=[]

const byId=id=>document.getElementById(id)
const DESKTOP=roots().desktop
const ADDRESS_PATHS={
  computer:"Computer",cdrive:"C:\\",ddrive:"D:\\",github:roots().github,desktop:roots().desktop,documents:roots().documents,downloads:roots().downloads,
  pictures:"C:\\Users\\Eka\\Pictures",music:"C:\\Users\\Eka\\Music",videos:"C:\\Users\\Eka\\Videos",users:"C:\\Users",userhome:"C:\\Users\\Eka",
  programfiles:"C:\\Program Files",powershellFolder:"C:\\Program Files\\WindowsPowerShell",psV1:"C:\\Program Files\\WindowsPowerShell\\v1.0",ieFolder:"C:\\Program Files\\Internet Explorer",
  windows:"C:\\Windows",system32:"C:\\Windows\\System32",projects:"G:\\Workspace\\Repositories",archives:"D:\\Archives",win7wallpapers:"C:\\Users\\Eka\\Pictures\\Windows 7 Wallpapers",recycle:roots().recycle,
  homegroup:"Homegroup",network:"Network"
}

function canonicalPath(target){
  if(target?.startsWith("vfs:"))return normalizePath(target.slice(4))
  if(target?.startsWith("repo:"))return `G:\\Workspace\\Repositories\\${target.slice(5)}`
  if(target?.startsWith("wallpapers:"))return `C:\\Users\\Eka\\Pictures\\Windows 7 Wallpapers\\${target.slice(11)}`
  return ADDRESS_PATHS[target]||folderFor(target).path
}

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
    return `<button class="drive-row" data-item-index="${index}" data-key="${encodeURIComponent(itemKey(item))}"><span class="file-icon">${fileIcon(item)}</span><span><span class="drive-name">${escapeHtml(item.name)}</span><span class="drive-meter"><i style="width:${width}%"></i></span><span class="drive-meta">${free} GB free of ${item.total} GB</span></span></button>`
  }).join("")}</div>`
}

function renderFiles(items){
  if(!items.length)return `<div class="empty-folder">This folder is empty.</div>`
  return `<div class="file-grid">${items.map((item,index)=>`<button class="file-item" data-item-index="${index}" data-key="${encodeURIComponent(itemKey(item))}">${item.type==="photo"&&item.image?`<span class="file-icon file-thumbnail"><img src="${item.thumbnail||item.image}" alt="" loading="lazy" draggable="false"></span>`:`<span class="file-icon">${fileIcon(item)}</span>`}<span class="file-name">${escapeHtml(item.name)}</span></button>`).join("")}</div>`
}

function render(){
  const folder=folderFor(current)
  const query=byId("explorerSearch").value.trim().toLowerCase()
  byId("explorerTitle").textContent=folder.title
  byId("addressBar").textContent=canonicalPath(current)
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
  if(push&&history[historyIndex]!==target){history=history.slice(0,historyIndex+1);history.push(target);historyIndex=history.length-1}
  render()
  openWindow("explorerWindow")
}

export function resolveFolderFromPath(path){
  const value=normalizePath(String(path||"")).toLowerCase()
  const table={
    "c:\\":"cdrive","c:":"cdrive","d:\\":"ddrive","d:":"ddrive","g:\\":"github","g:":"github",
    "c:\\users":"users","c:\\users\\eka":"userhome","c:\\users\\eka\\desktop":"desktop","c:\\users\\eka\\documents":"documents","c:\\users\\eka\\downloads":"downloads",
    "c:\\users\\eka\\pictures":"pictures","c:\\users\\eka\\music":"music","c:\\users\\eka\\videos":"videos","c:\\$recycle.bin":"recycle",
    "g:\\workspace":"github","g:\\workspace\\repositories":"projects","d:\\archives":"archives",
    "c:\\windows":"windows","c:\\windows\\system32":"system32","c:\\program files":"programfiles","c:\\program files\\windows powershell":"powershellFolder","c:\\program files\\windows powershell\\v1.0":"psV1","c:\\program files\\internet explorer":"ieFolder"
  }
  if(table[value])return table[value]
  const repoPrefix="g:\\workspace\\repositories\\"
  if(value.startsWith(repoPrefix)){const target=`repo:${normalizePath(path).slice(repoPrefix.length)}`;if(FILE_SYSTEM[target])return target}
  const wallpaperPrefix="c:\\users\\eka\\pictures\\windows 7 wallpapers\\"
  if(value.startsWith(wallpaperPrefix)){const target=`wallpapers:${normalizePath(path).slice(wallpaperPrefix.length)}`;if(FILE_SYSTEM[target])return target}
  const entry=getEntry(value)
  if(entry?.kind==="folder")return `vfs:${entry.path}`
  return null
}

function backgroundTarget(){return current.startsWith("vfs:")?current:folderPath(current)?current:null}

function createFolder(){
  const target=backgroundTarget()
  if(!target){window.dispatchEvent(new CustomEvent("win7:toast",{detail:"A folder cannot be created in this system location."}));return}
  return createItem(target,"folder")
}

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
      return backgroundContextItems(target,{selectAll:helpers.selectAll,clear:helpers.clear,refresh:render,surface:"explorer",onNew:kind=>createItem(target,kind)})
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
  byId("organizeBtn").addEventListener("click",event=>{
    const rect=event.currentTarget.getBoundingClientRect()
    showContextMenu([
      {label:"New folder",action:createFolder},
      {separator:true},
      {label:"Select all",action:()=>{byId("fileArea").focus();byId("fileArea").dispatchEvent(new KeyboardEvent("keydown",{key:"a",ctrlKey:true,bubbles:true}))}},
      {label:"Layout  ›  Navigation pane ✓",action:()=>byId("explorerWindow").classList.toggle("hide-navigation")},
      {label:"Layout  ›  Menu bar",action:()=>byId("explorerMenuBar").classList.toggle("hidden")},
      {separator:true},
      {label:"Folder and search options",action:()=>{window.dispatchEvent(new CustomEvent("win7:open-app",{detail:"control"}));window.dispatchEvent(new CustomEvent("win7:control-page",{detail:"folder-options"}))}}
    ],rect.left,rect.bottom)
  })
  byId("newFolderBtn").addEventListener("click",createFolder)
  byId("changeViewBtn").addEventListener("click",()=>{byId("fileArea").classList.toggle("details-view");byId("changeViewBtn").textContent=byId("fileArea").classList.contains("details-view")?"☰ ▾":"▦ ▾"})
  byId("addressBar").tabIndex=0
  byId("addressBar").addEventListener("dblclick",event=>{event.currentTarget.contentEditable="true";event.currentTarget.focus();document.execCommand?.("selectAll",false,null)})
  byId("addressBar").addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();event.currentTarget.contentEditable="false";navigatePath(event.currentTarget.textContent)}if(event.key==="Escape"){event.currentTarget.contentEditable="false";render()}})
  byId("addressBar").addEventListener("blur",event=>{event.currentTarget.contentEditable="false";render()})
  byId("explorerMenuBar").addEventListener("click",event=>{
    const button=event.target.closest("button");if(!button)return
    const rect=button.getBoundingClientRect(),menu=button.textContent.trim()
    const menus={
      File:[{label:"New folder",action:createFolder},{separator:true},{label:"Close",action:()=>byId("explorerWindow").querySelector('[data-window-action="close"]').click()}],
      Edit:[{label:"Select all",action:()=>byId("fileArea").dispatchEvent(new KeyboardEvent("keydown",{key:"a",ctrlKey:true,bubbles:true}))},{label:"Invert selection",action:()=>invertSelection(byId("fileArea"))}],
      View:[{label:"Large icons",action:()=>byId("fileArea").classList.remove("details-view")},{label:"Details",action:()=>byId("fileArea").classList.add("details-view")},{separator:true},{label:"Refresh",action:render}],
      Tools:[{label:"Map network drive...",action:()=>window.dispatchEvent(new CustomEvent("win7:toast",{detail:"GitHub workspace is mapped as G:."}))},{label:"Folder options...",action:()=>{window.dispatchEvent(new CustomEvent("win7:open-app",{detail:"control"}));window.dispatchEvent(new CustomEvent("win7:control-page",{detail:"folder-options"}))}}],
      Help:[{label:"View Help",action:()=>window.dispatchEvent(new CustomEvent("win7:open-app",{detail:"help"}))},{label:"About Windows",action:()=>window.dispatchEvent(new CustomEvent("win7:open-app",{detail:"systeminfo"}))}]
    }
    showContextMenu(menus[menu]||[],rect.left,rect.bottom)
  })
  byId("explorerWindow").addEventListener("keydown",event=>{
    if(event.altKey&&event.key==="ArrowLeft"){event.preventDefault();byId("backBtn").click();return}
    if(event.altKey&&event.key==="ArrowRight"){event.preventDefault();byId("forwardBtn").click();return}
    if((event.ctrlKey||event.metaKey)&&["e","f"].includes(event.key.toLowerCase())){event.preventDefault();byId("explorerSearch").focus();byId("explorerSearch").select();return}
    if(event.key==="F5"){event.preventDefault();render();return}
    if(event.key==="Alt"){event.preventDefault();byId("explorerMenuBar").classList.toggle("hidden");return}
    if(event.key==="Backspace"&&!event.target.matches("input,textarea")){event.preventDefault();byId("backBtn").click()}
  })
  window.addEventListener("win7:vfs-changed",render)
  window.addEventListener("win7:explorer-path",event=>navigatePath(event.detail))
}

export function profileUrl(){return PROFILE.github}
