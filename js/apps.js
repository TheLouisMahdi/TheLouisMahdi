import{profileText}from"./data.js"

const byId=id=>document.getElementById(id)

const buttons=[
  ["MC","memory-clear"],["MR","memory-read"],["M+","memory-add"],["M-","memory-sub"],["←","back"],
  ["CE","clear-entry"],["C","clear"],["±","sign"],["√","sqrt"],["÷","op"],
  ["7","digit"],["8","digit"],["9","digit"],["%","percent"],["×","op"],
  ["4","digit"],["5","digit"],["6","digit"],["1/x","inverse"],["−","op"],
  ["1","digit"],["2","digit"],["3","digit"],["=","equals"],["+","op"],
  ["0","digit"],[".","decimal"]
]

let value="0"
let stored=null
let operation=null
let fresh=true
let memory=0

function display(){byId("calcDisplay").value=value}
function number(){return Number(value)||0}

function calculate(){
  if(stored===null||!operation)return number()
  const right=number()
  if(operation==="+")return stored+right
  if(operation==="−")return stored-right
  if(operation==="×")return stored*right
  if(operation==="÷")return right===0?0:stored/right
  return right
}

function calcAction(label,type){
  if(type==="digit"){
    value=fresh?label:(value==="0"?label:value+label)
    fresh=false
  }
  if(type==="decimal"){
    if(fresh){value="0.";fresh=false}
    else if(!value.includes("."))value+="."
  }
  if(type==="op"){
    if(stored!==null&&!fresh)value=String(calculate())
    stored=number()
    operation=label
    fresh=true
  }
  if(type==="equals"){
    value=String(calculate())
    stored=null
    operation=null
    fresh=true
  }
  if(type==="clear"||type==="clear-entry"){value="0";if(type==="clear"){stored=null;operation=null}fresh=true}
  if(type==="back"&&!fresh){value=value.length>1?value.slice(0,-1):"0"}
  if(type==="sign")value=String(-number())
  if(type==="sqrt")value=String(Math.sqrt(Math.max(0,number())))
  if(type==="percent")value=String(number()/100)
  if(type==="inverse")value=String(number()===0?0:1/number())
  if(type==="memory-clear")memory=0
  if(type==="memory-read"){value=String(memory);fresh=true}
  if(type==="memory-add")memory+=number()
  if(type==="memory-sub")memory-=number()
  display()
}

function initCalculator(){
  const grid=byId("calcGrid")
  grid.innerHTML=buttons.map(([label,type])=>`<button data-calc-type="${type}" data-calc-label="${label}">${label}</button>`).join("")
  grid.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>calcAction(button.dataset.calcLabel,button.dataset.calcType)))
}

function downloadText(filename,text){
  const blob=new Blob([text],{type:"text/plain;charset=utf-8"})
  const url=URL.createObjectURL(blob)
  const link=document.createElement("a")
  link.href=url
  link.download=filename
  link.click()
  setTimeout(()=>URL.revokeObjectURL(url),1000)
}

function initNotepad(){
  byId("noteNew").addEventListener("click",()=>{
    byId("noteText").value=""
    byId("notepadTitle").textContent="Untitled - Notepad"
  })
  byId("noteProfile").addEventListener("click",()=>{
    byId("noteText").value=profileText()
    byId("notepadTitle").textContent="profile.txt - Notepad"
  })
  byId("noteSave").addEventListener("click",()=>downloadText("notepad.txt",byId("noteText").value))
}

function initRun(){
  const launch=value=>{
    const name=value.trim().toLowerCase().replace(".exe","")
    const apps={cmd:"cmd",powershell:"powershell",notepad:"notepad",calc:"calculator",calculator:"calculator",explorer:"explorer"}
    if(apps[name])window.dispatchEvent(new CustomEvent("win7:open-app",{detail:apps[name]}))
    else if(name==="github")window.open("https://github.com/TheLouisMahdi","_blank","noopener,noreferrer")
    else if(name==="telegram")window.open("https://t.me/thelouis_mahdi","_blank","noopener,noreferrer")
    else window.dispatchEvent(new CustomEvent("win7:toast",{detail:`Windows cannot find '${value}'.`}))
  }
  byId("runForm").addEventListener("submit",event=>{
    event.preventDefault()
    launch(byId("runInput").value)
    byId("runWindow").classList.add("hidden")
    byId("runInput").value=""
  })
  byId("runCancel").addEventListener("click",()=>byId("runWindow").classList.add("hidden"))
}

export function initApps(){
  initCalculator()
  initNotepad()
  initRun()
}
