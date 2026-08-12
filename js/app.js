import{FILE_SYSTEM}from"./data.js"
import{icon,paintIcons}from"./icons.js"
import{initWindowManager,openWindow,showDesktop,toggleAppWindow}from"./window-manager.js"
import{initExplorer,navigate}from"./explorer.js"
import{initTerminals}from"./terminal.js"
import{initReceipt,printReceipt}from"./receipt.js"
import{initApps}from"./apps.js"

const byId=id=>document.getElementById(id)
const appWindows={explorer:"explorerWindow",cmd:"cmdWindow",powershell:"psWindow",notepad:"notepadWindow",calculator:"calculatorWindow",run:"runWindow",image:"imageWindow"}

function openApp(app){
  const id=appWindows[app]
  if(!id)return
  if(app==="explorer")navigate("computer")
  else openWindow(id)
  byId("startMenu").classList.add("hidden")
}

function renderDesktop(){
  byId("desktopIcons").innerHTML=FILE_SYSTEM.desktop.items.map(item=>`<button class="desktop-icon" ${item.target?`data-desktop-target="${item.target}"`:`data-desktop-external="${item.external}"`}><span class="desktop-svg">${icon(item.type)}</span><span class="desktop-label">${item.name}</span></button>`).join("")
  byId("desktopIcons").querySelectorAll(".desktop-icon").forEach(button=>{
    button.addEventListener("dblclick",()=>{
      if(button.dataset.desktopTarget)navigate(button.dataset.desktopTarget)
      if(button.dataset.desktopExternal)window.open(button.dataset.desktopExternal,"_blank","noopener,noreferrer")
    })
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
    button.addEventListener("click",()=>{
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

function initCursor(){
  const screen=byId("screen")
  const cursor=byId("fakeCursor")
  cursor.innerHTML=icon("cursor")
  const fine=matchMedia("(pointer:fine)").matches
  if(!fine)return
  screen.addEventListener("pointerenter",()=>screen.classList.add("pointer-active"))
  screen.addEventListener("pointerleave",()=>screen.classList.remove("pointer-active"))
  screen.addEventListener("pointermove",event=>{
    const rect=screen.getBoundingClientRect()
    cursor.style.left=`${event.clientX-rect.left}px`
    cursor.style.top=`${event.clientY-rect.top}px`
  })
}

function initToast(){
  let timer
  window.addEventListener("win7:toast",event=>{
    let toast=document.querySelector(".toast")
    if(!toast){toast=document.createElement("div");toast.className="toast";byId("desktop").appendChild(toast)}
    toast.textContent=event.detail
    toast.classList.remove("hidden")
    clearTimeout(timer)
    timer=setTimeout(()=>toast.classList.add("hidden"),2600)
  })
}

function initAppEvents(){window.addEventListener("win7:open-app",event=>openApp(event.detail))}
function initKeyboard(){document.addEventListener("keydown",event=>{if(event.key==="Escape")byId("startMenu").classList.add("hidden");if(event.key==="Meta"){event.preventDefault();byId("startMenu").classList.toggle("hidden")}})}

function init(){
  paintIcons()
  renderDesktop()
  initWindowManager()
  initExplorer()
  initTerminals()
  initApps()
  initReceipt()
  initStart()
  initTaskbar()
  initClock()
  initCursor()
  initToast()
  initAppEvents()
  initKeyboard()
  setTimeout(printReceipt,450)
}

init()
