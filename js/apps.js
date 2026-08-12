function initNotepad(){
  const saved=localStorage.getItem("eka-notepad")
  $("#noteText").value=saved||profileFile()
  $("#noteSave").addEventListener("click",()=>{
    localStorage.setItem("eka-notepad",$("#noteText").value)
    toast("Saved")
  })
  $("#noteNew").addEventListener("click",()=>$("#noteText").value="")
  $("#noteProfile").addEventListener("click",()=>$("#noteText").value=profileFile())
}

function initCalculator(){
  const keys=["7","8","9","÷","4","5","6","×","1","2","3","−","0",".","=","+","C","±","%","⌫"]
  $("#calcGrid").innerHTML=keys.map(k=>`<button data-key="${k}">${k}</button>`).join("")
  $("#calcGrid").addEventListener("click",e=>{
    const b=e.target.closest("[data-key]")
    if(!b)return
    calcPress(b.dataset.key)
  })
}

function calcPress(key){
  const d=$("#calcDisplay")
  if(/[0-9.]/.test(key)){
    if(key==="."&&calcValue.includes("."))return
    calcValue=calcValue==="0"&&key!=="."?key:calcValue+key
  }else if(["+","−","×","÷"].includes(key)){
    calcStored=Number(calcValue)
    calcOp=key
    calcValue="0"
  }else if(key==="="&&calcStored!==null&&calcOp){
    const n=Number(calcValue)
    const map={"+":()=>calcStored+n,"−":()=>calcStored-n,"×":()=>calcStored*n,"÷":()=>n===0?0:calcStored/n}
    calcValue=String(map[calcOp]())
    calcStored=null
    calcOp=null
  }else if(key==="C"){
    calcValue="0";calcStored=null;calcOp=null
  }else if(key==="±"){
    calcValue=String(-Number(calcValue))
  }else if(key==="%"){
    calcValue=String(Number(calcValue)/100)
  }else if(key==="⌫"){
    calcValue=calcValue.length>1?calcValue.slice(0,-1):"0"
  }
  d.value=calcValue
}

function initControlPanel(){
  document.querySelectorAll("[data-wallpaper]").forEach(b=>b.addEventListener("click",()=>{
    UI.desktop.classList.remove("wallpaper-aurora","wallpaper-dark")
    if(b.dataset.wallpaper==="aurora")UI.desktop.classList.add("wallpaper-aurora")
    if(b.dataset.wallpaper==="dark")UI.desktop.classList.add("wallpaper-dark")
  }))
  $("#aeroToggle").addEventListener("change",e=>document.body.classList.toggle("no-aero",!e.target.checked))
  setInterval(()=>$("#controlClock").textContent=new Date().toLocaleString(),1000)
}

function runProgram(value){
  const v=value.trim()
  if(!v)return
  if(!launchName(v))toast("Windows cannot find '"+v+"'.")
  closeApp("runWindow")
}

function initRun(){
  $("#runForm").addEventListener("submit",e=>{
    e.preventDefault()
    runProgram($("#runInput").value)
    $("#runInput").value=""
  })
  $("#runCancel").addEventListener("click",()=>closeApp("runWindow"))
}

function powerOff(){
  closeStart()
  const overlay=$("#powerOverlay")
  overlay.classList.remove("hidden")
  $("#powerLogo").innerHTML=svg.windows()
  $("#powerText").textContent="Shutting down..."
  $("#powerButton").classList.add("hidden")
  setTimeout(()=>{
    $("#powerText").textContent=""
    $("#powerLogo").innerHTML=""
    $("#powerButton").classList.remove("hidden")
  },1200)
}

function initPower(){
  document.querySelector(".shutdown-arrow").addEventListener("click",powerOff)
  $("#powerButton").addEventListener("click",()=>{
    $("#powerOverlay").classList.add("hidden")
    $("#powerButton").classList.add("hidden")
  })
}

function resetPrintAfterTear(){
  const receipt=$("#receipt")
  receipt.classList.add("tearing")
  receipt.style.transform="translateY(-103%)"
  UI.screen.classList.remove("done","busy")
  UI.zone.classList.remove("finished","printing")
  UI.print.disabled=false
  UI.status.textContent="Ready to print GitHub profile"
  UI.printerState.textContent="IDLE"
  setTimeout(()=>{
    receipt.style.transform=""
    receipt.classList.remove("tearing")
  },60)
}

function tearReceipt(){
  if(!UI.zone.classList.contains("finished")||tearTriggered)return
  tearTriggered=true
  const receipt=$("#receipt")
  const clone=receipt.cloneNode(true)
  clone.removeAttribute("id")
  clone.classList.add("torn-receipt")
  clone.style.transform="none"
  $("#tornStack").appendChild(clone)
  navigator.vibrate?.(20)
  resetPrintAfterTear()
  setTimeout(()=>{
    clone.remove()
    tearTriggered=false
  },1100)
}

function initTear(){
  const zone=$("#tearZone")
  zone.addEventListener("click",tearReceipt)
  zone.addEventListener("pointerdown",e=>{
    tearStartY=e.clientY
    tearTriggered=false
    zone.setPointerCapture?.(e.pointerId)
  })
  zone.addEventListener("pointermove",e=>{
    if(tearStartY&&e.clientY-tearStartY>38)tearReceipt()
  })
  zone.addEventListener("pointerup",()=>tearStartY=0)
}

function initTasks(){
  $("#taskCmd").addEventListener("click",()=>toggleApp("cmdWindow"))
  $("#taskPowerShell").addEventListener("click",()=>toggleApp("psWindow"))
  $("#devicePrint").addEventListener("click",printProfile)
}

function initSearch(){
  $("#searchBox").addEventListener("keydown",e=>{
    if(e.key!=="Enter")return
    const q=e.target.value.trim().toLowerCase()
    const map=[
      ["command","cmd"],["cmd","cmd"],["powershell","powershell"],["notepad","notepad"],
      ["calculator","calculator"],["calc","calculator"],["control","control"],["run","run"],
      ["github","github"],["telegram","telegram"],["computer","thispc"],["project","projects"]
    ]
    const hit=map.find(x=>q.includes(x[0]))
    if(hit){e.preventDefault();openTarget(hit[1]);closeStart()}
  })
}

function initAppShortcuts(){
  $("#runBtn").addEventListener("click",()=>openTarget("run"))
  document.addEventListener("keydown",e=>{
    if(e.ctrlKey&&e.key.toLowerCase()==="l"){e.preventDefault();showDesktop()}
  })
}
