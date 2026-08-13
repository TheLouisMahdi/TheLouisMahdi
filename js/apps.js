import{profileText}from"./data.js"
import{askOpenFile,askSaveAs,askText}from"./interaction.js"
import{fileName,getEntry,parentPath,readFile,resolvePath,roots,writeFile}from"./vfs.js"
import{icon}from"./icons.js"
import{openWindow}from"./window-manager.js"

const byId=id=>document.getElementById(id)
const DESKTOP=roots().desktop
let notePath=null
let noteStaticName=null
let noteEncoding="UTF-8"

const buttons=[
  ["MC","memory-clear"],["MR","memory-read"],["M+","memory-add"],["M-","memory-sub"],["←","back"],
  ["CE","clear-entry"],["C","clear"],["±","sign"],["√","sqrt"],["÷","op"],
  ["7","digit"],["8","digit"],["9","digit"],["%","percent"],["×","op"],
  ["4","digit"],["5","digit"],["6","digit"],["1/x","inverse"],["−","op"],
  ["1","digit"],["2","digit"],["3","digit"],["=","equals"],["+","op"],
  ["0","digit"],[".","decimal"]
]
const calculatorModes={
  Standard:buttons,
  Scientific:[...["sin","cos","tan","log","ln","x²","x³","π","n!","10ˣ"].map(label=>[label,"scientific"]),...buttons],
  Programmer:[...["A","B","C","D","E","F"].map(label=>[label,"hex"]),["AND","bit-op"],["OR","bit-op"],["XOR","bit-op"],["MOD","bit-op"],...buttons],
  Statistics:[["Add","stat-add"],["Average","stat-average"],["Sum","stat-sum"],["Count","stat-count"],["Clear data","stat-clear"],...buttons]
}

let value="0"
let stored=null
let operation=null
let fresh=true
let memory=0
let statistics=[]

function display(){byId("calcDisplay").value=value}
function number(){return Number(value)||0}

function calculate(){
  if(stored===null||!operation)return number()
  const right=number()
  if(operation==="+")return stored+right
  if(operation==="−")return stored-right
  if(operation==="×")return stored*right
  if(operation==="÷")return right===0?0:stored/right
  if(operation==="AND")return stored&right
  if(operation==="OR")return stored|right
  if(operation==="XOR")return stored^right
  if(operation==="MOD")return right===0?0:stored%right
  return right
}

function calcAction(label,type){
  if(type==="digit"){value=fresh?label:(value==="0"?label:value+label);fresh=false}
  if(type==="decimal"){if(fresh){value="0.";fresh=false}else if(!value.includes("."))value+="."}
  if(type==="op"){if(stored!==null&&!fresh)value=String(calculate());stored=number();operation=label;fresh=true}
  if(type==="equals"){value=String(calculate());stored=null;operation=null;fresh=true}
  if(type==="clear"||type==="clear-entry"){value="0";if(type==="clear"){stored=null;operation=null}fresh=true}
  if(type==="back"&&!fresh)value=value.length>1?value.slice(0,-1):"0"
  if(type==="sign")value=String(-number())
  if(type==="sqrt")value=String(Math.sqrt(Math.max(0,number())))
  if(type==="percent")value=String(number()/100)
  if(type==="inverse")value=String(number()===0?0:1/number())
  if(type==="memory-clear")memory=0
  if(type==="memory-read"){value=String(memory);fresh=true}
  if(type==="memory-add")memory+=number()
  if(type==="memory-sub")memory-=number()
  if(type==="scientific"){
    const n=number(),actions={sin:Math.sin(n),cos:Math.cos(n),tan:Math.tan(n),log:Math.log10(Math.max(n,Number.EPSILON)),ln:Math.log(Math.max(n,Number.EPSILON)),"x²":n*n,"x³":n*n*n,π:Math.PI,"n!":n<0?0:Array.from({length:Math.min(170,Math.floor(n))},(_,i)=>i+1).reduce((a,b)=>a*b,1),"10ˣ":10**n}
    value=String(actions[label]);fresh=true
  }
  if(type==="hex"){const digit=String(parseInt(label,16));value=fresh?digit:String(number()*16+Number(digit));fresh=false}
  if(type==="bit-op"){stored=Math.trunc(number());operation=label;fresh=true}
  if(type==="stat-add")statistics.push(number())
  if(type==="stat-average"){value=String(statistics.length?statistics.reduce((a,b)=>a+b,0)/statistics.length:0);fresh=true}
  if(type==="stat-sum"){value=String(statistics.reduce((a,b)=>a+b,0));fresh=true}
  if(type==="stat-count"){value=String(statistics.length);fresh=true}
  if(type==="stat-clear")statistics=[]
  display()
}

function initCalculator(){
  const grid=byId("calcGrid")
  const render=()=>{const mode=byId("calcMode").value;grid.innerHTML=calculatorModes[mode].map(([label,type])=>`<button data-calc-type="${type}" data-calc-label="${label}">${label}</button>`).join("");grid.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>calcAction(button.dataset.calcLabel,button.dataset.calcType)));byId("calculatorWindow").classList.toggle("calc-wide",mode!=="Standard")}
  byId("calcMode").addEventListener("change",render);render()
}

function setNotepad(name,text,path=null){
  notePath=path
  noteStaticName=path?null:name
  byId("noteText").value=text
  byId("notepadTitle").textContent=`${name} - Notepad`
  openWindow("notepadWindow")
}

async function saveAs(){
  const initial=notePath?fileName(notePath):noteStaticName&&noteStaticName.includes(".")?noteStaticName:"Untitled.txt"
  const result=await askSaveAs({name:initial,type:/\.txt$/i.test(initial)?"text":"all"})
  if(!result)return
  writeFile(result.path,byId("noteText").value,DESKTOP,{encoding:result.encoding})
  notePath=result.path
  noteEncoding=result.encoding
  noteStaticName=null
  byId("notepadTitle").textContent=`${fileName(result.path)} - Notepad`
  window.dispatchEvent(new CustomEvent("win7:toast",{detail:`Saved ${fileName(result.path)} · ${noteEncoding}`}))
}

function saveCurrent(){
  if(!notePath){saveAs();return}
  writeFile(notePath,byId("noteText").value,DESKTOP,{encoding:noteEncoding})
  window.dispatchEvent(new CustomEvent("win7:toast",{detail:`Saved ${fileName(notePath)}`}))
}

function openFile(path,forceNotepad=false){
  const full=path.includes(":")?path:resolvePath(DESKTOP,path)
  const content=readFile(full)
  if(content===null){window.dispatchEvent(new CustomEvent("win7:toast",{detail:`Windows cannot find '${path}'.`}));return false}
  if(getEntry(full)?.kind==="photo"&&!forceNotepad){
    byId("imageTitle").textContent=`${fileName(full)} - Windows Photo Viewer`
    byId("imageView").src=content
    byId("imageView").alt=fileName(full)
    openWindow("imageWindow")
    return true
  }
  if(/\.html?$/i.test(full)&&!forceNotepad){openHtml(full,content);return true}
  setNotepad(fileName(full),content,full)
  return true
}

function buildHtmlPreview(path,content){
  const dir=parentPath(path)
  let html=String(content||"")
  html=html.replace(/<link\b([^>]*?)href=["']([^"']+)["']([^>]*)>/gi,(tag,before,href,after)=>{
    if(/^(?:https?:|data:|blob:|#|\/\/)/i.test(href))return tag
    const css=readFile(resolvePath(dir,href))
    return css===null?tag:`<style data-eka-source="${href.replaceAll('"','&quot;')}">${css}</style>`
  })
  html=html.replace(/<script\b([^>]*?)src=["']([^"']+)["']([^>]*)><\/script>/gi,(tag,before,src,after)=>{
    if(/^(?:https?:|data:|blob:|\/\/)/i.test(src))return tag
    const js=readFile(resolvePath(dir,src))
    return js===null?tag:`<script data-eka-source="${src.replaceAll('"','&quot;')}">${js.replace(/<\/script/gi,"<\\/script")}</script>`
  })
  return html
}

function openHtml(path,content){
  byId("browserTitle").textContent=`${fileName(path)} - Windows Internet Explorer`
  byId("browserAddress").value=`file:///${path.replaceAll("\\","/")}`
  byId("browserFrame").srcdoc=buildHtmlPreview(path,content)
  openWindow("browserWindow")
}

function initNotepad(){
  const text=byId("noteText"),dropdowns=["noteFileDropdown","noteEditDropdown","noteFormatDropdown","noteViewDropdown","noteHelpDropdown"].map(byId)
  const closeMenu=except=>dropdowns.forEach(dropdown=>{if(dropdown!==except)dropdown.classList.add("hidden")})
  const bindMenu=(buttonId,dropdownId)=>byId(buttonId).addEventListener("click",event=>{event.stopPropagation();const dropdown=byId(dropdownId),open=dropdown.classList.contains("hidden");closeMenu(dropdown);dropdown.classList.toggle("hidden",!open)})
  bindMenu("noteFileMenu","noteFileDropdown");bindMenu("noteEditMenu","noteEditDropdown");bindMenu("noteFormatMenu","noteFormatDropdown");bindMenu("noteViewMenu","noteViewDropdown");bindMenu("noteHelpMenu","noteHelpDropdown")
  byId("notepadWindow").addEventListener("pointerdown",event=>{if(!event.target.closest(".notepad-menu"))closeMenu()})
  byId("noteNew").addEventListener("click",()=>setNotepad("Untitled","",null))
  byId("noteProfile").addEventListener("click",()=>setNotepad("profile.txt",profileText(),null))
  byId("noteSave").addEventListener("click",saveAs)
  byId("noteSaveCurrent").addEventListener("click",saveCurrent)
  byId("noteOpen").addEventListener("click",async()=>{const path=await askOpenFile();if(path)openFile(path,true)})
  byId("notePrint").addEventListener("click",()=>window.dispatchEvent(new CustomEvent("win7:toast",{detail:"Notepad document queued to the simulated EKA printer."})))
  const replaceSelection=value=>{const start=text.selectionStart,end=text.selectionEnd;text.setRangeText(value,start,end,"end");text.dispatchEvent(new Event("input",{bubbles:true}))}
  const findText=async()=>{const query=await askText("Find","Find what:","");if(!query)return;let index=text.value.toLowerCase().indexOf(query.toLowerCase(),text.selectionEnd);if(index<0)index=text.value.toLowerCase().indexOf(query.toLowerCase());if(index<0){window.dispatchEvent(new CustomEvent("win7:toast",{detail:`Cannot find '${query}'.`}));return}text.focus();text.setSelectionRange(index,index+query.length)}
  const updateStatus=()=>{const before=text.value.slice(0,text.selectionStart),lines=before.split("\n");byId("noteStatus").innerHTML=`<span>Ln ${lines.length}, Col ${lines.at(-1).length+1}</span><span>100%</span><span>Windows (CRLF)</span><span>${noteEncoding}</span>`}
  byId("noteEditDropdown").addEventListener("click",async event=>{
    const action=event.target.closest("[data-note-edit]")?.dataset.noteEdit;if(!action)return
    if(["undo","cut","copy"].includes(action))document.execCommand(action)
    if(action==="paste"){try{replaceSelection(await navigator.clipboard.readText())}catch{window.dispatchEvent(new CustomEvent("win7:toast",{detail:"Clipboard permission was not available."}))}}
    if(action==="delete")replaceSelection("")
    if(action==="find")await findText()
    if(action==="replace"){const from=await askText("Replace","Find what:","");if(from!==null){const to=await askText("Replace","Replace with:","");if(to!==null){text.value=text.value.split(from).join(to);text.dispatchEvent(new Event("input",{bubbles:true}))}}}
    if(action==="goto"){const line=Number(await askText("Go To Line","Line number:","1"));if(line>0){const index=text.value.split("\n").slice(0,line-1).join("\n").length+(line>1?1:0);text.focus();text.setSelectionRange(index,index)}}
    if(action==="selectAll"){text.focus();text.select()}
    if(action==="time")replaceSelection(new Date().toLocaleString())
    closeMenu();updateStatus()
  })
  byId("noteWordWrap").addEventListener("click",()=>{text.classList.toggle("word-wrap");byId("noteWordWrap").textContent=`${text.classList.contains("word-wrap")?"✓ ":""}Word Wrap`;closeMenu()})
  byId("noteFont").addEventListener("click",async()=>{const value=await askText("Font","Font family and size:","Consolas, 10");if(value){const [family,size]=value.split(",");text.style.fontFamily=family.trim();if(Number(size)>5)text.style.fontSize=`${Number(size)}px`}closeMenu()})
  byId("noteStatusToggle").addEventListener("click",()=>{byId("noteStatus").classList.toggle("hidden");byId("notepadWindow").classList.toggle("show-status",!byId("noteStatus").classList.contains("hidden"));byId("noteStatusToggle").textContent=`${byId("noteStatus").classList.contains("hidden")?"":"✓ "}Status Bar`;closeMenu()})
  byId("noteViewHelp").addEventListener("click",()=>window.dispatchEvent(new CustomEvent("win7:open-app",{detail:"help"})))
  byId("noteAbout").addEventListener("click",()=>window.dispatchEvent(new CustomEvent("win7:toast",{detail:"Microsoft Windows · Notepad · EKA browser edition"})))
  text.addEventListener("keydown",event=>{
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="s"){event.preventDefault();saveCurrent()}
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="n"){event.preventDefault();setNotepad("Untitled","",null)}
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="o"){event.preventDefault();byId("noteOpen").click()}
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="f"){event.preventDefault();findText()}
    if(event.key==="F5"){event.preventDefault();replaceSelection(new Date().toLocaleString())}
  })
  text.addEventListener("keyup",updateStatus);text.addEventListener("click",updateStatus);text.addEventListener("input",updateStatus);updateStatus()
  window.addEventListener("win7:open-file",event=>openFile(event.detail.path,event.detail.forceNotepad))
  window.addEventListener("win7:open-text",event=>setNotepad(event.detail.name,event.detail.text,null))
}

function splitCommand(value){
  const parts=[]
  String(value||"").replace(/"([^"]*)"|'([^']*)'|(\S+)/g,(_,a,b,c)=>{parts.push(a??b??c);return ""})
  return parts
}

function initRun(){
  const launch=value=>{
    const parts=splitCommand(value)
    if(!parts.length)return
    const name=parts[0].toLowerCase().replace(/\.exe$/i,"")
    const arg=parts.slice(1).join(" ")
    const apps={cmd:"cmd",powershell:"powershell",notepad:"notepad",calc:"calculator",calculator:"calculator",explorer:"explorer",iexplore:"browser","internet explorer":"browser",mspaint:"paint",paint:"paint",write:"wordpad",wordpad:"wordpad",wmplayer:"media",taskmgr:"taskmanager",control:"control",osk:"keyboard",charmap:"charmap",snippingtool:"snipping",stikynot:"sticky",minesweeper:"minesweeper",solitaire:"solitaire",freecell:"freecell",chess:"chess",msinfo32:"systeminfo"}
    if(name==="python"||name==="py"){
      if(arg)window.dispatchEvent(new CustomEvent("win7:cmd-run",{detail:`python "${arg}"`}))
      else window.dispatchEvent(new CustomEvent("win7:cmd-run",{detail:"python --version"}))
      return
    }
    if(name==="notepad"&&arg){
      const full=arg.includes(":")?arg:resolvePath(DESKTOP,arg)
      if(readFile(full)===null)writeFile(full,"")
      openFile(full,true)
      return
    }
    if(name==="explorer"&&arg){window.dispatchEvent(new CustomEvent("win7:explorer-path",{detail:arg}));return}
    if(apps[name]){window.dispatchEvent(new CustomEvent("win7:open-app",{detail:apps[name]}));return}
    if(["eka","matrix","coffee","fortune"].includes(name)){window.dispatchEvent(new CustomEvent("win7:cmd-run",{detail:name}));return}
    if(name==="github"){window.open("https://github.com/TheLouisMahdi","_blank","noopener,noreferrer");return}
    if(name==="telegram"){window.open("https://t.me/thelouis_mahdi","_blank","noopener,noreferrer");return}
    if(/^https?:\/\//i.test(value)){window.open(value,"_blank","noopener,noreferrer");return}
    if(name==="shutdown"){window.dispatchEvent(new CustomEvent("win7:power",{detail:parts.includes("/r")?"restart":"shutdown"}));return}
    if(openFile(value,false))return
    window.dispatchEvent(new CustomEvent("win7:toast",{detail:`Windows cannot find '${value}'.`}))
  }
  byId("runForm").addEventListener("submit",event=>{
    event.preventDefault()
    const value=byId("runInput").value
    byId("runWindow").classList.add("hidden")
    byId("runInput").value=""
    launch(value)
  })
  byId("runCancel").addEventListener("click",()=>byId("runWindow").classList.add("hidden"))
}

export function mountRuntimeWindows(){
  if(byId("browserWindow"))return
  const browser=document.createElement("section")
  browser.className="window browser-window hidden"
  browser.id="browserWindow"
  browser.dataset.app="browser"
  browser.innerHTML=`<div class="titlebar" data-drag-handle><div class="title-left"><span class="title-mini">${icon("ie")}</span><span class="window-title" id="browserTitle">Windows Internet Explorer</span></div><div class="win-controls"><button class="win-control" data-window-action="min">_</button><button class="win-control" data-window-action="max">□</button><button class="win-control close" data-window-action="close">×</button></div></div><form class="ie-toolbar" id="browserForm"><button type="button" id="browserBack" aria-label="Back">←</button><button type="button" id="browserHome" aria-label="Home">⌂</button><input id="browserAddress" aria-label="Address" placeholder="Search the web or enter an address"><button class="browser-go" type="submit">Go</button></form><iframe id="browserFrame" sandbox="allow-scripts allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox"></iframe><div class="ie-status" id="browserStatus">Internet · Protected Mode: On</div>`
  byId("desktop").appendChild(browser)
  const task=document.createElement("button")
  task.className="task-button"
  task.dataset.task="browser"
  task.setAttribute("aria-label","Windows Internet Explorer")
  task.innerHTML=`<span>${icon("ie")}</span>`
  byId("taskApps").appendChild(task)
}

function safeText(value){return String(value||"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]))}

function browserHome(){
  const page=`<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;font:14px Segoe UI,Arial;color:#123;background:linear-gradient(#eaf6ff,#fff);padding:34px}main{max-width:720px;margin:auto}h1{color:#1267a5}form{display:flex}input{flex:1;padding:10px;border:1px solid #7f9db9}button{padding:0 18px}a{color:#075a9c}</style></head><body><main><h1>Eka Internet Explorer</h1><p>Search the web or visit Mahdi's work.</p><form action="https://www.google.com/search" target="_blank"><input name="q" placeholder="Search Google"><button>Search</button></form><h2>Favorites</h2><p><a href="https://github.com/TheLouisMahdi" target="_blank">GitHub · TheLouisMahdi</a></p><p><a href="https://t.me/thelouis_mahdi" target="_blank">Telegram · @thelouis_mahdi</a></p><p><small>External websites open in a new tab because modern sites commonly block legacy iframe navigation.</small></p></main></body></html>`
  byId("browserTitle").textContent="Eka Home - Windows Internet Explorer"
  byId("browserAddress").value="about:home"
  byId("browserFrame").srcdoc=page
  byId("browserStatus").textContent="Internet · Protected Mode: On"
}

function browse(value){
  const query=String(value||"").trim()
  if(!query||query==="about:home"){browserHome();return}
  if(/^file:\/\//i.test(query))return
  if(/^https?:\/\//i.test(query)){
    const url=safeText(query)
    byId("browserFrame").srcdoc=`<!doctype html><html><head><meta charset="utf-8"><style>body{font:14px Segoe UI,Arial;padding:40px;color:#233}a{display:inline-block;padding:9px 14px;background:#1676ad;color:#fff;text-decoration:none;border-radius:3px}</style></head><body><h2>Leaving the simulated Windows desktop</h2><p>Modern sites may refuse to load inside an embedded legacy browser frame.</p><p><a href="${url}" target="_blank" rel="noreferrer">Open ${url}</a></p></body></html>`
    byId("browserAddress").value=query
    byId("browserTitle").textContent=`${query} - Windows Internet Explorer`
    return
  }
  const encoded=encodeURIComponent(query)
  byId("browserAddress").value=query
  byId("browserTitle").textContent=`${query} - Search - Windows Internet Explorer`
  byId("browserFrame").srcdoc=`<!doctype html><html><head><meta charset="utf-8"><style>body{font:14px Segoe UI,Arial;padding:28px;color:#222}h1{font-size:22px;color:#145b8c}.result{padding:13px 0;border-bottom:1px solid #ddd}.result a{color:#0645ad;font-size:16px}.url{color:#168223;font-size:12px}</style></head><body><h1>Search results for “${safeText(query)}”</h1><div class="result"><a href="https://www.google.com/search?q=${encoded}" target="_blank">Search Google for ${safeText(query)}</a><div class="url">google.com/search</div><p>Open current web results in a new tab.</p></div><div class="result"><a href="https://github.com/search?q=${encoded}" target="_blank">Search GitHub for ${safeText(query)}</a><div class="url">github.com/search</div><p>Find repositories, code, issues, and users.</p></div><div class="result"><a href="https://duckduckgo.com/?q=${encoded}" target="_blank">Search DuckDuckGo for ${safeText(query)}</a><div class="url">duckduckgo.com</div></div></body></html>`
  byId("browserStatus").textContent="Done · External results open in a new tab"
}

function initBrowser(){
  browserHome()
  byId("browserForm").addEventListener("submit",event=>{event.preventDefault();browse(byId("browserAddress").value)})
  byId("browserHome").addEventListener("click",browserHome)
  byId("browserBack").addEventListener("click",browserHome)
  window.addEventListener("win7:browse",event=>{browse(event.detail);openWindow("browserWindow")})
}

export function initApps(){
  initCalculator()
  initNotepad()
  initRun()
  initBrowser()
}
