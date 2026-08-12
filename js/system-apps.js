import{PROFILE,REPOSITORIES}from"./data.js"
import{askOpenFile,askSaveAs,askText}from"./interaction.js"
import{icon}from"./icons.js"
import{fileName,getEntry,readFile,writeFile}from"./vfs.js"
import{closeWindow,openWindow}from"./window-manager.js"

const byId=id=>document.getElementById(id)
const toast=text=>window.dispatchEvent(new CustomEvent("win7:toast",{detail:text}))
const PAINT_COLORS=["#000000","#7f7f7f","#880015","#ed1c24","#ff7f27","#fff200","#22b14c","#00a2e8","#3f48cc","#a349a4","#ffffff","#c3c3c3","#b97a57","#ffaec9","#ffc90e","#efe4b0","#b5e61d","#99d9ea","#7092be","#c8bfe7"]

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
  windowNode("paint","Untitled - Paint","paint",`<div class="paint-tabs"><button class="paint-file-button" id="paintFileButton">Paint</button><button class="active" data-paint-tab="home">Home</button><button data-paint-tab="view">View</button><div class="paint-quick"><button data-paint="save" title="Save">▣</button><button data-paint="undo" title="Undo">↶</button><button data-paint="redo" title="Redo">↷</button></div></div><div class="paint-file-menu hidden" id="paintFileMenu"><button data-paint="new">New</button><button data-paint="open">Open</button><button data-paint="save">Save</button><button data-paint="save-as">Save as</button><span></span><button data-paint="print">Print</button><button data-paint="exit">Exit</button></div><div class="paint-ribbon paint-home-ribbon" id="paintHomeRibbon"><div class="ribbon-group paint-clipboard"><button data-paint="paste">▣<small>Paste</small></button><button data-paint="copy">Copy</button><button data-paint="cut">Cut</button><label>Clipboard</label></div><div class="ribbon-group paint-image-tools"><button data-paint-tool="select">▱<small>Select</small></button><button data-paint="crop">Crop</button><button data-paint="resize">Resize</button><button data-paint="rotate">Rotate</button><label>Image</label></div><div class="ribbon-group paint-tools"><button data-paint-tool="pencil" class="active" title="Pencil">✎</button><button data-paint-tool="fill" title="Fill with color">▰</button><button data-paint-tool="text" title="Text">A</button><button data-paint-tool="eraser" title="Eraser">▱</button><button data-paint-tool="picker" title="Color picker">⌖</button><button data-paint-tool="brush" title="Brush">🖌</button><label>Tools</label></div><div class="ribbon-group paint-brushes"><select id="paintBrush"><option value="round">Brushes</option><option value="round">Brush</option><option value="square">Calligraphy brush</option><option value="air">Airbrush</option><option value="marker">Marker</option></select><label>Brushes</label></div><div class="ribbon-group paint-shapes"><div><button data-paint-tool="line">╱</button><button data-paint-tool="rectangle">□</button><button data-paint-tool="ellipse">○</button><button data-paint-tool="rounded">▢</button></div><select id="paintOutline"><option>Solid color</option><option>No outline</option></select><select id="paintFill"><option>No fill</option><option>Solid color</option></select><label>Shapes</label></div><div class="ribbon-group paint-size"><select id="paintSize"><option value="1">1 px</option><option value="3" selected>3 px</option><option value="6">6 px</option><option value="10">10 px</option><option value="18">18 px</option></select><label>Size</label></div><div class="ribbon-group paint-colors"><div class="paint-color-state"><button id="paintPrimary" title="Color 1"><i style="background:#000"></i><small>Color 1</small></button><button id="paintSecondary" title="Color 2"><i style="background:#fff"></i><small>Color 2</small></button></div><div class="paint-palette" id="paintPalette">${PAINT_COLORS.map(color=>`<button data-paint-color="${color}" style="--paint-color:${color}" title="${color}"></button>`).join("")}</div><label class="paint-edit-color">Edit colors <input id="paintCustomColor" type="color" value="#000000"></label><label>Colors</label></div></div><div class="paint-ribbon paint-view-ribbon hidden" id="paintViewRibbon"><div class="ribbon-group"><button data-paint="zoom-in">Zoom in</button><button data-paint="zoom-out">Zoom out</button><button data-paint="zoom-100">100%</button><label>Zoom</label></div><div class="ribbon-group"><label><input id="paintRulers" type="checkbox"> Rulers</label><label><input id="paintGridlines" type="checkbox"> Gridlines</label><label><input id="paintStatus" type="checkbox" checked> Status bar</label><label>Show or hide</label></div><div class="ribbon-group"><button data-paint="fullscreen">Full screen</button><label>Display</label></div></div><div class="paint-stage" id="paintStage"><div class="paint-ruler paint-ruler-x hidden" id="paintRulerX"></div><div class="paint-ruler paint-ruler-y hidden" id="paintRulerY"></div><div class="paint-canvas-wrap" id="paintCanvasWrap"><canvas id="paintCanvas" width="960" height="540"></canvas><div class="paint-selection hidden" id="paintSelection"></div></div></div><div class="paint-statusbar" id="paintStatusbar"><span id="paintPointer">0, 0px</span><span id="paintDimensions">960 × 540px</span><div class="paint-zoom"><button data-paint="zoom-out">−</button><input id="paintZoom" type="range" min="25" max="400" step="25" value="100"><button data-paint="zoom-in">+</button><b id="paintZoomValue">100%</b></div></div>`,`paint-window`)
  windowNode("wordpad","Document - WordPad","wordpad",`<div class="wordpad-ribbon"><button data-format="bold"><b>B</b></button><button data-format="italic"><i>I</i></button><button data-format="underline"><u>U</u></button><select id="wordpadSize"><option>10</option><option selected>12</option><option>16</option><option>24</option><option>36</option></select><button id="wordpadSave">Save As...</button></div><div class="wordpad-page" id="wordpadText" contenteditable="true"><h1>Mahdi Ghahremani</h1><p>Electrical Engineering · Embedded Systems · FPGA · AI Vision</p></div>`,`wordpad-window`)
  windowNode("sticky","Sticky Notes","sticky",`<div class="sticky-toolbar"><button id="stickyNew">＋</button><span>Sticky Notes</span><button id="stickyDelete">×</button></div><textarea id="stickyText" aria-label="Sticky note"></textarea>`,`sticky-window`)
  windowNode("snipping","Snipping Tool","snipping",`<div class="snip-toolbar"><button id="snipNew">New</button><button id="snipCopy">Copy</button><span>Rectangular Snip</span></div><div class="snip-stage" id="snipStage"><p>Click New, then drag to select an area.</p><div class="snip-selection hidden" id="snipSelection"></div></div>`,`snipping-window`)
  windowNode("media","Windows Media Player","media",`<div class="media-layout"><aside><strong>Libraries</strong><button>Music</button><button>Videos</button><button>Pictures</button><button>Playlists</button></aside><main><h2>Eka Media Library</h2><div class="media-list">${REPOSITORIES.slice(0,5).map((repo,index)=>`<button data-track="${index}"><span>♫</span><b>${repo.name}</b><small>${repo.tag}</small></button>`).join("")}</div></main></div><div class="media-controls"><button id="mediaPrevious">◀◀</button><button id="mediaPlay">▶</button><button id="mediaNext">▶▶</button><div class="media-progress"><i id="mediaProgress"></i></div><input id="mediaVolume" type="range" min="0" max="100" value="70"><span id="mediaState">Ready</span></div>`,`media-window`)
  windowNode("control","Control Panel","control",`<div class="control-nav"><button id="controlBack" aria-label="Back">←</button><button id="controlForward" aria-label="Forward">→</button><div class="control-address"><button id="controlHome">Control Panel</button><span id="controlCrumb"></span></div><input id="controlSearch" placeholder="Search Control Panel"></div><div class="control-heading"><h2 id="controlHeading">Adjust your computer's settings</h2><label>View by: <select id="controlView"><option value="category">Category</option><option value="large">Large icons</option><option value="small">Small icons</option></select></label></div><div class="control-content" id="controlContent"></div><div class="control-footer" id="controlFooter">Windows 7 Control Panel · EKA-PC</div>`,`control-window`)
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
  if(!ctx)return
  let drawing=false,tool="pencil",primary="#000000",secondary="#ffffff",start=null,preview=null,selection=null,paintPath=null,zoom=100
  let history=[],future=[]
  const point=event=>{const rect=canvas.getBoundingClientRect();return{x:(event.clientX-rect.left)*canvas.width/rect.width,y:(event.clientY-rect.top)*canvas.height/rect.height}}
  const title=name=>byId("paintWindow").querySelector(".window-title").textContent=`${name} - Paint`
  const updateDimensions=()=>byId("paintDimensions").textContent=`${canvas.width} × ${canvas.height}px`
  const image=()=>ctx.getImageData(0,0,canvas.width,canvas.height)
  const record=()=>{history.push(image());if(history.length>16)history.shift();future=[]}
  const restore=data=>{if(data&&data.width===canvas.width&&data.height===canvas.height)ctx.putImageData(data,0,0)}
  const clear=()=>{ctx.save();ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.restore();record()}
  const setColors=()=>{byId("paintPrimary").querySelector("i").style.background=primary;byId("paintSecondary").querySelector("i").style.background=secondary}
  const setTool=next=>{tool=next;byId("paintHomeRibbon").querySelectorAll("[data-paint-tool]").forEach(button=>button.classList.toggle("active",button.dataset.paintTool===tool));canvas.style.cursor=["fill","picker"].includes(tool)?"crosshair":tool==="text"?"text":"crosshair"}
  const drawShape=(end,commit=true)=>{
    restore(preview)
    const x=Math.min(start.x,end.x),y=Math.min(start.y,end.y),w=Math.abs(end.x-start.x),h=Math.abs(end.y-start.y)
    ctx.save();ctx.lineWidth=Number(byId("paintSize").value);ctx.strokeStyle=primary;ctx.fillStyle=secondary
    if(byId("paintFill").value==="Solid color"&&tool!=="line"){if(tool==="ellipse"){ctx.beginPath();ctx.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,Math.PI*2);ctx.fill()}else ctx.fillRect(x,y,w,h)}
    if(byId("paintOutline").value!=="No outline"){ctx.beginPath();if(tool==="line"){ctx.moveTo(start.x,start.y);ctx.lineTo(end.x,end.y)}else if(tool==="ellipse")ctx.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,Math.PI*2);else ctx.rect(x,y,w,h);ctx.stroke()}
    ctx.restore();if(commit)record()
  }
  const resizeCanvas=(width,height,draw)=>{
    const temp=document.createElement("canvas");temp.width=canvas.width;temp.height=canvas.height;temp.getContext("2d").drawImage(canvas,0,0)
    canvas.width=Math.max(1,Math.round(width));canvas.height=Math.max(1,Math.round(height));ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);draw(ctx,temp);updateDimensions();history=[];future=[];record()
  }
  const loadImage=source=>new Promise((resolve,reject)=>{const picture=new Image();picture.onload=()=>resolve(picture);picture.onerror=reject;picture.src=source})
  const openPaint=async()=>{
    const path=await askOpenFile({types:[{value:"all",label:"Image Files (*.png;*.jpg;*.gif;*.bmp)"},{value:"all",label:"All Files (*.*)"}]})
    if(!path)return
    const entry=getEntry(path),content=readFile(path)
    if(entry?.kind!=="photo"||!content?.startsWith("data:image/")){toast("Paint can open images saved by this simulator.");return}
    try{const picture=await loadImage(content);canvas.width=picture.naturalWidth||picture.width;canvas.height=picture.naturalHeight||picture.height;ctx.drawImage(picture,0,0);paintPath=path;history=[];record();title(fileName(path));updateDimensions()}catch{toast("Paint could not read this picture.")}
  }
  const savePaint=async(forceAs=false)=>{
    if(!paintPath||forceAs){const result=await askSaveAs({name:paintPath?fileName(paintPath):"Untitled.png",type:"all",types:[{value:"all",label:"PNG (*.png)"},{value:"all",label:"JPEG (*.jpg;*.jpeg)"},{value:"all",label:"GIF (*.gif)"},{value:"all",label:"Bitmap (*.bmp)"}]});if(!result)return;paintPath=result.path}
    writeFile(paintPath,canvas.toDataURL("image/png"));title(fileName(paintPath));toast(`Saved ${fileName(paintPath)}`)
  }
  const changeZoom=value=>{zoom=Math.max(25,Math.min(400,value));byId("paintZoom").value=String(zoom);byId("paintZoomValue").textContent=`${zoom}%`;canvas.style.width=`${zoom}%`}
  ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.lineCap="round";ctx.lineJoin="round";record();setColors();updateDimensions()
  canvas.addEventListener("pointerdown",async event=>{
    const p=point(event);start=p
    if(tool==="fill"){ctx.fillStyle=event.button===2?secondary:primary;ctx.fillRect(0,0,canvas.width,canvas.height);record();return}
    if(tool==="picker"){const pixel=ctx.getImageData(Math.max(0,Math.floor(p.x)),Math.max(0,Math.floor(p.y)),1,1).data;primary=`#${[pixel[0],pixel[1],pixel[2]].map(value=>value.toString(16).padStart(2,"0")).join("")}`;setColors();return}
    if(tool==="text"){const text=await askText("Text","Enter text:","");if(text){ctx.fillStyle=primary;ctx.font="24px Segoe UI";ctx.fillText(text,p.x,p.y);record()}return}
    drawing=true;canvas.setPointerCapture(event.pointerId);preview=image()
    if(tool==="select"){selection={x:p.x,y:p.y,w:0,h:0};byId("paintSelection").classList.remove("hidden");return}
    ctx.beginPath();ctx.moveTo(p.x,p.y)
  })
  canvas.addEventListener("pointermove",event=>{
    const p=point(event);byId("paintPointer").textContent=`${Math.round(p.x)}, ${Math.round(p.y)}px`
    if(!drawing)return
    if(tool==="select"){
      selection={x:Math.min(start.x,p.x),y:Math.min(start.y,p.y),w:Math.abs(p.x-start.x),h:Math.abs(p.y-start.y)}
      Object.assign(byId("paintSelection").style,{left:`${selection.x/canvas.width*100}%`,top:`${selection.y/canvas.height*100}%`,width:`${selection.w/canvas.width*100}%`,height:`${selection.h/canvas.height*100}%`});return
    }
    if(["line","rectangle","ellipse","rounded"].includes(tool)){drawShape(p,false);return}
    ctx.strokeStyle=tool==="eraser"?"#fff":primary;ctx.lineWidth=tool==="pencil"?1:Number(byId("paintSize").value);ctx.lineCap=byId("paintBrush").value==="square"?"square":"round";ctx.lineTo(p.x,p.y);ctx.stroke()
  })
  const finish=event=>{if(!drawing)return;drawing=false;if(["line","rectangle","ellipse","rounded"].includes(tool))drawShape(point(event),true);else if(tool!=="select")record()}
  canvas.addEventListener("pointerup",finish);canvas.addEventListener("pointercancel",()=>drawing=false);canvas.addEventListener("contextmenu",event=>event.preventDefault())
  byId("paintPalette").addEventListener("click",event=>{const color=event.target.closest("[data-paint-color]")?.dataset.paintColor;if(color){primary=color;setColors()}})
  byId("paintPalette").addEventListener("contextmenu",event=>{const color=event.target.closest("[data-paint-color]")?.dataset.paintColor;if(color){event.preventDefault();secondary=color;setColors()}})
  byId("paintCustomColor").addEventListener("input",event=>{primary=event.target.value;setColors()})
  byId("paintZoom").addEventListener("input",event=>changeZoom(Number(event.target.value)))
  byId("paintRulers").addEventListener("change",event=>{byId("paintRulerX").classList.toggle("hidden",!event.target.checked);byId("paintRulerY").classList.toggle("hidden",!event.target.checked)})
  byId("paintGridlines").addEventListener("change",event=>byId("paintCanvasWrap").classList.toggle("gridlines",event.target.checked))
  byId("paintStatus").addEventListener("change",event=>byId("paintStatusbar").classList.toggle("hidden",!event.target.checked))
  byId("paintWindow").addEventListener("click",async event=>{
    const tab=event.target.closest("[data-paint-tab]")?.dataset.paintTab
    if(tab){byId("paintHomeRibbon").classList.toggle("hidden",tab!=="home");byId("paintViewRibbon").classList.toggle("hidden",tab!=="view");byId("paintWindow").querySelectorAll("[data-paint-tab]").forEach(button=>button.classList.toggle("active",button.dataset.paintTab===tab));return}
    const nextTool=event.target.closest("[data-paint-tool]")?.dataset.paintTool;if(nextTool){setTool(nextTool);return}
    const action=event.target.closest("[data-paint]")?.dataset.paint;if(!action)return
    if(action==="new"){paintPath=null;title("Untitled");history=[];future=[];clear()}
    if(action==="open")await openPaint()
    if(action==="save")await savePaint()
    if(action==="save-as")await savePaint(true)
    if(action==="undo"&&history.length>1){future.push(history.pop());restore(history.at(-1))}
    if(action==="redo"&&future.length){const data=future.pop();history.push(data);restore(data)}
    if(action==="crop"&&selection?.w>1&&selection?.h>1){const data=ctx.getImageData(Math.round(selection.x),Math.round(selection.y),Math.round(selection.w),Math.round(selection.h));canvas.width=data.width;canvas.height=data.height;ctx.putImageData(data,0,0);selection=null;byId("paintSelection").classList.add("hidden");updateDimensions();history=[];record()}
    if(action==="resize"){const value=Number(await askText("Resize and Skew","Percentage:","100"));if(value>0&&value<=500)resizeCanvas(canvas.width*value/100,canvas.height*value/100,(target,temp)=>target.drawImage(temp,0,0,target.canvas.width,target.canvas.height))}
    if(action==="rotate")resizeCanvas(canvas.height,canvas.width,(target,temp)=>{target.translate(target.canvas.width,0);target.rotate(Math.PI/2);target.drawImage(temp,0,0)})
    if(action==="zoom-in")changeZoom(zoom+25)
    if(action==="zoom-out")changeZoom(zoom-25)
    if(action==="zoom-100")changeZoom(100)
    if(action==="fullscreen")byId("paintWindow").querySelector('[data-window-action="max"]').click()
    if(action==="copy"){try{await navigator.clipboard.writeText(canvas.toDataURL("image/png"));toast("Picture copied to the simulated clipboard.")}catch{toast("Clipboard permission was not available.")}}
    if(action==="cut"){try{await navigator.clipboard.writeText(canvas.toDataURL("image/png"));clear()}catch{toast("Clipboard permission was not available.")}}
    if(action==="paste"){try{const value=await navigator.clipboard.readText();if(value.startsWith("data:image/")){const picture=await loadImage(value);ctx.drawImage(picture,0,0);record()}else toast("The clipboard does not contain a picture.")}catch{toast("Clipboard permission was not available.")}}
    if(action==="print")toast("Paint picture sent to Microsoft XPS Document Writer.")
    if(action==="exit")closeWindow(byId("paintWindow"))
    byId("paintFileMenu").classList.add("hidden")
  })
  byId("paintFileButton").addEventListener("click",event=>{event.stopPropagation();byId("paintFileMenu").classList.toggle("hidden")})
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

const CONTROL_CATEGORIES=[
  {id:"system-security",name:"System and Security",icon:"🛡️",links:[["action-center","Review your computer's status"],["firewall","Check firewall status"],["system","View amount of RAM and processor speed"],["windows-update","Check for updates"],["power-options","Change when the computer sleeps"],["backup","Back up your computer"]]},
  {id:"network-internet",name:"Network and Internet",icon:"🌐",links:[["network-sharing","View network status and tasks"],["homegroup","Choose homegroup and sharing options"],["internet-options","Internet Options"]]},
  {id:"hardware-sound",name:"Hardware and Sound",icon:"🔊",links:[["devices","View devices and printers"],["autoplay","Play CDs or other media automatically"],["sound","Adjust system volume"],["power-options","Change battery settings"]]},
  {id:"programs",name:"Programs",icon:"📦",links:[["programs-features","Uninstall a program"],["default-programs","Default Programs"],["desktop-gadgets","Get desktop gadgets online"]]},
  {id:"user-accounts",name:"User Accounts and Family Safety",icon:"👥",links:[["user-account","Add or remove user accounts"],["parental-controls","Set up parental controls for any user"]]},
  {id:"appearance",name:"Appearance and Personalization",icon:"🎨",links:[["personalization","Change the theme"],["desktop-background","Change desktop background"],["display","Adjust screen resolution"],["taskbar","Taskbar and Start Menu"],["folder-options","Folder Options"],["fonts","Fonts"]]},
  {id:"clock-region",name:"Clock, Language, and Region",icon:"🕘",links:[["date-time","Set the time and date"],["region-language","Change display language"],["location","Change location"]]},
  {id:"ease-access",name:"Ease of Access",icon:"♿",links:[["ease-center","Let Windows suggest settings"],["keyboard","Use the computer without a mouse or keyboard"],["display-access","Optimize visual display"]]}
]

const CONTROL_NAMES=Object.fromEntries(CONTROL_CATEGORIES.flatMap(category=>category.links.map(([id,name])=>[id,name])))

function controlPage(id){
  const pages={
    "action-center":`<section class="setting-hero good"><span>✓</span><div><h3>Review recent messages and resolve problems</h3><p>Action Center has not detected any current issues.</p></div></section><div class="setting-panels"><article><h4>Security</h4><p>Network firewall <b>On</b></p><p>Windows Update <b>On</b></p><p>Virus protection <b>Simulated</b></p></article><article><h4>Maintenance</h4><p>Windows Backup is ready.</p><button data-control-action="maintenance">Check for solutions</button></article></div>`,
    firewall:`<section class="setting-hero good"><span>✓</span><div><h3>Help protect your computer with Windows Firewall</h3><p>Windows Firewall is on for Home or Work networks.</p></div></section><div class="setting-list"><label><input type="radio" name="firewall" checked> Turn on Windows Firewall</label><label><input type="radio" name="firewall"> Turn off Windows Firewall (not recommended)</label><button data-control-action="firewall">Use recommended settings</button></div>`,
    "windows-update":`<section class="setting-hero"><span>↻</span><div><h3>Windows Update</h3><p id="updateStatus">Windows is up to date. Last checked: today.</p></div></section><button class="control-primary" data-control-action="updates">Check for updates</button><p class="control-link">Change settings · View update history · Restore hidden updates</p>`,
    "power-options":`<h3>Select a power plan</h3><div class="power-plans"><label><input type="radio" name="powerplan" checked> <b>Balanced (recommended)</b><small>Automatically balances performance with energy consumption.</small></label><label><input type="radio" name="powerplan"> <b>Power saver</b><small>Saves energy by reducing performance where possible.</small></label><label><input type="radio" name="powerplan"> <b>High performance</b><small>Favors performance, but may use more energy.</small></label></div><button data-control-action="power">Change plan settings</button>`,
    backup:`<section class="setting-hero"><span>▣</span><div><h3>Back up or restore your files</h3><p id="backupStatus">Windows Backup has not been set up for this browser workspace.</p></div></section><button data-control-action="backup">Set up backup</button><button data-control-action="restore">Restore my files</button>`,
    "network-sharing":`<h3>View your basic network information and set up connections</h3><div class="network-map"><b>EKA-PC</b><i></i><b>EKA-NETWORK</b><i></i><b>Internet</b></div><section class="active-network"><h4>View your active networks</h4><p><b>EKA-NETWORK</b><br>Home network · Access type: Internet<br>Connections: Wireless Network Connection</p></section><button data-control-action="network">Set up a new connection or network</button><button data-control-action="troubleshoot">Troubleshoot problems</button>`,
    homegroup:`<h3>Share with other home computers running Windows 7</h3><p>No other homegroup computers are currently available. This EKA browser desktop keeps all virtual files local.</p><button data-control-action="homegroup">Create a homegroup</button>`,
    "internet-options":`<h3>Internet Properties</h3><div class="property-tabs">General · Security · Privacy · Content · Connections · Programs · Advanced</div><label>Home page<textarea id="internetHome">about:home</textarea></label><button data-control-action="internet-home">Use current</button><button data-control-action="delete-history">Delete browsing history...</button>`,
    autoplay:`<h3>Choose what happens when you insert each type of media or device</h3><label><input type="checkbox" checked> Use AutoPlay for all media and devices</label><select><option>Ask me every time</option><option>Open folder to view files using Windows Explorer</option><option>Take no action</option></select><button data-control-action="save-setting">Save</button>`,
    sound:`<h3>Adjust system volume</h3><div class="sound-device"><span>🔊</span><b>Speakers<br><small>EKA High Definition Audio Device</small></b><input id="controlVolume" type="range" min="0" max="100" value="70"><output id="controlVolumeValue">70%</output></div><button data-control-action="sound-test">Test</button>`,
    "programs-features":`<h3>Uninstall or change a program</h3><div class="program-table"><b>Name</b><b>Publisher</b><b>Installed On</b><span>Internet Explorer 8</span><span>Microsoft Corporation</span><span>7/14/2009</span><span>Windows Media Player 12</span><span>Microsoft Corporation</span><span>7/14/2009</span><span>Python Browser Runtime</span><span>EKA</span><span>Today</span></div><button data-control-action="program-change">Uninstall/Change</button>`,
    "default-programs":`<h3>Choose the programs that Windows uses by default</h3><div class="default-programs"><button data-control-action="defaults">Set your default programs</button><button data-control-action="associations">Associate a file type or protocol with a program</button><dl><dt>.txt</dt><dd>Notepad</dd><dt>.html</dt><dd>Internet Explorer</dd><dt>.py</dt><dd>Python Browser Runtime</dd><dt>.png</dt><dd>Windows Photo Viewer</dd></dl></div>`,
    "desktop-gadgets":`<h3>Desktop Gadgets</h3><div class="gadget-list"><button data-control-action="gadget-clock">🕘 Clock</button><button data-control-action="gadget-cpu">▥ CPU Meter</button><button data-control-action="gadget-calendar">▣ Calendar</button></div>`,
    "user-account":`<h3>Make changes to your user account</h3><div class="user-account-card"><span>M</span><div><b>Mahdi Ghahremani</b><p>Administrator · Password protected</p></div></div><button data-control-action="password">Create a password for your account</button><button data-control-action="picture">Change your picture</button><button data-control-action="uac">Change User Account Control settings</button>`,
    "parental-controls":`<h3>Choose a user and set up Parental Controls</h3><div class="user-account-card"><span>M</span><div><b>Mahdi Ghahremani</b><p>Administrator · Parental Controls off</p></div></div><p>Parental Controls cannot restrict an administrator account.</p>`,
    personalization:`<h3>Change the visuals and sounds on your computer</h3><div class="theme-gallery"><button data-theme="aero"><i class="theme-aero"></i>Windows 7</button><button data-theme="architecture"><i class="theme-architecture"></i>Architecture</button><button data-theme="nature"><i class="theme-nature"></i>Nature</button><button data-theme="classic"><i class="theme-classic"></i>Windows Classic</button></div><p>Desktop Background · Window Color · Sounds · Screen Saver</p>`,
    "desktop-background":`<h3>Choose your desktop background</h3><div class="wallpaper-gallery"><button data-wallpaper="blue">Windows</button><button data-wallpaper="green">Landscapes</button><button data-wallpaper="dark">Architecture</button></div><label>Picture position <select><option>Fill</option><option>Fit</option><option>Stretch</option><option>Tile</option><option>Center</option></select></label>`,
    display:`<h3>Make it easier to read what's on your screen</h3><label><input type="radio" name="scale" checked> Smaller - 100% (default)</label><label><input type="radio" name="scale"> Medium - 125%</label><label>Resolution <select><option>1366 × 768 (recommended)</option><option>1280 × 720</option><option>1024 × 768</option></select></label><button data-control-action="display">Apply</button>`,
    taskbar:`<h3>Taskbar and Start Menu Properties</h3><div class="property-tabs">Taskbar · Start Menu · Toolbars</div><label><input id="lockTaskbarSetting" type="checkbox" checked> Lock the taskbar</label><label><input id="autoHideTaskbar" type="checkbox"> Auto-hide the taskbar</label><label><input id="smallTaskbarIcons" type="checkbox"> Use small icons</label><label>Taskbar location on screen <select><option>Bottom</option><option>Left</option><option>Right</option><option>Top</option></select></label><button data-control-action="taskbar-apply">Apply</button>`,
    "notification-area":`<h3>Select which icons and notifications appear on the taskbar</h3><div class="notification-list"><label>Action Center <select><option>Show icon and notifications</option><option>Only show notifications</option></select></label><label>Network <select><option>Show icon and notifications</option></select></label><label>Volume <select><option>Show icon and notifications</option></select></label><label>Power <select><option>Show icon and notifications</option></select></label></div><button data-control-action="save-setting">OK</button>`,
    "folder-options":`<h3>Folder Options</h3><div class="property-tabs">General · View · Search</div><fieldset><legend>Browse folders</legend><label><input type="radio" name="folders" checked> Open each folder in the same window</label><label><input type="radio" name="folders"> Open each folder in its own window</label></fieldset><fieldset><legend>Advanced settings</legend><label><input id="showExtensions" type="checkbox" checked> Show file name extensions</label><label><input type="checkbox"> Show hidden files, folders, and drives</label><label><input type="checkbox" checked> Show drive letters</label></fieldset><button data-control-action="folder-apply">Apply</button>`,
    fonts:`<h3>Fonts</h3><div class="font-list"><button style="font-family:Arial">Arial</button><button style="font-family:Consolas">Consolas</button><button style="font-family:'Segoe UI'">Segoe UI</button><button style="font-family:serif">Times New Roman</button></div>`,
    "date-time":`<h3>Date and Time</h3><div class="date-time-panel"><span>🕘</span><div><b>${new Date().toLocaleString()}</b><p>Time zone: Local browser time</p></div></div><button data-control-action="date-time">Change date and time...</button><button data-control-action="timezone">Change time zone...</button>`,
    "region-language":`<h3>Region and Language</h3><div class="property-tabs">Formats · Location · Keyboards and Languages · Administrative</div><label>Format <select><option>English (United States)</option><option>Persian (Iran)</option><option>German (Germany)</option></select></label><p>Date example: ${new Date().toLocaleDateString()}<br>Time example: ${new Date().toLocaleTimeString()}</p><button data-control-action="save-setting">Apply</button>`,
    location:`<h3>Location and Other Sensors</h3><p>No location sensors are installed. The site does not request precise location.</p><label>Current location <select><option>United States</option><option>Iran</option><option>Germany</option></select></label>`,
    "ease-center":`<h3>Ease of Access Center</h3><p>Quick access to common tools</p><div class="ease-tools"><button data-control-app="keyboard">Start On-Screen Keyboard</button><button data-generic-app="Magnifier">Start Magnifier</button><button data-control-action="high-contrast">Set up High Contrast</button></div>`,
    "display-access":`<h3>Make the computer easier to see</h3><label><input id="highContrastSetting" type="checkbox"> Choose a High Contrast theme</label><label><input type="checkbox"> Turn on Narrator</label><label><input type="checkbox"> Turn on Audio Description</label><button data-control-action="access-apply">Apply</button>`
  }
  return pages[id]||`<h3>${CONTROL_NAMES[id]||"Control Panel item"}</h3><p>This Windows 7 setting is available in the safe browser simulation. Changes remain inside this page and do not alter the visitor's device.</p><button data-control-action="save-setting">OK</button>`
}

function initControl(){
  let route="home",history=["home"],historyIndex=0
  const categoryFor=id=>CONTROL_CATEGORIES.find(category=>category.id===id)
  const pageName=id=>categoryFor(id)?.name||CONTROL_NAMES[id]||"Control Panel"
  const homeHtml=(query="")=>{
    const q=query.trim().toLowerCase(),view=byId("controlView").value
    if(view!=="category"){
      const links=CONTROL_CATEGORIES.flatMap(category=>category.links).filter(([,name])=>!q||name.toLowerCase().includes(q))
      return `<div class="control-icons ${view}">${links.map(([id,name])=>`<button data-control-link="${id}"><span>⚙</span><b>${name}</b></button>`).join("")}</div>`
    }
    return `<div class="control-categories">${CONTROL_CATEGORIES.filter(category=>!q||`${category.name} ${category.links.flat().join(" ")}`.toLowerCase().includes(q)).map(category=>`<section><button class="control-category-title" data-control-category="${category.id}"><span>${category.icon}</span><b>${category.name}</b></button><div>${category.links.slice(0,3).map(([id,name])=>`<button data-control-link="${id}">${name}</button>`).join("")}</div></section>`).join("")}</div>`
  }
  const render=(next=route,push=false)=>{
    route=next
    if(push){history=history.slice(0,historyIndex+1);history.push(next);historyIndex=history.length-1}
    byId("controlBack").disabled=historyIndex<=0;byId("controlForward").disabled=historyIndex>=history.length-1
    byId("controlCrumb").textContent=next==="home"?"":`› ${pageName(next)}`
    byId("controlHeading").textContent=next==="home"?"Adjust your computer's settings":pageName(next)
    byId("controlContent").innerHTML=next==="home"?homeHtml(byId("controlSearch").value):categoryFor(next)?`<div class="control-category-page"><aside><button data-control-route="home">Control Panel Home</button>${CONTROL_CATEGORIES.map(category=>`<button data-control-category="${category.id}">${category.name}</button>`).join("")}</aside><main><h3>${categoryFor(next).name}</h3>${categoryFor(next).links.map(([id,name])=>`<button class="category-task" data-control-link="${id}"><span>⚙</span><b>${name}</b><small>View or change this Windows setting</small></button>`).join("")}</main></div>`:`<div class="control-setting"><aside><button data-control-route="home">Control Panel Home</button><button data-control-category="${CONTROL_CATEGORIES.find(category=>category.links.some(([id])=>id===next))?.id||"system-security"}">Related category</button></aside><main>${controlPage(next)}</main></div>`
    byId("controlFooter").textContent=next==="home"?"Windows 7 Control Panel · EKA-PC":`${pageName(next)} · Changes apply only to this browser simulation`
  }
  byId("controlContent").addEventListener("click",event=>{
    const routeButton=event.target.closest("[data-control-route]");if(routeButton){render(routeButton.dataset.controlRoute,true);return}
    const category=event.target.closest("[data-control-category]");if(category){render(category.dataset.controlCategory,true);return}
    const link=event.target.closest("[data-control-link]");if(link){const id=link.dataset.controlLink;if(id==="system"){window.dispatchEvent(new CustomEvent("win7:open-app",{detail:"systeminfo"}));return}if(id==="devices"){window.dispatchEvent(new CustomEvent("win7:open-app",{detail:"devices"}));return}if(id==="keyboard"){window.dispatchEvent(new CustomEvent("win7:open-app",{detail:"keyboard"}));return}render(id,true);return}
    const app=event.target.closest("[data-control-app]")?.dataset.controlApp;if(app){window.dispatchEvent(new CustomEvent("win7:open-app",{detail:app}));return}
    const theme=event.target.closest("[data-theme]")?.dataset.theme;if(theme){byId("desktop").dataset.theme=theme;toast(`${theme} theme applied.`);return}
    const wallpaper=event.target.closest("[data-wallpaper]")?.dataset.wallpaper;if(wallpaper){byId("desktop").dataset.wallpaper=wallpaper;return}
    const action=event.target.closest("[data-control-action]")?.dataset.controlAction;if(!action)return
    if(action==="updates"){byId("updateStatus").textContent="Checking for updates...";setTimeout(()=>{if(byId("updateStatus"))byId("updateStatus").textContent="Windows is up to date. No important updates are available."},1300);return}
    if(action==="backup"){byId("backupStatus").textContent="Backup destination selected: GitHub (G:) local workspace.";return}
    if(action==="taskbar-apply"){byId("taskbar").classList.toggle("small-icons",byId("smallTaskbarIcons").checked);toast("Taskbar settings applied.");return}
    if(action==="access-apply"||action==="high-contrast"){byId("desktop").classList.toggle("high-contrast",byId("highContrastSetting")?.checked??true);return}
    toast(`${event.target.textContent.trim()} · completed in the EKA simulation.`)
  })
  byId("controlContent").addEventListener("input",event=>{if(event.target.id==="controlVolume"){byId("controlVolumeValue").textContent=`${event.target.value}%`;if(byId("volumeSlider")){byId("volumeSlider").value=event.target.value;byId("volumeSlider").dispatchEvent(new Event("input"))}}})
  byId("controlSearch").addEventListener("input",()=>{if(route!=="home")render("home",true);else render()})
  byId("controlView").addEventListener("change",()=>render("home",route!=="home"))
  byId("controlHome").addEventListener("click",()=>render("home",true))
  byId("controlBack").addEventListener("click",()=>{if(historyIndex>0){historyIndex-=1;render(history[historyIndex])}})
  byId("controlForward").addEventListener("click",()=>{if(historyIndex<history.length-1){historyIndex+=1;render(history[historyIndex])}})
  window.addEventListener("win7:control-page",event=>render(event.detail,true))
  render()
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
