import{getEntry,readFile,resolvePath,roots,writeFile}from"./vfs.js"
import{closeWindow}from"./window-manager.js"

const byId=id=>document.getElementById(id)
const DESKTOP=roots().desktop

function splitCommand(value){
  const parts=[]
  String(value||"").replace(/"([^"]*)"|'([^']*)'|(\S+)/g,(_,a,b,c)=>{parts.push(a??b??c);return ""})
  return parts
}

function openPath(value){
  const full=String(value).includes(":")?value:resolvePath(DESKTOP,value)
  const entry=getEntry(full)
  if(!entry)return false
  if(entry.kind==="folder")window.dispatchEvent(new CustomEvent("win7:explorer-path",{detail:full}))
  else window.dispatchEvent(new CustomEvent("win7:open-file",{detail:{path:full,forceNotepad:false}}))
  return true
}

function launch(value){
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
    window.dispatchEvent(new CustomEvent("win7:open-file",{detail:{path:full,forceNotepad:true}}))
    return
  }
  if(name==="explorer"&&arg){window.dispatchEvent(new CustomEvent("win7:explorer-path",{detail:arg}));return}
  if(apps[name]){window.dispatchEvent(new CustomEvent("win7:open-app",{detail:apps[name]}));return}
  if(["eka","matrix","coffee","fortune"].includes(name)){window.dispatchEvent(new CustomEvent("win7:cmd-run",{detail:name}));return}
  if(name==="github"){window.open("https://github.com/TheLouisMahdi","_blank","noopener,noreferrer");return}
  if(name==="telegram"){window.open("https://t.me/thelouis_mahdi","_blank","noopener,noreferrer");return}
  if(/^https?:\/\//i.test(value)){window.open(value,"_blank","noopener,noreferrer");return}
  if(name==="shutdown"){window.dispatchEvent(new CustomEvent("win7:power",{detail:parts.includes("/r")?"restart":"shutdown"}));return}
  if(openPath(value))return
  window.dispatchEvent(new CustomEvent("win7:toast",{detail:`Windows cannot find '${value}'.`}))
}

export function initRun(){
  byId("runForm").addEventListener("submit",event=>{
    event.preventDefault()
    const value=byId("runInput").value
    void closeWindow(byId("runWindow"))
    byId("runInput").value=""
    launch(value)
  })
  byId("runCancel").addEventListener("click",()=>void closeWindow(byId("runWindow")))
}
