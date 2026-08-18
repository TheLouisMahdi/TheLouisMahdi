import{profileText}from"./data.js"
import{askConfirm,askOpenFile,askSaveAs,askText}from"./interaction.js"
import{fileName,getEntry,readFile,resolvePath,roots,writeFile}from"./vfs.js"
import{openWindow,setCloseGuard}from"./window-manager.js"

const byId=id=>document.getElementById(id)
const DESKTOP=roots().desktop
let notePath=null
let noteStaticName=null
let noteEncoding="UTF-8"
let noteDirty=false

function currentName(){return notePath?fileName(notePath):(noteStaticName||"Untitled")}
function updateTitle(){byId("notepadTitle").textContent=`${noteDirty?"*":""}${currentName()} - Notepad`}

async function canDiscard(){
  if(!noteDirty)return true
  return askConfirm("Notepad",`Discard unsaved changes to ${currentName()}?`)
}

function setNotepad(name,text,path=null,encoding="UTF-8"){
  notePath=path
  noteStaticName=path?null:name
  noteEncoding=encoding||"UTF-8"
  noteDirty=false
  byId("noteText").value=text
  updateTitle()
  openWindow("notepadWindow")
}

async function replaceDocument(action){
  if(!(await canDiscard()))return false
  action()
  return true
}

async function saveAs(){
  const initial=notePath?fileName(notePath):noteStaticName&&noteStaticName.includes(".")?noteStaticName:"Untitled.txt"
  const result=await askSaveAs({name:initial,type:/\.txt$/i.test(initial)?"text":"all",encoding:noteEncoding})
  if(!result)return false
  writeFile(result.path,byId("noteText").value,DESKTOP,{encoding:result.encoding})
  notePath=result.path
  noteEncoding=result.encoding
  noteStaticName=null
  noteDirty=false
  updateTitle()
  window.dispatchEvent(new CustomEvent("win7:toast",{detail:`Saved ${fileName(result.path)} · ${noteEncoding}`}))
  return true
}

function saveCurrent(){
  if(!notePath){void saveAs();return}
  writeFile(notePath,byId("noteText").value,DESKTOP,{encoding:noteEncoding})
  noteDirty=false
  updateTitle()
  window.dispatchEvent(new CustomEvent("win7:toast",{detail:`Saved ${fileName(notePath)}`}))
}

function openFile(path,forceNotepad=false){
  const full=path.includes(":")?path:resolvePath(DESKTOP,path)
  const entry=getEntry(full)
  const content=readFile(full)
  if(content===null){window.dispatchEvent(new CustomEvent("win7:toast",{detail:`Windows cannot find '${path}'.`}));return false}
  if(entry?.kind==="photo"&&!forceNotepad){
    byId("imageTitle").textContent=`${fileName(full)} - Windows Photo Viewer`
    byId("imageView").src=content
    byId("imageView").alt=fileName(full)
    openWindow("imageWindow")
    return true
  }
  if(/\.html?$/i.test(full)&&!forceNotepad){window.dispatchEvent(new CustomEvent("win7:open-html",{detail:{path:full,content}}));return true}
  setNotepad(fileName(full),content,full,entry?.encoding||"UTF-8")
  return true
}

function opensInNotepad(path,forceNotepad=false){
  if(forceNotepad)return true
  const full=path.includes(":")?path:resolvePath(DESKTOP,path)
  const entry=getEntry(full)
  return entry?.kind!=="photo"&&!/\.html?$/i.test(full)
}

async function openFileSafely(path,forceNotepad=false){
  if(opensInNotepad(path,forceNotepad)&&!(await canDiscard()))return false
  return openFile(path,forceNotepad)
}

export function initNotepad(){
  const text=byId("noteText")
  const dropdowns=["noteFileDropdown","noteEditDropdown","noteFormatDropdown","noteViewDropdown","noteHelpDropdown"].map(byId)
  const closeMenu=except=>dropdowns.forEach(dropdown=>{if(dropdown!==except)dropdown.classList.add("hidden")})
  const bindMenu=(buttonId,dropdownId)=>byId(buttonId).addEventListener("click",event=>{event.stopPropagation();const dropdown=byId(dropdownId),open=dropdown.classList.contains("hidden");closeMenu(dropdown);dropdown.classList.toggle("hidden",!open)})

  bindMenu("noteFileMenu","noteFileDropdown")
  bindMenu("noteEditMenu","noteEditDropdown")
  bindMenu("noteFormatMenu","noteFormatDropdown")
  bindMenu("noteViewMenu","noteViewDropdown")
  bindMenu("noteHelpMenu","noteHelpDropdown")

  setCloseGuard("notepadWindow",canDiscard)
  byId("notepadWindow").addEventListener("pointerdown",event=>{if(!event.target.closest(".notepad-menu"))closeMenu()})
  byId("noteNew").addEventListener("click",()=>void replaceDocument(()=>setNotepad("Untitled","",null,"UTF-8")))
  byId("noteProfile").addEventListener("click",()=>void replaceDocument(()=>setNotepad("profile.txt",profileText(),null,"UTF-8")))
  byId("noteSave").addEventListener("click",()=>void saveAs())
  byId("noteSaveCurrent").addEventListener("click",saveCurrent)
  byId("noteOpen").addEventListener("click",async()=>{const path=await askOpenFile();if(path)await openFileSafely(path,true)})
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
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="n"){event.preventDefault();byId("noteNew").click()}
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="o"){event.preventDefault();byId("noteOpen").click()}
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="f"){event.preventDefault();void findText()}
    if(event.key==="F5"){event.preventDefault();replaceSelection(new Date().toLocaleString())}
  })
  text.addEventListener("keyup",updateStatus)
  text.addEventListener("click",updateStatus)
  text.addEventListener("input",()=>{noteDirty=true;updateTitle();updateStatus()})
  updateStatus()

  window.addEventListener("win7:open-file",event=>void openFileSafely(event.detail.path,event.detail.forceNotepad))
  window.addEventListener("win7:open-text",event=>void replaceDocument(()=>setNotepad(event.detail.name,event.detail.text,null,"UTF-8")))
}
