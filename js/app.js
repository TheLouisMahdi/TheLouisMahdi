import{FILE_SYSTEM}from"./data.js"
import{icon,paintIcons}from"./icons.js"
import{activeWindow,cascadeWindows,closeWindow,initWindowManager,minimizeOthers,openWindow,showDesktop,snapWindow,toggleAppWindow,visibleWindows}from"./window-manager.js"
import{initExplorer,navigate}from"./explorer.js"
import{initTerminals}from"./terminal.js"
import{initApps,mountRuntimeWindows}from"./apps.js"
import{initSystemApps,mountSystemApps}from"./system-apps.js"
import{initFidelityApps,mountFidelityApps}from"./fidelity-apps.js"
import{initUac,mountUac}from"./uac.js"
import{initGames,mountGames}from"./games.js"
import{initComfyCakes,mountComfyCakes}from"./comfy-cakes.js"
import{initGadgets,mountGadgets}from"./gadgets.js"
import{initSystem,lockSystem,showSecurityScreen,systemState}from"./system.js"
import{bindSelectableSurface,initPointerCursor,mountInteractionUi,refreshSurface,showContextMenu}from"./interaction.js"
import{backgroundContextItems,createDesktopItem,deleteSelected,fileContextItems,openVirtual,renameSelected}from"./file-actions.js"
import{listVirtual}from"./vfs.js"
import{APP_WINDOWS}from"./app-registry.js"
import{escapeHtml}from"./html.js"

const byId=id=>document.getElementById(id)
let desktopItems=[]
let mobileHintShown=false
let desktopSort="name",desktopIconSize=""

function openApp(app){
  const id=APP_WINDOWS[app]
  if(!id)return
  if(app==="explorer")navigate("computer")
  else openWindow(id)
  byId("startMenu").classList.add("hidden")
  byId("allProgramsPanel")?.classList.add("hidden")
}

function mountTaskButtons(){
  const iconNames={notepad:"notepad",calculator:"calculator",run:"run",image:"photo",paint:"paint",wordpad:"wordpad",sticky:"sticky",snipping:"snipping",media:"media",control:"control",devices:"devices",taskmanager:"taskmanager",minesweeper:"minesweeper",solitaire:"solitaire",freecell:"freecell",chess:"chess",comfy:"purble",systeminfo:"system",charmap:"charmap",keyboard:"keyboard",help:"system"}
  for(const [app,iconName] of Object.entries(iconNames)){
    if(document.querySelector(`[data-task="${app}"]`))continue
    const button=document.createElement("button")
    button.className="task-button unpinned"
    button.dataset.task=app
    button.setAttribute("aria-label",app)
    button.innerHTML=`<span>${icon(iconName)}</span>`
    byId("taskApps").appendChild(button)
  }
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
  if(desktopSort==="name")desktopItems.sort((a,b)=>a.name.localeCompare(b.name))
  if(desktopSort==="type")desktopItems.sort((a,b)=>String(a.type).localeCompare(String(b.type))||a.name.localeCompare(b.name))
  if(desktopSort==="size")desktopItems.sort((a,b)=>(Number(a.size)||String(a.content||"").length)-(Number(b.size)||String(b.content||"").length)||a.name.localeCompare(b.name))
  if(desktopSort==="date")desktopItems.sort((a,b)=>(Number(b.updated)||0)-(Number(a.updated)||0)||a.name.localeCompare(b.name))
  byId("desktopIcons").innerHTML=desktopItems.map((item,index)=>`<button class="desktop-icon" data-desktop-index="${index}" data-key="${encodeURIComponent(itemKey(item))}"><span class="desktop-svg">${icon(item.type)}</span><span class="desktop-label">${escapeHtml(item.name)}</span></button>`).join("")
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
  window.addEventListener("win7:desktop-menu",event=>{
    const x=Math.max(12,Math.min(window.innerWidth-190,window.innerWidth*.22)),y=Math.max(12,Math.min(window.innerHeight-230,window.innerHeight*.35))
    const iconSize=size=>{desktopIconSize=size;desktop.classList.remove("large-desktop-icons","small-desktop-icons");if(size)desktop.classList.add(size)}
    const checked=(label,value,current)=>`${label}${value===current?"  ✓":""}`
    if(event.detail==="view")showContextMenu([{label:checked("Large icons","large-desktop-icons",desktopIconSize),action:()=>iconSize("large-desktop-icons")},{label:checked("Medium icons","",desktopIconSize),action:()=>iconSize("")},{label:checked("Small icons","small-desktop-icons",desktopIconSize),action:()=>iconSize("small-desktop-icons")},{separator:true},{label:"Auto arrange icons  ✓",action:renderDesktop},{label:"Align icons to grid  ✓",action:renderDesktop},{label:`Show desktop icons${byId("desktopIcons").classList.contains("hidden")?"":"  ✓"}`,action:()=>byId("desktopIcons").classList.toggle("hidden")},{label:`Show desktop gadgets${byId("desktopGadgets").classList.contains("hidden")?"":"  ✓"}`,action:()=>window.dispatchEvent(new Event("win7:toggle-gadgets"))}],x,y)
    if(event.detail==="sort")showContextMenu([{label:checked("Name","name",desktopSort),action:()=>{desktopSort="name";renderDesktop()}},{label:checked("Size","size",desktopSort),action:()=>{desktopSort="size";renderDesktop()}},{label:checked("Item type","type",desktopSort),action:()=>{desktopSort="type";renderDesktop()}},{label:checked("Date modified","date",desktopSort),action:()=>{desktopSort="date";renderDesktop()}}],x,y)
    if(event.detail==="new")showContextMenu([{label:"Folder",action:()=>createDesktopItem("folder")},{separator:true},{label:"Text Document",action:()=>createDesktopItem("text")},{label:"Python File",action:()=>createDesktopItem("python")},{label:"HTML File",action:()=>createDesktopItem("html")}],x,y)
  })
}

function initStart(){
  const controlRecords=[
    ["Control Panel","home"],["Personalization","personalization"],["Change the theme","personalization"],["Desktop Background","desktop-background"],["Window Color and Appearance","window-color"],["Network and Sharing Center","network-sharing"],["Programs and Features","programs-features"],["Power Options","power-options"],["Devices and Printers","devices"],["Taskbar and Start Menu","taskbar"]
  ]
  const resetSearch=()=>{byId("searchBox").value="";byId("programList").classList.remove("hidden");byId("startSearchResults").classList.add("hidden");byId("startSearchResults").innerHTML=""}
  const closeStart=()=>{byId("startMenu").classList.add("hidden");byId("allProgramsPanel")?.classList.add("hidden");resetSearch()}
  const searchRecords=()=>{
    const records=[]
    document.querySelectorAll("#programList [data-app-open],#allProgramsPanel [data-app-open],#allProgramsPanel [data-generic-app]").forEach(button=>records.push({group:"Programs",label:button.textContent.trim().replace(/^Games · /,""),app:button.dataset.appOpen,generic:button.dataset.genericApp,icon:button.dataset.appOpen||"system"}))
    controlRecords.forEach(([label,control])=>records.push({group:"Control Panel",label,control,icon:"control"}))
    desktopItems.forEach(item=>records.push({group:item.type==="folder"?"Folders":"Documents",label:item.name,item,icon:item.type||"text"}))
    const seen=new Set()
    return records.filter(record=>{const key=`${record.group}|${record.label.toLowerCase()}`;if(seen.has(key))return false;seen.add(key);return true})
  }
  const resultMarkup=record=>`<button class="start-search-item" ${record.app?`data-search-app="${record.app}"`:record.generic?`data-search-generic="${record.generic}"`:record.control?`data-search-control="${record.control}"`:`data-search-file="${encodeURIComponent(itemKey(record.item))}"`}><span>${icon(record.icon)}</span><b>${escapeHtml(record.label)}</b></button>`
  const renderSearch=()=>{
    const q=byId("searchBox").value.trim().toLocaleLowerCase()
    byId("programList").classList.toggle("hidden",Boolean(q))
    byId("allProgramsPanel")?.classList.add("hidden")
    const results=byId("startSearchResults")
    if(!q){results.classList.add("hidden");results.innerHTML="";return}
    const matches=searchRecords().filter(record=>record.label.toLocaleLowerCase().includes(q)).sort((a,b)=>Number(!a.label.toLocaleLowerCase().startsWith(q))-Number(!b.label.toLocaleLowerCase().startsWith(q))||a.label.localeCompare(b.label)).slice(0,18)
    const groups=["Programs","Control Panel","Documents","Folders"].map(group=>{const items=matches.filter(record=>record.group===group);return items.length?`<section><h4>${group}</h4>${items.map(resultMarkup).join("")}</section>`:""}).join("")
    results.innerHTML=groups||'<p class="start-no-results">No items match your search.</p>'
    results.classList.remove("hidden")
  }
  const activateResult=button=>{
    if(button.dataset.searchApp)openApp(button.dataset.searchApp)
    else if(button.dataset.searchGeneric)window.dispatchEvent(new CustomEvent("win7:open-generic",{detail:button.dataset.searchGeneric}))
    else if(button.dataset.searchControl){openApp("control");if(button.dataset.searchControl!=="home")window.dispatchEvent(new CustomEvent("win7:control-page",{detail:button.dataset.searchControl}))}
    else if(button.dataset.searchFile){const key=decodeURIComponent(button.dataset.searchFile),item=desktopItems.find(candidate=>itemKey(candidate)===key);activateDesktop(item)}
    closeStart()
  }
  byId("startBtn").innerHTML=icon("windows")
  byId("startBtn").addEventListener("click",event=>{
    event.stopPropagation()
    byId("startMenu").classList.toggle("hidden")
    if(!byId("startMenu").classList.contains("hidden"))byId("searchBox").focus()
  })
  byId("startMenu").addEventListener("click",event=>event.stopPropagation())
  document.addEventListener("click",closeStart)
  byId("startMenu").querySelectorAll("[data-app-open]").forEach(node=>node.addEventListener("click",()=>openApp(node.dataset.appOpen)))
  byId("startMenu").querySelectorAll("[data-control-open]").forEach(node=>node.addEventListener("click",event=>{event.preventDefault();openApp("control");window.dispatchEvent(new CustomEvent("win7:control-page",{detail:node.dataset.controlOpen}))}))
  byId("allProgramsBtn")?.addEventListener("click",event=>{event.stopPropagation();byId("allProgramsPanel")?.classList.toggle("hidden")})
  byId("allProgramsPanel")?.addEventListener("click",event=>event.stopPropagation())
  byId("searchBox").addEventListener("input",renderSearch)
  byId("searchBox").addEventListener("keydown",event=>{if(event.key==="Enter"){const first=byId("startSearchResults").querySelector("button");if(first){event.preventDefault();activateResult(first)}}})
  byId("startSearchResults").addEventListener("click",event=>{const button=event.target.closest(".start-search-item");if(button)activateResult(button)})
}

function initTaskbar(){
  byId("peekBtn").addEventListener("click",showDesktop)
  byId("peekBtn").addEventListener("pointerenter",()=>byId("desktop").classList.add("aero-peek"))
  byId("peekBtn").addEventListener("pointerleave",()=>byId("desktop").classList.remove("aero-peek"))
  document.querySelectorAll("[data-task]").forEach(button=>{
    button.addEventListener("click",event=>{
      event.stopPropagation()
      const app=button.dataset.task
      const win=document.getElementById(APP_WINDOWS[app])
      if(app==="explorer"&&win?.classList.contains("hidden")&&!button.classList.contains("running"))navigate("computer")
      else toggleAppWindow(app,APP_WINDOWS[app])
    })
  })
  const closeFlyouts=except=>document.querySelectorAll(".tray-flyout").forEach(node=>{if(node!==except)node.classList.add("hidden")})
  const toggleFlyout=id=>{
    const flyout=byId(id)
    if(!flyout)return
    const open=flyout.classList.contains("hidden")
    closeFlyouts(flyout)
    flyout.classList.toggle("hidden",!open)
  }
  const trayMap={trayOverflowBtn:"trayOverflow",actionCenterBtn:"actionCenterFlyout",networkBtn:"networkFlyout",volumeBtn:"volumeFlyout",batteryBtn:"batteryFlyout",clock:"clockFlyout",desktopToolbarBtn:"desktopToolbarMenu"}
  for(const [button,flyout]of Object.entries(trayMap))byId(button)?.addEventListener("click",event=>{event.stopPropagation();toggleFlyout(flyout)})
  byId("volumeSlider")?.addEventListener("input",event=>{byId("volumeValue").textContent=`${event.target.value}%`;byId("volumeBtn").classList.toggle("muted",event.target.value==="0")})
  byId("muteBtn")?.addEventListener("click",()=>{const slider=byId("volumeSlider");slider.value=slider.value==="0"?"70":"0";slider.dispatchEvent(new Event("input"))})
  byId("networkConnect")?.addEventListener("click",()=>{const connected=byId("networkConnect").textContent==="Disconnect";byId("networkStatus").textContent=connected?"Not connected":"Connected · Internet access";byId("networkConnect").textContent=connected?"Connect":"Disconnect"})
  byId("actionCenterOpen")?.addEventListener("click",()=>{openApp("control");window.dispatchEvent(new CustomEvent("win7:control-page",{detail:"action-center"}))})
  byId("powerPlanLink")?.addEventListener("click",()=>{openApp("control");window.dispatchEvent(new CustomEvent("win7:control-page",{detail:"power-options"}))})
  byId("dateTimeLink")?.addEventListener("click",()=>{openApp("control");window.dispatchEvent(new CustomEvent("win7:control-page",{detail:"date-time"}))})
  byId("desktopToolbarMenu")?.addEventListener("click",event=>{
    const button=event.target.closest("[data-toolbar-open],[data-toolbar-app],[data-toolbar-external]")
    if(!button)return
    if(button.dataset.toolbarOpen)navigate(button.dataset.toolbarOpen)
    if(button.dataset.toolbarApp)openApp(button.dataset.toolbarApp)
    if(button.dataset.toolbarExternal)window.open(button.dataset.toolbarExternal,"_blank","noopener,noreferrer")
    closeFlyouts()
  })
  byId("taskbar").addEventListener("click",event=>{
    const appLink=event.target.closest(".tray-flyout [data-app-open]")
    if(appLink){event.preventDefault();openApp(appLink.dataset.appOpen);closeFlyouts()}
    const controlLink=event.target.closest(".tray-flyout [data-control-open]")
    if(controlLink){event.preventDefault();openApp("control");window.dispatchEvent(new CustomEvent("win7:control-page",{detail:controlLink.dataset.controlOpen}));closeFlyouts()}
  })
  byId("customizeTray")?.addEventListener("click",event=>{event.preventDefault();openApp("control");window.dispatchEvent(new CustomEvent("win7:control-page",{detail:"notification-area"}))})
  document.addEventListener("click",()=>closeFlyouts())
  byId("taskbar").addEventListener("contextmenu",event=>{
    event.preventDefault()
    const taskButton=event.target.closest("[data-task]")
    if(taskButton){
      const app=taskButton.dataset.task
      const names={explorer:"Windows Explorer",cmd:"Command Prompt",powershell:"Windows PowerShell",notepad:"Notepad",browser:"Internet Explorer",paint:"Paint",control:"Control Panel"}
      const recent=app==="explorer"?[{label:"Documents",action:()=>navigate("documents")},{label:"Pictures",action:()=>navigate("pictures")},{label:"GitHub (G:)",action:()=>navigate("github")},]:app==="notepad"?[{label:"Eka Command Deck.txt",action:()=>window.dispatchEvent(new CustomEvent("win7:open-file",{detail:{path:"C:\\Users\\Eka\\Desktop\\Eka Command Deck.txt",forceNotepad:true}}))}]:[]
      showContextMenu([...recent,...(recent.length?[{separator:true}]:[]),{label:`Open ${names[app]||app}`,action:()=>openApp(app)},{label:"Pin this program to taskbar ✓",action:()=>window.dispatchEvent(new CustomEvent("win7:toast",{detail:`${names[app]||app} is pinned to the taskbar.`}))},{label:"Close window",action:()=>{const win=byId(APP_WINDOWS[app]);if(win)void closeWindow(win)}}],event.clientX,event.clientY)
      return
    }
    showContextMenu([
      {label:"Toolbars  ›  Desktop",action:()=>byId("desktopToolbarBtn").classList.toggle("hidden")},
      {separator:true},
      {label:"Cascade windows",action:cascadeWindows},
      {label:"Show windows side by side",action:()=>{const wins=visibleWindows().slice(-2);if(wins[0])snapWindow(wins[0],"left");if(wins[1])snapWindow(wins[1],"right")}},
      {label:"Show the desktop",action:showDesktop},
      {separator:true},
      {label:"Start Task Manager",action:()=>openApp("taskmanager")},
      {label:"Lock the taskbar ✓",action:()=>window.dispatchEvent(new CustomEvent("win7:toast",{detail:"The taskbar is locked."}))},
      {label:"Properties",action:()=>{openApp("control");window.dispatchEvent(new CustomEvent("win7:control-page",{detail:"taskbar"}))}}
    ],event.clientX,event.clientY)
  })
}

function initClock(){
  const tick=()=>{
    const now=new Date()
    const time=now.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})
    const date=now.toLocaleDateString([],{month:"2-digit",day:"2-digit",year:"numeric"})
    byId("clock").textContent=`${time}\n${date}`
    byId("clock").title=now.toString()
    if(byId("clockFlyoutDate"))byId("clockFlyoutDate").textContent=now.toLocaleDateString([],{weekday:"long",year:"numeric",month:"long",day:"numeric"})
    if(byId("clockFlyoutTime"))byId("clockFlyoutTime").textContent=now.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"})
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
  window.addEventListener("win7:vfs-error",event=>window.dispatchEvent(new CustomEvent("win7:toast",{detail:event.detail?.message||"Virtual disk changes could not be saved."})))
}

function cycleWindows(reverse=false){
  const wins=visibleWindows()
  if(wins.length<2)return
  const next=reverse?wins.at(-2):wins[0]
  next?.dispatchEvent(new PointerEvent("pointerdown",{bubbles:true,pointerType:"mouse",button:0}))
}

function initKeyboard(){
  document.addEventListener("keydown",event=>{
    const key=event.key.toLowerCase()
    if(event.ctrlKey&&event.altKey&&event.key==="Delete"){event.preventDefault();showSecurityScreen();return}
    if(systemState()!=="running")return
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
      const win=activeWindow();if(win){event.preventDefault();void closeWindow(win)}return
    }
    if(event.altKey&&event.key==="Tab"){
      event.preventDefault();cycleWindows(event.shiftKey);return
    }
    if(event.ctrlKey&&event.shiftKey&&event.key==="Escape"){
      event.preventDefault();openApp("taskmanager");return
    }
    if(event.key==="F1"){
      event.preventDefault();openApp("help");return
    }
    if(event.key==="PrintScreen"){
      event.preventDefault();openApp("snipping");return
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
    if(event.metaKey&&key==="l"){
      event.preventDefault();lockSystem();return
    }
    if(event.metaKey&&key==="u"){
      event.preventDefault();openApp("keyboard");return
    }
    if(event.metaKey&&key==="f"){
      event.preventDefault();openApp("explorer");setTimeout(()=>byId("explorerSearch")?.focus(),0);return
    }
    if(event.metaKey&&event.key==="Pause"){
      event.preventDefault();openApp("systeminfo");return
    }
    if(event.metaKey&&event.key==="Tab"){
      event.preventDefault();cycleWindows(event.shiftKey);return
    }
    if(event.metaKey&&key==="home"){
      event.preventDefault();minimizeOthers(activeWindow());return
    }
    if(event.metaKey&&["arrowleft","arrowright","arrowup","arrowdown"].includes(key)){
      const win=activeWindow();if(win){event.preventDefault();snapWindow(win,key.replace("arrow",""))}return
    }
    if(event.metaKey&&key==="p"){
      event.preventDefault();window.dispatchEvent(new CustomEvent("win7:open-generic",{detail:"Connect to a Projector"}));return
    }
    if(event.metaKey&&key==="x"){
      event.preventDefault();window.dispatchEvent(new CustomEvent("win7:open-generic",{detail:"Windows Mobility Center"}));return
    }
    if(event.metaKey&&/^[1-9]$/.test(key)){
      event.preventDefault();document.querySelectorAll("[data-task]")[Number(key)-1]?.click();return
    }
  })
  document.addEventListener("keydown",event=>{if(systemState()==="running"&&event.metaKey&&event.code==="Space"){event.preventDefault();byId("desktop").classList.add("aero-peek")}})
  document.addEventListener("keyup",event=>{if(event.code==="Space")byId("desktop").classList.remove("aero-peek")})
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
  initSystem()
  mountInteractionUi()
  mountRuntimeWindows()
  mountSystemApps()
  mountFidelityApps()
  mountUac()
  mountGames()
  mountComfyCakes()
  mountGadgets()
  mountTaskButtons()
  paintIcons()
  renderDesktop()
  initWindowManager()
  initExplorer()
  initTerminals()
  initApps()
  initSystemApps()
  initFidelityApps()
  initUac()
  initGames()
  initComfyCakes()
  initGadgets()
  initDesktopInteraction()
  initStart()
  initTaskbar()
  initClock()
  initPointerCursor()
  initToast()
  initAppEvents()
  initKeyboard()
}

init()
