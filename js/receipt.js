import{PROFILE,REPOSITORIES,profileText}from"./data.js"
import{escapeHtml}from"./html.js"

const byId=id=>document.getElementById(id)
let active=false
let serial=1
let tearing=false
let printing=false
let feedAnimations=[]
let currentJob={kind:"profile",name:"GitHub Profile",text:""}

function nowText(){return new Intl.DateTimeFormat(undefined,{year:"numeric",month:"short",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(new Date())}

function receiptHtml(){
  if(currentJob.kind==="document")return `<div class="receipt-header"><div class="receipt-gh">TXT</div><strong>NOTEPAD PRINT JOB</strong><small>${escapeHtml(currentJob.name)}</small></div><div class="receipt-section"><pre style="white-space:pre-wrap;word-break:break-word;margin:0;font:10px/1.45 Consolas,monospace">${escapeHtml(currentJob.text)}</pre></div><div class="receipt-total">EKA LOCAL PRINTER · JOB #${String(serial).padStart(3,"0")}</div><div class="receipt-time">${nowText()}</div><div class="receipt-code">|| ||| | |||| || | |||</div>`
  return `<div class="receipt-header"><div class="receipt-gh">GH</div><strong>GITHUB PROFILE RECEIPT</strong><small>@${PROFILE.user}</small></div>
  <div class="receipt-section">
    <div class="receipt-row"><span>NAME</span><span>${PROFILE.name}</span></div>
    <div class="receipt-row"><span>USER</span><span>@${PROFILE.user}</span></div>
    <div class="receipt-row"><span>ROLE</span><span>EE Student</span></div>
    <div class="receipt-row"><span>UNIVERSITY</span><span>${PROFILE.university}</span></div>
    <div class="receipt-row"><span>TELEGRAM</span><span>${PROFILE.telegram}</span></div>
  </div>
  <div class="receipt-section"><strong>SELECTED REPOSITORIES</strong>${REPOSITORIES.map(repo=>`<div class="receipt-project">${repo.name}</div>`).join("")}</div>
  <div class="receipt-section">
    <div class="receipt-row"><span>STACK</span><span>Python / C / Verilog</span></div>
    <div class="receipt-row"><span>HARDWARE</span><span>STM32 / FPGA / Zynq</span></div>
    <div class="receipt-row"><span>GITHUB</span><span>TheLouisMahdi</span></div>
  </div>
  <div class="receipt-total">EKA @GITHUB · PROFILE #${String(serial).padStart(3,"0")}</div><div class="receipt-time">${nowText()}</div><div class="receipt-code">|| ||| | |||| || | |||</div>`
}

function setStatus(text,state="READY"){
  byId("statusText").textContent=text
  byId("printerState").textContent=state
  const printer=byId("printerZone").querySelector(".printer")
  printer.classList.toggle("printer-done",state==="READY"&&active)
  if(state==="WAIT"||state==="TEAR"||!active)printer.classList.remove("printer-done")
}

function rememberTornReceipt(){
  const stack=byId("tornStack")
  const torn=document.createElement("div")
  torn.className="torn-receipt"
  const label=currentJob.kind==="document"?escapeHtml(currentJob.name):`@${PROFILE.user}`
  torn.innerHTML=`<div class="torn-summary"><span>${currentJob.kind==="document"?"PRINT JOB":"PROFILE"} #${String(serial).padStart(3,"0")}</span><span>${label}</span></div><div>${currentJob.kind==="document"?"Notepad document":PROFILE.name}</div><div>${nowText()}</div>`
  stack.prepend(torn)
  while(stack.children.length>3)stack.lastElementChild?.remove()
}

export function tearReceipt(silent=false){
  if(!active||tearing||printing)return false
  tearing=true
  const receipt=byId("receipt")
  receipt.classList.add("tearing")
  byId("tearZone").classList.add("hidden")
  setStatus("Tearing along perforation...","TEAR")
  setTimeout(()=>{
    rememberTornReceipt()
    const stage=byId("printerZone").querySelector(".receipt-stage")
    stage.classList.remove("receipt-ready")
    stage.classList.add("has-torn")
    stage.style.height=""
    receipt.className="receipt hidden"
    receipt.style.transform=""
    active=false
    tearing=false
    serial+=1
    setStatus(silent?"Receipt detached":"Receipt detached. The paper path is clear.","READY")
  },620)
  return true
}

function notifyReady(){window.dispatchEvent(new Event("win7:receipt-ready"))}

function beginPrint(){
  if(printing)return
  printing=true
  active=false
  const zone=byId("printerZone")
  const printer=zone.querySelector(".printer")
  const receipt=byId("receipt")
  const stage=zone.querySelector(".receipt-stage")
  const controls=[zone.querySelector(".printer-actions"),zone.querySelector(".printer-status")]
  feedAnimations.forEach(animation=>animation.cancel())
  feedAnimations=[]
  stage.classList.remove("receipt-ready","has-torn")
  stage.style.height="0px"
  byId("tearZone").classList.add("hidden")
  receipt.className="receipt hidden"
  printer.classList.add("printer-working")
  printer.classList.remove("printer-done")
  zone.classList.add("printing-active")
  setStatus("Warming thermal print head...","WARM")
  setTimeout(()=>{
    receipt.innerHTML=receiptHtml()
    receipt.className="receipt printing"
    receipt.style.transform="translate3d(0,-100%,0)"
    const height=receipt.getBoundingClientRect().height
    const targetHeight=height+31,timing={duration:4680,easing:"linear",fill:"forwards"}
    controls.forEach(node=>node.style.transform=`translate3d(0,-${targetHeight}px,0)`)
    stage.style.height=`${targetHeight}px`
    if(receipt.animate)feedAnimations=[
      receipt.animate([{transform:"translate3d(0,-100%,0)"},{transform:"translate3d(0,0,0)"}],timing),
      ...controls.map(node=>node.animate([{transform:`translate3d(0,-${targetHeight}px,0)`},{transform:"translate3d(0,0,0)"}],timing))
    ];else{receipt.style.transform="translate3d(0,0,0)";controls.forEach(node=>node.style.transform="")}
    setStatus("Feeding and printing profile...","PRINT")
  },520)
  setTimeout(()=>{
    feedAnimations.forEach(animation=>animation.finish())
    feedAnimations=[]
    receipt.classList.remove("printing")
    receipt.style.transform=""
    controls.forEach(node=>node.style.transform="")
    stage.style.height=""
    stage.classList.add("receipt-ready")
    printer.classList.remove("printer-working")
    printer.classList.add("printer-done")
    zone.classList.remove("printing-active")
    byId("tearZone").classList.remove("hidden")
    printing=false
    active=true
    setStatus("Printed. Pull down or click the perforation.","READY")
    notifyReady()
  },5200)
}

export function printReceipt(){
  if(printing)return false
  if(active){setStatus("Tear the current receipt before printing another.","WAIT");return false}
  currentJob={kind:"profile",name:"GitHub Profile",text:profileText()}
  beginPrint()
  return true
}

export function printTextDocument(name,text){
  if(printing)return false
  if(active){setStatus("Tear the current receipt before printing another.","WAIT");return false}
  currentJob={kind:"document",name:String(name||"Untitled.txt"),text:String(text||"")}
  beginPrint()
  return true
}

function download(name,content,type){
  const blob=new Blob([content],{type})
  const url=URL.createObjectURL(blob)
  const link=document.createElement("a")
  link.href=url
  link.download=name
  link.click()
  setTimeout(()=>URL.revokeObjectURL(url),1000)
}

function bindPull(target,clickTears=false){
  let startY=0
  let dragging=false
  let moved=false
  target.addEventListener("pointerdown",event=>{
    if(!active||printing)return
    dragging=true
    moved=false
    startY=event.clientY
    target.setPointerCapture?.(event.pointerId)
  })
  target.addEventListener("pointermove",event=>{
    if(!dragging||!active||printing)return
    const delta=Math.max(0,event.clientY-startY)
    moved=moved||delta>4
    byId("receipt").style.transform=`translateY(${Math.min(24,delta*.28)}px) rotate(${Math.min(1.8,delta*.018)}deg)`
    byId("printerState").textContent=delta>28?"RELEASE":"PULL"
  })
  target.addEventListener("pointerup",event=>{
    if(!dragging)return
    const delta=event.clientY-startY
    dragging=false
    byId("receipt").style.transform=""
    if(delta>28)tearReceipt()
    else if(clickTears&&!moved)tearReceipt()
    else if(active)setStatus("Printed. Pull down or click the perforation.","READY")
  })
  target.addEventListener("pointercancel",()=>{dragging=false;byId("receipt").style.transform=""})
}

function printPdfWhenReady(){
  if(active&&!printing){window.print();return}
  window.addEventListener("win7:receipt-ready",()=>window.print(),{once:true})
  if(!printing)printReceipt()
}

export function initReceipt(){
  byId("printBtn").addEventListener("click",printReceipt)
  byId("txtBtn").addEventListener("click",()=>download("TheLouisMahdi-profile.txt",`${profileText()}\n${nowText()}\n`,"text/plain;charset=utf-8"))
  byId("copyBtn").addEventListener("click",async()=>{
    try{await navigator.clipboard.writeText(`${profileText()}\n${nowText()}`);setStatus("Profile copied to clipboard.","READY")}
    catch{setStatus("Clipboard permission was not available.","READY")}
  })
  byId("pdfBtn").addEventListener("click",printPdfWhenReady)
  bindPull(byId("tearZone"),true)
  bindPull(byId("receipt"),false)
  window.addEventListener("win7:print-profile",printReceipt)
  window.addEventListener("win7:print-document",event=>printTextDocument(event.detail?.name,event.detail?.text))
}
