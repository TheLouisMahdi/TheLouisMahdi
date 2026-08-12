import{FILE_SYSTEM}from"./data.js"
import{icon,paintIcons}from"./icons.js"
import{closeWindow,initWindowManager,openWindow,showDesktop,toggleAppWindow}from"./window-manager.js"
import{initExplorer,navigate}from"./explorer.js"
import{initTerminals}from"./terminal.js"
import{initReceipt,printReceipt}from"./receipt.js"
import{initApps,mountRuntimeWindows}from"./apps.js"
import{bindSelectableSurface,initPointerCursor,mountInteractionUi,refreshSurface}from"./interaction.js"
import{backgroundContextItems,deleteSelected,fileContextItems,openVirtual,renameSelected}from"./file-actions.js"
import{listVirtual}from"./vfs.js"

const byId=id=>document.getElementById(id)
const appWindows={explorer:"explorerWindow",cmd:"cmdWindow",powershell:"psWindow",notepad:"notepadWindow",calculator:"calculatorWindow",run:"runWindow",image:"imageWindow",browser:"browserWindow"}
let desktopItems=[]
let mobileHintShown=false

function openApp(app){
  const id=appWindows[app]
  if(!id)return
  if(app==="explorer")navigate("computer")
  else openWindow(id)
  byId("startMenu").classList.add("hidden")
}

function itemKey(item){return item.virtualPath||`${item.name}|${item.target||item.external||item.app||""}`}

function activateDesktop(item){
  if(!item)return
  if(item.virtualPath){openVirtual(item);return}
  if(item.target){navigate(item.target);return}
  if(item.app){openApp(item.app);return}
  if(item.external)window.open(item.external,"_blank","noopener,noreferrer")
}

function renderDesktop(){
  desktopItems=[...FILE_SYSTEM.desktop.items,...listVirtual("desktop")]
  byId("desktopIcons").innerHTML=desktopItems.map((item,index)=>`<button class="desktop-icon" data-desktop-index="${index}" data-key="${encodeURIComponent(itemKey(item))}"><span class="desktop-svg">${icon(item.type)}</span><span class="desktop-label">${item.name}</span></button>`).join("")
  refreshSurface(byId("desktop"))
}

function initDesktopInteraction(){
  const desktop=byId("desktop")
  bindSelectableSurface(desktop,".desktop-icon",{
    key:node=>decodeURIComponent(node.dataset.key||""),
    item:node=>desktopItems[Number(node.dataset.desktopIndex)],
    activate:activateDesktop,
    ignore:target=>Boolean(target.closest(".window,.start-menu,.taskbar,.win-context-menu,.win-prompt")),
    context:(item,selected)=>fileContextItems(item,selected,{open:activateDesktop}),
    background:(_,helpers)=>backgroundContextItems("desktop",{selectAll:helpers.selectAll,clear:helpers.clear,refresh:renderDesktop}),
    deleteSelected,
    renameSelected
  })
  desktop.addEventListener("pointerup",event=>{
    if(event.pointerType!=="touch"||mobileHintShown||!event.target.closest(".desktop-icon"))return
    mobileHintShown=true
    window.dispatchEvent(new CustomEvent("win7:toast",{detail:"Tap to select · double-tap to open · touch and hold for right-click"}))
  })
}

function initStart(){
  byId("startBtn").innerHTML=icon("windows")
  byId("startBtn").addEventListener("click",event=>{
    event.stopPropagation()
    byId("startMenu").classList.toggle("hidden")
    if(!byId("startMenu").classList.contains("hidden"))byId("searchBox").focus()
  })
  byId("startMenu").addEventListener("click",event=>event.stopPropagation())
  document.addEventListener("click",()=>byId("startMenu").classList.add("hidden"))
  document.querySelectorAll("[data-app-open]").forEach(node=>node.addEventListener("click",()=>openApp(node.dataset.appOpen)))
  byId("searchBox").addEventListener("input",()=>{
    const q=byId("searchBox").value.trim().toLowerCase()
    byId("programList").querySelectorAll(".start-program").forEach(button=>button.hidden=q&&!button.textContent.toLowerCase().includes(q))
  })
}

function initTaskbar(){
  byId("peekBtn").addEventListener("click",showDesktop)
  document.querySelectorAll("[data-task]").forEach(button=>{
    button.addEventListener("click",event=>{
      event.stopPropagation()
      const app=button.dataset.task
      if(app==="explorer"&&document.getElementById("explorerWindow").classList.contains("hidden"))navigate("computer")
      else toggleAppWindow(app,appWindows[app])
    })
  })
}

function initClock(){
  const tick=()=>{
    const now=new Date()
    const time=now.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})
    const date=now.toLocaleDateString([],{month:"2-digit",day:"2-digit",year:"numeric"})
    byId("clock").textContent=`${time}\n${date}`
    byId("clock").title=now.toString()
  }
  tick()
  setInterval(tick,1000)
}

function initToast(){
  let timer
  window.addEventListener("win7:toast",event=>{
    let toast=document.querySelector(".toast")
    if(!toast){toast=document.createElement("div");toast.className="toast";byId("desktop").appendChild(toast)}
    toast.textContent=event.detail
    toast.classList.remove("hidden")
    clearTimeout(timer)
    timer=setTimeout(()=>toast.classList.add("hidden"),2800)
  })
}

function initAppEvents(){
  window.addEventListener("win7:open-app",event=>openApp(event.detail))
  window.addEventListener("win7:navigate",event=>navigate(event.detail))
  window.addEventListener("win7:vfs-changed",renderDesktop)
}

function visibleWindows(){
  return [...document.querySelectorAll(".window:not(.hidden)")].sort((a,b)=>(Number(getComputedStyle(a).zIndex)||0)-(Number(getComputedStyle(b).zIndex)||0))
}

function activeWindow(){return visibleWindows().at(-1)||null}

function cycleWindows(reverse=false){
  const wins=visibleWindows()
  if(wins.length<2)return
  const next=reverse?wins.at(-2):wins[0]
  next?.dispatchEvent(new PointerEvent("pointerdown",{bubbles:true,pointerType:"mouse",button:0}))
}

function initKeyboard(){
  document.addEventListener("keydown",event=>{
    const key=event.key.toLowerCase()
    if(event.key==="Escape")byId("startMenu").classList.add("hidden")
    if(event.key==="Meta"||event.key==="OS"){
      event.preventDefault()
      byId("startMenu").classList.toggle("hidden")
      return
    }
    if(event.ctrlKey&&event.key==="Escape"){
      event.preventDefault();byId("startMenu").classList.toggle("hidden");return
    }
    if(event.altKey&&event.key==="F4"){
      const win=activeWindow();if(win){event.preventDefault();closeWindow(win)}return
    }
    if(event.altKey&&event.key==="Tab"){
      event.preventDefault();cycleWindows(event.shiftKey);return
    }
    if(event.metaKey&&(key==="d"||key==="m")){
      event.preventDefault();showDesktop();return
    }
    if(event.metaKey&&key==="e"){
      event.preventDefault();openApp("explorer");return
    }
    if(event.metaKey&&key==="r"){
      event.preventDefault();openApp("run");return
    }
  })
}

function loadRuntimeCss(){
  if(document.querySelector('link[data-win7-runtime]'))return
  const link=document.createElement("link")
  link.rel="stylesheet"
  link.href="css/runtime.css"
  link.dataset.win7Runtime="1"
  document.head.appendChild(link)
}

function init(){
  loadRuntimeCss()
  mountInteractionUi()
  mountRuntimeWindows()
  paintIcons()
  renderDesktop()
  initWindowManager()
  initExplorer()
  initTerminals()
  initApps()
  initReceipt()
  initDesktopInteraction()
  initStart()
  initTaskbar()
  initClock()
  initPointerCursor()
  initToast()
  initAppEvents()
  initKeyboard()
  setTimeout(printReceipt,520)
}

init()
