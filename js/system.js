import{closeAllWindows}from"./window-manager.js"

const byId=id=>document.getElementById(id)
const timers=new Set()
let state="off"
let biosDefaultHtml=""

function later(fn,delay){const timer=setTimeout(()=>{timers.delete(timer);fn()},delay);timers.add(timer);return timer}
function clearTimers(){timers.forEach(clearTimeout);timers.clear()}
function hideScreens(){document.querySelectorAll(".system-screen").forEach(node=>node.classList.add("hidden"))}
function setState(next){state=next;window.dispatchEvent(new CustomEvent("win7:system-state",{detail:next}))}
function show(id){hideScreens();byId(id)?.classList.remove("hidden")}

function restoreBiosPanel(){
  const panel=byId("biosPanel")
  if(!panel)return
  if(biosDefaultHtml)panel.innerHTML=biosDefaultHtml
  panel.classList.remove("bios-setup")
}

function showWelcome(message="Welcome"){
  show("welcomeScreen")
  const label=byId("welcomeScreen")?.querySelector("small")
  if(label)label.textContent=message
}

export function bootSystem(){
  if(state==="booting"||state==="running")return
  clearTimers()
  restoreBiosPanel()
  setState("booting")
  show("bootScreen")
  byId("biosPanel")?.classList.remove("hidden")
  byId("windowsBoot")?.classList.add("hidden")
  later(()=>{byId("biosPanel")?.classList.add("hidden");byId("windowsBoot")?.classList.remove("hidden")},1250)
  later(()=>showWelcome("Welcome"),3850)
  later(()=>{hideScreens();setState("running")},4850)
}

export function lockSystem(message="Locked · click to unlock"){
  if(state!=="running")return
  setState("locked")
  show("lockScreen")
  const label=byId("lockScreen")?.querySelector(".lock-user small")
  if(label)label.textContent=message
  byId("startMenu")?.classList.add("hidden")
}

export function unlockSystem(){
  if(state!=="locked")return
  setState("booting")
  showWelcome("Welcome")
  later(()=>{hideScreens();setState("running")},720)
}

export function sleepSystem(){
  if(state!=="running"&&state!=="locked")return
  setState("sleeping")
  show("powerOffScreen")
  byId("powerOffScreen").querySelector("small").textContent="Sleeping · press the EKA power button to resume"
}

export function powerOff(action="shutdown"){
  if(state==="off"||state==="shutting-down")return
  clearTimers()
  setState("shutting-down")
  show("shutdownScreen")
  byId("shutdownText").textContent=action==="restart"?"Restarting...":"Shutting down..."
  closeAllWindows()
  later(()=>{
    if(action==="restart"){setState("off");bootSystem();return}
    setState("off")
    show("powerOffScreen")
    byId("powerOffScreen").querySelector("small").textContent="Press the laptop power button to start"
  },1650)
}

function mountSecurityScreen(){
  const panel=document.createElement("section")
  panel.className="system-screen security-screen hidden"
  panel.id="securityScreen"
  panel.innerHTML=`<div class="security-card"><strong>Windows Security</strong><button data-security="lock">Lock this computer</button><button data-security="switch">Switch User</button><button data-security="logoff">Log off</button><button data-security="taskmgr">Start Task Manager</button><button data-security="cancel">Cancel</button></div><button class="lock-power" data-security="shutdown">⏻</button><div class="welcome-brand">Windows 7 Professional · EKA-PC</div>`
  byId("desktop").appendChild(panel)
  panel.addEventListener("click",event=>{
    const action=event.target.closest("[data-security]")?.dataset.security
    if(!action)return
    if(action==="cancel"){hideScreens();setState("running")}
    if(action==="lock"){setState("running");lockSystem()}
    if(action==="switch"||action==="logoff"){setState("running");lockSystem(action==="switch"?"Switch user · click to continue":"Logged off · click to sign in")}
    if(action==="taskmgr"){hideScreens();setState("running");window.dispatchEvent(new CustomEvent("win7:open-app",{detail:"taskmanager"}))}
    if(action==="shutdown")powerOff("shutdown")
  })
}

export function showSecurityScreen(){
  if(state!=="running")return
  setState("secure")
  show("securityScreen")
}

function showBiosSetup(mode){
  if(state!=="booting")return
  const panel=byId("biosPanel")
  if(!panel||panel.classList.contains("hidden"))return
  clearTimers()
  panel.classList.add("bios-setup")
  panel.innerHTML=mode==="boot"?`<strong>EKA BOOT MENU</strong><span>Choose a boot device</span><pre>▶ EKA SSD 128 GB
  USB Storage Device
  Network Boot (IPv4)</pre><small>Enter: boot · Esc: continue startup</small>`:`<strong>EKA BIOS SETUP UTILITY</strong><span>Main · Advanced · Boot · Security · Exit</span><pre>System Model        EKA Notebook 7
BIOS Version        7.1.7600
Processor           EKA Virtual x86
System Memory       4096 MB
Primary Storage     EKA SSD 128 GB
Boot Mode           Legacy BIOS
Secure Boot         Unsupported by Windows 7</pre><small>F10: Save & Exit · Esc: continue startup</small>`
}

function continueBoot(){
  if(state!=="booting")return
  const panel=byId("biosPanel")
  panel?.classList.remove("bios-setup")
  panel?.classList.add("hidden")
  byId("windowsBoot")?.classList.remove("hidden")
  later(()=>showWelcome("Welcome"),2100)
  later(()=>{hideScreens();setState("running")},3000)
}

function tickLock(){
  const now=new Date()
  if(byId("lockTime"))byId("lockTime").innerHTML=`<strong>${now.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</strong><span>${now.toLocaleDateString([],{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</span>`
}

function handlePower(action){
  byId("powerMenu")?.classList.add("hidden")
  if(action==="shutdown")powerOff("shutdown")
  if(action==="restart")powerOff("restart")
  if(action==="sleep")sleepSystem()
  if(action==="lock")lockSystem()
  if(action==="switch")lockSystem("Switch user · click to continue")
  if(action==="logoff")lockSystem("Logged off · click to sign in")
}

export function systemState(){return state}

export function initSystem(){
  biosDefaultHtml=byId("biosPanel")?.innerHTML||""
  mountSecurityScreen()
  tickLock()
  setInterval(tickLock,1000)
  byId("unlockBtn")?.addEventListener("click",unlockSystem)
  byId("lockPowerBtn")?.addEventListener("click",()=>powerOff("shutdown"))
  byId("shutdownBtn")?.addEventListener("click",()=>powerOff("shutdown"))
  byId("shutdownMenuBtn")?.addEventListener("click",event=>{event.stopPropagation();byId("powerMenu")?.classList.toggle("hidden")})
  byId("powerMenu")?.addEventListener("click",event=>{const action=event.target.closest("[data-power-action]")?.dataset.powerAction;if(action)handlePower(action)})
  byId("laptopPower")?.addEventListener("click",()=>{
    if(state==="off")bootSystem()
    else if(state==="sleeping"){setState("locked");show("lockScreen")}
    else if(state==="running"||state==="locked")powerOff("shutdown")
  })
  document.addEventListener("keydown",event=>{
    if(state==="booting"&&event.key==="F2"){event.preventDefault();showBiosSetup("setup")}
    if(state==="booting"&&event.key==="F12"){event.preventDefault();showBiosSetup("boot")}
    if(state==="booting"&&["Escape","Enter","F10"].includes(event.key)&&byId("biosPanel")?.classList.contains("bios-setup")){event.preventDefault();continueBoot()}
  })
  document.addEventListener("click",event=>{if(!event.target.closest(".start-power"))byId("powerMenu")?.classList.add("hidden")})
  window.addEventListener("win7:power",event=>handlePower(event.detail))
  bootSystem()
}
