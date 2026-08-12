import{PROFILE,REPOSITORIES,profileText}from"./data.js"

const byId=id=>document.getElementById(id)
let active=false
let serial=1
let tearing=false
let printing=false

function nowText(){return new Intl.DateTimeFormat(undefined,{year:"numeric",month:"short",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(new Date())}

function receiptHtml(){
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

function setStatus(text,state="READY"){byId("statusText").textContent=text;byId("printerState").textContent=state}

function snapshot(){
  const node=document.createElement("div")
  node.className="torn-receipt arriving"
  node.innerHTML=`<div class="torn-summary"><span>GITHUB PROFILE RECEIPT</span><span>#${String(serial).padStart(3,"0")}</span></div><div>${PROFILE.name} · @${PROFILE.user}</div><div>${nowText()}</div><div class="mini-code">||| || | |||| | |||</div>`
  requestAnimationFrame(()=>node.classList.remove("arriving"))
  return node
}

export function tearReceipt(silent=false){
  if(!active||tearing||printing)return false
  tearing=true
  const receipt=byId("receipt")
  receipt.classList.add("tearing")
  byId("tearZone").classList.add("hidden")
  setStatus("Tearing along perforation...","TEAR")
  setTimeout(()=>{
    const stack=byId("tornStack")
    stack.prepend(snapshot())
    while(stack.children.length>4)stack.lastElementChild.remove()
    byId("printerZone").querySelector(".receipt-stage").classList.add("has-torn")
    receipt.className="receipt hidden"
    receipt.style.transform=""
    active=false
    tearing=false
    serial+=1
    setStatus(silent?"Previous receipt detached":"Receipt detached. Print another anytime.","READY")
  },430)
  return true
}

function beginPrint(){
  if(printing)return
  printing=true
  active=false
  const zone=byId("printerZone")
  const printer=zone.querySelector(".printer")
  const receipt=byId("receipt")
  byId("tearZone").classList.add("hidden")
  receipt.className="receipt hidden"
  printer.classList.add("printer-working")
  zone.classList.add("printing-active")
  setStatus("Warming thermal print head...","WARM")
  setTimeout(()=>{
    receipt.innerHTML=receiptHtml()
    receipt.className="receipt printing"
    active=true
    setStatus("Feeding and printing profile...","PRINT")
  },180)
  setTimeout(()=>{
    receipt.classList.remove("printing")
    printer.classList.remove("printer-working")
    zone.classList.remove("printing-active")
    byId("tearZone").classList.remove("hidden")
    printing=false
    setStatus("Printed. Pull down or click the perforation.","READY")
  },1560)
}

export function printReceipt(){
  if(printing)return
  if(active){
    if(tearReceipt(true))setTimeout(beginPrint,470)
    return
  }
  beginPrint()
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

export function initReceipt(){
  byId("printBtn").addEventListener("click",printReceipt)
  byId("txtBtn").addEventListener("click",()=>download("TheLouisMahdi-profile.txt",`${profileText()}\n${nowText()}\n`,"text/plain;charset=utf-8"))
  byId("copyBtn").addEventListener("click",async()=>{
    try{await navigator.clipboard.writeText(`${profileText()}\n${nowText()}`);setStatus("Profile copied to clipboard.","READY")}
    catch{setStatus("Clipboard permission was not available.","READY")}
  })
  byId("pdfBtn").addEventListener("click",()=>{if(!active)printReceipt();setTimeout(()=>window.print(),active?0:1650)})
  bindPull(byId("tearZone"),true)
  bindPull(byId("receipt"),false)
}
