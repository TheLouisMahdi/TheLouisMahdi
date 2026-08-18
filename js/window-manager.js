let topZ=30
const normalGeometry=new Map()
const snapModes=new WeakMap()
const desktopHidden=new Map()
const closeGuards=new WeakMap()

function screenBounds(){return document.querySelector("#desktop").getBoundingClientRect()}
function taskbarHeight(){return document.querySelector("#taskbar")?.getBoundingClientRect().height||39}
function taskButton(app){return app?document.querySelector(`[data-task="${app}"]`):null}
function currentGeometry(win){return{left:win.style.left||`${win.offsetLeft}px`,top:win.style.top||`${win.offsetTop}px`,width:win.style.width||`${win.offsetWidth}px`,height:win.style.height||`${win.offsetHeight}px`}}
function applyGeometry(win,value){if(value)Object.assign(win.style,value)}
function rememberNormal(win){if(!normalGeometry.has(win))normalGeometry.set(win,currentGeometry(win))}
function setNormalFromCurrent(win){normalGeometry.set(win,currentGeometry(win))}
function clearMode(win){win.classList.remove("maximized");snapModes.delete(win)}

export function visibleWindows(){
  return [...document.querySelectorAll(".window:not(.hidden)")]
    .sort((a,b)=>(Number(getComputedStyle(a).zIndex)||0)-(Number(getComputedStyle(b).zIndex)||0))
}

export function activeWindow(){return visibleWindows().at(-1)||null}
export function isWindowActive(win){return Boolean(win)&&activeWindow()===win}
export function windowMode(win){return win?.classList.contains("maximized")?"maximized":snapModes.get(win)||"normal"}

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

function restoreNormal(win,{activate=true}={}){
  if(!win)return
  clearMode(win)
  applyGeometry(win,normalGeometry.get(win))
  if(activate)bringToFront(win)
}

export function maximizeWindow(win){
  if(!win)return
  if(win.classList.contains("maximized")){restoreNormal(win);return}
  if(!snapModes.has(win))setNormalFromCurrent(win)
  snapModes.delete(win)
  win.classList.add("maximized")
  bringToFront(win)
}

export function snapWindow(win,direction){
  if(!win)return
  if(direction==="up"){maximizeWindow(win);return}
  if(direction==="down"){
    if(win.classList.contains("maximized")||snapModes.has(win)){restoreNormal(win);return}
    minimizeWindow(win);return
  }
  if(!["left","right"].includes(direction))return
  if(!win.classList.contains("maximized")&&!snapModes.has(win))setNormalFromCurrent(win)
  win.classList.remove("maximized")
  snapModes.set(win,direction)
  win.style.top="1px"
  win.style.left=direction==="left"?"1px":"50%"
  win.style.width="calc(50% - 1px)"
  win.style.height=`calc(100% - ${taskbarHeight()+1}px)`
  bringToFront(win)
}

export function cascadeWindows(){
  const wins=visibleWindows()
  if(!wins.length)return
  const bounds=screenBounds(),bottom=taskbarHeight(),step=24
  const width=Math.max(280,Math.min(bounds.width*.72,bounds.width-step*Math.max(0,wins.length-1)-12))
  const height=Math.max(180,Math.min((bounds.height-bottom)*.72,bounds.height-bottom-step*Math.max(0,wins.length-1)-12))
  wins.forEach((win,index)=>{
    clearMode(win)
    Object.assign(win.style,{left:`${8+index*step}px`,top:`${8+index*step}px`,width:`${width}px`,height:`${height}px`})
    setNormalFromCurrent(win)
    bringToFront(win)
  })
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
    if(event.target.closest(".win-controls"))return
    const bounds=screenBounds()
    const before=win.getBoundingClientRect()
    const ratioX=Math.max(0,Math.min(1,(event.clientX-before.left)/Math.max(1,before.width)))
    const wasManaged=win.classList.contains("maximized")||snapModes.has(win)
    if(wasManaged){
      rememberNormal(win)
      restoreNormal(win,{activate:false})
      const restored=win.getBoundingClientRect()
      const left=Math.max(0,Math.min(event.clientX-bounds.left-restored.width*ratioX,bounds.width-restored.width))
      const top=Math.max(0,Math.min(event.clientY-bounds.top-14,bounds.height-restored.height-taskbarHeight()))
      win.style.left=`${left}px`
      win.style.top=`${top}px`
    }
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
    const y=Math.max(0,Math.min(event.clientY-bounds.top-offsetY,bounds.height-win.offsetHeight-taskbarHeight()))
    win.style.left=`${x}px`
    win.style.top=`${y}px`
    const delta=event.clientX-lastX,direction=Math.sign(delta)
    if(Math.abs(delta)>10&&direction&&lastDirection&&direction!==lastDirection)reversals+=1
    if(Math.abs(delta)>10&&direction)lastDirection=direction
    lastX=event.clientX
    if(reversals>=3&&performance.now()-shakeStarted<850){minimizeOthers(win);reversals=0;shakeStarted=performance.now()}
  })
  const stop=event=>{
    if(!active)return
    active=false
    if(event){
      const bounds=screenBounds(),x=event.clientX-bounds.left,y=event.clientY-bounds.top
      if(y<12){snapWindow(win,"up");return}
      if(x<12){snapWindow(win,"left");return}
      if(x>bounds.width-12){snapWindow(win,"right");return}
    }
    clearMode(win)
    setNormalFromCurrent(win)
  }
  handle.addEventListener("pointerup",stop)
  handle.addEventListener("pointercancel",stop)
  handle.addEventListener("dblclick",()=>maximizeWindow(win))
}

function resizeWindow(win){
  for(const edge of["n","e","s","w","ne","nw","se","sw"]){
    const handle=document.createElement("i");handle.className=`resize-handle resize-${edge}`
    handle.addEventListener("pointerdown",event=>{
      if(win.classList.contains("maximized")||snapModes.has(win))return
      event.preventDefault();event.stopPropagation();bringToFront(win);handle.setPointerCapture(event.pointerId)
      const bounds=screenBounds(),start=win.getBoundingClientRect(),origin={x:event.clientX,y:event.clientY}
      const move=next=>{
        const dx=next.clientX-origin.x,dy=next.clientY-origin.y,minWidth=Math.min(240,bounds.width-12),minHeight=140,bottom=taskbarHeight()
        let left=start.left-bounds.left,top=start.top-bounds.top,width=start.width,height=start.height
        if(edge.includes("e"))width=Math.max(minWidth,Math.min(bounds.width-left,start.width+dx))
        if(edge.includes("s"))height=Math.max(minHeight,Math.min(bounds.height-top-bottom,start.height+dy))
        if(edge.includes("w")){const candidate=Math.max(0,Math.min(left+dx,left+width-minWidth));width+=left-candidate;left=candidate}
        if(edge.includes("n")){const candidate=Math.max(0,Math.min(top+dy,top+height-minHeight));height+=top-candidate;top=candidate}
        Object.assign(win.style,{left:`${left}px`,top:`${top}px`,width:`${width}px`,height:`${height}px`})
      }
      const stop=()=>{setNormalFromCurrent(win);handle.removeEventListener("pointermove",move);handle.removeEventListener("pointerup",stop);handle.removeEventListener("pointercancel",stop)}
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
    const restore=[...desktopHidden.entries()].sort((a,b)=>a[1]-b[1])
    desktopHidden.clear()
    for(const[win,z]of restore){
      win.classList.remove("hidden")
      setTask(win.dataset.app,true)
      win.style.zIndex=String(z)
      topZ=Math.max(topZ,z)
      window.dispatchEvent(new CustomEvent("win7:window-state",{detail:{id:win.id,state:"open"}}))
    }
    syncActiveTask()
    return
  }
  visibleWindows().forEach(win=>{desktopHidden.set(win,Number(getComputedStyle(win).zIndex)||0);minimizeWindow(win)})
  document.querySelectorAll(".task-button").forEach(button=>button.classList.remove("active"))
}

export function toggleAppWindow(app,id){
  const win=document.getElementById(id)
  if(!win)return
  if(win.classList.contains("hidden")){openWindow(id);return}
  if(isWindowActive(win)){minimizeWindow(win);return}
  bringToFront(win)
}
