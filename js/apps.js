import{profileText}from"./data.js"
import{askText}from"./interaction.js"
import{fileName,parentPath,readFile,resolvePath,roots,writeFile}from"./vfs.js"
import{icon}from"./icons.js"
import{openWindow}from"./window-manager.js"

const byId=id=>document.getElementById(id)
const DESKTOP=roots().desktop
let notePath=null
let noteStaticName=null

const buttons=[
  ["MC","memory-clear"],["MR","memory-read"],["M+","memory-add"],["M-","memory-sub"],["←","back"],
  ["CE","clear-entry"],["C","clear"],["±","sign"],["√","sqrt"],["÷","op"],
  ["7","digit"],["8","digit"],["9","digit"],["%","percent"],["×","op"],
  ["4","digit"],["5","digit"],["6","digit"],["1/x","inverse"],["−","op"],
  ["1","digit"],["2","digit"],["3","digit"],["=","equals"],["+","op"],
  ["0","digit"],[".","decimal"]
]

let value="0"
let stored=null
let operation=null
let fresh=true
let memory=0

function display(){byId("calcDisplay").value=value}
function number(){return Number(value)||0}

function calculate(){
  if(stored===null||!operation)return number()
  const right=number()
  if(operation==="+")return stored+right
  if(operation==="−")return stored-right
  if(operation==="×")return stored*right
  if(operation==="÷")return right===0?0:stored/right
  return right
}

function calcAction(label,type){
  if(type==="digit"){value=fresh?label:(value==="0"?label:value+label);fresh=false}
  if(type==="decimal"){if(fresh){value="0.";fresh=false}else if(!value.includes("."))value+="."}
  if(type==="op"){if(stored!==null&&!fresh)value=String(calculate());stored=number();operation=label;fresh=true}
  if(type==="equals"){value=String(calculate());stored=null;operation=null;fresh=true}
  if(type==="clear"||type==="clear-entry"){value="0";if(type==="clear"){stored=null;operation=null}fresh=true}
  if(type==="back"&&!fresh)value=value.length>1?value.slice(0,-1):"0"
  if(type==="sign")value=String(-number())
  if(type==="sqrt")value=String(Math.sqrt(Math.max(0,number())))
  if(type==="percent")value=String(number()/100)
  if(type==="inverse")value=String(number()===0?0:1/number())
  if(type==="memory-clear")memory=0
  if(type==="memory-read"){value=String(memory);fresh=true}
  if(type==="memory-add")memory+=number()
  if(type==="memory-sub")memory-=number()
  display()
}

function initCalculator(){
  const grid=byId("calcGrid")
  grid.innerHTML=buttons.map(([label,type])=>`<button data-calc-type="${type}" data-calc-label="${label}">${label}</button>`).join("")
  grid.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>calcAction(button.dataset.calcLabel,button.dataset.calcType)))
}

function setNotepad(name,text,path=null){
  notePath=path
  noteStaticName=path?null:name
  byId("noteText").value=text
  byId("notepadTitle").textContent=`${name} - Notepad`
  openWindow("notepadWindow")
}

async function saveAs(){
  const initial=notePath||resolvePath(DESKTOP,noteStaticName&&noteStaticName.includes(".")?noteStaticName:"Untitled.txt")
  const path=await askText("Save As","File name or full path:",initial)
  if(!path)return
  const full=path.includes(":")?path:resolvePath(DESKTOP,path)
  writeFile(full,byId("noteText").value)
  notePath=full
  noteStaticName=null
  byId("notepadTitle").textContent=`${fileName(full)} - Notepad`
  window.dispatchEvent(new CustomEvent("win7:toast",{detail:`Saved ${fileName(full)}`}))
}

function saveCurrent(){
  if(!notePath){saveAs();return}
  writeFile(notePath,byId("noteText").value)
  window.dispatchEvent(new CustomEvent("win7:toast",{detail:`Saved ${fileName(notePath)}`}))
}

function openFile(path,forceNotepad=false){
  const full=path.includes(":")?path:resolvePath(DESKTOP,path)
  const content=readFile(full)
  if(content===null){window.dispatchEvent(new CustomEvent("win7:toast",{detail:`Windows cannot find '${path}'.`}));return false}
  if(/\.html?$/i.test(full)&&!forceNotepad){openHtml(full,content);return true}
  setNotepad(fileName(full),content,full)
  return true
}

function buildHtmlPreview(path,content){
  const dir=parentPath(path)
  let html=String(content||"")
  html=html.replace(/<link\b([^>]*?)href=["']([^"']+)["']([^>]*)>/gi,(tag,before,href,after)=>{
    if(/^(?:https?:|data:|blob:|#|\/\/)/i.test(href))return tag
    const css=readFile(resolvePath(dir,href))
    return css===null?tag:`<style data-eka-source="${href.replaceAll('"','&quot;')}">${css}</style>`
  })
  html=html.replace(/<script\b([^>]*?)src=["']([^"']+)["']([^>]*)><\/script>/gi,(tag,before,src,after)=>{
    if(/^(?:https?:|data:|blob:|\/\/)/i.test(src))return tag
    const js=readFile(resolvePath(dir,src))
    return js===null?tag:`<script data-eka-source="${src.replaceAll('"','&quot;')}">${js.replace(/<\/script/gi,"<\\/script")}</script>`
  })
  return html
}

function openHtml(path,content){
  byId("browserTitle").textContent=`${fileName(path)} - Windows Internet Explorer`
  byId("browserAddress").value=`file:///${path.replaceAll("\\","/")}`
  byId("browserFrame").srcdoc=buildHtmlPreview(path,content)
  openWindow("browserWindow")
}

function initNotepad(){
  byId("noteNew").addEventListener("click",()=>setNotepad("Untitled","",null))
  byId("noteProfile").addEventListener("click",()=>setNotepad("profile.txt",profileText(),null))
  byId("noteSave").addEventListener("click",saveAs)
  byId("noteText").addEventListener("keydown",event=>{
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="s"){event.preventDefault();saveCurrent()}
  })
  window.addEventListener("win7:open-file",event=>openFile(event.detail.path,event.detail.forceNotepad))
  window.addEventListener("win7:open-text",event=>setNotepad(event.detail.name,event.detail.text,null))
}

function splitCommand(value){
  const parts=[]
  String(value||"").replace(/"([^"]*)"|'([^']*)'|(\S+)/g,(_,a,b,c)=>{parts.push(a??b??c);return ""})
  return parts
}

function initRun(){
  const launch=value=>{
    const parts=splitCommand(value)
    if(!parts.length)return
    const name=parts[0].toLowerCase().replace(/\.exe$/i,"")
    const arg=parts.slice(1).join(" ")
    const apps={cmd:"cmd",powershell:"powershell",notepad:"notepad",calc:"calculator",calculator:"calculator",explorer:"explorer"}
    if(name==="python"||name==="py"){
      if(arg)window.dispatchEvent(new CustomEvent("win7:cmd-run",{detail:`python "${arg}"`}))
      else window.dispatchEvent(new CustomEvent("win7:cmd-run",{detail:"python --version"}))
      return
    }
    if(name==="notepad"&&arg){
      const full=arg.includes(":")?arg:resolvePath(DESKTOP,arg)
      if(readFile(full)===null)writeFile(full,"")
      openFile(full,true)
      return
    }
    if(name==="explorer"&&arg){window.dispatchEvent(new CustomEvent("win7:explorer-path",{detail:arg}));return}
    if(apps[name]){window.dispatchEvent(new CustomEvent("win7:open-app",{detail:apps[name]}));return}
    if(["eka","matrix","coffee","fortune"].includes(name)){window.dispatchEvent(new CustomEvent("win7:cmd-run",{detail:name}));return}
    if(name==="github"){window.open("https://github.com/TheLouisMahdi","_blank","noopener,noreferrer");return}
    if(name==="telegram"){window.open("https://t.me/thelouis_mahdi","_blank","noopener,noreferrer");return}
    if(/^https?:\/\//i.test(value)){window.open(value,"_blank","noopener,noreferrer");return}
    if(openFile(value,false))return
    window.dispatchEvent(new CustomEvent("win7:toast",{detail:`Windows cannot find '${value}'.`}))
  }
  byId("runForm").addEventListener("submit",event=>{
    event.preventDefault()
    const value=byId("runInput").value
    byId("runWindow").classList.add("hidden")
    byId("runInput").value=""
    launch(value)
  })
  byId("runCancel").addEventListener("click",()=>byId("runWindow").classList.add("hidden"))
}

export function mountRuntimeWindows(){
  if(byId("browserWindow"))return
  const browser=document.createElement("section")
  browser.className="window browser-window hidden"
  browser.id="browserWindow"
  browser.dataset.app="browser"
  browser.innerHTML=`<div class="titlebar" data-drag-handle><div class="title-left"><span class="title-mini">${icon("ie")}</span><span class="window-title" id="browserTitle">Windows Internet Explorer</span></div><div class="win-controls"><button class="win-control" data-window-action="min">_</button><button class="win-control" data-window-action="max">□</button><button class="win-control close" data-window-action="close">×</button></div></div><div class="ie-toolbar"><button disabled>←</button><button disabled>→</button><input id="browserAddress" readonly></div><iframe id="browserFrame" sandbox="allow-scripts allow-forms allow-modals"></iframe><div class="ie-status">Internet · Protected Mode: On</div>`
  byId("desktop").appendChild(browser)
  const task=document.createElement("button")
  task.className="task-button"
  task.dataset.task="browser"
  task.setAttribute("aria-label","Windows Internet Explorer")
  task.innerHTML=`<span>${icon("ie")}</span>`
  byId("taskApps").appendChild(task)
}

export function initApps(){
  initCalculator()
  initNotepad()
  initRun()
}
