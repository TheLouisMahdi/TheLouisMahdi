import{PROFILE,REPOSITORIES,profileText}from"./data.js"

const byId=id=>document.getElementById(id)
let active=false
let serial=1
let tearing=false

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
  node.className="torn-receipt"
  node.innerHTML=`<div class="torn-summary"><span>GITHUB PROFILE RECEIPT</span><span>#${String(serial).padStart(3,"0")}</span></div><div>${PROFILE.name} · @${PROFILE.user}</div><div>${nowText()}</div>`
  return node
}

export function tearReceipt(silent=false){
  if(!active||tearing)return false
  tearing=true
  const receipt=byId("receipt")
  receipt.classList.add("tearing")
  setStatus("Tearing receipt...","TEAR")
  setTimeout(()=>{
    const stack=byId("tornStack")
    stack.prepend(snapshot())
    while(stack.children.length>3)stack.lastElementChild.remove()
    byId("printerZone").querySelector(".receipt-stage").classList.add("has-torn")
    receipt.className="receipt hidden"
    byId("tearZone").classList.add("hidden")
    active=false
    tearing=false
    serial+=1
    setStatus(silent?"Previous receipt saved in torn stack":"Receipt detached. Print another anytime.","READY")
  },330)
  return true
}

export function printReceipt(){
  const start=()=>{
    const receipt=byId("receipt")
    receipt.innerHTML=receiptHtml()
    receipt.className="receipt printing"
    byId("tearZone").classList.remove("hidden")
    active=true
    setStatus("Printing GitHub profile...","PRINT")
    setTimeout(()=>{receipt.classList.remove("printing");setStatus("Printed. Pull or click the tear line.","READY")},760)
  }
  if(active){tearReceipt(true);setTimeout(start,360)}else start()
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

function bindTearGesture(){
  const zone=byId("tearZone")
  let startY=0
  let dragging=false
  zone.addEventListener("pointerdown",event=>{dragging=true;startY=event.clientY;zone.setPointerCapture(event.pointerId)})
  zone.addEventListener("pointermove",event=>{
    if(!dragging||!active)return
    const delta=Math.max(0,event.clientY-startY)
    byId("receipt").style.transform=`translateY(${Math.min(18,delta*.25)}px) rotate(${Math.min(1.5,delta*.02)}deg)`
  })
  zone.addEventListener("pointerup",event=>{const delta=event.clientY-startY;dragging=false;byId("receipt").style.transform="";if(delta>24)tearReceipt()})
  zone.addEventListener("click",()=>tearReceipt())
}

export function initReceipt(){
  byId("printBtn").addEventListener("click",printReceipt)
  byId("txtBtn").addEventListener("click",()=>download("TheLouisMahdi-profile.txt",`${profileText()}\n${nowText()}\n`,"text/plain;charset=utf-8"))
  byId("copyBtn").addEventListener("click",async()=>{
    try{await navigator.clipboard.writeText(`${profileText()}\n${nowText()}`);setStatus("Profile copied to clipboard.","READY")}
    catch{setStatus("Clipboard permission was not available.","READY")}
  })
  byId("pdfBtn").addEventListener("click",()=>{if(!active)printReceipt();setTimeout(()=>window.print(),active?0:800)})
  bindTearGesture()
}
