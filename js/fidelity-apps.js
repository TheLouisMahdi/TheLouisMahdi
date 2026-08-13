import{icon}from"./icons.js"
import{openWindow}from"./window-manager.js"
import{requestElevation}from"./uac.js"

const byId=id=>document.getElementById(id)
const toast=text=>window.dispatchEvent(new CustomEvent("win7:toast",{detail:text}))

const APPS={
  "Private Character Editor":{kind:"ink",text:"Select a private-use code, then draw a custom character on the pixel grid.",tools:["Pencil","Brush","Straight Line","Rectangle","Ellipse","Selection","Eraser"]},
  "Windows Journal":{kind:"ink",text:"Write or type a Journal note. Pages, pen settings and flags stay inside this session.",tools:["Pen","Highlighter","Eraser","Selection","Text Box","Flag"]},
  "Math Input Panel":{kind:"ink",text:"Write a mathematical expression, correct recognition, then insert it into a compatible program.",tools:["Write","Erase","Select and Correct","Clear","Undo","Redo","Insert"]},
  "Tablet PC Input Panel":{kind:"ink",text:"Use the writing pad, character pad or on-screen keyboard to enter text.",tools:["Writing Pad","Character Pad","On-Screen Keyboard","Insert"]},
  "Sound Recorder":{kind:"recorder",text:"Record audio from the selected microphone and save it as a Windows Media Audio file."},
  Magnifier:{kind:"magnifier",text:"Magnify the desktop in Full screen, Lens or Docked view."},
  Narrator:{kind:"utility",text:"Narrator reads focused controls and typed characters using an installed Windows voice.",tabs:["Main","Voice Settings"],actions:["Start Narrator","Exit"]},
  "Speech Recognition":{kind:"utility",text:"Control Windows and dictate text with speech commands.",tabs:["Listening","Sleeping","Off"],actions:["Set up microphone","Open Speech Dictionary","Train your computer"]},
  "Remote Desktop Connection":{kind:"wizard",text:"Connect to another Windows computer using Remote Desktop.",fields:["Computer","User name"],actions:["Connect","Options"]},
  "Windows Remote Assistance":{kind:"wizard",text:"Invite someone you trust to help you or respond to an invitation.",actions:["Invite someone you trust","Help someone who has invited you"]},
  "Windows PowerShell ISE":{kind:"ise",text:"Edit and run Windows PowerShell 2.0 scripts."},
  "Windows Media Center":{kind:"utility",text:"Enjoy pictures, music, video and recorded TV in the ten-foot Media Center interface.",tabs:["Pictures + Videos","Music","Movies","TV"],actions:["Open Media Center"]},
  "Windows DVD Maker":{kind:"wizard",text:"Add pictures and videos, choose a DVD menu, then burn a video DVD.",actions:["Add items","Next"]},
  "Windows Fax and Scan":{kind:"utility",text:"Send and receive faxes or scan documents from attached devices.",tabs:["Fax","Scan"],actions:["New Fax","New Scan"]},
  "XPS Viewer":{kind:"utility",text:"View, search, sign and set permissions on XPS documents.",tabs:["File","Permissions","Signatures","View"],actions:["Open XPS document"]},
  "Connect to a Projector":{kind:"projector",text:"Choose how Windows should use the connected display."},
  "Connect to a Network Projector":{kind:"wizard",text:"Search for a network projector or enter its network address.",fields:["Projector address"],actions:["Search for a projector","Connect"]},
  "Sync Center":{kind:"utility",text:"Manage offline files and synchronization partnerships.",tabs:["Sync partnerships","Sync results","Sync conflicts"],actions:["Sync All"]},
  "Windows Mobility Center":{kind:"mobility",text:"Adjust common mobile PC settings in one place."},
  "Disk Cleanup":{kind:"cleanup",text:"Select files that can be safely removed from Local Disk (C:)."},
  "Disk Defragmenter":{kind:"utility",text:"Consolidate fragmented files and schedule disk optimization.",tabs:["Current status","Schedule"],actions:["Analyze disk","Defragment disk"]},
  "Resource Monitor":{kind:"monitor",text:"Monitor CPU, memory, disk and network activity in real time.",tabs:["Overview","CPU","Memory","Disk","Network"]},
  "System Restore":{kind:"wizard",text:"Restore system files and settings without affecting personal documents.",actions:["Recommended restore","Choose a different restore point","Next"]},
  "Windows Easy Transfer":{kind:"wizard",text:"Transfer user accounts, documents, pictures, music and settings from another computer.",actions:["An Easy Transfer cable","A network","An external hard disk or USB flash drive"]},
  "Create a System Repair Disc":{kind:"wizard",text:"Create a bootable disc containing Windows recovery tools.",fields:["Drive"],actions:["Create disc"]},
  "Task Scheduler":{kind:"mmc",text:"Create and manage tasks that run automatically at selected times or events.",nodes:["Task Scheduler Library","Microsoft","Windows"],actions:["Create Basic Task...","Create Task...","Import Task..."]},
  "Computer Management":{kind:"mmc",text:"Manage system tools, storage, services and applications.",nodes:["System Tools","Storage","Services and Applications"],actions:["View","Refresh","Help"]},
  "Device Manager":{kind:"mmc",text:"View hardware by type and manage drivers and device status.",nodes:["Batteries","Display adapters","Disk drives","Human Interface Devices","Network adapters","Processors","Sound, video and game controllers"],actions:["Scan for hardware changes","Properties"]},
  "Disk Management":{kind:"mmc",text:"Manage volumes, drive letters and virtual hard disks.",nodes:["Disk 0 · Basic · 118 GB · Online","System Reserved · 100 MB","Windows (C:) · 117.9 GB NTFS"],actions:["Rescan Disks","Create VHD","Attach VHD"]},
  "Event Viewer":{kind:"mmc",text:"Browse Windows logs and application or system events.",nodes:["Custom Views","Windows Logs","Applications and Services Logs","Subscriptions"],actions:["Open Saved Log...","Create Custom View...","Clear Log..."]},
  Services:{kind:"mmc",text:"Start, stop and configure Windows services.",nodes:["Application Information · Running","Background Intelligent Transfer Service · Running","Themes · Running","Windows Audio · Running","Windows Update · Running"],actions:["Start","Stop","Restart"]},
  "Performance Monitor":{kind:"monitor",text:"Collect and graph Windows performance counters.",tabs:["Performance Monitor","Data Collector Sets","Reports"]},
  "System Information":{kind:"mmc",text:"View a comprehensive summary of hardware resources, components and software environment.",nodes:["System Summary","Hardware Resources","Components","Software Environment"],actions:["Find...","Export..."]},
  "System Configuration":{kind:"utility",text:"Choose startup modes, services, boot options and diagnostic tools.",tabs:["General","Boot","Services","Startup","Tools"],actions:["OK","Apply"]},
  "Registry Editor":{kind:"mmc",text:"Inspect the simulated Windows registry hierarchy. Changes are not written to the real device.",nodes:["HKEY_CLASSES_ROOT","HKEY_CURRENT_USER","HKEY_LOCAL_MACHINE","HKEY_USERS","HKEY_CURRENT_CONFIG"],actions:["Find...","Export..."]},
  "Local Group Policy Editor":{kind:"mmc",text:"Configure computer and user policies.",nodes:["Computer Configuration","User Configuration","Administrative Templates"],actions:["Filter Options...","Help"]},
  "Local Security Policy":{kind:"mmc",text:"Configure account policies, local policies and firewall rules.",nodes:["Account Policies","Local Policies","Windows Firewall with Advanced Security","Public Key Policies"],actions:["Export List...","Help"]},
  "Windows Firewall with Advanced Security":{kind:"mmc",text:"Manage inbound, outbound and connection security rules.",nodes:["Inbound Rules","Outbound Rules","Connection Security Rules","Monitoring"],actions:["New Rule...","Filter by Profile"]},
  "Print Management":{kind:"mmc",text:"Manage printers, drivers, forms and ports.",nodes:["Print Servers","EKA-PC","Drivers","Ports","Printers"],actions:["Add Printer...","Add Driver..."]},
  "Component Services":{kind:"mmc",text:"Configure COM+ applications, DCOM and distributed transactions.",nodes:["Component Services","Computers","My Computer","COM+ Applications","DCOM Config"]},
  "Data Sources (ODBC)":{kind:"utility",text:"Configure 32-bit user, system and file data sources.",tabs:["User DSN","System DSN","File DSN","Drivers","Tracing","Connection Pooling","About"],actions:["Add...","Configure..."]},
  "Windows Memory Diagnostic":{kind:"wizard",text:"Check the computer for memory problems.",actions:["Restart now and check for problems","Check for problems the next time I start my computer"]}
}

const startNames=["Private Character Editor","Windows Journal","Math Input Panel","Tablet PC Input Panel","Sound Recorder","Magnifier","Narrator","Speech Recognition","Remote Desktop Connection","Windows Remote Assistance","Windows PowerShell ISE","Windows Media Center","Windows DVD Maker","Windows Fax and Scan","XPS Viewer","Connect to a Projector","Connect to a Network Projector","Sync Center","Windows Mobility Center","Disk Cleanup","Disk Defragmenter","Resource Monitor","System Restore","Windows Easy Transfer","Create a System Repair Disc","Task Scheduler","Computer Management","Device Manager","Disk Management","Event Viewer","Services","Performance Monitor","System Information","System Configuration","Registry Editor","Local Group Policy Editor","Local Security Policy","Windows Firewall with Advanced Security","Print Management","Component Services","Data Sources (ODBC)","Windows Memory Diagnostic"]
const elevated=new Set(["Computer Management","Device Manager","Disk Management","Services","System Configuration","Registry Editor","Local Group Policy Editor","Local Security Policy","Windows Firewall with Advanced Security","Print Management","Component Services"])

function controls(){return `<div class="win-controls"><button class="win-control" data-window-action="min">_</button><button class="win-control" data-window-action="max">□</button><button class="win-control close" data-window-action="close">×</button></div>`}

function mountWindow(){
  const section=document.createElement("section")
  section.id="fidelityWindow"
  section.className="window fidelity-window hidden"
  section.dataset.app="accessory"
  section.innerHTML=`<div class="titlebar" data-drag-handle><div class="title-left"><span class="title-mini">${icon("system")}</span><span class="window-title" id="fidelityTitle">Windows Accessory</span></div>${controls()}</div><div class="fidelity-body" id="fidelityBody"></div>`
  byId("desktop").appendChild(section)
}

function tabs(items=[]){return items.length?`<div class="fidelity-tabs">${items.map((name,index)=>`<button class="${index?"":"active"}" data-fidelity-tab="${name}">${name}</button>`).join("")}</div>`:""}
function actions(items=[]){return items.length?`<div class="fidelity-actions">${items.map((name,index)=>`<button class="${index?"":"primary"}" data-fidelity-action="${name}">${name}</button>`).join("")}</div>`:""}

function content(name,app){
  if(app.kind==="projector")return `<div class="projector-chooser"><h2>Connect to a Projector</h2>${[["computer","Computer only"],["duplicate","Duplicate"],["extend","Extend"],["projector","Projector only"]].map(([mode,label])=>`<button data-projector-mode="${mode}"><i>${icon("computer")}</i><b>${label}</b><small>Win+P</small></button>`).join("")}</div>`
  if(app.kind==="magnifier")return `<div class="magnifier-toolbar"><button data-magnifier="out">−</button><strong id="magnifierValue">100%</strong><button data-magnifier="in">＋</button><select id="magnifierView"><option>Full screen</option><option>Lens</option><option>Docked</option></select><label><input id="magnifierInvert" type="checkbox"> Invert colors</label></div><p>${app.text}</p>`
  if(app.kind==="recorder")return `<div class="recorder"><div class="recorder-display"><span id="recorderTime">00:00:00</span><i id="recorderLevel"></i></div><button data-recorder>Start Recording</button><p>${app.text}</p></div>`
  if(app.kind==="ise")return `${tabs(["Untitled1.ps1"])}<div class="ise-toolbar"><button data-ise-run>▶ Run Script</button><button>■ Stop</button></div><textarea id="iseEditor" spellcheck="false">Get-Process | Sort-Object CPU -Descending\nWrite-Output "EKA-PC · Windows 7 Professional x86"</textarea><pre id="iseOutput">PS C:\\Users\\Eka&gt; </pre>`
  if(app.kind==="mmc")return `<div class="mmc-menu">File · Action · View · Help</div><div class="mmc-shell"><aside><strong>Console Root</strong>${(app.nodes||[]).map(node=>`<button>▸ ${node}</button>`).join("")}</aside><main><h3>${name}</h3><p>${app.text}</p><div class="mmc-table"><b>Name</b><b>Status / Description</b>${(app.nodes||[]).map(node=>`<span>${node}</span><span>Ready</span>`).join("")}</div></main><nav>${(app.actions||[]).map(action=>`<button data-fidelity-action="${action}">${action}</button>`).join("")}</nav></div>`
  if(app.kind==="monitor")return `${tabs(app.tabs)}<div class="monitor-grid"><section><h3>${name}</h3><p>${app.text}</p><div class="monitor-table"><b>Image</b><b>CPU</b><b>Memory</b><span>explorer.exe</span><span>2%</span><span>41 MB</span><span>browser</span><span>5%</span><span>96 MB</span></div></section><div class="monitor-chart"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>`
  if(app.kind==="cleanup")return `<h2>Disk Cleanup for Windows (C:)</h2><p>${app.text}</p><div class="cleanup-list">${[["Downloaded Program Files","0 bytes"],["Temporary Internet Files","24.6 MB"],["Recycle Bin","0 bytes"],["Temporary files","118 MB"],["Thumbnails","31.4 MB"]].map(([label,size])=>`<label><input type="checkbox" checked> <span>${label}</span><b>${size}</b></label>`).join("")}</div><p>Total amount of disk space you gain: <strong id="cleanupTotal">174 MB</strong></p>${actions(["OK","Cancel"])}`
  if(app.kind==="mobility")return `<h2>Windows Mobility Center</h2><div class="mobility-tiles"><label><b>Display brightness</b><input type="range" value="80"></label><label><b>Volume</b><input type="range" value="70"></label><label><b>Battery Status</b><select><option>Balanced</option><option>Power saver</option></select></label><button data-generic-app="Connect to a Projector"><b>External Display</b><span>Connect display</span></button></div>`
  if(app.kind==="ink")return `<div class="ink-toolbar">${app.tools.map(tool=>`<button data-ink-tool="${tool}">${tool}</button>`).join("")}</div><div class="ink-surface" contenteditable="true" spellcheck="false"><h3>${name}</h3><p>${app.text}</p><p>Click here to type or use the pointer as the selected input tool.</p></div>`
  const fields=(app.fields||[]).map(field=>`<label>${field}<input placeholder="${field}"></label>`).join("")
  return `${tabs(app.tabs)}<div class="fidelity-page"><div class="fidelity-hero">${icon(app.kind==="wizard"?"computer":"system")}<div><h2>${name}</h2><p>${app.text}</p></div></div>${fields}${actions(app.actions)}</div>`
}

function open(name){
  const app=APPS[name]
  if(!app)return false
  byId("fidelityTitle").textContent=name
  byId("fidelityBody").innerHTML=content(name,app)
  openWindow("fidelityWindow")
  return true
}

function mountStartItems(){
  const panel=byId("allProgramsPanel")
  if(!panel)return
  const existing=new Set([...panel.querySelectorAll("[data-generic-app]")].map(button=>button.dataset.genericApp))
  panel.insertAdjacentHTML("beforeend",`<div class="all-programs-group">System Tools</div>${startNames.filter(name=>!existing.has(name)).map(name=>`<button data-generic-app="${name}">${name}</button>`).join("")}`)
}

export function mountFidelityApps(){mountWindow();mountStartItems()}

export function initFidelityApps(){
  let zoom=100,recording=false,recordTimer=null,seconds=0
  window.addEventListener("win7:open-fidelity",event=>{const name=event.detail;if(!APPS[name])return;event.preventDefault();if(elevated.has(name))requestElevation(name,()=>open(name));else open(name)})
  byId("fidelityBody").addEventListener("click",event=>{
    const tab=event.target.closest("[data-fidelity-tab]");if(tab){tab.parentElement.querySelectorAll("button").forEach(button=>button.classList.toggle("active",button===tab));return}
    const mode=event.target.closest("[data-projector-mode]")?.dataset.projectorMode;if(mode){toast(`Projector mode: ${event.target.closest("button").querySelector("b").textContent}`);byId("fidelityWindow").querySelector('[data-window-action="close"]').click();return}
    const magnifier=event.target.closest("[data-magnifier]")?.dataset.magnifier;if(magnifier){zoom=Math.max(100,Math.min(1600,zoom+(magnifier==="in"?100:-100)));byId("magnifierValue").textContent=`${zoom}%`;byId("desktop").style.setProperty("--magnifier-zoom",zoom/100);byId("desktop").classList.toggle("magnified",zoom>100);return}
    if(event.target.closest("[data-recorder]")){
      recording=!recording;event.target.textContent=recording?"Stop Recording":"Start Recording"
      clearInterval(recordTimer)
      if(recording){seconds=0;recordTimer=setInterval(()=>{seconds+=1;const h=String(Math.floor(seconds/3600)).padStart(2,"0"),m=String(Math.floor(seconds%3600/60)).padStart(2,"0"),s=String(seconds%60).padStart(2,"0");if(byId("recorderTime"))byId("recorderTime").textContent=`${h}:${m}:${s}`},1000)}else toast("Recording stopped. Save As would create a .wma file.")
      return
    }
    if(event.target.closest("[data-ise-run]")){byId("iseOutput").textContent=`PS C:\\Users\\Eka> Run Selection\nHandles  NPM(K)  PM(K)  WS(K)  CPU(s)  Id ProcessName\n    421      28  43120  69844    2.14 1648 explorer\nEKA-PC · Windows 7 Professional x86`;return}
    const action=event.target.closest("[data-fidelity-action]")?.dataset.fidelityAction;if(action)toast(`${action} · completed in the Windows 7 simulation.`)
  })
  byId("fidelityBody").addEventListener("change",event=>{if(event.target.id==="magnifierInvert")byId("desktop").classList.toggle("magnifier-invert",event.target.checked)})
}
