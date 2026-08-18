let topZ=30
const normalGeometry=new Map()
const snapModes=new WeakMap()
const desktopHidden=new Map()
const closeGuards=new WeakMap()

function desktopSpace(){
  const desktop=document.querySelector("#desktop"),rect=desktop.getBoundingClientRect()
  const width=desktop.clientWidth,height=desktop.clientHeight
  return{rect,width,height,scaleX:width/Math.max(1,rect.width),scaleY:height/Math.max(1,rect.height),taskbar:document.querySelector("#taskbar")?.offsetHeight||39}
}
function pointerPosition(event,space=desktopSpace()){return{x:(event.clientX-space.rect.left)*space.scaleX,y:(event.clientY-space.rect.top)*space.scaleY}}
function taskbarHeight(){return document.querySelector("#taskbar")?.offsetHeight||39}
function taskButton(app){return app?document.querySelector(`[data-task="${app}"]`):null}
function currentGeometry(win){return{left:win.style.left||`${win.offsetLeft}px`,top:win.style.top||`${win.offsetTop}px`,width:win.style.width||`${win.offsetWidth}px`,height:win.style.height||`${win.offsetHeight}px`}}
function applyGeometry(win,value){if(value)Object.assign(win.style,value)}
function rememberNormal(win){if(!normalGeometry.has(win))normalGeometry.set(win,currentGeometry(win))}
function setNormalFromCurrent(win){normalGeometry.set(win,currentGeometry(win))}
function clearMode(win){win.classList.remove("maximized");snapModes.delete(win)}
function constrainWindow(win,{resize=true}={}){
  if(!win||win.classList.contains("hidden")||win.classList.contains("maximized")||snapModes.has(win))return
  const space=desktopSpace(),maxWidth=Math.max(1,space.width),maxHeight=Math.max(1,space.height-space.taskbar)
  if(resize&&win.offsetWidth>maxWidth)win.style.width=`${maxWidth}px`
  if(resize&&win.offsetHeight>maxHeight)win.style.height=`${maxHeight}px`
  const left=Math.max(0,Math.min(win.offsetLeft,Math.max(0,maxWidth-win.offsetWidth)))
  const top=Math.max(0,Math.min(win.offsetTop,Math.max(0,maxHeight-win.offsetHeight)))
  win.style.left=`${left}px`;win.style.top=`${top}px`
}
function focusConsoleInput(win,event){
  if(!win.classList.contains("console-window")||event.target.closest("[data-drag-handle],.win-controls"))return
  const selection=window.getSelection?.();if(selection&&!selection.isCollapsed)return
  const input=win.querySelector(".console-input-row input");if(!input)return
  input.focus({preventScroll:true});const end=input.value.length;input.setSelectionRange?.(end,end)
}

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
  constrainWindow(win)
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
  constrainWindow(win)
  setNormalFromCurrent(win)
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
  const space=desktopSpace(),bottom=space.taskbar,step=24
  const width=Math.max(280,Math.min(space.width*.72,space.width-step*Math.max(0,wins.length-1)-12))
  const height=Math.max(180,Math.min((space.height-bottom)*.72,space.height-bottom-step*Math.max(0,wins.length-1)-12))
  wins.forEach((win,index)=>{
    clearMode(win)
    Object.assign(win.style,{left:`${8+index*step}px`,top:`${8+index*step}px`,width:`${width}px`,height:`${height}px`})
    constrainWindow(win)
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
    const space=desktopSpace(),point=pointerPosition(event,space)
    const ratioX=Math.max(0,Math.min(1,(point.x-win.offsetLeft)/Math.max(1,win.offsetWidth)))
    const wasManaged=win.classList.contains("maximized")||snapModes.has(win)
    if(wasManaged){
      rememberNormal(win)
      restoreNormal(win,{activate:false})
      const left=Math.max(0,Math.min(point.x-win.offsetWidth*ratioX,space.width-win.offsetWidth))
      const top=Math.max(0,Math.min(point.y-14,space.height-win.offsetHeight-space.taskbar))
      win.style.left=`${left}px`
      win.style.top=`${top}px`
    }
    active=true
    offsetX=point.x-win.offsetLeft
    offsetY=point.y-win.offsetTop
    lastX=point.x;lastDirection=0;reversals=0;shakeStarted=performance.now()
    handle.setPointerCapture(event.pointerId)
    bringToFront(win)
  })
  handle.addEventListener("pointermove",event=>{
    if(!active)return
    const space=desktopSpace(),point=pointerPosition(event,space)
    const x=Math.max(0,Math.min(point.x-offsetX,space.width-win.offsetWidth))
    const y=Math.max(0,Math.min(point.y-offsetY,space.height-win.offsetHeight-space.taskbar))
    win.style.left=`${x}px`
    win.style.top=`${y}px`
    const delta=point.x-lastX,direction=Math.sign(delta)
    if(Math.abs(delta)>10&&direction&&lastDirection&&direction!==lastDirection)reversals+=1
    if(Math.abs(delta)>10&&direction)lastDirection=direction
    lastX=point.x
    if(reversals>=3&&performance.now()-shakeStarted<850){minimizeOthers(win);reversals=0;shakeStarted=performance.now()}
  })
  const stop=event=>{
    if(!active)return
    active=false
    if(event){
      const space=desktopSpace(),point=pointerPosition(event,space)
      if(point.y<12){snapWindow(win,"up");return}
      if(point.x<12){snapWindow(win,"left");return}
      if(point.x>space.width-12){snapWindow(win,"right");return}
    }
    clearMode(win)
    constrainWindow(win)
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
      const space=desktopSpace(),origin=pointerPosition(event,space)
      const start={left:win.offsetLeft,top:win.offsetTop,width:win.offsetWidth,height:win.offsetHeight}
      const move=next=>{
        const point=pointerPosition(next,space),dx=point.x-origin.x,dy=point.y-origin.y,minWidth=Math.min(240,space.width-12),minHeight=140,bottom=space.taskbar
        let{left,top,width,height}=start
        if(edge.includes("e"))width=Math.max(minWidth,Math.min(space.width-left,start.width+dx))
        if(edge.includes("s"))height=Math.max(minHeight,Math.min(space.height-top-bottom,start.height+dy))
        if(edge.includes("w")){const candidate=Math.max(0,Math.min(left+dx,left+width-minWidth));width+=left-candidate;left=candidate}
        if(edge.includes("n")){const candidate=Math.max(0,Math.min(top+dy,top+height-minHeight));height+=top-candidate;top=candidate}
        Object.assign(win.style,{left:`${left}px`,top:`${top}px`,width:`${width}px`,height:`${height}px`})
      }
      const stop=()=>{constrainWindow(win);setNormalFromCurrent(win);handle.removeEventListener("pointermove",move);handle.removeEventListener("pointerup",stop);handle.removeEventListener("pointercancel",stop)}
      handle.addEventListener("pointermove",move);handle.addEventListener("pointerup",stop);handle.addEventListener("pointercancel",stop)
    })
    win.appendChild(handle)
  }
}

export function initWindowManager(){
  document.querySelectorAll(".window").forEach(win=>{
    win.addEventListener("pointerdown",()=>bringToFront(win))
    win.addEventListener("click",event=>focusConsoleInput(win,event))
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
  const desktop=document.querySelector("#desktop")
  if("ResizeObserver"in window)new ResizeObserver(()=>visibleWindows().forEach(win=>constrainWindow(win))).observe(desktop)
  else window.addEventListener("resize",()=>visibleWindows().forEach(win=>constrainWindow(win)))
}

export function showDesktop(){
  if(desktopHidden.size){
    const restore=[...desktopHidden.entries()].sort((a,b)=>a[1]-b[1])
    desktopHidden.clear()
    for(const[win,z]of restore){
      win.classList.remove("hidden")
      constrainWindow(win)
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
