const APP_IDS=["cmdWindow","psWindow","notepadWindow","calculatorWindow","controlWindow","devicesWindow","runWindow"]
const TERMINAL_PATHS={
  "C:\\Users\\Eka":["Desktop","Documents","Pictures","GitHub","profile.txt"],
  "C:\\Users\\Eka\\GitHub":REPOS.map(r=>r[0]),
  "C:\\Users\\Eka\\Documents":["profile.txt","README.md"],
  "C:\\Users\\Eka\\Pictures":["avatar.jpg","about-terminal.svg","profile-preview.png"],
  "G:\\Repositories":REPOS.map(r=>r[0])
}
let cmdPath="C:\\Users\\Eka"
let psPath="C:\\Users\\Eka"
let calcValue="0"
let calcStored=null
let calcOp=null
let tearStartY=0
let tearTriggered=false

function openApp(id){
  const el=$("#"+id)
  if(!el)return
  closeStart()
  el.classList.remove("hidden")
  el.style.zIndex=++z
  if(id==="cmdWindow"){
    $("#taskCmd").classList.add("open")
    $("#cmdInput").focus()
  }
  if(id==="psWindow"){
    $("#taskPowerShell").classList.add("open")
    $("#psInput").focus()
  }
  if(id==="notepadWindow")$("#noteText").focus()
  if(id==="runWindow")setTimeout(()=>$("#runInput").focus(),0)
}

function closeApp(id){
  const el=$("#"+id)
  if(!el)return
  el.classList.add("hidden")
  if(id==="cmdWindow")$("#taskCmd").classList.remove("open")
  if(id==="psWindow")$("#taskPowerShell").classList.remove("open")
}

function toggleApp(id){
  const el=$("#"+id)
  if(!el)return
  if(el.classList.contains("hidden"))openApp(id)
  else closeApp(id)
}

function makeWindowsDraggable(){
  document.querySelectorAll(".app-window").forEach(win=>{
    const bar=win.querySelector(".app-titlebar")
    if(!bar)return
    let active=false,dx=0,dy=0
    bar.addEventListener("pointerdown",e=>{
      if(e.target.closest(".win-control")||win.classList.contains("maximized"))return
      active=true
      const r=win.getBoundingClientRect()
      dx=e.clientX-r.left
      dy=e.clientY-r.top
      bar.setPointerCapture(e.pointerId)
      win.style.zIndex=++z
    })
    bar.addEventListener("pointermove",e=>{
      if(!active)return
      const sr=UI.screen.getBoundingClientRect()
      const x=Math.max(2,Math.min(e.clientX-sr.left-dx,sr.width-win.offsetWidth-2))
      const y=Math.max(2,Math.min(e.clientY-sr.top-dy,sr.height-win.offsetHeight-44))
      win.style.left=x+"px"
      win.style.top=y+"px"
    })
    bar.addEventListener("pointerup",()=>active=false)
  })
}

function bindWindowControls(){
  document.querySelectorAll("[data-win]").forEach(btn=>btn.addEventListener("click",()=>{
    const win=$("#"+btn.dataset.target)
    if(!win)return
    const action=btn.dataset.win
    if(action==="close"||action==="min")closeApp(btn.dataset.target)
    if(action==="max")win.classList.toggle("maximized")
  }))
}

function appendConsole(out,text=""){
  const line=document.createElement("div")
  line.className="console-line"
  line.textContent=text
  out.appendChild(line)
  out.scrollTop=out.scrollHeight
}

function setCmdPrompt(){
  $("#cmdPrompt").textContent=cmdPath+">"
}

function setPsPrompt(){
  $("#psPrompt").textContent="PS "+psPath+"> "
}

function initTerminals(){
  appendConsole($("#cmdOutput"),"Microsoft Windows [Version 6.1.7601]")
  appendConsole($("#cmdOutput"),"")
  appendConsole($("#psOutput"),"Windows PowerShell 2.0")
  appendConsole($("#psOutput"),"")
  setCmdPrompt()
  setPsPrompt()
}

function pathItems(path){
  return TERMINAL_PATHS[path]||[]
}

function parentPath(path){
  if(path==="C:\\"||path==="G:\\")return path
  const parts=path.split("\\")
  parts.pop()
  return parts.length===1?parts[0]+"\\":parts.join("\\")
}

function childPath(base,name){
  if(base.endsWith("\\"))return base+name
  return base+"\\"+name
}

function changePath(current,arg){
  const clean=arg.trim().replace(/^["']|["']$/g,"")
  if(!clean)return current
  if(/^[cg]:$/i.test(clean))return clean.toUpperCase()+"\\"
  if(clean==="\\")return current.slice(0,2)+"\\"
  if(clean==="..")return parentPath(current)
  const direct=clean.replace(/\//g,"\\")
  if(TERMINAL_PATHS[direct])return direct
  const candidates=Object.keys(TERMINAL_PATHS)
  const next=childPath(current,direct)
  const match=candidates.find(p=>p.toLowerCase()===next.toLowerCase())
  if(match)return match
  if(current==="C:\\Users\\Eka"&&direct.toLowerCase()==="github")return "C:\\Users\\Eka\\GitHub"
  if(current==="C:\\Users\\Eka"&&direct.toLowerCase()==="documents")return "C:\\Users\\Eka\\Documents"
  if(current==="C:\\Users\\Eka"&&direct.toLowerCase()==="pictures")return "C:\\Users\\Eka\\Pictures"
  return null
}

function listText(path){
  const items=pathItems(path)
  if(!items.length)return " Directory is empty."
  return items.map(x=>x.includes(".")?`        ${x}`:`<DIR>   ${x}`).join("\n")
}

function profileFile(){
  return [
    "Eka / @TheLouisMahdi",
    "Mahdi Ghahremani",
    "Electrical Engineering Student",
    "University of Zanjan",
    "AI Vision · Embedded Systems · FPGA",
    "GitHub: github.com/TheLouisMahdi",
    "Telegram: @thelouis_mahdi"
  ].join("\n")
}

function launchName(name){
  const v=name.trim().replace(/^["']|["']$/g,"").toLowerCase()
  if(["cmd","cmd.exe","command prompt"].includes(v)){openTarget("cmd");return true}
  if(["powershell","powershell.exe","windows powershell"].includes(v)){openTarget("powershell");return true}
  if(["notepad","notepad.exe"].includes(v)){openTarget("notepad");return true}
  if(["calc","calc.exe","calculator"].includes(v)){openTarget("calculator");return true}
  if(["explorer","explorer.exe","computer"].includes(v)){openTarget("thispc");return true}
  if(["control","control.exe","control panel"].includes(v)){openTarget("control");return true}
  if(["github","thelouismahdi"].includes(v)){window.open(PROFILE.github,"_blank");return true}
  if(["telegram","tg"].includes(v)){window.open(PROFILE.telegramUrl,"_blank");return true}
  if(["print","printer"].includes(v)){printProfile();return true}
  const repo=REPOS.find(r=>r[0].toLowerCase()===v)
  if(repo){window.open(repoUrl(repo[0]),"_blank");return true}
  return false
}
function runCmd(raw){
  const out=$("#cmdOutput")
  const input=raw.trim()
  appendConsole(out,cmdPath+">"+raw)
  if(!input){setCmdPrompt();return}
  const lower=input.toLowerCase()
  if(lower==="cls"){out.textContent="";setCmdPrompt();return}
  if(lower==="help"){
    appendConsole(out,"CD  DIR  CLS  ECHO  TYPE  START  VER  WHOAMI  HOSTNAME  DATE /T  TIME /T  EXPLORER  POWERSHELL  NOTEPAD  CALC  PRINT  EXIT")
  }else if(lower==="ver"){
    appendConsole(out,"Microsoft Windows [Version 6.1.7601]")
  }else if(lower==="whoami"){
    appendConsole(out,"eka-pc\\eka")
  }else if(lower==="hostname"){
    appendConsole(out,"EKA-PC")
  }else if(lower==="date /t"){
    appendConsole(out,localStamp().date)
  }else if(lower==="time /t"){
    appendConsole(out,localStamp().time)
  }else if(lower==="dir"||lower.startsWith("dir ")){
    appendConsole(out,` Directory of ${cmdPath}`)
    listText(cmdPath).split("\n").forEach(x=>appendConsole(out,x))
  }else if(lower==="cd"||lower==="chdir"){
    appendConsole(out,cmdPath)
  }else if(lower.startsWith("cd ")||lower.startsWith("chdir ")){
    const arg=input.replace(/^(cd|chdir)\s+/i,"")
    const next=changePath(cmdPath,arg)
    if(next)cmdPath=next
    else appendConsole(out,"The system cannot find the path specified.")
  }else if(lower.startsWith("echo ")){
    appendConsole(out,input.slice(5))
  }else if(lower.startsWith("type ")){
    const file=input.slice(5).trim().toLowerCase()
    if(["profile.txt","readme.md"].includes(file))profileFile().split("\n").forEach(x=>appendConsole(out,x))
    else appendConsole(out,"The system cannot find the file specified.")
  }else if(lower.startsWith("start ")){
    if(!launchName(input.slice(6)))appendConsole(out,"The system cannot find the file specified.")
  }else if(["explorer","explorer.exe"].includes(lower)){
    openTarget("thispc")
  }else if(["powershell","powershell.exe"].includes(lower)){
    openTarget("powershell")
  }else if(["notepad","notepad.exe"].includes(lower)){
    openTarget("notepad")
  }else if(["calc","calc.exe"].includes(lower)){
    openTarget("calculator")
  }else if(lower==="github"){
    window.open(PROFILE.github,"_blank")
  }else if(lower==="telegram"){
    window.open(PROFILE.telegramUrl,"_blank")
  }else if(lower==="print"){
    printProfile()
  }else if(lower==="exit"){
    closeApp("cmdWindow")
  }else{
    appendConsole(out,`'${input.split(/\s+/)[0]}' is not recognized as an internal or external command.`)
  }
  setCmdPrompt()
}

function runPowerShell(raw){
  const out=$("#psOutput")
  const input=raw.trim()
  appendConsole(out,"PS "+psPath+"> "+raw)
  if(!input){setPsPrompt();return}
  const lower=input.toLowerCase()
  if(["cls","clear-host"].includes(lower)){out.textContent="";setPsPrompt();return}
  if(["get-childitem","dir","ls"].includes(lower)){
    listText(psPath).split("\n").forEach(x=>appendConsole(out,x))
  }else if(lower==="get-location"||lower==="pwd"){
    appendConsole(out,psPath)
  }else if(lower.startsWith("set-location ")||lower.startsWith("cd ")){
    const arg=input.replace(/^(set-location|cd)\s+/i,"")
    const next=changePath(psPath,arg)
    if(next)psPath=next
    else appendConsole(out,`Set-Location : Cannot find path '${arg}'.`)
  }else if(lower==="get-date"){
    appendConsole(out,new Date().toString())
  }else if(lower.startsWith("get-content ")){
    const file=input.replace(/^get-content\s+/i,"").trim().toLowerCase()
    if(["profile.txt","readme.md"].includes(file))profileFile().split("\n").forEach(x=>appendConsole(out,x))
    else appendConsole(out,"Get-Content : Cannot find path.")
  }else if(lower==="$psversiontable"||lower==="$psversiontable.psversion"){
    appendConsole(out,"Name                           Value")
    appendConsole(out,"----                           -----")
    appendConsole(out,"PSVersion                      2.0")
    appendConsole(out,"CLRVersion                     2.0.50727")
    appendConsole(out,"BuildVersion                   6.1.7601")
  }else if(lower==="get-command"){
    appendConsole(out,"Get-ChildItem  Set-Location  Get-Location  Get-Date  Get-Content  Write-Output  Start-Process  Clear-Host")
  }else if(lower.startsWith("write-output ")){
    appendConsole(out,input.replace(/^write-output\s+/i,"").replace(/^["']|["']$/g,""))
  }else if(lower.startsWith("echo ")){
    appendConsole(out,input.slice(5))
  }else if(lower.startsWith("start-process ")){
    if(!launchName(input.replace(/^start-process\s+/i,"")))appendConsole(out,"Start-Process : The system cannot find the file specified.")
  }else if(lower==="whoami"){
    appendConsole(out,"eka-pc\\eka")
  }else if(lower==="cmd"){
    openTarget("cmd")
  }else if(lower==="notepad"){
    openTarget("notepad")
  }else if(lower==="explorer"){
    openTarget("thispc")
  }else if(lower==="github"){
    window.open(PROFILE.github,"_blank")
  }else if(lower==="telegram"){
    window.open(PROFILE.telegramUrl,"_blank")
  }else if(lower==="print"){
    printProfile()
  }else if(lower==="exit"){
    closeApp("psWindow")
  }else{
    appendConsole(out,`${input.split(/\s+/)[0]} : The term is not recognized as a cmdlet, function, script file, or operable program.`)
  }
  setPsPrompt()
}

function bindTerminals(){
  $("#cmdForm").addEventListener("submit",e=>{
    e.preventDefault()
    const i=$("#cmdInput")
    runCmd(i.value)
    i.value=""
  })
  $("#psForm").addEventListener("submit",e=>{
    e.preventDefault()
    const i=$("#psInput")
    runPowerShell(i.value)
    i.value=""
  })
}
