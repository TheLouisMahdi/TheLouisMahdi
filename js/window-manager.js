let topZ=30
const states=new Map()

function screenBounds(){return document.querySelector("#desktop").getBoundingClientRect()}

export function bringToFront(win){
  topZ+=1
  win.style.zIndex=topZ
  document.querySelectorAll(".task-button").forEach(button=>button.classList.toggle("active",button.dataset.task===win.dataset.app))
}

function setTask(app,running){
  const button=document.querySelector(`[data-task="${app}"]`)
  if(button)button.classList.toggle("running",running)
}

export function openWindow(id){
  const win=document.getElementById(id)
  if(!win)return
  win.classList.remove("hidden")
  setTask(win.dataset.app,true)
  bringToFront(win)
  const input=win.querySelector("input,textarea")
  if(input)setTimeout(()=>input.focus(),0)
}

export function closeWindow(win){win.classList.add("hidden");setTask(win.dataset.app,false)}
export function minimizeWindow(win){win.classList.add("hidden");setTask(win.dataset.app,true)}

export function maximizeWindow(win){
  if(win.classList.contains("maximized")){
    const saved=states.get(win)
    win.classList.remove("maximized")
    if(saved){win.style.left=saved.left;win.style.top=saved.top;win.style.width=saved.width;win.style.height=saved.height}
    return
  }
  states.set(win,{left:win.style.left||`${win.offsetLeft}px`,top:win.style.top||`${win.offsetTop}px`,width:win.style.width||`${win.offsetWidth}px`,height:win.style.height||`${win.offsetHeight}px`})
  win.classList.add("maximized")
}

export function snapWindow(win,direction){
  if(!win)return
  if(direction==="up"){if(!win.classList.contains("maximized"))maximizeWindow(win);return}
  if(direction==="down"){
    if(win.classList.contains("maximized")){maximizeWindow(win);return}
    minimizeWindow(win);return
  }
  const saved=states.get(win)||{left:win.style.left||`${win.offsetLeft}px`,top:win.style.top||`${win.offsetTop}px`,width:win.style.width||`${win.offsetWidth}px`,height:win.style.height||`${win.offsetHeight}px`}
  states.set(win,saved)
  win.classList.remove("maximized")
  win.style.top="1px"
  win.style.left=direction==="left"?"1px":"50%"
  win.style.width="calc(50% - 1px)"
  win.style.height="calc(100% - 40px)"
  bringToFront(win)
}

export function minimizeOthers(active){
  document.querySelectorAll(".window:not(.hidden)").forEach(win=>{if(win!==active)minimizeWindow(win)})
}

export function closeAllWindows(){
  document.querySelectorAll(".window").forEach(win=>closeWindow(win))
}

function dragWindow(win,handle){
  let active=false
  let offsetX=0
  let offsetY=0
  handle.addEventListener("pointerdown",event=>{
    if(event.target.closest(".win-controls")||win.classList.contains("maximized"))return
    active=true
    const rect=win.getBoundingClientRect()
    offsetX=event.clientX-rect.left
    offsetY=event.clientY-rect.top
    handle.setPointerCapture(event.pointerId)
    bringToFront(win)
  })
  handle.addEventListener("pointermove",event=>{
    if(!active)return
    const bounds=screenBounds()
    const x=Math.max(0,Math.min(event.clientX-bounds.left-offsetX,bounds.width-win.offsetWidth))
    const y=Math.max(0,Math.min(event.clientY-bounds.top-offsetY,bounds.height-win.offsetHeight-39))
    win.style.left=`${x}px`
    win.style.top=`${y}px`
  })
  const stop=()=>{active=false}
  handle.addEventListener("pointerup",stop)
  handle.addEventListener("pointercancel",stop)
  handle.addEventListener("dblclick",()=>maximizeWindow(win))
}

export function initWindowManager(){
  document.querySelectorAll(".window").forEach(win=>{
    win.addEventListener("pointerdown",()=>bringToFront(win))
    const handle=win.querySelector("[data-drag-handle]")
    if(handle)dragWindow(win,handle)
    win.querySelectorAll("[data-window-action]").forEach(button=>{
      button.addEventListener("click",event=>{
        event.stopPropagation()
        const action=button.dataset.windowAction
        if(action==="close")closeWindow(win)
        if(action==="min")minimizeWindow(win)
        if(action==="max")maximizeWindow(win)
      })
    })
  })
}

export function showDesktop(){
  document.querySelectorAll(".window").forEach(win=>win.classList.add("hidden"))
  document.querySelectorAll(".task-button").forEach(button=>button.classList.remove("active"))
}

export function toggleAppWindow(app,id){
  const win=document.getElementById(id)
  if(!win)return
  if(win.classList.contains("hidden"))openWindow(id)
  else minimizeWindow(win)
}
