import{fileName,folderPath,getEntry,listVirtual,resolvePath,roots,validFileName}from"./vfs.js"
import{escapeHtml}from"./html.js"

let menu=null
let activeSurface=null
const states=new WeakMap()

const byId=id=>document.getElementById(id)

export function mountInteractionUi(){
  if(document.getElementById("winContextMenu"))return
  menu=document.createElement("div")
  menu.id="winContextMenu"
  menu.className="win-context-menu hidden"
  byId("desktop").appendChild(menu)
  document.addEventListener("pointerdown",event=>{
    if(menu&&!menu.contains(event.target))hideContextMenu()
  },true)
  window.addEventListener("blur",hideContextMenu)
}

export function hideContextMenu(){if(menu)menu.classList.add("hidden")}

export function showContextMenu(items,clientX,clientY){
  mountInteractionUi()
  const clean=(items||[]).filter(Boolean)
  if(!clean.length)return
  menu.innerHTML=clean.map((item,index)=>item.separator?`<div class="context-separator"></div>`:`<button data-context-index="${index}" ${item.disabled?"disabled":""}>${escapeHtml(item.label)}</button>`).join("")
  menu.classList.remove("hidden")
  const desktop=byId("desktop").getBoundingClientRect()
  const x=clientX-desktop.left
  const y=clientY-desktop.top
  menu.style.left=`${Math.max(2,Math.min(x,desktop.width-190))}px`
  menu.style.top=`${Math.max(2,Math.min(y,desktop.height-260))}px`
  menu.querySelectorAll("button").forEach(button=>button.addEventListener("click",async event=>{
    event.stopPropagation()
    const item=clean[Number(button.dataset.contextIndex)]
    hideContextMenu()
    if(item&&!item.disabled)await item.action?.()
  }))
}

function applySelection(container,selector,state){
  container.querySelectorAll(selector).forEach(node=>node.classList.toggle("selected",state.selected.has(state.key(node))))
  state.onSelection?.([...state.selected])
}

function setSingle(container,selector,state,key){state.selected.clear();if(key)state.selected.add(key);applySelection(container,selector,state)}
function toggleOne(container,selector,state,key){if(state.selected.has(key))state.selected.delete(key);else state.selected.add(key);applySelection(container,selector,state)}

export function clearSelection(container){
  const state=states.get(container)
  if(!state)return
  state.selected.clear()
  state.anchor=-1
  state.touchMulti=false
  applySelection(container,state.selector,state)
}

export function selectedKeys(container){return [...(states.get(container)?.selected||[])]}

export function selectAll(container){
  const state=states.get(container)
  if(!state)return
  state.selected=new Set([...container.querySelectorAll(state.selector)].map(node=>state.key(node)))
  applySelection(container,state.selector,state)
}

function selectRange(container,selector,state,node){
  const nodes=[...container.querySelectorAll(selector)]
  const index=nodes.indexOf(node)
  if(state.anchor<0){setSingle(container,selector,state,state.key(node));state.anchor=index;return}
  const start=Math.min(state.anchor,index)
  const end=Math.max(state.anchor,index)
  state.selected=new Set(nodes.slice(start,end+1).map(item=>state.key(item)))
  applySelection(container,selector,state)
}

function selectionItems(container,state){
  return [...container.querySelectorAll(state.selector)]
    .filter(node=>state.selected.has(state.key(node)))
    .map(node=>state.item(node))
    .filter(Boolean)
}

function openMenu(container,state,node,event,touch=false){
  if(node&&!state.selected.has(state.key(node)))setSingle(container,state.selector,state,state.key(node))
  if(touch)state.touchMulti=true
  const item=node?state.item(node):null
  const selected=selectionItems(container,state)
  const helpers={
    enableMulti:()=>{state.touchMulti=true},
    disableMulti:()=>{state.touchMulti=false},
    clear:()=>clearSelection(container),
    selectAll:()=>selectAll(container)
  }
  const items=item?state.context?.(item,selected,helpers):state.background?.(selected,helpers)
  showContextMenu(items,event.clientX,event.clientY)
}

export function bindSelectableSurface(container,selector,options){
  if(states.has(container))return states.get(container)
  const state={
    selector,
    selected:new Set(),
    anchor:-1,
    touchMulti:false,
    lastTapKey:null,
    lastTapAt:0,
    holdTimer:null,
    holdFired:false,
    downX:0,
    downY:0,
    ignoreDblUntil:0,
    key:options.key,
    item:options.item,
    activate:options.activate,
    context:options.context,
    background:options.background,
    onSelection:options.onSelection,
    ignore:options.ignore
  }
  states.set(container,state)
  container.tabIndex=container.tabIndex>=0?container.tabIndex:0

  const findNode=target=>target.closest?.(selector)&&container.contains(target.closest(selector))?target.closest(selector):null

  container.addEventListener("pointerdown",event=>{
    if(state.ignore?.(event.target))return
    activeSurface=container
    const node=findNode(event.target)
    if(event.button>1)return
    state.downX=event.clientX
    state.downY=event.clientY
    state.holdFired=false
    clearTimeout(state.holdTimer)
    if(event.pointerType==="touch"){
      state.holdTimer=setTimeout(()=>{
        state.holdFired=true
        openMenu(container,state,node,event,true)
      },560)
    }
  })

  container.addEventListener("pointermove",event=>{
    if(Math.hypot(event.clientX-state.downX,event.clientY-state.downY)>10)clearTimeout(state.holdTimer)
  })

  container.addEventListener("pointercancel",()=>clearTimeout(state.holdTimer))

  container.addEventListener("pointerup",event=>{
    clearTimeout(state.holdTimer)
    if(state.ignore?.(event.target))return
    if(event.button!==0||state.holdFired)return
    const node=findNode(event.target)
    if(!node){clearSelection(container);return}
    const key=state.key(node)
    const nodes=[...container.querySelectorAll(selector)]
    const index=nodes.indexOf(node)
    if(event.pointerType==="touch"){
      const now=performance.now()
      if(state.lastTapKey===key&&now-state.lastTapAt<430){
        state.lastTapKey=null
        state.lastTapAt=0
        state.ignoreDblUntil=performance.now()+500
        state.activate?.(state.item(node),event)
        return
      }
      if(state.touchMulti)toggleOne(container,selector,state,key)
      else setSingle(container,selector,state,key)
      state.anchor=index
      state.lastTapKey=key
      state.lastTapAt=now
      return
    }
    if(event.ctrlKey||event.metaKey){toggleOne(container,selector,state,key);state.anchor=index;return}
    if(event.shiftKey){selectRange(container,selector,state,node);return}
    setSingle(container,selector,state,key)
    state.anchor=index
  })

  container.addEventListener("dblclick",event=>{
    if(performance.now()<state.ignoreDblUntil)return
    if(state.ignore?.(event.target))return
    const node=findNode(event.target)
    if(!node)return
    event.preventDefault()
    state.activate?.(state.item(node),event)
  })

  container.addEventListener("contextmenu",event=>{
    if(state.ignore?.(event.target))return
    event.preventDefault()
    activeSurface=container
    openMenu(container,state,findNode(event.target),event,event.pointerType==="touch")
  })

  container.addEventListener("keydown",event=>{
    const nodes=[...container.querySelectorAll(selector)]
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="a"){
      event.preventDefault();selectAll(container);return
    }
    if(event.key==="Escape"){hideContextMenu();clearSelection(container);return}
    const selected=selectionItems(container,state)
    if(event.key==="Enter"&&selected.length){event.preventDefault();state.activate?.(selected[0],event);return}
    if(event.key==="Delete"&&selected.length){event.preventDefault();options.deleteSelected?.(selected);return}
    if(event.key==="F2"&&selected.length===1){event.preventDefault();options.renameSelected?.(selected[0]);return}
    if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(event.key)||!nodes.length)return
    event.preventDefault()
    const current=nodes.findIndex(node=>state.selected.has(state.key(node)))
    const columns=Math.max(1,Math.round(container.clientWidth/Math.max(1,nodes[0].offsetWidth)))
    const step=event.key==="ArrowLeft"?-1:event.key==="ArrowRight"?1:event.key==="ArrowUp"?-columns:columns
    const next=Math.max(0,Math.min(nodes.length-1,(current<0?0:current)+step))
    setSingle(container,selector,state,state.key(nodes[next]))
    state.anchor=next
    nodes[next].focus?.({preventScroll:true})
  })

  return state
}

export function refreshSurface(container){
  const state=states.get(container)
  if(!state)return
  const keys=new Set([...container.querySelectorAll(state.selector)].map(node=>state.key(node)))
  state.selected=new Set([...state.selected].filter(key=>keys.has(key)))
  applySelection(container,state.selector,state)
}

export function initPointerCursor(){
  const screen=byId("screen")
  const cursor=byId("fakeCursor")
  let hideTimer
  const fine=matchMedia("(pointer:fine)").matches
  const place=event=>{
    const rect=screen.getBoundingClientRect()
    cursor.style.left=`${event.clientX-rect.left}px`
    cursor.style.top=`${event.clientY-rect.top}px`
  }
  const show=event=>{
    place(event)
    screen.classList.add("pointer-active")
    clearTimeout(hideTimer)
  }
  if(fine){
    screen.addEventListener("pointerenter",show)
    screen.addEventListener("pointerleave",()=>screen.classList.remove("pointer-active"))
    screen.addEventListener("pointermove",event=>{place(event);screen.classList.add("pointer-active")})
    screen.querySelectorAll("iframe").forEach(frame=>frame.addEventListener("pointerenter",()=>screen.classList.remove("pointer-active")))
  }
  screen.addEventListener("pointerdown",event=>{
    show(event)
    cursor.classList.remove("left-click","right-click")
    void cursor.offsetWidth
    cursor.classList.add(event.button===2?"right-click":"left-click")
  })
  screen.addEventListener("pointermove",event=>{if(event.pointerType==="touch"&&event.buttons)show(event)})
  screen.addEventListener("pointerup",event=>{
    place(event)
    if(event.pointerType==="touch")hideTimer=setTimeout(()=>screen.classList.remove("pointer-active"),850)
  })
  screen.addEventListener("contextmenu",event=>{
    show(event)
    cursor.classList.remove("left-click")
    cursor.classList.add("right-click")
    if(event.pointerType==="touch")hideTimer=setTimeout(()=>screen.classList.remove("pointer-active"),1100)
  })
}

export function activeSelection(){return activeSurface?selectedKeys(activeSurface):[]}

function ensurePrompt(){
  let dialog=byId("winPrompt")
  if(dialog)return dialog
  dialog=document.createElement("div")
  dialog.id="winPrompt"
  dialog.className="win-prompt hidden"
  dialog.innerHTML=`<div class="win-prompt-title" id="winPromptTitle"></div><div class="win-prompt-body"><label id="winPromptLabel"></label><input id="winPromptInput" autocomplete="off" spellcheck="false"><div class="win-prompt-actions"><button id="winPromptOk">OK</button><button id="winPromptCancel">Cancel</button></div></div>`
  byId("desktop").appendChild(dialog)
  return dialog
}

export function askText(title,label,value=""){
  const dialog=ensurePrompt()
  byId("winPromptTitle").textContent=title
  byId("winPromptLabel").textContent=label
  const input=byId("winPromptInput")
  input.value=value
  input.classList.remove("hidden")
  dialog.classList.remove("confirm-only")
  dialog.classList.remove("hidden")
  setTimeout(()=>{input.focus();input.select()},0)
  return new Promise(resolve=>{
    const finish=result=>{
      dialog.classList.add("hidden")
      byId("winPromptOk").onclick=null
      byId("winPromptCancel").onclick=null
      input.onkeydown=null
      resolve(result)
    }
    byId("winPromptOk").onclick=()=>finish(input.value)
    byId("winPromptCancel").onclick=()=>finish(null)
    input.onkeydown=event=>{if(event.key==="Enter")finish(input.value);if(event.key==="Escape")finish(null)}
  })
}

export function askConfirm(title,message){
  const dialog=ensurePrompt()
  byId("winPromptTitle").textContent=title
  byId("winPromptLabel").textContent=message
  byId("winPromptInput").classList.add("hidden")
  dialog.classList.add("confirm-only")
  dialog.classList.remove("hidden")
  return new Promise(resolve=>{
    const finish=result=>{
      dialog.classList.add("hidden")
      dialog.classList.remove("confirm-only")
      byId("winPromptInput").classList.remove("hidden")
      byId("winPromptOk").onclick=null
      byId("winPromptCancel").onclick=null
      resolve(result)
    }
    byId("winPromptOk").onclick=()=>finish(true)
    byId("winPromptCancel").onclick=()=>finish(false)
  })
}

const FILE_LOCATIONS={
  desktop:{label:"Desktop",path:roots().desktop},
  documents:{label:"Documents",path:roots().documents},
  downloads:{label:"Downloads",path:roots().downloads},
  github:{label:"GitHub (G:)",path:roots().github}
}

function ensureFileDialog(){
  let dialog=byId("fileDialog")
  if(dialog)return dialog
  dialog=document.createElement("section")
  dialog.id="fileDialog"
  dialog.className="file-dialog hidden"
  dialog.innerHTML=`<div class="file-dialog-title"><span id="fileDialogTitle">Save As</span><button id="fileDialogClose">×</button></div><div class="file-dialog-toolbar"><button id="fileDialogBack" aria-label="Back">←</button><div class="file-dialog-address" id="fileDialogAddress"></div></div><div class="file-dialog-main"><aside>${Object.entries(FILE_LOCATIONS).map(([key,value])=>`<button data-file-location="${key}"><b>${value.label}</b><small>${value.path}</small></button>`).join("")}</aside><div class="file-dialog-list" id="fileDialogList"></div></div><div class="file-dialog-fields"><label>File name:<input id="fileDialogName" autocomplete="off" spellcheck="false"></label><label>Save as type:<select id="fileDialogType"></select></label><label id="fileDialogEncodingLabel">Encoding:<select id="fileDialogEncoding"><option>ANSI</option><option>Unicode</option><option>Unicode big endian</option><option selected>UTF-8</option></select></label><div><button id="fileDialogOk">Save</button><button id="fileDialogCancel">Cancel</button></div></div>`
  byId("desktop").appendChild(dialog)
  return dialog
}

function appendExtension(name,type){
  const clean=String(name||"").trim().replace(/^"|"$/g,"")
  if(!clean)return ""
  if(type==="text"&&!/\.[^\\.]+$/.test(clean))return `${clean}.txt`
  return clean
}

function runFileDialog(mode,options={}){
  const dialog=ensureFileDialog()
  const title=mode==="open"?"Open":options.title||"Save As"
  let location=options.location&&FILE_LOCATIONS[options.location]?options.location:"desktop"
  let currentPath=FILE_LOCATIONS[location].path
  let selected=null
  let pathHistory=[currentPath]
  let historyIndex=0
  const nameInput=byId("fileDialogName")
  const typeSelect=byId("fileDialogType")
  const encodingLabel=byId("fileDialogEncodingLabel")
  const types=options.types||[{value:"text",label:"Text Documents (*.txt)"},{value:"all",label:"All Files (*.*)"}]

  byId("fileDialogTitle").textContent=title
  byId("fileDialogOk").textContent=mode==="open"?"Open":"Save"
  typeSelect.innerHTML=types.map(type=>`<option value="${escapeHtml(type.value)}">${escapeHtml(type.label)}</option>`).join("")
  typeSelect.value=options.type||types[0].value
  byId("fileDialogEncoding").value=options.encoding||"UTF-8"
  encodingLabel.classList.toggle("hidden",mode==="open")
  nameInput.value=options.name||""

  const render=()=>{
    byId("fileDialogAddress").textContent=currentPath
    dialog.querySelectorAll("[data-file-location]").forEach(button=>button.classList.toggle("active",FILE_LOCATIONS[button.dataset.fileLocation]?.path.toLowerCase()===currentPath.toLowerCase()))
    const files=listVirtual(currentPath)
    byId("fileDialogList").innerHTML=files.length?files.map(item=>`<button data-file-path="${encodeURIComponent(item.virtualPath)}" data-file-kind="${item.type}"><span>${item.type==="folder"?"📁":item.type==="python"?"🐍":item.type==="html"?"🌐":"📄"}</span><b>${escapeHtml(fileName(item.virtualPath))}</b><small>${item.type==="folder"?"File folder":escapeHtml(item.type.toUpperCase())+" file"}</small></button>`).join(""):`<p>This folder is empty.</p>`
    selected=null
  }

  const goTo=(path,push=true)=>{
    currentPath=path
    if(push){pathHistory=pathHistory.slice(0,historyIndex+1);pathHistory.push(path);historyIndex=pathHistory.length-1}
    render()
  }

  render()
  dialog.classList.remove("hidden")
  setTimeout(()=>{nameInput.focus();nameInput.select()},0)

  return new Promise(resolve=>{
    const cleanup=result=>{
      dialog.classList.add("hidden")
      dialog.onclick=null
      nameInput.onkeydown=null
      byId("fileDialogOk").onclick=null
      byId("fileDialogCancel").onclick=null
      byId("fileDialogClose").onclick=null
      byId("fileDialogBack").onclick=null
      resolve(result)
    }
    const accept=async()=>{
      if(mode==="open"&&selected&&getEntry(selected)?.kind==="folder"){goTo(selected);return}
      const name=appendExtension(nameInput.value,typeSelect.value)
      if(!name)return
      if(!validFileName(name)){window.dispatchEvent(new CustomEvent("win7:toast",{detail:"The file name contains invalid Windows characters or a reserved device name."}));return}
      const path=mode==="open"&&selected&&getEntry(selected)?.kind!=="folder"?selected:resolvePath(currentPath,name)
      if(mode==="open"){
        const entry=getEntry(path)
        if(entry&&entry.kind!=="folder")cleanup(path)
        return
      }
      if(getEntry(path)){
        dialog.classList.add("hidden")
        const overwrite=await askConfirm("Confirm Save As",`${fileName(path)} already exists. Do you want to replace it?`)
        if(!overwrite){dialog.classList.remove("hidden");return}
      }
      cleanup({path,type:typeSelect.value,encoding:byId("fileDialogEncoding").value})
    }
    dialog.onclick=event=>{
      const locationButton=event.target.closest("[data-file-location]")
      if(locationButton){location=locationButton.dataset.fileLocation;goTo(FILE_LOCATIONS[location].path);return}
      const fileButton=event.target.closest("[data-file-path]")
      if(!fileButton)return
      byId("fileDialogList").querySelectorAll("button").forEach(button=>button.classList.toggle("selected",button===fileButton))
      selected=decodeURIComponent(fileButton.dataset.filePath)
      if(fileButton.dataset.fileKind!=="folder")nameInput.value=fileName(selected)
      if(event.detail===2){if(fileButton.dataset.fileKind==="folder"){goTo(selected);return}void accept()}
    }
    byId("fileDialogBack").onclick=()=>{if(historyIndex<=0)return;historyIndex-=1;currentPath=pathHistory[historyIndex];render()}
    byId("fileDialogOk").onclick=()=>void accept()
    byId("fileDialogCancel").onclick=()=>cleanup(null)
    byId("fileDialogClose").onclick=()=>cleanup(null)
    nameInput.onkeydown=event=>{if(event.key==="Enter")void accept();if(event.key==="Escape")cleanup(null)}
  })
}

export function askSaveAs(options={}){return runFileDialog("save",options)}
export function askOpenFile(options={}){return runFileDialog("open",options)}
