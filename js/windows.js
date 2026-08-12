function localStamp(){
  const d=new Date()
  return {
    time:new Intl.DateTimeFormat(undefined,{hour:"2-digit",minute:"2-digit",hour12:false}).format(d),
    date:new Intl.DateTimeFormat(undefined,{day:"2-digit",month:"2-digit",year:"numeric"}).format(d),
    long:new Intl.DateTimeFormat("en-GB",{dateStyle:"medium",timeStyle:"short"}).format(d)
  }
}

function updateClock(){
  const s=localStamp()
  UI.clock.innerHTML=`${s.time}<br>${s.date}`
}

function desktopFolder(){
  return {
    title:"Desktop",
    path:"Desktop",
    kind:"files",
    items:DATA.desktop.filter(x=>x[1]!=="thispc").map(([a,b,c])=>[a,b,c])
  }
}

function folderData(key){
  if(key==="desktop") return desktopFolder()
  if(key.startsWith("repo:")){
    const name=key.slice(5)
    const tag=(REPOS.find(r=>r[0]===name)||[])[1]||"Repository"
    return {title:name,path:`Computer > GitHub (G:) > Repositories > ${name}`,kind:"repo",name,tag}
  }
  return DATA.folders[key]
}

function openTarget(target,addHistory=true){
  const apps={cmd:"cmdWindow",powershell:"psWindow",notepad:"notepadWindow",calculator:"calculatorWindow",control:"controlWindow",devices:"devicesWindow",run:"runWindow"}
  if(apps[target]){
    openApp(apps[target])
    return
  }
  if(target==="telegram"){
    window.open(PROFILE.telegramUrl,"_blank")
    return
  }
  if(target.startsWith("external:")){
    window.open(target.slice(9),"_blank")
    return
  }
  const data=folderData(target)
  if(!data) return
  renderExplorer(target,data)
  if(addHistory){
    history=history.slice(0,historyIndex+1)
    if(history[history.length-1]!==target){
      history.push(target)
      historyIndex=history.length-1
    }
  }
}

function renderExplorer(key,data){
  UI.explorer.classList.remove("hidden")
  UI.explorer.style.zIndex=++z
  UI.taskExplorer.classList.add("open")
  UI.title.textContent=data.title
  UI.address.textContent=data.path
  UI.titleIcon.innerHTML=data.kind==="drives"?svg.computer():data.kind==="repo"?svg.github():svg.folder()
  document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.open===key))

  if(data.kind==="drives"){
    UI.files.innerHTML=`
      <div class="group-title">Hard Disk Drives (3)</div>
      <div class="drive-list">
        ${driveRow("Local Disk (C:)","218 GB free of 476 GB",58,"projects")}
        ${driveRow("Data (D:)","624 GB free of 931 GB",34,"archives")}
        ${driveRow("GitHub (G:)","Public repositories",76,"github")}
      </div>`
  }else if(data.kind==="repo"){
    UI.files.innerHTML=`
      <div class="repo-detail">
        <h3>${data.name}</h3>
        <div>Owner: TheLouisMahdi</div>
        <div>Type: ${data.tag}</div>
        <div>Branch: main</div>
        <div class="repo-actions">
          <button class="small-btn" data-external="${repoUrl(data.name)}">Open GitHub</button>
          <button class="small-btn" data-external="${repoUrl(data.name)}">README.md</button>
          <button class="small-btn" data-external="${repoUrl(data.name)}">ZIP</button>
        </div>
      </div>`
  }else{
    UI.files.innerHTML=`
      <div class="group-title">${data.title}</div>
      <div class="file-grid">
        ${data.items.map(fileButton).join("")}
      </div>`
  }
  bindDynamic()
}

function driveRow(name,cap,fill,target){
  return `<div class="drive-row" data-open="${target}">
    <span class="drive-svg">${svg.drive()}</span>
    <div>
      <div class="drive-name">${name}</div>
      <div class="drive-meter"><div class="drive-fill" style="width:${fill}%"></div></div>
      <div class="drive-cap">${cap}</div>
    </div>
  </div>`
}

function fileButton([name,target,type]){
  return `<button class="file-item" data-open="${target}">
    <span class="file-svg">${svg[type]()}</span>
    <span class="file-name">${name}</span>
  </button>`
}

function bindDynamic(){
  UI.files.querySelectorAll("[data-open]").forEach(el=>el.addEventListener("click",()=>openTarget(el.dataset.open)))
  UI.files.querySelectorAll("[data-external]").forEach(el=>el.addEventListener("click",()=>window.open(el.dataset.external,"_blank")))
}

function toggleStart(){
  UI.start.classList.toggle("show")
  UI.startBtn.classList.toggle("open",UI.start.classList.contains("show"))
}

function closeStart(){
  UI.start.classList.remove("show")
  UI.startBtn.classList.remove("open")
}

function showDesktop(){
  document.querySelectorAll(".window").forEach(w=>w.classList.add("hidden"))
  closeStart()
}
function receiptText(){
  return [
    "GITHUB PROFILE RECEIPT",
    "",
    `NAME: ${PROFILE.name}`,
    `USER: @${PROFILE.user}`,
    `ROLE: ${PROFILE.role}`,
    `UNIVERSITY: ${PROFILE.university}`,
    `TELEGRAM: ${PROFILE.telegram}`,
    "",
    "SELECTED REPOSITORIES",
    ...REPOS.map(r=>`+ ${r[0]}`),
    "",
    "STACK: Python / C / Verilog",
    "HARDWARE: STM32 / FPGA / Zynq",
    `GITHUB: ${PROFILE.github}`,
    localStamp().long
  ].join("\n")
}

function resetPrint(){
  UI.screen.classList.remove("busy","done")
  UI.zone.classList.remove("printing","finished")
  UI.print.disabled=false
  UI.status.textContent="Ready to print GitHub profile"
  UI.printerState.textContent="IDLE"
}

function printProfile(){
  resetPrint()
  closeStart()
  UI.screen.classList.add("busy")
  UI.zone.classList.add("printing")
  UI.print.disabled=true
  UI.status.textContent="Sending profile to printer..."
  UI.printerState.textContent="RECEIVING"
  UI.date.textContent=localStamp().long

  setTimeout(()=>{
    UI.status.textContent="Printing developer receipt..."
    UI.printerState.textContent="PRINTING"
  },1200)

  setTimeout(()=>{
    UI.screen.classList.remove("busy")
    UI.screen.classList.add("done")
    UI.zone.classList.remove("printing")
    UI.zone.classList.add("finished")
    UI.status.textContent="Profile printed successfully"
    UI.printerState.textContent="DONE"
    navigator.vibrate?.(35)
  },4500)
}

function saveTxt(){
  const blob=new Blob([receiptText()],{type:"text/plain;charset=utf-8"})
  const url=URL.createObjectURL(blob)
  const a=document.createElement("a")
  a.href=url
  a.download="TheLouisMahdi-github-profile.txt"
  a.click()
  URL.revokeObjectURL(url)
  toast("TXT saved")
}

async function copyReceipt(){
  try{
    await navigator.clipboard.writeText(receiptText())
  }catch{
    const t=document.createElement("textarea")
    t.value=receiptText()
    document.body.appendChild(t)
    t.select()
    document.execCommand("copy")
    t.remove()
  }
  toast("Copied")
}

function savePdf(){
  toast("Choose Save as PDF")
  setTimeout(()=>window.print(),220)
}
function dragWindow(){
  let active=false,dx=0,dy=0
  UI.titlebar.addEventListener("pointerdown",e=>{
    if(e.target.closest(".win-control")||UI.explorer.classList.contains("maximized")) return
    active=true
    const r=UI.explorer.getBoundingClientRect()
    const sr=UI.screen.getBoundingClientRect()
    dx=e.clientX-r.left
    dy=e.clientY-r.top
    UI.explorer.setPointerCapture(e.pointerId)
    UI.explorer.style.zIndex=++z
  })
  UI.titlebar.addEventListener("pointermove",e=>{
    if(!active) return
    const sr=UI.screen.getBoundingClientRect()
    const x=Math.max(2,Math.min(e.clientX-sr.left-dx,sr.width-UI.explorer.offsetWidth-2))
    const y=Math.max(2,Math.min(e.clientY-sr.top-dy,sr.height-UI.explorer.offsetHeight-44))
    UI.explorer.style.left=x+"px"
    UI.explorer.style.top=y+"px"
  })
  UI.titlebar.addEventListener("pointerup",()=>active=false)
}

function fakeCursor(){
  const move=(clientX,clientY)=>{
    const r=UI.screen.getBoundingClientRect()
    const x=Math.max(0,Math.min(clientX-r.left,r.width-18))
    const y=Math.max(0,Math.min(clientY-r.top,r.height-24))
    UI.cursor.style.left=x+"px"
    UI.cursor.style.top=y+"px"
    UI.screen.classList.add("cursor-visible")
  }
  UI.screen.addEventListener("pointermove",e=>move(e.clientX,e.clientY))
  UI.screen.addEventListener("pointerenter",e=>move(e.clientX,e.clientY))
  UI.screen.addEventListener("pointerleave",()=>UI.screen.classList.remove("cursor-visible"))
  UI.screen.addEventListener("pointerdown",e=>move(e.clientX,e.clientY))
}

function bind(){
  document.querySelectorAll("[data-open]:not(.desktop-icon)").forEach(el=>{
    el.addEventListener("click",()=>{
      openTarget(el.dataset.open)
      closeStart()
    })
  })

  UI.startBtn.addEventListener("click",e=>{e.stopPropagation();toggleStart()})
  $("#startPrint").addEventListener("click",printProfile)
  UI.print.addEventListener("click",printProfile)
  $("#pdfBtn").addEventListener("click",savePdf)
  $("#txtBtn").addEventListener("click",saveTxt)
  $("#copyBtn").addEventListener("click",copyReceipt)

  $("#backBtn").addEventListener("click",()=>{
    if(historyIndex>0){
      historyIndex--
      openTarget(history[historyIndex],false)
    }
  })
  $("#forwardBtn").addEventListener("click",()=>{
    if(historyIndex<history.length-1){
      historyIndex++
      openTarget(history[historyIndex],false)
    }
  })

  $("#minBtn").addEventListener("click",()=>{
    UI.explorer.classList.add("hidden")
    UI.taskExplorer.classList.remove("open")
  })
  $("#closeBtn").addEventListener("click",()=>{
    UI.explorer.classList.add("hidden")
    UI.taskExplorer.classList.remove("open")
  })
  $("#maxBtn").addEventListener("click",()=>UI.explorer.classList.toggle("maximized"))

  UI.taskExplorer.addEventListener("click",()=>{
    UI.explorer.classList.toggle("hidden")
    UI.taskExplorer.classList.toggle("open",!UI.explorer.classList.contains("hidden"))
  })
  UI.taskGithub.addEventListener("click",()=>openTarget("github"))
  UI.taskPrinter.addEventListener("click",printProfile)
  $("#peekBtn").addEventListener("click",showDesktop)

  $("#controlPanelBtn").addEventListener("click",()=>openTarget("control"))
  $("#devicesBtn").addEventListener("click",()=>openTarget("devices"))
  $("#runBtn").addEventListener("click",()=>openTarget("run"))
  $("#shutdownBtn").addEventListener("click",powerOff)

  $("#searchBox").addEventListener("input",e=>{
    const q=e.target.value.trim().toLowerCase()
    document.querySelectorAll(".start-program").forEach(b=>{
      b.style.display=!q||b.textContent.toLowerCase().includes(q)?"flex":"none"
    })
  })

  document.addEventListener("click",e=>{
    if(!UI.start.contains(e.target)&&e.target!==UI.startBtn) closeStart()
  })

  document.addEventListener("keydown",e=>{
    if(e.ctrlKey&&e.key==="Escape"){
      e.preventDefault()
      toggleStart()
    }
    if(e.key==="Escape") closeStart()
    if(e.key==="F2"&&e.altKey){e.preventDefault();openTarget("cmd")}
    if(e.key.toLowerCase()==="r"&&e.altKey){e.preventDefault();openTarget("run")}
  })

  UI.desktopIcons.querySelectorAll(".desktop-icon").forEach(el=>{
    el.addEventListener("click",()=>{
      document.querySelectorAll(".desktop-icon").forEach(x=>x.classList.remove("selected"))
      el.classList.add("selected")
      openTarget(el.dataset.open)
    })
  })
}
