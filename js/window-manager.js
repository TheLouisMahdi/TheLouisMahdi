let topZ=30
const geometry=new Map()
const desktopHidden=new Set()
const closeGuards=new WeakMap()

function screenBounds(){return document.querySelector("#desktop").getBoundingClientRect()}
function taskButton(app){return app?document.querySelector(`[data-task="${app}"]`):null}

export function visibleWindows(){
  return [...document.querySelectorAll(".window:not(.hidden)")]
    .sort((a,b)=>(Number(getComputedStyle(a).zIndex)||0)-(Number(getComputedStyle(b).zIndex)||0))
}

export function activeWindow(){return visibleWindows().at(-1)||null}
export function isWindowActive(win){return Boolean(win)&&activeWindow()===win}

function syncActiveTask(){
  const active=activeWindow()?.dataset.app||null
  document.querySelectorAll(".task-button").forEach(button=>button.classList.toggle("active",Boolean(active)&&button.dataset.task===active))
}

export function bringToFront(win){
  if(!win)return
  topZ+=1
  win.style.zIndex=topZ
  syncActiveTask()
}

function setTask(app,running){
  const button=taskButton(app)
  if(button)button.classList.toggle("running",running)
}

export function setCloseGuard(winOrId,guard){
  const win=typeof winOrId==="string"?document.getElementById(winOrId):winOrId
  if(!win)return
  if(typeof guard==="function")closeGuards.set(win,guard)
  else closeGuards.delete(win)
}

export function clearCloseGuard(winOrId){setCloseGuard(winOrId,null)}

export function openWindow(id){
  const win=document.getElementById(id)
  if(!win)return
  desktopHidden.delete(win)
  win.classList.remove("hidden")
  setTask(win.dataset.app,true)
  bringToFront(win)
  const input=win.querySelector("input,textarea")
  if(input)setTimeout(()=>input.focus(),0)
  window.dispatchEvent(new CustomEvent("win7:window-state",{detail:{id,state:"open"}}))
}

async function mayClose(win,force){
  if(force)return true
  const guard=closeGuards.get(win)
  if(!guard)return true
  try{return (await guard())!==false}catch{return false}
}

function performClose(win){
  desktopHidden.delete(win)
  win.classList.add("hidden")
  setTask(win.dataset.app,false)
  taskButton(win.dataset.app)?.classList.remove("active")
  syncActiveTask()
  window.dispatchEvent(new CustomEvent("win7:window-state",{detail:{id:win.id,state:"closed"}}))
}

export async function closeWindow(win,{force=false}={}){
  if(!win||!(await mayClose(win,force)))return false
  performClose(win)
  return true
}

export function minimizeWindow(win){
  if(!win)return
  win.classList.add("hidden")
  setTask(win.dataset.app,true)
  taskButton(win.dataset.app)?.classList.remove("active")
  syncActiveTask()
  window.dispatchEvent(new CustomEvent("win7:window-state",{detail:{id:win.id,state:"minimized"}}))
}

export function maximizeWindow(win){
  if(win.classList.contains("maximized")){
    const saved=geometry.get(win)
    win.classList.remove("maximized")
    if(saved){win.style.left=saved.left;win.style.top=saved.top;win.style.width=saved.width;win.style.height=saved.height}
    bringToFront(win)
    return
  }
  geometry.set(win,{left:win.style.left||`${win.offsetLeft}px`,top:win.style.top||`${win.offsetTop}px`,width:win.style.width||`${win.offsetWidth}px`,height:win.style.height||`${win.offsetHeight}px`})
  win.classList.add("maximized")
  bringToFront(win)
}

export function snapWindow(win,direction){
  if(!win)return
  if(direction==="up"){if(!win.classList.contains("maximized"))maximizeWindow(win);return}
  if(direction==="down"){
    if(win.classList.contains("maximized")){maximizeWindow(win);return}
    minimizeWindow(win);return
  }
  const saved=geometry.get(win)||{left:win.style.left||`${win.offsetLeft}px`,top:win.style.top||`${win.offsetTop}px`,width:win.style.width||`${win.offsetWidth}px`,height:win.style.height||`${win.offsetHeight}px`}
  geometry.set(win,saved)
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
  document.querySelectorAll(".window").forEach(performClose)
  desktopHidden.clear()
}

function dragWindow(win,handle){
  let active=false
  let offsetX=0
  let offsetY=0
  let lastX=0
  let lastDirection=0
  let reversals=0
  let shakeStarted=0
  handle.addEventListener("pointerdown",event=>{
    if(event.target.closest(".win-controls")||win.classList.contains("maximized"))return
    active=true
    const rect=win.getBoundingClientRect()
    offsetX=event.clientX-rect.left
    offsetY=event.clientY-rect.top
    lastX=event.clientX;lastDirection=0;reversals=0;shakeStarted=performance.now()
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
    const delta=event.clientX-lastX,direction=Math.sign(delta)
    if(Math.abs(delta)>10&&direction&&lastDirection&&direction!==lastDirection)reversals+=1
    if(Math.abs(delta)>10&&direction)lastDirection=direction
    lastX=event.clientX
    if(reversals>=3&&performance.now()-shakeStarted<850){minimizeOthers(win);reversals=0;shakeStarted=performance.now()}
  })
  const stop=event=>{
    if(active&&event){const bounds=screenBounds(),x=event.clientX-bounds.left,y=event.clientY-bounds.top;if(y<12)snapWindow(win,"up");else if(x<12)snapWindow(win,"left");else if(x>bounds.width-12)snapWindow(win,"right")}
    active=false
  }
  handle.addEventListener("pointerup",stop)
  handle.addEventListener("pointercancel",stop)
  handle.addEventListener("dblclick",()=>maximizeWindow(win))
}

function resizeWindow(win){
  for(const edge of["n","e","s","w","ne","nw","se","sw"]){
    const handle=document.createElement("i");handle.className=`resize-handle resize-${edge}`
    handle.addEventListener("pointerdown",event=>{
      if(win.classList.contains("maximized"))return
      event.preventDefault();event.stopPropagation();bringToFront(win);handle.setPointerCapture(event.pointerId)
      const bounds=screenBounds(),start=win.getBoundingClientRect(),origin={x:event.clientX,y:event.clientY}
      const move=next=>{
        const dx=next.clientX-origin.x,dy=next.clientY-origin.y,minWidth=Math.min(240,bounds.width-12),minHeight=140
        let left=start.left-bounds.left,top=start.top-bounds.top,width=start.width,height=start.height
        if(edge.includes("e"))width=Math.max(minWidth,Math.min(bounds.width-left,start.width+dx))
        if(edge.includes("s"))height=Math.max(minHeight,Math.min(bounds.height-top-39,start.height+dy))
        if(edge.includes("w")){const candidate=Math.max(0,Math.min(left+dx,left+width-minWidth));width+=left-candidate;left=candidate}
        if(edge.includes("n")){const candidate=Math.max(0,Math.min(top+dy,top+height-minHeight));height+=top-candidate;top=candidate}
        Object.assign(win.style,{left:`${left}px`,top:`${top}px`,width:`${width}px`,height:`${height}px`})
      }
      const stop=()=>{handle.removeEventListener("pointermove",move);handle.removeEventListener("pointerup",stop);handle.removeEventListener("pointercancel",stop)}
      handle.addEventListener("pointermove",move);handle.addEventListener("pointerup",stop);handle.addEventListener("pointercancel",stop)
    })
    win.appendChild(handle)
  }
}

export function initWindowManager(){
  document.querySelectorAll(".window").forEach(win=>{
    win.addEventListener("pointerdown",()=>bringToFront(win))
    const handle=win.querySelector("[data-drag-handle]")
    if(handle)dragWindow(win,handle)
    resizeWindow(win)
    win.querySelectorAll("[data-window-action]").forEach(button=>{
      button.addEventListener("click",event=>{
        event.stopPropagation()
        const action=button.dataset.windowAction
        if(action==="close")void closeWindow(win)
        if(action==="min")minimizeWindow(win)
        if(action==="max")maximizeWindow(win)
      })
    })
  })
}

export function showDesktop(){
  if(desktopHidden.size){
    const restore=[...desktopHidden]
    desktopHidden.clear()
    restore.forEach(win=>openWindow(win.id))
    return
  }
  visibleWindows().forEach(win=>{desktopHidden.add(win);minimizeWindow(win)})
  document.querySelectorAll(".task-button").forEach(button=>button.classList.remove("active"))
}

export function toggleAppWindow(app,id){
  const win=document.getElementById(id)
  if(!win)return
  if(win.classList.contains("hidden")){openWindow(id);return}
  if(isWindowActive(win)){minimizeWindow(win);return}
  bringToFront(win)
}
