import{FILE_SYSTEM,PROFILE,profileText}from"./data.js"
import{navigate,resolveFolderFromPath}from"./explorer.js"
import{closeWindow,openWindow}from"./window-manager.js"
import{copyPath,deletePath,fileName,getEntry,listVirtual,makeFolder,movePath,readFile,renamePath,resolvePath,roots,writeFile}from"./vfs.js"
import{getPythonVersion,runPythonFile}from"./python.js"

const byId=id=>document.getElementById(id)
let cmdPath="C:\\Users\\Eka"
let psPath="C:\\Users\\Eka"
const cmdHistory=[]
const psHistory=[]
const psExecuted=[]
const DESKTOP=roots().desktop
const ENV={USERNAME:"Eka",COMPUTERNAME:"EKA-PC",USERPROFILE:"C:\\Users\\Eka",HOMEDRIVE:"C:",HOMEPATH:"\\Users\\Eka",WINDIR:"C:\\Windows",SYSTEMROOT:"C:\\Windows",COMSPEC:"C:\\Windows\\System32\\cmd.exe",PATH:"C:\\Windows\\system32;C:\\Windows;C:\\Windows\\System32\\WindowsPowerShell\\v1.0"}

const HELP={
  dir:"Displays a list of files and subdirectories in a directory.",cd:"Displays or changes the current directory.",cls:"Clears the screen.",echo:"Displays messages or writes text to a virtual file with > or >>.",type:"Displays the contents of a text file.",copy:"Copies a writable virtual file.",move:"Moves a writable virtual file.",ren:"Renames a writable virtual file.",del:"Deletes one or more writable virtual files.",mkdir:"Creates a virtual folder.",rmdir:"Removes an empty virtual folder.",tree:"Graphically displays the folder structure.",start:"Starts an app, file, URL, or Explorer location.",where:"Displays locations of common executables.",tasklist:"Displays the simulated processes in this Windows session.",systeminfo:"Displays Windows 7-style system configuration.",ipconfig:"Displays simulated TCP/IP configuration.",python:"Runs a saved .py file using the browser Python runtime.",notepad:"Opens a file in Notepad.",explorer:"Opens Windows Explorer.",help:"Provides Help information for supported commands."
}

function expandEnv(value){return String(value||"").replace(/%([^%]+)%/g,(all,name)=>ENV[name.toUpperCase()]??all)}

function tokenize(value){
  const parts=[]
  String(value||"").replace(/"([^"]*)"|'([^']*)'|(\S+)/g,(_,a,b,c)=>{parts.push(a??b??c);return ""})
  return parts
}

function append(id,text=""){
  const out=byId(id)
  out.textContent+=`${text}\n`
  out.scrollTop=out.scrollHeight
}

function setCmdPrompt(){byId("cmdPrompt").textContent=`${cmdPath}>`}
function setPsPrompt(){byId("psPrompt").textContent=`PS ${psPath}> `}

function folderExists(path){
  const normalized=resolvePath(path,path)
  if(Object.values(roots()).some(root=>root.toLowerCase()===normalized.toLowerCase()))return true
  if(normalized.toLowerCase()==="c:\\users\\eka")return true
  if(resolveFolderFromPath(normalized))return true
  return getEntry(normalized)?.kind==="folder"
}

function itemsForPath(path){
  const lower=path.toLowerCase().replace(/\\+$/,"")
  if(lower==="c:\\users\\eka")return [{name:"Desktop",type:"folder"},{name:"Documents",type:"folder"},{name:"Downloads",type:"folder"}]
  const target=resolveFolderFromPath(path)
  if(target){
    if(target.startsWith("vfs:"))return listVirtual(path)
    const base=FILE_SYSTEM[target]?.items||[]
    return [...base,...listVirtual(target)]
  }
  const entry=getEntry(path)
  if(entry?.kind==="folder")return listVirtual(path)
  return []
}

function changeDir(current,arg){
  let raw=String(arg||"").trim().replace(/^\/d\s+/i,"")
  if(!raw)return current
  if(/^[a-z]:$/i.test(raw))raw+="\\"
  return resolvePath(current,raw)
}

function fileText(path,cwd){
  const text=readFile(path,cwd)
  if(text!==null)return text
  const name=fileName(resolvePath(cwd,path)).toLowerCase()
  if(name==="profile.txt")return profileText()
  return null
}

function cmdDir(path=cmdPath){
  const target=path?resolvePath(cmdPath,path):cmdPath
  if(!folderExists(target))return `File Not Found\nThe system cannot find the path specified.`
  const items=itemsForPath(target)
  const stamp=new Date().toLocaleDateString("en-US",{month:"2-digit",day:"2-digit",year:"numeric"})
  const lines=items.map(item=>{
    const entry=item.virtualPath?getEntry(item.virtualPath):null
    const dir=item.type==="folder"||item.type==="drive"||item.target&&FILE_SYSTEM[item.target]
    const size=dir?"<DIR>         ":String(new Blob([entry?.content||""]).size).padStart(14," ")
    return `${stamp}  09:27 PM    ${size} ${item.name}`
  })
  return ` Volume in drive ${target[0]||"C"} is ${target[0]==="G"?"GITHUB":"Windows"}\n Volume Serial Number is EKA7-2026\n\n Directory of ${target}\n\n${lines.join("\n")}\n\n              ${items.length} item(s)`
}

function openApp(name){window.dispatchEvent(new CustomEvent("win7:open-app",{detail:name}))}

function openTarget(value,cwd=cmdPath){
  const raw=String(value||"").trim().replace(/^"|"$/g,"")
  if(!raw||raw==="."){window.dispatchEvent(new CustomEvent("win7:explorer-path",{detail:cwd}));return true}
  const lower=raw.toLowerCase().replace(/\.exe$/i,"")
  const apps={cmd:"cmd",powershell:"powershell",notepad:"notepad",calc:"calculator",calculator:"calculator",explorer:"explorer",iexplore:"browser",mspaint:"paint",paint:"paint",write:"wordpad",wordpad:"wordpad",wmplayer:"media",taskmgr:"taskmanager",control:"control",osk:"keyboard",charmap:"charmap",snippingtool:"snipping",stikynot:"sticky",minesweeper:"minesweeper",solitaire:"solitaire",freecell:"freecell",chess:"chess",msinfo32:"systeminfo"}
  if(apps[lower]){openApp(apps[lower]);return true}
  if(lower==="github"){window.open(PROFILE.github,"_blank","noopener,noreferrer");return true}
  if(lower==="telegram"){window.open(PROFILE.telegramUrl,"_blank","noopener,noreferrer");return true}
  if(/^https?:\/\//i.test(raw)){window.open(raw,"_blank","noopener,noreferrer");return true}
  const full=raw.includes(":")?raw:resolvePath(cwd,raw)
  if(folderExists(full)){window.dispatchEvent(new CustomEvent("win7:explorer-path",{detail:full}));return true}
  if(getEntry(full)){window.dispatchEvent(new CustomEvent("win7:open-file",{detail:{path:full}}));return true}
  return false
}

function splitRedirect(line){
  const match=String(line).match(/^echo\s+(.*?)\s*(>>|>)\s*(.+)$/i)
  return match?{text:match[1],mode:match[2],file:match[3].trim().replace(/^"|"$/g,"")}:null
}

async function runPython(args,outId,path){
  if(!args.length||["--version","-v","-V"].map(value=>value.toLowerCase()).includes(args[0].toLowerCase())){
    append(outId,"Loading Python WebAssembly runtime...")
    try{const version=await getPythonVersion();append(outId,`Python ${version} · Pyodide browser runtime`)}catch(error){append(outId,`Python runtime error: ${error.message}`)}
    return
  }
  const file=args.find(arg=>/\.py$/i.test(arg))||args.find(arg=>!arg.startsWith("-"))
  if(!file){append(outId,"Python usage: python script.py  or  py script.py");return}
  append(outId,`[Python] Running ${file}...`)
  try{
    const result=await runPythonFile(file,path)
    if(result.stdout)append(outId,result.stdout.replace(/\n$/,"") )
    if(result.stderr)append(outId,result.stderr.replace(/\n$/,"") )
    if(!result.stdout&&!result.stderr)append(outId,"[Python] Process finished with exit code 0.")
  }catch(error){append(outId,error.message)}
}

function cmdAttrib(path=cmdPath){
  const target=path?resolvePath(cmdPath,path):cmdPath
  const entry=getEntry(target)
  if(entry&&entry.kind!=="folder")return `A            ${entry.path}`
  return itemsForPath(target).map(item=>`${item.type==="folder"?"   D":"A   "}         ${item.virtualPath||resolvePath(target,item.name)}`).join("\n")
}

function findStr(parts){
  const insensitive=parts.some(part=>part.toLowerCase()==="/i")
  const args=parts.filter(part=>!part.startsWith("/"))
  if(args.length<2)return "FINDSTR: Bad command line"
  const pattern=args[0]
  const text=fileText(args[1],cmdPath)
  if(text===null)return `FINDSTR: Cannot open ${args[1]}`
  const needle=insensitive?pattern.toLowerCase():pattern
  return text.split(/\r?\n/).filter(line=>(insensitive?line.toLowerCase():line).includes(needle)).join("\n")
}

function pingText(host){
  const name=String(host||"").trim()
  if(!name)return "Usage: ping target_name"
  if(["localhost","127.0.0.1"].includes(name.toLowerCase()))return `Pinging ${name} [127.0.0.1] with 32 bytes of data:\nReply from 127.0.0.1: bytes=32 time<1ms TTL=128\nReply from 127.0.0.1: bytes=32 time<1ms TTL=128\nReply from 127.0.0.1: bytes=32 time<1ms TTL=128\nReply from 127.0.0.1: bytes=32 time<1ms TTL=128\n\nPing statistics for 127.0.0.1:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`
  return `Pinging ${name}...\nThis browser-hosted Windows 7 simulation does not expose raw ICMP networking.`
}

function netstatText(){return `Active Connections\n\n  Proto  Local Address          Foreign Address        State\n  TCP    127.0.0.1:browser      127.0.0.1:runtime      ESTABLISHED`}
function driverQuery(){return `Module Name  Display Name                 Driver Type   Link Date\n===========  ============================ ============= ======================\nACPI         Microsoft ACPI Driver        Kernel        7/13/2009 7:11:32 PM\ndisk         Disk Driver                  Kernel        7/13/2009 6:20:47 PM\nndis         NDIS System Driver           Kernel        7/13/2009 7:12:03 PM`}

function setCmdColor(code){
  const value=String(code||"").trim().toLowerCase()
  if(!/^[0-9a-f]{2}$/.test(value))return false
  const colors={0:"#000",1:"#000080",2:"#008000",3:"#008080",4:"#800000",5:"#800080",6:"#808000",7:"#c0c0c0",8:"#808080",9:"#0000ff",a:"#00ff00",b:"#00ffff",c:"#ff0000",d:"#ff00ff",e:"#ffff00",f:"#fff"}
  const win=byId("cmdWindow")
  win.querySelector(".cmd-console").style.backgroundColor=colors[value[0]]
  win.querySelector(".cmd-console").style.color=colors[value[1]]
  win.querySelector(".console-input-row").style.backgroundColor=colors[value[0]]
  win.querySelector(".console-input-row").style.color=colors[value[1]]
  return true
}

function taskList(){return `Image Name                     PID Session Name        Mem Usage\n========================= ======== ================ ============\nSystem Idle Process              0 Services                   24 K\nSystem                           4 Services                1,820 K\nexplorer.exe                  1648 Console                41,212 K\ncmd.exe                       3024 Console                11,208 K\npowershell.exe                2452 Console                17,140 K\niexplore.exe                  3316 Console                32,804 K`}
function systemInfo(){return `Host Name:                 EKA-PC\nOS Name:                   Microsoft Windows 7 Professional\nOS Version:                6.1.7600 Build 7600\nOS Manufacturer:           Microsoft Corporation\nSystem Type:               X86-based PC\nRegistered Owner:          Eka\nWindows Directory:         C:\\Windows\nSystem Directory:         C:\\Windows\\system32\nBoot Device:               \\Device\\HarddiskVolume1\nSystem Locale:             en-us;English (United States)\nTime Zone:                 Local browser time\nTotal Physical Memory:     4,096 MB\nAvailable Physical Memory: 2,718 MB`}
function ipConfig(){return `Windows IP Configuration\n\nEthernet adapter Local Area Connection:\n\n   Connection-specific DNS Suffix  . : local\n   IPv4 Address. . . . . . . . . . . : 192.168.1.27\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1`}

function whereOutput(name){
  const table={cmd:"C:\\Windows\\System32\\cmd.exe",powershell:"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",notepad:"C:\\Windows\\System32\\notepad.exe",calc:"C:\\Windows\\System32\\calc.exe",explorer:"C:\\Windows\\explorer.exe",mspaint:"C:\\Windows\\System32\\mspaint.exe",write:"C:\\Program Files\\Windows NT\\Accessories\\wordpad.exe",wmplayer:"C:\\Program Files\\Windows Media Player\\wmplayer.exe",iexplore:"C:\\Program Files\\Internet Explorer\\iexplore.exe",taskmgr:"C:\\Windows\\System32\\taskmgr.exe",control:"C:\\Windows\\System32\\control.exe",python:"C:\\Users\\Eka\\BrowserRuntime\\python.exe"}
  return table[name.toLowerCase().replace(/\.exe$/i,"")]||`INFO: Could not find files for the given pattern(s).`
}

function treeText(path){
  const items=itemsForPath(path)
  if(!items.length)return path
  return `${path}\n${items.map((item,index)=>`${index===items.length-1?"└──":"├──"} ${item.name}`).join("\n")}`
}

function customCommand(command,outId){
  if(command==="eka"){append(outId,"EKA / THELOUISMAHDI\nElectrical Engineering · FPGA · Embedded · AI Vision\nGitHub: github.com/TheLouisMahdi\nTip: type 'coffee', 'matrix', or open 'Eka Command Deck.txt'.");return true}
  if(command==="matrix"){append(outId,Array.from({length:9},()=>Array.from({length:54},()=>Math.random()>.52?Math.floor(Math.random()*2):" ").join("")).join("\n"));return true}
  if(command==="coffee"){append(outId,"COFFEE.SYS status: REQUIRED\nDeveloper uptime: questionable\nBuild motivation: 100%\nThermal limit: one more bug");return true}
  if(command==="fortune"){
    const lines=["Small tools finished well beat giant ideas left half-built.","If it can be measured, it can probably be optimized.","Build it once. Understand it twice.","Hardware says no. Debugger says maybe."]
    append(outId,lines[Math.floor(Math.random()*lines.length)]);return true
  }
  return false
}

async function runCmd(line){
  const trimmed=expandEnv(line.trim())
  if(!trimmed)return
  const redirect=splitRedirect(trimmed)
  if(redirect){
    const old=redirect.mode===">>"?fileText(redirect.file,cmdPath)||"":""
    writeFile(redirect.file,`${old}${old?"\n":""}${redirect.text}`,cmdPath)
    return
  }
  const parts=tokenize(trimmed)
  const commandRaw=parts.shift()||""
  const command=commandRaw.toLowerCase()
  const arg=parts.join(" ")
  if(customCommand(command,"cmdOutput"))return
  if(command==="help"){
    if(parts.length){append("cmdOutput",`${parts[0].toUpperCase()}\n${HELP[parts[0].toLowerCase()]||"No detailed help is available for this command."}`);return}
    append("cmdOutput","ASSOC  ATTRIB  CD  CHDIR  CLS  COLOR  CONTROL  COPY  DATE  DEL  DIR  DRIVERQUERY  ECHO  ERASE  EXIT  EXPLORER  FINDSTR  FTYPE  GETMAC  HELP  HOSTNAME  IPCONFIG  MD  MKDIR  MORE  MOVE  NETSTAT  NOTEPAD  PATH  PAUSE  PING  POWERSHELL  PY  PYTHON  RD  REN  RMDIR  SET  SHUTDOWN  SORT  START  SYSTEMINFO  TASKLIST  TIME  TITLE  TREE  TYPE  VER  VOL  WHERE  WHOAMI  WMIC\n\nWindows apps: MSPAINT  WRITE  WMPLAYER  IEXPLORE  TASKMGR  OSK  CHARMAP  SNIPPINGTOOL  STIKYNOT  MSINFO32\nEka commands: EKA  GITHUB  PROJECTS  TELEGRAM  PROFILE  MATRIX  COFFEE  FORTUNE");return
  }
  if(command==="ver"){append("cmdOutput","Microsoft Windows [Version 6.1.7600]");return}
  if(command==="vol"){append("cmdOutput",` Volume in drive ${cmdPath[0]} is Windows\n Volume Serial Number is EKA7-2026`);return}
  if(command==="dir"){append("cmdOutput",cmdDir(arg||cmdPath));return}
  if(command==="cls"){byId("cmdOutput").textContent="";return}
  if(command==="echo"){append("cmdOutput",arg);return}
  if(command==="whoami"){append("cmdOutput","eka-pc\\eka");return}
  if(command==="hostname"){append("cmdOutput","EKA-PC");return}
  if(command==="date"&&parts[0]?.toLowerCase()==="/t"){append("cmdOutput",new Date().toLocaleDateString());return}
  if(command==="time"&&parts[0]?.toLowerCase()==="/t"){append("cmdOutput",new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}));return}
  if(command==="tasklist"){append("cmdOutput",taskList());return}
  if(command==="systeminfo"){append("cmdOutput",systemInfo());return}
  if(command==="ipconfig"){append("cmdOutput",ipConfig());return}
  if(command==="getmac"){append("cmdOutput","Physical Address    Transport Name\n=================== ==========================================================\n02-45-4B-41-30-37   \\Device\\Tcpip_{EKA-WIN7-BROWSER}");return}
  if(command==="netstat"){append("cmdOutput",netstatText());return}
  if(command==="ping"){append("cmdOutput",pingText(parts[0]));return}
  if(command==="driverquery"){append("cmdOutput",driverQuery());return}
  if(command==="wmic"){append("cmdOutput",arg.toLowerCase().startsWith("os")?"Caption                        Version   BuildNumber\nMicrosoft Windows 7 Professional  6.1.7600  7600":"WMIC simulation supports: wmic os get caption,version,buildnumber");return}
  if(command==="assoc"){const associations={".txt":"txtfile",".html":"htmlfile",".htm":"htmlfile",".py":"Python.File",".cmd":"cmdfile",".bat":"batfile"};if(arg)append("cmdOutput",associations[arg.toLowerCase()]?`${arg.toLowerCase()}=${associations[arg.toLowerCase()]}`:`File association not found for extension ${arg}`);else append("cmdOutput",Object.entries(associations).map(([extension,type])=>`${extension}=${type}`).join("\n"));return}
  if(command==="ftype"){append("cmdOutput",arg&&arg.toLowerCase()!=="python.file"?`File type '${arg}' not found or no open command associated with it.`:'Python.File="C:\\Users\\Eka\\BrowserRuntime\\python.exe" "%1" %*\ntxtfile=%SystemRoot%\\system32\\NOTEPAD.EXE %1\nhtmlfile="C:\\Program Files\\Internet Explorer\\iexplore.exe" -nohome');return}
  if(command==="attrib"){append("cmdOutput",cmdAttrib(arg||cmdPath));return}
  if(command==="findstr"){append("cmdOutput",findStr(parts));return}
  if(command==="more"){const text=fileText(arg,cmdPath);append("cmdOutput",text===null?"Cannot access file.":text);return}
  if(command==="sort"){const text=fileText(arg,cmdPath);append("cmdOutput",text===null?"The system cannot find the file specified.":text.split(/\r?\n/).sort((a,b)=>a.localeCompare(b)).join("\n"));return}
  if(command==="set"){
    if(!arg){append("cmdOutput",Object.entries(ENV).sort().map(([k,v])=>`${k}=${v}`).join("\n"));return}
    const eq=arg.indexOf("=")
    if(eq<1){const prefix=arg.toUpperCase();append("cmdOutput",Object.entries(ENV).filter(([k])=>k.startsWith(prefix)).map(([k,v])=>`${k}=${v}`).join("\n"));return}
    ENV[arg.slice(0,eq).trim().toUpperCase()]=arg.slice(eq+1);return
  }
  if(command==="path"){if(arg)ENV.PATH=arg;append("cmdOutput",`PATH=${ENV.PATH}`);return}
  if(command==="title"){byId("cmdWindow").querySelector(".window-title").textContent=arg||"Command Prompt";return}
  if(command==="color"){if(!arg){setCmdColor("0f");return}if(!setCmdColor(arg))append("cmdOutput","Sets the default console foreground and background colors. Example: COLOR 0A");return}
  if(command==="pause"){append("cmdOutput","Press any key to continue . . .");return}
  if(command==="cmd"){
    if(parts[0]?.toLowerCase()==="/c"){await runCmd(parts.slice(1).join(" "));return}
    append("cmdOutput","Microsoft Windows [Version 6.1.7600]");return
  }
  if(command==="tree"){append("cmdOutput",treeText(arg?resolvePath(cmdPath,arg):cmdPath));return}
  if(command==="where"){append("cmdOutput",whereOutput(parts[0]||""));return}
  if(command==="type"){
    const text=fileText(arg,cmdPath)
    append("cmdOutput",text===null?"The system cannot find the file specified.":text);return
  }
  if(command==="cd"||command==="chdir"){
    if(!arg){append("cmdOutput",cmdPath);return}
    const next=changeDir(cmdPath,arg)
    if(folderExists(next)){cmdPath=next;setCmdPrompt()}else append("cmdOutput","The system cannot find the path specified.")
    return
  }
  if(/^[a-z]:$/i.test(commandRaw)){
    const next=`${commandRaw.toUpperCase()}\\`
    if(folderExists(next)){cmdPath=next;setCmdPrompt()}else append("cmdOutput","The system cannot find the drive specified.")
    return
  }
  if(command==="copy"&&parts.length>=2){const result=copyPath(parts[0],parts[1],cmdPath);append("cmdOutput",result?"        1 file(s) copied.":"The system cannot find the file specified.");return}
  if(command==="move"&&parts.length>=2){const result=movePath(parts[0],parts[1],cmdPath);append("cmdOutput",result?"        1 file(s) moved.":"The system cannot find the file specified.");return}
  if(command==="ren"||command==="rename"){
    const result=parts.length>=2?renamePath(resolvePath(cmdPath,parts[0]),parts[1]):null
    if(!result)append("cmdOutput","The system cannot find the file specified or the destination already exists.")
    return
  }
  if(command==="del"||command==="erase"){const target=parts.length?resolvePath(cmdPath,parts[0]):null,entry=target?getEntry(target):null;if(!entry||entry.kind==="folder"||!deletePath(target))append("cmdOutput","Could Not Find the specified file.");return}
  if(command==="mkdir"||command==="md"){if(!arg||!makeFolder(arg,cmdPath))append("cmdOutput","A subdirectory or file already exists.");return}
  if(command==="rmdir"||command==="rd"){const target=arg?resolvePath(cmdPath,arg):null,entry=target?getEntry(target):null;if(!entry||entry.kind!=="folder"||!deletePath(target))append("cmdOutput","The directory is not empty or could not be found.");return}
  if(command==="start"){if(!openTarget(arg,cmdPath))append("cmdOutput",`Windows cannot find '${arg}'.`);return}
  if(command==="explorer"){window.dispatchEvent(new CustomEvent("win7:explorer-path",{detail:arg||cmdPath}));return}
  if(command==="notepad"){
    const full=arg?resolvePath(cmdPath,arg):resolvePath(DESKTOP,"Untitled.txt")
    if(arg&&readFile(full)===null&&!writeFile(full,"")){append("cmdOutput","The system cannot find the path specified.");return}
    if(arg)window.dispatchEvent(new CustomEvent("win7:open-file",{detail:{path:full,forceNotepad:true}}));else openApp("notepad")
    return
  }
  if(command==="calc"){openApp("calculator");return}
  if(command==="mspaint"||command==="paint"){openApp("paint");return}
  if(["solitaire","freecell","minesweeper","chess"].includes(command)){openApp(command);return}
  if(command==="write"||command==="wordpad"){openApp("wordpad");return}
  if(command==="wmplayer"){openApp("media");return}
  if(command==="iexplore"){openApp("browser");return}
  if(command==="taskmgr"){openApp("taskmanager");return}
  if(command==="control"){openApp("control");return}
  if(command==="osk"){openApp("keyboard");return}
  if(command==="charmap"){openApp("charmap");return}
  if(command==="snippingtool"){openApp("snipping");return}
  if(command==="stikynot"){openApp("sticky");return}
  if(command==="minesweeper"){openApp("minesweeper");return}
  if(command==="msinfo32"){openApp("systeminfo");return}
  if(command==="shutdown"){
    const action=parts.some(part=>part.toLowerCase()==="/r")?"restart":parts.some(part=>part.toLowerCase()==="/l")?"logoff":"shutdown"
    window.dispatchEvent(new CustomEvent("win7:power",{detail:action}));return
  }
  if(command==="powershell"){openApp("powershell");return}
  if(command==="python"||command==="python3"||command==="py"){await runPython(parts,"cmdOutput",cmdPath);return}
  if(command==="github"){window.open(PROFILE.github,"_blank","noopener,noreferrer");return}
  if(command==="telegram"){window.open(PROFILE.telegramUrl,"_blank","noopener,noreferrer");return}
  if(command==="projects"){navigate("projects");return}
  if(command==="profile"){append("cmdOutput",profileText());return}
  if(command==="exit"){void closeWindow(byId("cmdWindow"));return}
  append("cmdOutput",`'${commandRaw}' is not recognized as an internal or external command,\noperable program or batch file.`)
}

function psList(path=psPath){
  const target=path?resolvePath(psPath,path):psPath
  const items=itemsForPath(target)
  if(!folderExists(target))return `Get-ChildItem : Cannot find path '${target}' because it does not exist.`
  return `    Directory: ${target}\n\nMode                LastWriteTime     Length Name\n----                -------------     ------ ----\n${items.map(item=>{
    const entry=item.virtualPath?getEntry(item.virtualPath):null
    const dir=item.type==="folder"||item.type==="drive"||item.target&&FILE_SYSTEM[item.target]
    const mode=dir?"d----":"-a---"
    const size=dir?"":new Blob([entry?.content||""]).size
    return `${mode}        ${new Date().toLocaleDateString()}  9:27 PM ${String(size).padStart(8," ")} ${item.name}`
  }).join("\n")}`
}

function psHelp(name){
  const table={"get-childitem":"Gets the items and child items in one or more specified locations.","get-location":"Gets information about the current working location.","set-location":"Sets the current working location.","get-content":"Gets the content of the item at the specified location.","set-content":"Replaces the contents of a writable virtual file.","new-item":"Creates a new writable virtual file or directory.","remove-item":"Deletes a writable virtual item.","copy-item":"Copies a writable virtual file.","move-item":"Moves a writable virtual file.","rename-item":"Renames a writable virtual item.","start-process":"Starts an app or opens a file.","write-output":"Sends objects to the pipeline."}
  return table[name.toLowerCase()]||"Windows PowerShell 2.0 help. Try Get-Command to list supported commands."
}

async function runPs(line){
  const trimmed=line.trim()
  if(!trimmed)return
  psExecuted.push(trimmed)
  const parts=tokenize(trimmed)
  const raw=parts.shift()||""
  const lower=raw.toLowerCase()
  const arg=parts.join(" ")
  if(customCommand(lower,"psOutput"))return
  if(trimmed.toLowerCase()==="$psversiontable"){append("psOutput","Name                           Value\n----                           -----\nCLRVersion                     2.0.50727.4927\nBuildVersion                   6.1.7600.16385\nPSVersion                      2.0\nWSManStackVersion              2.0\nPSCompatibleVersions           {1.0, 2.0}\nSerializationVersion           1.1.0.1");return}
  if(trimmed.toLowerCase()==="$env:username"){append("psOutput","Eka");return}
  if(["get-childitem","gci","dir","ls"].includes(lower)){append("psOutput",psList(arg||psPath));return}
  if(["get-location","gl","pwd"].includes(lower)){append("psOutput",`\nPath\n----\n${psPath}\n`);return}
  if(["clear-host","clear","cls"].includes(lower)){byId("psOutput").textContent="";return}
  if(lower==="get-date"){append("psOutput",new Date().toString());return}
  if(lower==="get-process"){append("psOutput",taskList().replace("Image Name                     PID Session Name        Mem Usage","Handles  NPM(K)    PM(K)      WS(K) VM(M)   CPU(s)     Id ProcessName").replace(/={5,}/g,"-------"));return}
  if(lower==="get-host"){append("psOutput","Name             : ConsoleHost\nVersion          : 2.0\nInstanceId       : EKA-WIN7-BROWSER\nUI               : System.Management.Automation.Internal.Host.InternalHostUserInterface");return}
  if(lower==="get-variable"){append("psOutput",`Name                           Value\n----                           -----\nHOME                           C:\\Users\\Eka\nHost                           ConsoleHost\nPWD                            ${psPath}\nPSVersionTable                 {PSVersion, CLRVersion...}`);return}
  if(lower==="test-path"){const full=resolvePath(psPath,arg);append("psOutput",String(folderExists(full)||getEntry(full)!==null));return}
  if(lower==="get-item"){
    const full=resolvePath(psPath,arg);const entry=getEntry(full)
    if(entry)append("psOutput",`    Directory: ${full.replace(/\\[^\\]+$/,'')}\n\nMode LastWriteTime Length Name\n---- ------------- ------ ----\n${entry.kind==="folder"?"d----":"-a---"} ${new Date().toLocaleDateString()} ${new Blob([entry.content||""]).size} ${fileName(full)}`)
    else append("psOutput",`Get-Item : Cannot find path '${full}'.`)
    return
  }
  if(lower==="select-string"){
    const clean=parts.filter(part=>!["-pattern","-path"].includes(part.toLowerCase()))
    if(clean.length<2){append("psOutput","Select-String : Pattern and path are required.");return}
    const pattern=clean[0],text=fileText(clean[1],psPath)
    if(text===null){append("psOutput",`Select-String : Cannot find path '${clean[1]}'.`);return}
    append("psOutput",text.split(/\r?\n/).map((line,index)=>({line,index})).filter(x=>x.line.toLowerCase().includes(pattern.toLowerCase())).map(x=>`${clean[1]}:${x.index+1}:${x.line}`).join("\n"));return
  }
  if(lower==="get-wmiobject"||lower==="gwmi"){append("psOutput",arg.toLowerCase().includes("win32_operatingsystem")?"SystemDirectory : C:\\Windows\\system32\nCaption         : Microsoft Windows 7 Professional\nVersion         : 6.1.7600\nBuildNumber     : 7600":"Get-WmiObject simulation supports Win32_OperatingSystem.");return}
  if(lower==="get-command"){append("psOutput","CommandType     Name\n-----------     ----\nCmdlet          Add-Content\nCmdlet          Copy-Item\nCmdlet          Get-ChildItem\nCmdlet          Get-Content\nCmdlet          Get-Date\nCmdlet          Get-Help\nCmdlet          Get-History\nCmdlet          Get-Host\nCmdlet          Get-Item\nCmdlet          Get-Location\nCmdlet          Get-Process\nCmdlet          Get-Variable\nCmdlet          Get-WmiObject\nCmdlet          Move-Item\nCmdlet          New-Item\nCmdlet          Remove-Item\nCmdlet          Rename-Item\nCmdlet          Select-String\nCmdlet          Set-Content\nCmdlet          Set-Location\nCmdlet          Start-Process\nCmdlet          Test-Path\nCmdlet          Write-Output\nApplication     python\nAlias           dir, ls, pwd, cat, type, echo");return}
  if(lower==="get-help"){append("psOutput",psHelp(parts[0]||""));return}
  if(lower==="get-history"){append("psOutput",`  Id CommandLine\n  -- -----------\n${psExecuted.slice(0,-1).map((line,index)=>String(index+1).padStart(4," ")+" "+line).join("\n")}`);return}
  if(lower==="write-output"||lower==="echo"){append("psOutput",arg.replace(/^"|"$/g,""));return}
  if(["get-content","cat","type"].includes(lower)){
    const text=fileText(arg,psPath)
    append("psOutput",text===null?`Get-Content : Cannot find path '${resolvePath(psPath,arg)}' because it does not exist.`:text);return
  }
  if(lower==="set-content"||lower==="add-content"){
    if(parts.length<2){append("psOutput",`${raw} : Missing an argument for parameter content.`);return}
    const path=parts[0],content=parts.slice(1).join(" "),old=lower==="add-content"?fileText(path,psPath)||"":""
    if(!writeFile(path,`${old}${old?"\n":""}${content}`,psPath))append("psOutput",`${raw} : Could not write to the specified path.`);return
  }
  if(lower==="new-item"){
    if(!parts.length){append("psOutput","New-Item : A path is required.");return}
    const isDir=parts.some(part=>part.toLowerCase()==="directory")||trimmed.toLowerCase().includes("-itemtype directory")
    const created=isDir?makeFolder(parts[0],psPath):writeFile(parts[0],"",psPath)
    if(!created){append("psOutput",`New-Item : Could not create '${parts[0]}' in the specified path.`);return}
    append("psOutput",`    Directory: ${psPath}\n\nMode LastWriteTime Length Name\n---- ------------- ------ ----\n${isDir?"d----":"-a---"} ${new Date().toLocaleDateString()}      ${fileName(resolvePath(psPath,parts[0]))}`);return
  }
  if(lower==="remove-item"){if(!parts.length||!deletePath(parts[0],psPath))append("psOutput",`Remove-Item : Cannot find or remove '${arg}'.`);return}
  if(lower==="rename-item"){if(parts.length<2||!renamePath(resolvePath(psPath,parts[0]),parts[1]))append("psOutput","Rename-Item : Rename failed.");return}
  if(lower==="copy-item"){if(parts.length<2||!copyPath(parts[0],parts[1],psPath))append("psOutput","Copy-Item : Copy failed.");return}
  if(lower==="move-item"){if(parts.length<2||!movePath(parts[0],parts[1],psPath))append("psOutput","Move-Item : Move failed.");return}
  if(lower==="set-location"||lower==="cd"){
    if(!arg){append("psOutput",psPath);return}
    const next=changeDir(psPath,arg)
    if(folderExists(next)){psPath=next;setPsPrompt()}else append("psOutput",`Set-Location : Cannot find path '${next}' because it does not exist.`)
    return
  }
  if(lower==="start-process"){if(!openTarget(arg,psPath))append("psOutput",`Start-Process : This session cannot find '${arg}'.`);return}
  if(lower==="stop-computer"){window.dispatchEvent(new CustomEvent("win7:power",{detail:"shutdown"}));return}
  if(lower==="restart-computer"){window.dispatchEvent(new CustomEvent("win7:power",{detail:"restart"}));return}
  if(lower==="python"||lower==="python3"||lower==="py"){await runPython(parts,"psOutput",psPath);return}
  if(lower==="github"){window.open(PROFILE.github,"_blank","noopener,noreferrer");return}
  if(lower==="telegram"){window.open(PROFILE.telegramUrl,"_blank","noopener,noreferrer");return}
  if(lower==="projects"){navigate("projects");return}
  if(lower==="profile"){append("psOutput",profileText());return}
  append("psOutput",`The term '${raw}' is not recognized as the name of a cmdlet, function, script file, or operable program.`)
}

function bindHistory(input,history,runner){
  let index=history.length
  input.addEventListener("keydown",event=>{
    if(event.key==="ArrowUp"){event.preventDefault();if(history.length){index=Math.max(0,index-1);input.value=history[index]||""}}
    if(event.key==="ArrowDown"){event.preventDefault();if(history.length){index=Math.min(history.length,index+1);input.value=history[index]||""}}
  })
  return async value=>{if(value.trim()){history.push(value);index=history.length}await runner(value)}
}

async function submitCmd(value){append("cmdOutput",`${cmdPath}>${value}`);await runCmd(value);setCmdPrompt()}

export function initTerminals(){
  append("cmdOutput","Microsoft Windows [Version 6.1.7600]\nCopyright (c) 2009 Microsoft Corporation.  All rights reserved.\n\nType HELP for commands. Try EKA or open 'Eka Command Deck.txt'.")
  setCmdPrompt()
  const cmdRun=bindHistory(byId("cmdInput"),cmdHistory,runCmd)
  byId("cmdForm").addEventListener("submit",async event=>{event.preventDefault();const value=byId("cmdInput").value;append("cmdOutput",`${cmdPath}>${value}`);byId("cmdInput").value="";await cmdRun(value);setCmdPrompt()})
  append("psOutput","Windows PowerShell\nCopyright (C) 2009 Microsoft Corporation. All rights reserved.\n\nType Get-Help for commands. Try Get-Command or EKA.")
  setPsPrompt()
  const psRun=bindHistory(byId("psInput"),psHistory,runPs)
  byId("psForm").addEventListener("submit",async event=>{event.preventDefault();const value=byId("psInput").value;append("psOutput",`PS ${psPath}> ${value}`);byId("psInput").value="";await psRun(value);setPsPrompt()})
  window.addEventListener("win7:cmd-run",async event=>{openWindow("cmdWindow");await submitCmd(event.detail);byId("cmdInput").focus()})
}
