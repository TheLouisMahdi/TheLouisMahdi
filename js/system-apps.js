import{PROFILE,REPOSITORIES}from"./data.js"
import{askSaveAs}from"./interaction.js"
import{icon}from"./icons.js"
import{writeFile}from"./vfs.js"
import{closeWindow,openWindow}from"./window-manager.js"

const byId=id=>document.getElementById(id)
const toast=text=>window.dispatchEvent(new CustomEvent("win7:toast",{detail:text}))

function controls(max=true){return `<div class="win-controls"><button class="win-control" data-window-action="min">_</button>${max?'<button class="win-control" data-window-action="max">□</button>':""}<button class="win-control close" data-window-action="close">×</button></div>`}
function windowNode(app,title,iconName,body,className="system-app-window"){
  const section=document.createElement("section")
  section.className=`window ${className} hidden`
  section.id=`${app}Window`
  section.dataset.app=app
  section.innerHTML=`<div class="titlebar" data-drag-handle><div class="title-left"><span class="title-mini">${icon(iconName)}</span><span class="window-title">${title}</span></div>${controls()}</div>${body}`
  byId("desktop").appendChild(section)
  return section
}

function mountWindows(){
  windowNode("paint","Untitled - Paint","paint",`<div class="paint-ribbon"><button data-paint="clear">New</button><button data-paint="save">Save PNG</button><label>Color <input id="paintColor" type="color" value="#111111"></label><label>Size <input id="paintSize" type="range" min="1" max="18" value="4"></label></div><div class="paint-stage"><canvas id="paintCanvas" width="960" height="540"></canvas></div>`,`paint-window`)
  windowNode("wordpad","Document - WordPad","wordpad",`<div class="wordpad-ribbon"><button data-format="bold"><b>B</b></button><button data-format="italic"><i>I</i></button><button data-format="underline"><u>U</u></button><select id="wordpadSize"><option>10</option><option selected>12</option><option>16</option><option>24</option><option>36</option></select><button id="wordpadSave">Save As...</button></div><div class="wordpad-page" id="wordpadText" contenteditable="true"><h1>Mahdi Ghahremani</h1><p>Electrical Engineering · Embedded Systems · FPGA · AI Vision</p></div>`,`wordpad-window`)
  windowNode("sticky","Sticky Notes","sticky",`<div class="sticky-toolbar"><button id="stickyNew">＋</button><span>Sticky Notes</span><button id="stickyDelete">×</button></div><textarea id="stickyText" aria-label="Sticky note"></textarea>`,`sticky-window`)
  windowNode("snipping","Snipping Tool","snipping",`<div class="snip-toolbar"><button id="snipNew">New</button><button id="snipCopy">Copy</button><span>Rectangular Snip</span></div><div class="snip-stage" id="snipStage"><p>Click New, then drag to select an area.</p><div class="snip-selection hidden" id="snipSelection"></div></div>`,`snipping-window`)
  windowNode("media","Windows Media Player","media",`<div class="media-layout"><aside><strong>Libraries</strong><button>Music</button><button>Videos</button><button>Pictures</button><button>Playlists</button></aside><main><h2>Eka Media Library</h2><div class="media-list">${REPOSITORIES.slice(0,5).map((repo,index)=>`<button data-track="${index}"><span>♫</span><b>${repo.name}</b><small>${repo.tag}</small></button>`).join("")}</div></main></div><div class="media-controls"><button id="mediaPrevious">◀◀</button><button id="mediaPlay">▶</button><button id="mediaNext">▶▶</button><div class="media-progress"><i id="mediaProgress"></i></div><input id="mediaVolume" type="range" min="0" max="100" value="70"><span id="mediaState">Ready</span></div>`,`media-window`)
  windowNode("control","Control Panel","control",`<div class="control-head"><b>Control Panel</b><input id="controlSearch" placeholder="Search Control Panel"></div><div class="control-grid" id="controlGrid"></div>`,`control-window`)
  windowNode("devices","Devices and Printers","devices",`<div class="devices-command">Add a device · Add a printer</div><div class="device-section"><h3>Devices</h3><button class="device-card"><span>${icon("computer")}</span><b>EKA Notebook</b><small>This device</small></button></div><div class="device-section"><h3>Printers and Faxes</h3><button class="device-card" id="profilePrinter"><span>${icon("printer")}</span><b>EKA Profile Printer</b><small>Ready · Default</small></button><button class="device-card"><span>${icon("printer")}</span><b>Microsoft XPS Document Writer</b><small>Ready</small></button></div>`,`devices-window`)
  windowNode("taskmanager","Windows Task Manager","taskmanager",`<div class="taskmgr-tabs"><button>Applications</button><button>Processes</button><button>Performance</button><button>Networking</button><button>Users</button></div><div class="taskmgr-table" id="taskManagerList"></div><div class="taskmgr-actions"><span id="taskManagerStatus">Processes: 0 · CPU Usage: 7% · Physical Memory: 34%</span><button id="endTask">End Task</button></div>`,`taskmanager-window`)
  windowNode("minesweeper","Minesweeper","games",`<div class="mine-toolbar"><span>Game</span><span>Help</span><button id="mineReset">🙂</button><b id="mineCount">010</b><b id="mineTime">000</b></div><div class="mine-grid" id="mineGrid"></div>`,`minesweeper-window`)
  windowNode("systeminfo","System","system",`<div class="system-properties"><header><span>${icon("windows")}</span><div><h2>Windows 7 Ultimate</h2><p>Service Pack 1</p></div></header><section><h3>System</h3><dl><dt>Manufacturer</dt><dd>EKA</dd><dt>Model</dt><dd>EKA Notebook 7</dd><dt>Processor</dt><dd>EKA Virtual x64 Processor</dd><dt>Installed memory (RAM)</dt><dd>4.00 GB</dd><dt>System type</dt><dd>64-bit Operating System</dd><dt>Computer name</dt><dd>EKA-PC</dd></dl></section><footer>Windows is activated · Product ID: EKA-7601-GITHUB</footer></div>`,`system-window`)
  windowNode("charmap","Character Map","charmap",`<div class="charmap-body"><label>Font: <select><option>Segoe UI</option><option>Arial</option><option>Consolas</option></select></label><div class="char-grid" id="charGrid"></div><label>Characters to copy: <input id="charValue"></label><button id="charCopy">Copy</button></div>`,`charmap-window`)
  windowNode("keyboard","On-Screen Keyboard","keyboard",`<div class="osk" id="osk"></div>`,`keyboard-window`)
  windowNode("help","Windows Help and Support","help",`<div class="help-home"><h2>How can we help?</h2><input id="helpSearch" placeholder="Search Help"><div id="helpTopics"><button data-help="hotkeys">Windows keyboard shortcuts</button><button data-help="files">Working with files and folders</button><button data-help="terminal">Using Command Prompt and PowerShell</button><button data-help="mobile">Touch controls on phones</button><button data-help="about">About this EKA simulation</button></div><article id="helpArticle"></article></div>`,`help-window`)
  windowNode("accessory","Windows Accessory","system",`<div class="accessory-body" id="accessoryBody"></div>`,`accessory-window`)
}

function addStartPrograms(){
  byId("programList").insertAdjacentHTML("beforeend",`<button class="start-program" data-app-open="browser"><span>${icon("ie")}</span><b>Internet Explorer</b></button><button class="start-program" data-app-open="paint"><span>${icon("paint")}</span><b>Paint</b></button><button class="start-program" data-app-open="wordpad"><span>${icon("wordpad")}</span><b>WordPad</b></button><button class="start-program" data-app-open="sticky"><span>${icon("sticky")}</span><b>Sticky Notes</b></button><button class="start-program" data-app-open="snipping"><span>${icon("snipping")}</span><b>Snipping Tool</b></button><button class="start-program" data-app-open="media"><span>${icon("media")}</span><b>Windows Media Player</b></button><button class="start-program" data-app-open="minesweeper"><span>${icon("games")}</span><b>Minesweeper</b></button><button class="start-program all-programs" id="allProgramsBtn"><span>${icon("folder")}</span><b>All Programs</b></button>`)
  const all=document.createElement("div")
  all.className="all-programs-panel hidden"
  all.id="allProgramsPanel"
  all.innerHTML=`<button data-app-open="calculator">Calculator</button><button data-app-open="charmap">Character Map</button><button data-app-open="cmd">Command Prompt</button><button data-app-open="keyboard">Ease of Access · On-Screen Keyboard</button><button data-generic-app="Magnifier">Ease of Access · Magnifier</button><button data-app-open="paint">Paint</button><button data-app-open="powershell">Windows PowerShell</button><button data-app-open="snipping">Snipping Tool</button><button data-app-open="sticky">Sticky Notes</button><button data-app-open="wordpad">WordPad</button><button data-generic-app="Sound Recorder">Sound Recorder</button><button data-generic-app="Math Input Panel">Math Input Panel</button><button data-generic-app="Remote Desktop Connection">Remote Desktop Connection</button><button data-generic-app="Windows DVD Maker">Windows DVD Maker</button><button data-generic-app="Windows Fax and Scan">Windows Fax and Scan</button><button data-generic-app="Windows Media Center">Windows Media Center</button><button data-generic-app="XPS Viewer">XPS Viewer</button><button data-generic-app="Getting Started">Getting Started</button><button data-generic-app="Connect to a Projector">Connect to a Projector</button><button data-app-open="help">Windows Help and Support</button>`
  byId("startMenu").appendChild(all)
}

function initPaint(){
  const canvas=byId("paintCanvas"),ctx=canvas.getContext("2d")
  ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.lineCap="round";ctx.lineJoin="round"
  let drawing=false
  const point=event=>{const rect=canvas.getBoundingClientRect();return{x:(event.clientX-rect.left)*canvas.width/rect.width,y:(event.clientY-rect.top)*canvas.height/rect.height}}
  canvas.addEventListener("pointerdown",event=>{drawing=true;canvas.setPointerCapture(event.pointerId);const p=point(event);ctx.beginPath();ctx.moveTo(p.x,p.y)})
  canvas.addEventListener("pointermove",event=>{if(!drawing)return;const p=point(event);ctx.strokeStyle=byId("paintColor").value;ctx.lineWidth=Number(byId("paintSize").value);ctx.lineTo(p.x,p.y);ctx.stroke()})
  canvas.addEventListener("pointerup",()=>drawing=false)
  byId("paintWindow").addEventListener("click",event=>{const action=event.target.closest("[data-paint]")?.dataset.paint;if(action==="clear"){ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height)}if(action==="save"){const link=document.createElement("a");link.download="Untitled.png";link.href=canvas.toDataURL("image/png");link.click()}})
}

function initWordPad(){
  byId("wordpadWindow").addEventListener("click",event=>{const command=event.target.closest("[data-format]")?.dataset.format;if(command)document.execCommand(command)})
  byId("wordpadSize").addEventListener("change",event=>{document.execCommand("fontSize",false,"7");byId("wordpadText").querySelectorAll('font[size="7"]').forEach(node=>{node.removeAttribute("size");node.style.fontSize=`${event.target.value}px`})})
  byId("wordpadSave").addEventListener("click",async()=>{const result=await askSaveAs({name:"Document.rtf",type:"all"});if(result){writeFile(result.path,byId("wordpadText").innerText,undefined,{encoding:result.encoding});toast(`Saved ${result.path}`)}})
}

function initSticky(){
  const key="eka.windows7.sticky",text=byId("stickyText")
  text.value=localStorage.getItem(key)||"Remember to explore the EKA Windows 7 desktop."
  text.addEventListener("input",()=>localStorage.setItem(key,text.value))
  byId("stickyNew").addEventListener("click",()=>{text.value="";text.focus();localStorage.setItem(key,"")})
  byId("stickyDelete").addEventListener("click",()=>{text.value="";localStorage.removeItem(key);closeWindow(byId("stickyWindow"))})
}

function initSnipping(){
  const stage=byId("snipStage"),selection=byId("snipSelection")
  let start=null,last=null
  byId("snipNew").addEventListener("click",()=>{selection.classList.add("hidden");stage.classList.add("snipping");stage.querySelector("p").textContent="Drag a rectangle to create a simulated snip."})
  stage.addEventListener("pointerdown",event=>{if(!stage.classList.contains("snipping"))return;const rect=stage.getBoundingClientRect();start={x:event.clientX-rect.left,y:event.clientY-rect.top};last=start;stage.setPointerCapture(event.pointerId)})
  stage.addEventListener("pointermove",event=>{if(!start)return;const rect=stage.getBoundingClientRect();last={x:event.clientX-rect.left,y:event.clientY-rect.top};const x=Math.min(start.x,last.x),y=Math.min(start.y,last.y),w=Math.abs(last.x-start.x),h=Math.abs(last.y-start.y);Object.assign(selection.style,{left:`${x}px`,top:`${y}px`,width:`${w}px`,height:`${h}px`});selection.classList.remove("hidden")})
  stage.addEventListener("pointerup",()=>{if(!start)return;stage.classList.remove("snipping");stage.querySelector("p").textContent=`Captured ${Math.round(Math.abs(last.x-start.x))} × ${Math.round(Math.abs(last.y-start.y))} simulated pixels`;start=null})
  byId("snipCopy").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(stage.querySelector("p").textContent);toast("Snip information copied.")}catch{toast("Clipboard permission was not available.")}})
}

function initMedia(){
  let track=0,playing=false,timer=null,progress=0
  const update=()=>{const repo=REPOSITORIES[track%Math.min(5,REPOSITORIES.length)];byId("mediaState").textContent=`${playing?"Playing":"Paused"}: ${repo.name}`;byId("mediaPlay").textContent=playing?"Ⅱ":"▶"}
  const play=()=>{playing=!playing;clearInterval(timer);if(playing)timer=setInterval(()=>{progress=(progress+1)%101;byId("mediaProgress").style.width=`${progress}%`},500);update()}
  byId("mediaPlay").addEventListener("click",play)
  byId("mediaPrevious").addEventListener("click",()=>{track=(track+4)%5;progress=0;update()})
  byId("mediaNext").addEventListener("click",()=>{track=(track+1)%5;progress=0;update()})
  byId("mediaWindow").querySelectorAll("[data-track]").forEach(button=>button.addEventListener("click",()=>{track=Number(button.dataset.track);playing=true;update()}))
}

const CONTROL_ITEMS=[
  ["System and Security","Review computer status, firewall, backup and system information","systeminfo"],
  ["Network and Internet","View network status and sharing options",null],
  ["Hardware and Sound","View devices, printers and sound settings","devices"],
  ["Programs","Uninstall programs and choose default programs",null],
  ["User Accounts","Change account type and credentials",null],
  ["Appearance and Personalization","Aero themes, display and taskbar",null],
  ["Clock, Language, and Region","Date, time, language and location",null],
  ["Ease of Access","Optimize visual display and input","keyboard"]
]

function initControl(){
  const render=query=>{const q=query.toLowerCase();byId("controlGrid").innerHTML=CONTROL_ITEMS.filter(item=>item.join(" ").toLowerCase().includes(q)).map(([name,description,app],index)=>`<button data-control-index="${CONTROL_ITEMS.findIndex(item=>item[0]===name)}"><span>${icon(app==="devices"?"devices":app==="keyboard"?"keyboard":app==="systeminfo"?"system":"control")}</span><b>${name}</b><small>${description}</small></button>`).join("")}
  render("")
  byId("controlSearch").addEventListener("input",event=>render(event.target.value))
  byId("controlGrid").addEventListener("click",event=>{const index=Number(event.target.closest("[data-control-index]")?.dataset.controlIndex);if(!Number.isInteger(index))return;const item=CONTROL_ITEMS[index];if(item[2])window.dispatchEvent(new CustomEvent("win7:open-app",{detail:item[2]}));else toast(`${item[0]} · settings are represented safely inside this browser simulation.`)})
  byId("profilePrinter").addEventListener("dblclick",()=>window.dispatchEvent(new Event("win7:print-profile")))
}

function refreshTaskManager(){
  const windows=[...document.querySelectorAll(".window:not(.hidden)")].filter(win=>win.id!=="taskmanagerWindow")
  byId("taskManagerList").innerHTML=`<div class="task-row heading"><b>Task</b><b>Status</b></div>${windows.map(win=>`<button class="task-row" data-task-id="${win.id}"><span>${win.querySelector(".window-title")?.textContent||win.dataset.app}</span><span>Running</span></button>`).join("")||"<p>No running applications.</p>"}`
  byId("taskManagerStatus").textContent=`Processes: ${windows.length+27} · CPU Usage: ${Math.floor(4+Math.random()*10)}% · Physical Memory: 34%`
}

function initTaskManager(){
  let selected=null
  byId("taskManagerList").addEventListener("click",event=>{const row=event.target.closest("[data-task-id]");if(!row)return;selected=row.dataset.taskId;byId("taskManagerList").querySelectorAll("button").forEach(button=>button.classList.toggle("selected",button===row))})
  byId("endTask").addEventListener("click",()=>{if(selected){closeWindow(byId(selected));selected=null;refreshTaskManager()}})
  window.addEventListener("win7:open-app",event=>{if(event.detail==="taskmanager")setTimeout(refreshTaskManager,0)})
}

function initMinesweeper(){
  let mines,revealed,flags,started,timer
  const neighbors=index=>{const x=index%9,y=Math.floor(index/9),out=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if(nx>=0&&nx<9&&ny>=0&&ny<9&&(dx||dy))out.push(ny*9+nx)}return out}
  const reset=()=>{mines=new Set();while(mines.size<10)mines.add(Math.floor(Math.random()*81));revealed=new Set();flags=new Set();started=Date.now();clearInterval(timer);timer=setInterval(()=>byId("mineTime").textContent=String(Math.min(999,Math.floor((Date.now()-started)/1000))).padStart(3,"0"),1000);render()}
  const reveal=index=>{if(flags.has(index)||revealed.has(index))return;if(mines.has(index)){revealed=new Set([...Array(81).keys()]);render();toast("Game over. Click the smiley to try again.");return}revealed.add(index);if(!neighbors(index).some(value=>mines.has(value)))neighbors(index).forEach(reveal);render();if(revealed.size===71)toast("Mines cleared. You win!")}
  const render=()=>{byId("mineCount").textContent=String(Math.max(0,10-flags.size)).padStart(3,"0");byId("mineGrid").innerHTML=Array.from({length:81},(_,index)=>{const open=revealed.has(index),mine=mines.has(index),count=neighbors(index).filter(value=>mines.has(value)).length;return `<button data-mine="${index}" class="${open?"open":""}">${open?(mine?"💣":count||""):flags.has(index)?"⚑":""}</button>`}).join("")}
  byId("mineGrid").addEventListener("click",event=>{const index=Number(event.target.closest("[data-mine]")?.dataset.mine);if(Number.isInteger(index))reveal(index)})
  byId("mineGrid").addEventListener("contextmenu",event=>{const button=event.target.closest("[data-mine]");if(!button)return;event.preventDefault();const index=Number(button.dataset.mine);if(!revealed.has(index)){flags.has(index)?flags.delete(index):flags.add(index);render()}})
  byId("mineReset").addEventListener("click",reset);reset()
}

function initCharacterMap(){
  const chars="©®™€£¥Ωµπ√∞≈≠≤≥←↑→↓◆●★☆✓✕♠♥♦♣☺☻♪♫αβγδεζηθλσφψω"
  byId("charGrid").innerHTML=[...chars].map(char=>`<button>${char}</button>`).join("")
  byId("charGrid").addEventListener("click",event=>{if(event.target.matches("button"))byId("charValue").value+=event.target.textContent})
  byId("charCopy").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(byId("charValue").value);toast("Characters copied.")}catch{toast("Clipboard permission was not available.")}})
}

function initKeyboard(){
  let target=null
  document.addEventListener("focusin",event=>{if(event.target.matches("input,textarea,[contenteditable=true]")&&!event.target.closest("#keyboardWindow"))target=event.target})
  const rows=["1234567890","QWERTYUIOP","ASDFGHJKL","ZXCVBNM"]
  byId("osk").innerHTML=rows.map(row=>`<div>${[...row].map(key=>`<button data-key="${key}">${key}</button>`).join("")}</div>`).join("")+`<div><button data-key="Backspace">Backspace</button><button class="space" data-key=" ">Space</button><button data-key="Enter">Enter</button></div>`
  byId("osk").addEventListener("pointerdown",event=>event.preventDefault())
  byId("osk").addEventListener("click",event=>{const key=event.target.closest("[data-key]")?.dataset.key;if(key===undefined||!target)return;if(target.isContentEditable){document.execCommand(key==="Backspace"?"delete":key==="Enter"?"insertLineBreak":"insertText",false,key===" "?" ":key);return}const start=target.selectionStart??target.value.length,end=target.selectionEnd??start;if(key==="Backspace"){target.value=target.value.slice(0,Math.max(0,start-1))+target.value.slice(end);target.selectionStart=target.selectionEnd=Math.max(0,start-1)}else{const value=key==="Enter"?"\n":key;target.value=target.value.slice(0,start)+value+target.value.slice(end);target.selectionStart=target.selectionEnd=start+value.length}target.dispatchEvent(new Event("input",{bubbles:true}));target.focus()})
}

function initHelp(){
  const articles={hotkeys:"Win+E Explorer · Win+R Run · Win+L Lock · Win+D Desktop · Win+Arrow Aero Snap · Alt+Tab switch · Alt+F4 close · Ctrl+Shift+Esc Task Manager · F2 rename · F5 refresh.",files:"Double-click to open. Right-click or touch and hold for commands. Ctrl+click selects multiple items. Notepad Save As stores files in this site's local browser storage.",terminal:"CMD and Windows PowerShell operate on the same virtual files. Save a .py file with Notepad, then run python file.py, py file.py, or Start-Process python.",mobile:"Tap once to select, double-tap to open, and touch-hold for right click. Windows are maximized to the laptop display on narrow screens.",about:"This is a safe browser-hosted Windows 7 portfolio simulation. It does not modify the real device, registry, disks, processes, or network settings."}
  const show=key=>{byId("helpArticle").textContent=articles[key]||"No matching topic."}
  byId("helpTopics").addEventListener("click",event=>{const key=event.target.closest("[data-help]")?.dataset.help;if(key)show(key)})
  byId("helpSearch").addEventListener("input",event=>{const q=event.target.value.toLowerCase();const key=Object.keys(articles).find(name=>`${name} ${articles[name]}`.toLowerCase().includes(q));if(q)show(key)})
  show("hotkeys")
}

function openAccessory(name){
  const details={"Sound Recorder":"Microphone recording requires browser permission. This safe demo leaves the microphone off until the visitor explicitly grants access.","Math Input Panel":"A Windows 7 handwriting surface for mathematical expressions. Pointer handwriting recognition is represented without sending input anywhere.","Remote Desktop Connection":"Remote Desktop cannot connect from this isolated portfolio simulation. No credentials are requested or stored.","Windows Fax and Scan":"Fax and Scan is available as a Windows 7 reference surface. No modem or scanner is attached.","XPS Viewer":"Use the EKA Profile Printer or browser PDF export for portable documents.","Magnifier":"The Windows 7 magnifier can zoom the desktop. Use the browser's zoom controls for an accessible equivalent.","Windows DVD Maker":"No optical drive or writable media is attached to this browser-hosted EKA notebook.","Windows Media Center":"Music, pictures and video are available through Windows Media Player in this simulation.","Getting Started":"Explore the Start menu, save a file in Notepad, run Python from CMD, and print the GitHub profile receipt.","Connect to a Projector":"Computer only · Duplicate · Extend · Projector only. Hardware display switching is represented safely.","Windows Anytime Upgrade":"This simulated system already identifies as Windows 7 Ultimate Service Pack 1."}
  byId("accessoryWindow").querySelector(".window-title").textContent=name
  byId("accessoryBody").innerHTML=`<div class="accessory-icon">${icon("system")}</div><h2>${name}</h2><p>${details[name]||"Windows 7 accessory"}</p><button data-accessory-close>Close</button>`
  openWindow("accessoryWindow")
}

export function initSystemApps(){
  initPaint();initWordPad();initSticky();initSnipping();initMedia();initControl();initTaskManager();initMinesweeper();initCharacterMap();initKeyboard();initHelp()
  document.addEventListener("click",event=>{const name=event.target.closest("[data-generic-app]")?.dataset.genericApp;if(name){byId("startMenu").classList.add("hidden");openAccessory(name)}if(event.target.closest("[data-accessory-close]"))closeWindow(byId("accessoryWindow"))})
  byId("profilePrinter").addEventListener("click",()=>toast("EKA Profile Printer · Ready. Double-click to print."))
}

export function mountSystemApps(){mountWindows();addStartPrograms()}
