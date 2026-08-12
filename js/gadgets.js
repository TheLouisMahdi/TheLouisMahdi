const byId=id=>document.getElementById(id)

const gadgetHtml={
  clock:()=>`<div class="gadget-clock-face"><i></i><b></b><em></em><span>12</span><span>3</span><span>6</span><span>9</span></div><small>EKA</small>`,
  cpu:()=>`<div class="gadget-cpu-title">CPU Meter</div><div class="gadget-meters"><i><b id="gadgetCpuNeedle"></b><span>CPU</span></i><i><b id="gadgetRamNeedle"></b><span>RAM</span></i></div><small id="gadgetCpuText">CPU 7% · RAM 34%</small>`,
  calendar:()=>{const now=new Date();return `<div class="gadget-calendar-month">${now.toLocaleDateString(undefined,{month:"long"})}</div><strong>${now.getDate()}</strong><span>${now.toLocaleDateString(undefined,{weekday:"long"})}</span><small>${now.getFullYear()}</small>`}
}

function makeGadget(type,index=0){
  const node=document.createElement("section")
  node.className=`desktop-gadget gadget-${type}`
  node.dataset.gadget=type
  node.style.top=`${18+index*132}px`
  node.innerHTML=`<button class="gadget-close" aria-label="Close gadget">×</button><div data-gadget-drag>${gadgetHtml[type]()}</div>`
  return node
}

function bindDrag(node){
  const handle=node.querySelector("[data-gadget-drag]")
  let start=null
  handle.addEventListener("pointerdown",event=>{
    if(event.target.closest("button"))return
    const rect=node.getBoundingClientRect()
    start={x:event.clientX,y:event.clientY,left:rect.left,top:rect.top}
    handle.setPointerCapture?.(event.pointerId)
  })
  handle.addEventListener("pointermove",event=>{
    if(!start)return
    const desktop=byId("desktop").getBoundingClientRect(),left=Math.max(0,Math.min(desktop.width-node.offsetWidth,start.left-desktop.left+event.clientX-start.x)),top=Math.max(0,Math.min(desktop.height-node.offsetHeight-42,start.top-desktop.top+event.clientY-start.y))
    Object.assign(node.style,{left:`${left}px`,right:"auto",top:`${top}px`})
  })
  const stop=()=>{start=null}
  handle.addEventListener("pointerup",stop);handle.addEventListener("pointercancel",stop)
}

function updateGadgets(){
  const now=new Date(),seconds=now.getSeconds()*6,minutes=(now.getMinutes()+now.getSeconds()/60)*6,hours=(now.getHours()%12+now.getMinutes()/60)*30
  document.querySelectorAll(".gadget-clock-face").forEach(face=>{face.querySelector("i").style.transform=`rotate(${hours}deg)`;face.querySelector("b").style.transform=`rotate(${minutes}deg)`;face.querySelector("em").style.transform=`rotate(${seconds}deg)`})
  document.querySelectorAll('.desktop-gadget[data-gadget="cpu"]').forEach(gadget=>{const cpu=Math.round(5+Math.random()*19),ram=Math.round(31+Math.random()*7);gadget.querySelector("#gadgetCpuNeedle").style.transform=`rotate(${-120+cpu*2.4}deg)`;gadget.querySelector("#gadgetRamNeedle").style.transform=`rotate(${-120+ram*2.4}deg)`;gadget.querySelector("#gadgetCpuText").textContent=`CPU ${cpu}% · RAM ${ram}%`})
}

function addGadget(type){
  if(!gadgetHtml[type])return
  const layer=byId("desktopGadgets"),existing=layer.querySelector(`[data-gadget="${type}"]`);layer.classList.remove("hidden")
  if(existing){existing.classList.remove("hidden");return}
  const node=makeGadget(type,layer.children.length)
  layer.appendChild(node);bindDrag(node);updateGadgets()
}

export function mountGadgets(){
  const layer=document.createElement("div")
  layer.className="desktop-gadgets"
  layer.id="desktopGadgets"
  byId("desktop").appendChild(layer)
}

export function initGadgets(){
  const layer=byId("desktopGadgets")
  window.addEventListener("win7:add-gadget",event=>addGadget(event.detail))
  window.addEventListener("win7:toggle-gadgets",()=>layer.classList.toggle("hidden"))
  layer.addEventListener("click",event=>event.target.closest(".gadget-close")?.closest(".desktop-gadget")?.remove())
  addGadget("clock")
  updateGadgets();setInterval(updateGadgets,1000)
}
