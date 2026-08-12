import{PROFILE,FILE_SYSTEM,profileText}from"./data.js"
import{navigate,resolveFolderFromPath}from"./explorer.js"

const byId=id=>document.getElementById(id)
let cmdPath="C:\\Users\\Eka"
let psPath="C:\\Users\\Eka"
const cmdHistory=[]
const psHistory=[]

const pathTargets={
  "c:\\":"cdrive",
  "c:\\users\\eka":"desktop",
  "c:\\users\\eka\\desktop":"desktop",
  "c:\\users\\eka\\documents":"documents",
  "c:\\users\\eka\\downloads":"downloads",
  "c:\\windows":"windows",
  "c:\\windows\\system32":"system32",
  "c:\\program files":"programfiles",
  "g:\\":"github",
  "d:\\":"ddrive"
}

function targetFor(path){return resolveFolderFromPath(path)||pathTargets[path.toLowerCase()]||null}
function namesFor(path){const target=targetFor(path);return target&&FILE_SYSTEM[target]?FILE_SYSTEM[target].items.map(item=>item.name):[]}
function append(id,text=""){const out=byId(id);out.textContent+=`${text}\n`;out.scrollTop=out.scrollHeight}
function setCmdPrompt(){byId("cmdPrompt").textContent=`${cmdPath}>`}
function setPsPrompt(){byId("psPrompt").textContent=`PS ${psPath}> `}

function cd(current,arg){
  const raw=arg.trim().replace(/^["']|["']$/g,"")
  if(!raw)return current
  if(raw===".."){
    const parts=current.split("\\")
    if(parts.length>1)parts.pop()
    return parts.join("\\")||"C:\\"
  }
  if(/^[a-z]:\\?$/i.test(raw))return raw.endsWith("\\")?raw:`${raw}\\`
  if(raw.includes(":\\"))return raw.replace(/\\+$/,"")
  return `${current.replace(/\\+$/,"")}\\${raw}`.replace(/\\+/g,"\\")
}

function cmdDir(){
  const names=namesFor(cmdPath)
  if(!names.length)return ` Volume in drive ${cmdPath[0]} has no label.\n Directory of ${cmdPath}\n\n              0 File(s)`
  const lines=names.map((name,index)=>`08/12/2026  09:${String(20+index).padStart(2,"0")} PM    <DIR>          ${name}`)
  return ` Volume in drive ${cmdPath[0]} is ${cmdPath[0]==="G"?"GITHUB":"Windows"}\n Directory of ${cmdPath}\n\n${lines.join("\n")}\n\n              ${names.length} Dir(s)`
}

function startTarget(value){
  const lower=value.trim().toLowerCase()
  const apps={cmd:"cmd",powershell:"powershell",notepad:"notepad",calc:"calculator",calculator:"calculator",explorer:"explorer"}
  if(apps[lower]){window.dispatchEvent(new CustomEvent("win7:open-app",{detail:apps[lower]}));return true}
  if(lower.includes("github")){window.open(PROFILE.github,"_blank","noopener,noreferrer");return true}
  if(lower.includes("telegram")||lower.includes("t.me")){window.open(PROFILE.telegramUrl,"_blank","noopener,noreferrer");return true}
  return false
}

function runCmd(line){
  const trimmed=line.trim()
  if(!trimmed)return
  const [commandRaw,...rest]=trimmed.split(/\s+/)
  const command=commandRaw.toLowerCase()
  const arg=rest.join(" ")
  if(command==="help")return append("cmdOutput","ASSOC  CD  CLS  DATE  DIR  ECHO  EXIT  HELP  HOSTNAME  START  TIME  TREE  TYPE  VER  WHOAMI\nPortfolio commands: github  projects  telegram  profile")
  if(command==="ver")return append("cmdOutput","Microsoft Windows [Version 6.1.7601]")
  if(command==="dir")return append("cmdOutput",cmdDir())
  if(command==="cls")return byId("cmdOutput").textContent=""
  if(command==="echo")return append("cmdOutput",arg)
  if(command==="whoami")return append("cmdOutput","eka-pc\\eka")
  if(command==="hostname")return append("cmdOutput","EKA-PC")
  if(command==="date"&&arg.toLowerCase()==="/t")return append("cmdOutput",new Date().toLocaleDateString())
  if(command==="time"&&arg.toLowerCase()==="/t")return append("cmdOutput",new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}))
  if(command==="tree")return append("cmdOutput",`${cmdPath}\n├── Projects\n├── Documents\n├── Downloads\n└── Pictures`)
  if(command==="type"&&arg.toLowerCase()==="profile.txt")return append("cmdOutput",profileText())
  if(command==="start"){if(startTarget(arg))return;return append("cmdOutput",`Windows cannot find '${arg}'.`)}
  if(command==="cd"||command==="chdir"){
    const next=cd(cmdPath,arg)
    if(targetFor(next)||next.toLowerCase()==="c:\\users\\eka"){cmdPath=next;setCmdPrompt()}
    else append("cmdOutput","The system cannot find the path specified.")
    return
  }
  if(command==="github"){window.open(PROFILE.github,"_blank","noopener,noreferrer");return}
  if(command==="telegram"){window.open(PROFILE.telegramUrl,"_blank","noopener,noreferrer");return}
  if(command==="projects"){navigate("projects");return}
  if(command==="profile")return append("cmdOutput",profileText())
  if(command==="exit"){document.getElementById("cmdWindow").classList.add("hidden");return}
  append("cmdOutput",`'${commandRaw}' is not recognized as an internal or external command,\noperable program or batch file.`)
}

function psList(){
  const names=namesFor(psPath)
  return names.length?`    Directory: ${psPath}\n\nMode                LastWriteTime     Length Name\n----                -------------     ------ ----\n${names.map(name=>`d----        8/12/2026  9:27 PM            ${name}`).join("\n")}`:`    Directory: ${psPath}\n\n`
}

function runPs(line){
  const trimmed=line.trim()
  if(!trimmed)return
  const lower=trimmed.toLowerCase()
  if(lower==="$psversiontable")return append("psOutput","Name                           Value\n----                           -----\nCLRVersion                     2.0.50727.4927\nBuildVersion                   6.1.7600.16385\nPSVersion                      2.0\nWSManStackVersion              2.0\nPSCompatibleVersions           {1.0, 2.0}\nSerializationVersion           1.1.0.1")
  if(["get-childitem","gci","dir","ls"].includes(lower))return append("psOutput",psList())
  if(["get-location","gl","pwd"].includes(lower))return append("psOutput",`\nPath\n----\n${psPath}\n`)
  if(["clear-host","clear","cls"].includes(lower)){byId("psOutput").textContent="";return}
  if(lower==="get-date")return append("psOutput",new Date().toString())
  if(lower==="get-process")return append("psOutput","Handles  NPM(K)    PM(K)      WS(K) VM(M)   CPU(s)     Id ProcessName\n-------  ------    -----      ----- -----   ------     -- -----------\n    326      18    25640      41212   184     2.41   1648 explorer\n    121       8     9216      17140    72     0.42   2452 powershell\n     96       6     6232      11208    55     0.11   3024 cmd")
  if(lower==="get-command")return append("psOutput","CommandType     Name\n-----------     ----\nCmdlet          Get-ChildItem\nCmdlet          Get-Location\nCmdlet          Get-Date\nCmdlet          Get-Process\nCmdlet          Set-Location\nCmdlet          Write-Output\nAlias           dir\nAlias           ls\nAlias           pwd")
  if(lower.startsWith("get-help"))return append("psOutput","Windows PowerShell 2.0 help\nTry: Get-ChildItem, Get-Location, Set-Location, Get-Date, Get-Process, Get-Command, Write-Output, Start-Process")
  if(lower.startsWith("write-output ")||lower.startsWith("echo ")){const value=trimmed.slice(trimmed.indexOf(" ")+1).replace(/^["']|["']$/g,"");return append("psOutput",value)}
  if(lower.startsWith("get-content ")){const value=trimmed.slice(trimmed.indexOf(" ")+1).replace(/^["']|["']$/g,"").toLowerCase();if(value==="profile.txt")return append("psOutput",profileText())}
  if(lower.startsWith("set-location ")||lower.startsWith("cd ")){
    const arg=trimmed.slice(trimmed.indexOf(" ")+1)
    const next=cd(psPath,arg)
    if(targetFor(next)||next.toLowerCase()==="c:\\users\\eka"){psPath=next;setPsPrompt()}
    else append("psOutput",`Set-Location : Cannot find path '${next}' because it does not exist.`)
    return
  }
  if(lower.startsWith("start-process ")){const arg=trimmed.slice(trimmed.indexOf(" ")+1).replace(/^["']|["']$/g,"");if(startTarget(arg))return;return append("psOutput",`Start-Process : This portfolio cannot launch '${arg}'.`)}
  if(lower==="github"){window.open(PROFILE.github,"_blank","noopener,noreferrer");return}
  if(lower==="telegram"){window.open(PROFILE.telegramUrl,"_blank","noopener,noreferrer");return}
  if(lower==="projects"){navigate("projects");return}
  if(lower==="profile")return append("psOutput",profileText())
  append("psOutput",`The term '${trimmed.split(/\s+/)[0]}' is not recognized as the name of a cmdlet, function, script file, or operable program.`)
}

function bindHistory(input,history,runner){
  let index=history.length
  input.addEventListener("keydown",event=>{
    if(event.key==="ArrowUp"){event.preventDefault();if(history.length){index=Math.max(0,index-1);input.value=history[index]||""}}
    if(event.key==="ArrowDown"){event.preventDefault();if(history.length){index=Math.min(history.length,index+1);input.value=history[index]||""}}
  })
  return value=>{if(value.trim()){history.push(value);index=history.length}runner(value)}
}

export function initTerminals(){
  append("cmdOutput","Microsoft Windows [Version 6.1.7601]\nCopyright (c) 2009 Microsoft Corporation.  All rights reserved.\n\nType HELP for available commands.")
  setCmdPrompt()
  const cmdRun=bindHistory(byId("cmdInput"),cmdHistory,runCmd)
  byId("cmdForm").addEventListener("submit",event=>{event.preventDefault();const value=byId("cmdInput").value;append("cmdOutput",`${cmdPath}>${value}`);byId("cmdInput").value="";cmdRun(value);setCmdPrompt()})
  append("psOutput","Windows PowerShell\nCopyright (C) 2009 Microsoft Corporation. All rights reserved.\n\nType Get-Help for available commands.")
  setPsPrompt()
  const psRun=bindHistory(byId("psInput"),psHistory,runPs)
  byId("psForm").addEventListener("submit",event=>{event.preventDefault();const value=byId("psInput").value;append("psOutput",`PS ${psPath}> ${value}`);byId("psInput").value="";psRun(value);setPsPrompt()})
}
