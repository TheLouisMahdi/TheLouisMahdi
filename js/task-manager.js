import{closeWindow}from"./window-manager.js"

const byId=id=>document.getElementById(id)
let selected=null
let tab="applications"

const processes=[
  ["System Idle Process","SYSTEM","0","24 K"],["System","SYSTEM","1","1,820 K"],["dwm.exe","Eka","1","32,144 K"],["explorer.exe","Eka","2","41,212 K"],["taskmgr.exe","Eka","3","12,036 K"],["browser.exe","Eka","5","96,240 K"]
]
const services=[["AudioSrv","1200","Windows Audio","Running"],["BITS","904","Background Intelligent Transfer Service","Running"],["Themes","1120","Themes","Running"],["wuauserv","1068","Windows Update","Running"]]

function applications(){
  return [...document.querySelectorAll(".window:not(.hidden)")].filter(win=>win.id!=="taskmanagerWindow").map(win=>[win.id,win.querySelector(".window-title")?.textContent||win.dataset.app,"Running"])
}

function rows(values,columns,hideKey=true){
  return `<div class="task-row heading">${columns.map(name=>`<b>${name}</b>`).join("")}</div>${values.map(row=>`<button class="task-row" data-task-key="${row[0]}">${(hideKey?row.slice(1):row).map(value=>`<span>${value}</span>`).join("")}</button>`).join("")}`
}

function render(){
  selected=null
  byId("taskmanagerWindow").querySelectorAll("[data-taskmgr-tab]").forEach(button=>button.classList.toggle("active",button.dataset.taskmgrTab===tab))
  const list=byId("taskManagerList")
  if(tab==="applications")list.innerHTML=rows(applications(),["Task","Status"])
  if(tab==="processes")list.innerHTML=rows(processes,["Image Name","User Name","CPU","Memory"],false)
  if(tab==="services")list.innerHTML=rows(services,["Name","PID","Description","Status"],false)
  if(tab==="performance")list.innerHTML=`<div class="task-performance"><section><h3>CPU Usage</h3><b>${Math.floor(4+Math.random()*9)}%</b></section><section><h3>Memory</h3><b>1.32 GB</b></section><div class="task-graph">${Array.from({length:34},()=>`<i style="height:${8+Math.random()*72}%"></i>`).join("")}</div><dl><dt>Handles</dt><dd>9,842</dd><dt>Threads</dt><dd>472</dd><dt>Processes</dt><dd>31</dd><dt>Up Time</dt><dd>0:02:17:41</dd></dl><button data-generic-app="Resource Monitor">Resource Monitor...</button></div>`
  if(tab==="networking")list.innerHTML=`<div class="task-network"><h3>Wireless Network Connection</h3><div class="task-graph">${Array.from({length:34},()=>`<i style="height:${4+Math.random()*36}%"></i>`).join("")}</div><p>Adapter Name: EKA Wireless Adapter · Link Speed: 300 Mbps · State: Connected</p></div>`
  if(tab==="users")list.innerHTML=rows([["Eka","1","Active","Console"]],["User","ID","Status","Client Name"],false)
  byId("endTask").textContent=tab==="processes"?"End Process":tab==="services"?"Services...":tab==="users"?"Logoff":"End Task"
  byId("taskManagerStatus").textContent=`Processes: ${processes.length+25} · CPU Usage: ${Math.floor(4+Math.random()*10)}% · Physical Memory: 34%`
}

export function initDetailedTaskManager(){
  const win=byId("taskmanagerWindow")
  win.querySelector(".taskmgr-tabs").addEventListener("click",event=>{const next=event.target.closest("[data-taskmgr-tab]")?.dataset.taskmgrTab;if(next){tab=next;render()}})
  byId("taskManagerList").addEventListener("click",event=>{const row=event.target.closest("[data-task-key]");if(!row)return;selected=row.dataset.taskKey;byId("taskManagerList").querySelectorAll("button").forEach(button=>button.classList.toggle("selected",button===row))})
  byId("endTask").addEventListener("click",()=>{
    if(tab==="applications"&&selected){const target=byId(selected);if(target)closeWindow(target);render();return}
    if(tab==="services"){window.dispatchEvent(new CustomEvent("win7:open-generic",{detail:"Services"}));return}
    if(tab==="processes"&&selected){const index=processes.findIndex(row=>row[0]===selected);if(index>1)processes.splice(index,1);render();return}
    if(tab==="users"&&selected)window.dispatchEvent(new CustomEvent("win7:toast",{detail:"The active console user cannot be logged off from this view."}))
  })
  byId("taskManagerNewTask").addEventListener("click",()=>window.dispatchEvent(new CustomEvent("win7:open-app",{detail:"run"})))
  window.addEventListener("win7:open-app",event=>{if(event.detail==="taskmanager")setTimeout(render,0)})
  window.addEventListener("win7:window-state",()=>{if(!win.classList.contains("hidden"))setTimeout(render,0)})
  render()
}
