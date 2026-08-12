import{FILE_SYSTEM,PROFILE,profileText,repoText}from"./data.js"
import{icon}from"./icons.js"
import{openWindow}from"./window-manager.js"

let current="computer"
let history=["computer"]
let historyIndex=0

const byId=id=>document.getElementById(id)

function fileIcon(item){
  const map={computer:"computer",drive:"drive",folder:"folder",github:"github",telegram:"telegram",photo:"photo",zip:"zip",text:"text",recycle:"recycle",cmd:"cmd",powershell:"powershell",notepad:"notepad",calculator:"calculator",link:"link"}
  return icon(map[item.type]||"text")
}

function openExternal(url){window.open(url,"_blank","noopener,noreferrer")}

function openText(item){
  byId("notepadTitle").textContent=`${item.name} - Notepad`
  const text=byId("noteText")
  if(item.text==="profile")text.value=profileText()
  else if(item.text?.startsWith("repo:"))text.value=repoText(item.text.slice(5))
  else text.value=""
  openWindow("notepadWindow")
}

function openImage(item){
  byId("imageTitle").textContent=`${item.name} - Windows Photo Viewer`
  const image=byId("imageView")
  image.src=item.image
  image.alt=item.name
  openWindow("imageWindow")
}

function activate(item){
  if(item.target){navigate(item.target);return}
  if(item.app){window.dispatchEvent(new CustomEvent("win7:open-app",{detail:item.app}));return}
  if(item.text){openText(item);return}
  if(item.image){openImage(item);return}
  if(item.external)openExternal(item.external)
}

function renderDrives(folder,query){
  const items=folder.items.filter(item=>item.name.toLowerCase().includes(query))
  return `<div class="drive-list">${items.map(item=>{
    const free=item.total-item.used
    const width=Math.min(100,Math.round(item.used/item.total*100))
    return `<button class="drive-row" data-item-name="${item.name}"><span class="file-icon">${fileIcon(item)}</span><span><span class="drive-name">${item.name}</span><span class="drive-meter"><i style="width:${width}%"></i></span><span class="drive-meta">${free} GB free of ${item.total} GB</span></span></button>`
  }).join("")}</div>`
}

function renderFiles(folder,query){
  const items=folder.items.filter(item=>item.name.toLowerCase().includes(query))
  if(!items.length)return `<div style="padding:18px;font-size:10px;color:#777">This folder is empty.</div>`
  return `<div class="file-grid">${items.map(item=>`<button class="file-item" data-item-name="${item.name}"><span class="file-icon">${fileIcon(item)}</span><span class="file-name">${item.name}</span></button>`).join("")}</div>`
}

function render(){
  const folder=FILE_SYSTEM[current]||FILE_SYSTEM.computer
  const query=byId("explorerSearch").value.trim().toLowerCase()
  byId("explorerTitle").textContent=folder.title
  byId("addressBar").textContent=folder.path
  byId("explorerSearch").placeholder=`Search ${folder.title}`
  const filtered=folder.items.filter(item=>item.name.toLowerCase().includes(query))
  byId("fileArea").innerHTML=folder.type==="drives"?renderDrives(folder,query):renderFiles(folder,query)
  byId("explorerStatus").textContent=`${filtered.length} item${filtered.length===1?"":"s"}`
  byId("fileArea").querySelectorAll("[data-item-name]").forEach(node=>{
    const item=folder.items.find(entry=>entry.name===node.dataset.itemName)
    node.addEventListener("dblclick",()=>activate(item))
    node.addEventListener("click",()=>{
      byId("fileArea").querySelectorAll(".selected").forEach(x=>x.classList.remove("selected"))
      node.classList.add("selected")
    })
  })
}

export function navigate(target,push=true){
  if(!FILE_SYSTEM[target])return
  current=target
  if(push){history=history.slice(0,historyIndex+1);history.push(target);historyIndex=history.length-1}
  render()
  openWindow("explorerWindow")
}

export function resolveFolderFromPath(path){
  const value=path.trim().replaceAll("/","\\").toLowerCase()
  const table={
    "c:\\":"cdrive","c:":"cdrive","d:\\":"ddrive","d:":"ddrive","g:\\":"github","g:":"github",
    "c:\\users\\eka\\desktop":"desktop","c:\\users\\eka\\documents":"documents","c:\\users\\eka\\downloads":"downloads",
    "c:\\windows":"windows","c:\\windows\\system32":"system32","c:\\program files":"programfiles"
  }
  return table[value]||null
}

export function initExplorer(){
  render()
  byId("backBtn").addEventListener("click",()=>{if(historyIndex<=0)return;historyIndex-=1;current=history[historyIndex];render()})
  byId("forwardBtn").addEventListener("click",()=>{if(historyIndex>=history.length-1)return;historyIndex+=1;current=history[historyIndex];render()})
  byId("explorerSearch").addEventListener("input",render)
  document.querySelectorAll("[data-open]").forEach(node=>node.addEventListener("click",()=>{navigate(node.dataset.open);byId("startMenu").classList.add("hidden")}))
  document.querySelectorAll("[data-external]").forEach(node=>node.addEventListener("click",()=>openExternal(node.dataset.external)))
  byId("organizeBtn").addEventListener("click",()=>window.dispatchEvent(new CustomEvent("win7:toast",{detail:"Organize: New folder · Layout · Folder options"})))
}

export function profileUrl(){return PROFILE.github}
