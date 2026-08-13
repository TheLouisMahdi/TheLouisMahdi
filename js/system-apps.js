import{PROFILE,REPOSITORIES}from"./data.js"
import{askOpenFile,askSaveAs,askText}from"./interaction.js"
import{icon}from"./icons.js"
import{fileName,getEntry,readFile,writeFile}from"./vfs.js"
import{closeWindow,openWindow}from"./window-manager.js"
import{applyAccent,applyTheme,desktopBackgroundHtml,personalizationHtml,restorePersonalization,saveWallpaperPlaylist}from"./personalization.js"

const byId=id=>document.getElementById(id)
const toast=text=>window.dispatchEvent(new CustomEvent("win7:toast",{detail:text}))
const PAINT_COLORS=["#000000","#7f7f7f","#880015","#ed1c24","#ff7f27","#fff200","#22b14c","#00a2e8","#3f48cc","#a349a4","#ffffff","#c3c3c3","#b97a57","#ffaec9","#ffc90e","#efe4b0","#b5e61d","#99d9ea","#7092be","#c8bfe7"]
const PAINT_BRUSH_SIZES={brush:[1,3,5,8],calligraphy1:[3,5,8,10],calligraphy2:[3,5,8,10],airbrush:[4,8,16,24],oil:[8,16,30,40],crayon:[8,16,30,40],marker:[8,16,30,40],natural:[4,6,8,10],watercolor:[8,16,30,40]}
const WINDOW_COLORS=[["Sky","#4f96c5"],["Twilight","#586895"],["Sea","#3f8492"],["Leaf","#4d8f6a"],["Lime","#8c9b48"],["Sun","#d1b53d"],["Pumpkin","#cd743b"],["Ruby","#aa4747"],["Frost","#91c9ce"],["Slate","#71838e"],["Chocolate","#795548"],["Lavender","#8876ad"],["Rose","#ae718f"],["Taupe","#8b7d72"],["Silver","#a1abb2"],["Graphite","#53606a"]]

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
  windowNode("paint","Untitled - Paint","paint",`<div class="paint-tabs"><button class="paint-file-button" id="paintFileButton">Paint</button><button class="active" data-paint-tab="home">Home</button><button data-paint-tab="view">View</button><div class="paint-quick"><button data-paint="save" title="Save">▣</button><button data-paint="undo" title="Undo">↶</button><button data-paint="redo" title="Redo">↷</button></div></div><div class="paint-file-menu hidden" id="paintFileMenu"><button data-paint="new">New</button><button data-paint="open">Open</button><button data-paint="save">Save</button><button data-paint="save-as">Save as</button><span></span><button data-paint="print">Print</button><button data-paint="exit">Exit</button></div><div class="paint-ribbon paint-home-ribbon" id="paintHomeRibbon"><div class="ribbon-group paint-clipboard"><button data-paint="paste">▣<small>Paste</small></button><button data-paint="copy">Copy</button><button data-paint="cut">Cut</button><label>Clipboard</label></div><div class="ribbon-group paint-image-tools"><button data-paint-tool="select">▱<small>Select</small></button><button data-paint="crop">Crop</button><button data-paint="resize">Resize</button><button data-paint="rotate">Rotate</button><label>Image</label></div><div class="ribbon-group paint-tools"><button data-paint-tool="pencil" class="active" title="Pencil">✎</button><button data-paint-tool="fill" title="Fill with color">▰</button><button data-paint-tool="text" title="Text">A</button><button data-paint-tool="eraser" title="Eraser">▱</button><button data-paint-tool="picker" title="Color picker">⌖</button><button data-paint-tool="brush" title="Brush">🖌</button><label>Tools</label></div><div class="ribbon-group paint-brushes"><select id="paintBrush" title="Brushes"><option value="brush">Brush</option><option value="calligraphy1">Calligraphy brush 1</option><option value="calligraphy2">Calligraphy brush 2</option><option value="airbrush">Airbrush</option><option value="oil">Oil brush</option><option value="crayon">Crayon</option><option value="marker">Marker</option><option value="natural">Natural pencil</option><option value="watercolor">Watercolor brush</option></select><label>Brushes</label></div><div class="ribbon-group paint-shapes"><div><button data-paint-tool="line" title="Line">╱</button><button data-paint-tool="curve" title="Curve">⌒</button><button data-paint-tool="rectangle" title="Rectangle">□</button><button data-paint-tool="rounded" title="Rounded rectangle">▢</button><button data-paint-tool="ellipse" title="Oval">○</button><button data-paint-tool="triangle" title="Triangle">△</button><button data-paint-tool="diamond" title="Diamond">◇</button><button data-paint-tool="arrow" title="Right arrow">→</button></div><select id="paintOutline"><option>Solid color</option><option>Crayon</option><option>Marker</option><option>Oil</option><option>Natural pencil</option><option>Watercolor</option><option>No outline</option></select><select id="paintFill"><option>No fill</option><option>Solid color</option><option>Crayon</option><option>Marker</option><option>Oil</option><option>Natural pencil</option><option>Watercolor</option></select><label>Shapes</label></div><div class="ribbon-group paint-size"><select id="paintSize"><option value="1">1 px</option><option value="3" selected>3 px</option><option value="5">5 px</option><option value="8">8 px</option></select><label>Size</label></div><div class="ribbon-group paint-colors"><div class="paint-color-state"><button id="paintPrimary" title="Color 1"><i style="background:#000"></i><small>Color 1</small></button><button id="paintSecondary" title="Color 2"><i style="background:#fff"></i><small>Color 2</small></button></div><div class="paint-palette" id="paintPalette">${PAINT_COLORS.map(color=>`<button data-paint-color="${color}" style="--paint-color:${color}" title="${color}"></button>`).join("")}</div><label class="paint-edit-color">Edit colors <input id="paintCustomColor" type="color" value="#000000"></label><label>Colors</label></div></div><div class="paint-ribbon paint-view-ribbon hidden" id="paintViewRibbon"><div class="ribbon-group"><button data-paint="zoom-in">Zoom in</button><button data-paint="zoom-out">Zoom out</button><button data-paint="zoom-100">100%</button><label>Zoom</label></div><div class="ribbon-group"><label><input id="paintRulers" type="checkbox"> Rulers</label><label><input id="paintGridlines" type="checkbox"> Gridlines</label><label><input id="paintStatus" type="checkbox" checked> Status bar</label><label>Show or hide</label></div><div class="ribbon-group"><button data-paint="fullscreen">Full screen</button><label>Display</label></div></div><div class="paint-stage" id="paintStage"><div class="paint-ruler paint-ruler-x hidden" id="paintRulerX"></div><div class="paint-ruler paint-ruler-y hidden" id="paintRulerY"></div><div class="paint-canvas-wrap" id="paintCanvasWrap"><canvas id="paintCanvas" width="960" height="540"></canvas><div class="paint-selection hidden" id="paintSelection"></div></div></div><div class="paint-statusbar" id="paintStatusbar"><span id="paintPointer">0, 0px</span><span id="paintDimensions">960 × 540px</span><div class="paint-zoom"><button data-paint="zoom-out">−</button><input id="paintZoom" type="range" min="25" max="800" step="25" value="100"><button data-paint="zoom-in">+</button><b id="paintZoomValue">100%</b></div></div>`,`paint-window`)
  windowNode("wordpad","Document - WordPad","wordpad",`<div class="wordpad-ribbon"><button data-format="bold"><b>B</b></button><button data-format="italic"><i>I</i></button><button data-format="underline"><u>U</u></button><select id="wordpadSize"><option>10</option><option selected>12</option><option>16</option><option>24</option><option>36</option></select><button id="wordpadSave">Save As...</button></div><div class="wordpad-page" id="wordpadText" contenteditable="true"><h1>Mahdi Ghahremani</h1><p>Electrical Engineering · Embedded Systems · FPGA · AI Vision</p></div>`,`wordpad-window`)
  windowNode("sticky","Sticky Notes","sticky",`<div class="sticky-toolbar"><button id="stickyNew">＋</button><span>Sticky Notes</span><button id="stickyDelete">×</button></div><textarea id="stickyText" aria-label="Sticky note"></textarea>`,`sticky-window`)
  windowNode("snipping","Snipping Tool","snipping",`<div class="snip-toolbar"><button id="snipNew">New</button><button id="snipCopy">Copy</button><span>Rectangular Snip</span></div><div class="snip-stage" id="snipStage"><p>Click New, then drag to select an area.</p><div class="snip-selection hidden" id="snipSelection"></div></div>`,`snipping-window`)
  windowNode("media","Windows Media Player","media",`<div class="media-layout"><aside><strong>Libraries</strong><button>Music</button><button>Videos</button><button>Pictures</button><button>Playlists</button></aside><main><h2>Eka Media Library</h2><div class="media-list">${REPOSITORIES.slice(0,5).map((repo,index)=>`<button data-track="${index}"><span>♫</span><b>${repo.name}</b><small>${repo.tag}</small></button>`).join("")}</div></main></div><div class="media-controls"><button id="mediaPrevious">◀◀</button><button id="mediaPlay">▶</button><button id="mediaNext">▶▶</button><div class="media-progress"><i id="mediaProgress"></i></div><input id="mediaVolume" type="range" min="0" max="100" value="70"><span id="mediaState">Ready</span></div>`,`media-window`)
  windowNode("control","Control Panel","control",`<div class="control-nav"><button id="controlBack" aria-label="Back">←</button><button id="controlForward" aria-label="Forward">→</button><div class="control-address"><button id="controlHome">Control Panel</button><span id="controlCrumb"></span></div><input id="controlSearch" placeholder="Search Control Panel"></div><div class="control-heading"><h2 id="controlHeading">Adjust your computer's settings</h2><label>View by: <select id="controlView"><option value="category">Category</option><option value="large">Large icons</option><option value="small">Small icons</option></select></label></div><div class="control-content" id="controlContent"></div><div class="control-footer" id="controlFooter">Windows 7 Control Panel · EKA-PC</div>`,`control-window`)
  windowNode("devices","Devices and Printers","devices",`<div class="devices-command">Add a device · Add a printer</div><div class="device-section"><h3>Devices</h3><button class="device-card"><span>${icon("computer")}</span><b>EKA Notebook</b><small>This device</small></button></div><div class="device-section"><h3>Printers and Faxes</h3><button class="device-card" id="profilePrinter"><span>${icon("printer")}</span><b>EKA Profile Printer</b><small>Ready · Default</small></button><button class="device-card"><span>${icon("printer")}</span><b>Microsoft XPS Document Writer</b><small>Ready</small></button></div>`,`devices-window`)
  windowNode("taskmanager","Windows Task Manager","taskmanager",`<div class="taskmgr-tabs"><button>Applications</button><button>Processes</button><button>Performance</button><button>Networking</button><button>Users</button></div><div class="taskmgr-table" id="taskManagerList"></div><div class="taskmgr-actions"><span id="taskManagerStatus">Processes: 0 · CPU Usage: 7% · Physical Memory: 34%</span><button id="endTask">End Task</button></div>`,`taskmanager-window`)
  windowNode("minesweeper","Minesweeper","minesweeper",`<div class="mine-menubar"><button id="mineGameMenu">Game</button><button id="mineHelp">Help</button></div><div class="mine-game-menu hidden" id="mineGameDropdown"><button data-mine-level="beginner">Beginner <small>9 × 9 · 10 mines</small></button><button data-mine-level="intermediate">Intermediate <small>16 × 16 · 40 mines</small></button><button data-mine-level="advanced">Advanced <small>30 × 16 · 99 mines</small></button></div><div class="mine-toolbar"><b id="mineCount">010</b><button id="mineReset">🙂</button><b id="mineTime">000</b></div><div class="mine-scroll"><div class="mine-grid" id="mineGrid"></div></div>`,`minesweeper-window`)
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
  const magnifierButton=byId("paintHomeRibbon").querySelector('[data-paint-tool="brush"]');magnifierButton.dataset.paintTool="magnifier";magnifierButton.title="Magnifier";magnifierButton.textContent="⌕"
  let drawing=false,tool="pencil",primary="#000000",secondary="#ffffff",strokeColor=primary,shapeSecondary=false,start=null,last=null,preview=null,selection=null,paintPath=null,zoom=100
  let history=[],future=[]
  const point=event=>{const rect=canvas.getBoundingClientRect();return{x:(event.clientX-rect.left)*canvas.width/rect.width,y:(event.clientY-rect.top)*canvas.height/rect.height}}
  const title=name=>byId("paintWindow").querySelector(".window-title").textContent=`${name} - Paint`
  const updateDimensions=()=>byId("paintDimensions").textContent=`${canvas.width} × ${canvas.height}px`
  const image=()=>ctx.getImageData(0,0,canvas.width,canvas.height)
  const record=()=>{history.push(image());if(history.length>16)history.shift();future=[]}
  const restore=data=>{if(data&&data.width===canvas.width&&data.height===canvas.height)ctx.putImageData(data,0,0)}
  const clear=()=>{ctx.save();ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.restore();record()}
  const setColors=()=>{byId("paintPrimary").querySelector("i").style.background=primary;byId("paintSecondary").querySelector("i").style.background=secondary}
  const setSizes=values=>{const select=byId("paintSize"),current=Number(select.value);select.innerHTML=values.map(value=>`<option value="${value}">${value} px</option>`).join("");select.value=String(values.includes(current)?current:values[0])}
  const setTool=next=>{tool=next;byId("paintHomeRibbon").querySelectorAll("[data-paint-tool]").forEach(button=>button.classList.toggle("active",button.dataset.paintTool===tool));canvas.style.cursor=["fill","picker"].includes(tool)?"crosshair":tool==="text"?"text":tool==="magnifier"?"zoom-in":"crosshair";if(tool==="pencil")setSizes([1,2,3,4]);else if(tool==="eraser")setSizes([4,6,8,10]);else if(tool==="brush")setSizes(PAINT_BRUSH_SIZES[byId("paintBrush").value]);else if(["line","curve","rectangle","ellipse","rounded","triangle","diamond","arrow"].includes(tool))setSizes([1,3,5,8])}
  const colorBytes=color=>{const value=color.replace("#","");return[value.slice(0,2),value.slice(2,4),value.slice(4,6)].map(part=>parseInt(part,16))}
  const floodFill=(x,y,color)=>{
    x=Math.floor(x);y=Math.floor(y);const data=ctx.getImageData(0,0,canvas.width,canvas.height),pixels=data.data,index=(y*canvas.width+x)*4,target=[pixels[index],pixels[index+1],pixels[index+2],pixels[index+3]],next=[...colorBytes(color),255]
    if(target.every((value,i)=>value===next[i]))return
    const match=offset=>target.every((value,i)=>pixels[offset+i]===value),stack=[[x,y]],seen=new Uint8Array(canvas.width*canvas.height)
    while(stack.length){const[cx,cy]=stack.pop(),key=cy*canvas.width+cx,offset=key*4;if(cx<0||cy<0||cx>=canvas.width||cy>=canvas.height||seen[key]||!match(offset))continue;seen[key]=1;pixels.set(next,offset);stack.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1])}
    ctx.putImageData(data,0,0)
  }
  const brushStroke=(from,to,color)=>{
    const size=Number(byId("paintSize").value),brush=byId("paintBrush").value,dx=to.x-from.x,dy=to.y-from.y,distance=Math.max(1,Math.hypot(dx,dy)),steps=Math.max(1,Math.ceil(distance/2))
    ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineJoin="round";ctx.globalAlpha=1
    if(tool==="pencil"){ctx.lineWidth=1;ctx.lineCap="butt"}
    else if(tool==="eraser"){ctx.strokeStyle=secondary;ctx.fillStyle=secondary;ctx.lineWidth=Math.max(4,size*4);ctx.lineCap="square"}
    else{ctx.lineWidth=size;ctx.lineCap="round";if(brush==="calligraphy1")ctx.lineCap="square";if(brush==="calligraphy2")ctx.lineCap="butt";if(brush==="marker"){ctx.globalAlpha=.38;ctx.lineCap="square"}if(brush==="watercolor")ctx.globalAlpha=.18;if(brush==="natural")ctx.globalAlpha=.72}
    if(tool==="brush"&&["airbrush","crayon","oil","natural"].includes(brush)){
      for(let step=0;step<=steps;step++){const t=step/steps,x=from.x+dx*t,y=from.y+dy*t,radius=Math.max(2,size*(brush==="airbrush"?.5:.38)),dots=brush==="airbrush"?Math.max(4,size):brush==="oil"?Math.max(5,Math.ceil(size*.7)):Math.max(3,Math.ceil(size*.45));for(let dot=0;dot<dots;dot++){const angle=Math.random()*Math.PI*2,spread=Math.random()*radius,px=x+Math.cos(angle)*spread,py=y+Math.sin(angle)*spread;ctx.globalAlpha=brush==="airbrush"?.11:brush==="crayon"?.48:brush==="natural"?.35:.3;ctx.fillRect(px,py,brush==="oil"?Math.max(2,size*.22):1.2,brush==="oil"?Math.max(1,size*.1):1.2)}}
    }else{ctx.beginPath();ctx.moveTo(from.x,from.y);ctx.lineTo(to.x,to.y);ctx.stroke();if(distance<2){ctx.beginPath();ctx.arc(to.x,to.y,Math.max(.5,ctx.lineWidth/2),0,Math.PI*2);ctx.fill()}}
    ctx.restore()
  }
  const drawShape=(end,commit=true)=>{
    restore(preview)
    const x=Math.min(start.x,end.x),y=Math.min(start.y,end.y),w=Math.abs(end.x-start.x),h=Math.abs(end.y-start.y)
    const outline=shapeSecondary?secondary:primary,fill=shapeSecondary?primary:secondary
    const path=()=>{ctx.beginPath();if(tool==="line"||tool==="curve"){ctx.moveTo(start.x,start.y);tool==="curve"?ctx.quadraticCurveTo(x+w*.62,y-h*.35,end.x,end.y):ctx.lineTo(end.x,end.y)}else if(tool==="ellipse")ctx.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,Math.PI*2);else if(tool==="rounded"){const radius=Math.min(18,w/4,h/4);if(ctx.roundRect)ctx.roundRect(x,y,w,h,radius);else{ctx.moveTo(x+radius,y);ctx.lineTo(x+w-radius,y);ctx.quadraticCurveTo(x+w,y,x+w,y+radius);ctx.lineTo(x+w,y+h-radius);ctx.quadraticCurveTo(x+w,y+h,x+w-radius,y+h);ctx.lineTo(x+radius,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-radius);ctx.lineTo(x,y+radius);ctx.quadraticCurveTo(x,y,x+radius,y);ctx.closePath()}}else if(tool==="triangle"){ctx.moveTo(x+w/2,y);ctx.lineTo(x+w,y+h);ctx.lineTo(x,y+h);ctx.closePath()}else if(tool==="diamond"){ctx.moveTo(x+w/2,y);ctx.lineTo(x+w,y+h/2);ctx.lineTo(x+w/2,y+h);ctx.lineTo(x,y+h/2);ctx.closePath()}else if(tool==="arrow"){ctx.moveTo(x,y+h*.3);ctx.lineTo(x+w*.55,y+h*.3);ctx.lineTo(x+w*.55,y);ctx.lineTo(x+w,y+h*.5);ctx.lineTo(x+w*.55,y+h);ctx.lineTo(x+w*.55,y+h*.7);ctx.lineTo(x,y+h*.7);ctx.closePath()}else ctx.rect(x,y,w,h)}
    const style=name=>{ctx.globalAlpha=name==="Marker"?.42:name==="Watercolor"?.22:name==="Crayon"?.72:name==="Oil"?.82:name==="Natural pencil"?.65:1;ctx.setLineDash?.(name==="Crayon"?[2,1]:name==="Natural pencil"?[1,1]:[]);ctx.lineCap=name==="Marker"?"square":"round"}
    if(byId("paintFill").value!=="No fill"&&tool!=="line"&&tool!=="curve"){ctx.save();style(byId("paintFill").value);ctx.fillStyle=fill;path();ctx.fill();ctx.restore()}
    if(byId("paintOutline").value!=="No outline"){ctx.save();style(byId("paintOutline").value);ctx.lineWidth=Number(byId("paintSize").value);ctx.strokeStyle=outline;path();ctx.stroke();ctx.restore()}
    if(commit)record()
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
    const extension=fileName(paintPath).split(".").pop().toLowerCase(),mime=extension==="jpg"||extension==="jpeg"?"image/jpeg":extension==="gif"?"image/png":extension==="bmp"?"image/png":"image/png"
    writeFile(paintPath,canvas.toDataURL(mime,mime==="image/jpeg"?.92:undefined));title(fileName(paintPath));toast(`Saved ${fileName(paintPath)}`)
  }
  const changeZoom=value=>{zoom=Math.max(25,Math.min(800,value));byId("paintZoom").value=String(zoom);byId("paintZoomValue").textContent=`${zoom}%`;canvas.style.width=`${zoom}%`}
  ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.lineCap="round";ctx.lineJoin="round";record();setColors();byId("paintSize").value="1";setTool("pencil");updateDimensions()
  canvas.addEventListener("pointerdown",async event=>{
    const p=point(event);start=p;last=p;strokeColor=event.button===2?secondary:primary;shapeSecondary=event.button===2
    if(tool==="magnifier"){changeZoom(zoom+(event.button===2?-100:100));return}
    if(tool==="fill"){floodFill(p.x,p.y,strokeColor);record();return}
    if(tool==="picker"){const pixel=ctx.getImageData(Math.max(0,Math.floor(p.x)),Math.max(0,Math.floor(p.y)),1,1).data,value=`#${[pixel[0],pixel[1],pixel[2]].map(value=>value.toString(16).padStart(2,"0")).join("")}`;if(event.button===2)secondary=value;else primary=value;setColors();return}
    if(tool==="text"){const text=await askText("Text","Enter text:","");if(text){ctx.fillStyle=strokeColor;ctx.font="24px Segoe UI";ctx.fillText(text,p.x,p.y);record()}return}
    drawing=true;canvas.setPointerCapture(event.pointerId);preview=image()
    if(tool==="select"){selection={x:p.x,y:p.y,w:0,h:0};byId("paintSelection").classList.remove("hidden");return}
    if(["pencil","brush","eraser"].includes(tool))brushStroke(p,p,strokeColor)
  })
  canvas.addEventListener("pointermove",event=>{
    const p=point(event);byId("paintPointer").textContent=`${Math.round(p.x)}, ${Math.round(p.y)}px`
    if(!drawing)return
    if(tool==="select"){
      selection={x:Math.min(start.x,p.x),y:Math.min(start.y,p.y),w:Math.abs(p.x-start.x),h:Math.abs(p.y-start.y)}
      Object.assign(byId("paintSelection").style,{left:`${selection.x/canvas.width*100}%`,top:`${selection.y/canvas.height*100}%`,width:`${selection.w/canvas.width*100}%`,height:`${selection.h/canvas.height*100}%`});return
    }
    if(["line","curve","rectangle","ellipse","rounded","triangle","diamond","arrow"].includes(tool)){drawShape(p,false);return}
    brushStroke(last,p,strokeColor);last=p
  })
  const finish=event=>{if(!drawing)return;drawing=false;if(["line","curve","rectangle","ellipse","rounded","triangle","diamond","arrow"].includes(tool))drawShape(point(event),true);else if(tool!=="select")record()}
  canvas.addEventListener("pointerup",finish);canvas.addEventListener("pointercancel",()=>drawing=false);canvas.addEventListener("contextmenu",event=>event.preventDefault())
  byId("paintPalette").addEventListener("click",event=>{const color=event.target.closest("[data-paint-color]")?.dataset.paintColor;if(color){primary=color;setColors()}})
  byId("paintPalette").addEventListener("contextmenu",event=>{const color=event.target.closest("[data-paint-color]")?.dataset.paintColor;if(color){event.preventDefault();secondary=color;setColors()}})
  byId("paintCustomColor").addEventListener("input",event=>{primary=event.target.value;setColors()})
  byId("paintBrush").addEventListener("change",()=>setTool("brush"))
  document.addEventListener("keydown",event=>{if(byId("paintWindow").classList.contains("hidden")||!document.querySelector('[data-task="paint"].active'))return;if(event.ctrlKey&&(event.code==="NumpadAdd"||event.code==="NumpadSubtract")){event.preventDefault();const sizes=[...byId("paintSize").options].map(option=>Number(option.value)),current=Number(byId("paintSize").value),index=sizes.indexOf(current),next=event.code==="NumpadAdd"?Math.min(sizes.length-1,index+1):Math.max(0,index-1);byId("paintSize").value=String(sizes[next])}if(event.ctrlKey&&event.key.toLowerCase()==="z"){event.preventDefault();if(history.length>1){future.push(history.pop());restore(history.at(-1))}}if(event.ctrlKey&&event.key.toLowerCase()==="y"){event.preventDefault();if(future.length){const data=future.pop();history.push(data);restore(data)}}})
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
  {id:"system-security",name:"System and Security",icon:"system",links:[["action-center","Review your computer's status"],["backup","Back up your computer"],["troubleshooting","Find and fix problems"],["windows-update","Check for updates"]]},
  {id:"network-internet",name:"Network and Internet",icon:"ie",links:[["network-sharing","View network status and tasks"],["homegroup","Choose homegroup and sharing options"],["internet-options","Internet Options"]]},
  {id:"hardware-sound",name:"Hardware and Sound",icon:"devices",links:[["devices","View devices and printers"],["autoplay","Play CDs or other media automatically"],["sound","Adjust system volume"],["power-options","Change battery settings"]]},
  {id:"programs",name:"Programs",icon:"folder",links:[["programs-features","Uninstall a program"],["default-programs","Default Programs"],["desktop-gadgets","Get desktop gadgets online"]]},
  {id:"user-accounts",name:"User Accounts and Family Safety",icon:"system",links:[["user-account","Add or remove user accounts"],["parental-controls","Set up parental controls for any user"]]},
  {id:"appearance",name:"Appearance and Personalization",icon:"paint",links:[["personalization","Change the theme"],["desktop-background","Change desktop background"],["display","Adjust screen resolution"]]},
  {id:"clock-region",name:"Clock, Language, and Region",icon:"run",links:[["date-time","Change keyboards or other input methods"],["region-language","Change display language"]]},
  {id:"ease-access",name:"Ease of Access",icon:"keyboard",links:[["ease-center","Let Windows suggest settings"],["display-access","Optimize visual display"]]}
]

const CONTROL_ITEMS=[
  ["action-center","Action Center","system"],["administrative-tools","Administrative Tools","control"],["autoplay","AutoPlay","media"],["backup","Backup and Restore","drive"],["bitlocker","BitLocker Drive Encryption","drive"],["color-management","Color Management","paint"],["credential-manager","Credential Manager","system"],["date-time","Date and Time","run"],["default-programs","Default Programs","system"],["desktop-gadgets","Desktop Gadgets","control"],["device-manager","Device Manager","devices"],["devices","Devices and Printers","devices"],["display","Display","computer"],["ease-center","Ease of Access Center","keyboard"],["folder-options","Folder Options","folder"],["fonts","Fonts","text"],["getting-started","Getting Started","windows"],["homegroup","HomeGroup","computer"],["indexing-options","Indexing Options","folder"],["internet-options","Internet Options","ie"],["keyboard","Keyboard","keyboard"],["location","Location and Other Sensors","system"],["mouse","Mouse","cursor"],["network-sharing","Network and Sharing Center","ie"],["notification-area","Notification Area Icons","system"],["parental-controls","Parental Controls","system"],["performance","Performance Information and Tools","taskmanager"],["personalization","Personalization","paint"],["phone-modem","Phone and Modem","devices"],["power-options","Power Options","system"],["programs-features","Programs and Features","folder"],["recovery","Recovery","system"],["region-language","Region and Language","system"],["remoteapp","RemoteApp and Desktop Connections","computer"],["sound","Sound","media"],["speech-recognition","Speech Recognition","system"],["sync-center","Sync Center","system"],["system","System","computer"],["taskbar","Taskbar and Start Menu","windows"],["troubleshooting","Troubleshooting","control"],["user-account","User Accounts","system"],["windows-anytime","Windows Anytime Upgrade","windows"],["windows-defender","Windows Defender","system"],["firewall","Windows Firewall","system"],["windows-update","Windows Update","windows"]
].map(([id,name,iconName])=>({id,name,icon:iconName}))
const CONTROL_ITEM_BY_ID=Object.fromEntries(CONTROL_ITEMS.map(item=>[item.id,item]))
const CONTROL_NAMES={...Object.fromEntries(CONTROL_CATEGORIES.flatMap(category=>category.links.map(([id,name])=>[id,name]))),...Object.fromEntries(CONTROL_ITEMS.map(item=>[item.id,item.name]))}
const CONTROL_DESCRIPTIONS={
  "administrative-tools":"Configure advanced Windows management tools, services, scheduled tasks, event logs, and computer management.",bitlocker:"Protect data on fixed and removable drives with BitLocker Drive Encryption.","color-management":"Associate color profiles with displays, scanners, and printers.","credential-manager":"Manage Windows credentials and certificate-based credentials saved for network resources.","device-manager":"View hardware devices, update drivers, and inspect device status.","getting-started":"Learn the essential Windows 7 tasks and personalize this computer.","indexing-options":"Choose which locations Windows Search indexes and rebuild the search index.",mouse:"Change button, pointer, wheel, and hardware settings for the mouse.",performance:"View the Windows Experience Index and adjust visual effects and performance options.","phone-modem":"Configure dialing rules, modems, and telephony providers.",recovery:"Restore system files and settings from a restore point or open advanced recovery methods.",remoteapp:"Set up connections to RemoteApp programs and remote desktops.","speech-recognition":"Set up a microphone, train speech recognition, and open the Speech Reference Card.","sync-center":"Manage offline files and synchronization partnerships.",troubleshooting:"Find and fix common problems with programs, hardware, networks, appearance, and security.","windows-anytime":"Upgrade this edition of Windows 7 using Windows Anytime Upgrade.","windows-defender":"Scan for spyware and potentially unwanted software and review detected items."
}

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
    personalization:personalizationHtml(),
    "desktop-background":desktopBackgroundHtml(),
    "window-color":`<h3>Window Color and Appearance</h3><p>Click a color to change the color of your window borders, Start menu, and taskbar.</p><div class="window-color-grid">${WINDOW_COLORS.map(([name,color],index)=>`<button data-window-color="${index}" data-window-color-value="${color}" title="${name}" style="--accent:${color}"><i></i><span>${name}</span></button>`).join("")}</div><label>Color intensity <input id="windowColorIntensity" type="range" min="20" max="100" value="65"></label><label><input id="windowTransparency" type="checkbox" checked> Enable transparency</label><button data-control-action="window-color-apply">Save changes</button>`,
    sounds:`<h3>Sound</h3><div class="property-tabs">Playback · Recording · Sounds · Communications</div><label>Sound Scheme: <select id="soundScheme"><option>Windows Default</option><option>Afternoon</option><option>Calligraphy</option><option>Characters</option><option>Cityscape</option><option>Delta</option><option>Festival</option><option>Garden</option><option>Heritage</option><option>Landscape</option><option>Quirky</option><option>Raga</option><option>Savana</option><option>Sonata</option><option>No Sounds</option></select></label><label><input type="checkbox" checked> Play Windows Startup sound</label><button data-control-action="sound-test">Test</button><button data-control-action="save-setting">OK</button>`,
    "screen-saver":`<h3>Screen Saver Settings</h3><div class="screen-saver-preview"><i id="screenSaverPreview">Windows 7</i></div><label>Screen saver: <select id="screenSaver"><option>(None)</option><option>3D Text</option><option>Blank</option><option>Bubbles</option><option>Mystify</option><option>Photos</option><option>Ribbons</option></select></label><button data-control-action="screen-preview">Preview</button><label>Wait: <input type="number" min="1" max="999" value="10"> minutes</label><label><input type="checkbox"> On resume, display logon screen</label><button data-control-action="save-setting">OK</button>`,
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
  const item=CONTROL_ITEM_BY_ID[id]
  return pages[id]||`<h3>${item?.name||CONTROL_NAMES[id]||"Control Panel item"}</h3><section class="setting-hero"><span>${item?icon(item.icon):icon("control")}</span><div><h3>${item?.name||"Windows setting"}</h3><p>${CONTROL_DESCRIPTIONS[id]||"View and change the Windows 7 settings for this Control Panel item."}</p></div></section><div class="setting-panels"><article><h4>Settings</h4><p>Changes made here are saved inside the EKA Windows browser workspace.</p><button data-control-action="save-setting">Change settings</button></article><article><h4>Related support</h4><p>Use Windows Help and Support for an explanation of this item.</p><button data-control-app="help">Open Help</button></article></div>`
}

function initControl(){
  let route="home",history=["home"],historyIndex=0
  const categoryFor=id=>CONTROL_CATEGORIES.find(category=>category.id===id)
  const pageName=id=>categoryFor(id)?.name||CONTROL_NAMES[id]||"Control Panel"
  const relatedCategory=id=>CONTROL_CATEGORIES.find(category=>category.links.some(([linkId])=>linkId===id))||({id:"system-security"})
  const homeHtml=(query="")=>{
    const q=query.trim().toLowerCase(),view=byId("controlView").value
    if(view!=="category"){
      const items=CONTROL_ITEMS.filter(item=>!q||item.name.toLowerCase().includes(q))
      return `<div class="control-icons ${view}">${items.map(item=>`<button data-control-link="${item.id}"><span>${icon(item.icon)}</span><b>${item.name}</b></button>`).join("")}</div>`
    }
    return `<div class="control-categories">${CONTROL_CATEGORIES.filter(category=>!q||`${category.name} ${category.links.flat().join(" ")}`.toLowerCase().includes(q)).map(category=>`<section><button class="control-category-title" data-control-category="${category.id}"><span>${icon(category.icon)}</span><b>${category.name}</b></button><div>${category.links.slice(0,3).map(([id,name])=>`<button data-control-link="${id}">${name}</button>`).join("")}</div></section>`).join("")}</div>`
  }
  const render=(next=route,push=false)=>{
    route=next
    if(push){history=history.slice(0,historyIndex+1);history.push(next);historyIndex=history.length-1}
    byId("controlBack").disabled=historyIndex<=0;byId("controlForward").disabled=historyIndex>=history.length-1
    const category=relatedCategory(next)
    byId("controlCrumb").textContent=next==="home"?"":next==="personalization"?"› Appearance and Personalization  › Personalization":`› ${categoryFor(next)?pageName(next):`${categoryFor(category.id)?.name||"All Control Panel Items"}  › ${pageName(next)}`}`
    byId("controlHeading").textContent=next==="home"?"Adjust your computer's settings":pageName(next)
    const detail=next!=="home"
    byId("controlWindow").classList.toggle("control-detail-route",detail)
    byId("controlWindow").classList.toggle("control-personalization-route",next==="personalization")
    byId("controlHeading").parentElement.classList.toggle("hidden",detail)
    byId("controlContent").innerHTML=next==="home"?homeHtml(byId("controlSearch").value):next==="personalization"?controlPage(next):categoryFor(next)?`<div class="control-category-page"><aside><button data-control-route="home">Control Panel Home</button>${CONTROL_CATEGORIES.map(item=>`<button data-control-category="${item.id}">${item.name}</button>`).join("")}</aside><main><h3>${categoryFor(next).name}</h3>${categoryFor(next).links.map(([id,name])=>`<button class="category-task" data-control-link="${id}"><span>${icon(CONTROL_ITEM_BY_ID[id]?.icon||"control")}</span><b>${name}</b><small>View or change this Windows setting</small></button>`).join("")}</main></div>`:`<div class="control-setting"><aside><button data-control-route="home">Control Panel Home</button><button data-control-category="${category.id}">${categoryFor(category.id)?.name||"Related category"}</button></aside><main>${controlPage(next)}</main></div>`
    byId("controlFooter").textContent=next==="home"?"Windows 7 Control Panel · EKA-PC":`${pageName(next)} · Changes apply only to this browser simulation`
  }
  byId("controlContent").addEventListener("click",event=>{
    const routeButton=event.target.closest("[data-control-route]");if(routeButton){render(routeButton.dataset.controlRoute,true);return}
    const category=event.target.closest("[data-control-category]");if(category){render(category.dataset.controlCategory,true);return}
    const link=event.target.closest("[data-control-link]");if(link){const id=link.dataset.controlLink;if(id==="system"){window.dispatchEvent(new CustomEvent("win7:open-app",{detail:"systeminfo"}));return}if(id==="devices"){window.dispatchEvent(new CustomEvent("win7:open-app",{detail:"devices"}));return}if(id==="keyboard"){window.dispatchEvent(new CustomEvent("win7:open-app",{detail:"keyboard"}));return}render(id,true);return}
    const app=event.target.closest("[data-control-app]")?.dataset.controlApp;if(app){window.dispatchEvent(new CustomEvent("win7:open-app",{detail:app}));return}
    const theme=event.target.closest("[data-theme-name]")?.dataset.themeName;if(theme){applyTheme(theme);render("personalization");return}
    const basicTheme=event.target.closest("[data-basic-theme]")?.dataset.basicTheme;if(basicTheme){applyTheme(basicTheme);render("personalization");return}
    const wallpaperButton=event.target.closest("[data-wallpaper-category]");if(wallpaperButton){wallpaperButton.classList.toggle("selected");return}
    const selectWallpapers=event.target.closest("[data-wallpaper-select]")?.dataset.wallpaperSelect;if(selectWallpapers){byId("controlContent").querySelectorAll(".wallpaper-thumb").forEach(button=>button.classList.toggle("selected",selectWallpapers==="all"));return}
    const windowColor=event.target.closest("[data-window-color]")?.dataset.windowColor;if(windowColor!==undefined){const button=event.target.closest("[data-window-color]");byId("controlContent").querySelectorAll("[data-window-color]").forEach(candidate=>candidate.classList.toggle("selected",candidate===button));applyAccent(button.dataset.windowColorValue);return}
    const action=event.target.closest("[data-control-action]")?.dataset.controlAction;if(!action)return
    if(action==="updates"){byId("updateStatus").textContent="Checking for updates...";setTimeout(()=>{if(byId("updateStatus"))byId("updateStatus").textContent="Windows is up to date. No important updates are available."},1300);return}
    if(action==="backup"){byId("backupStatus").textContent="Backup destination selected: GitHub (G:) local workspace.";return}
    if(action==="taskbar-apply"){byId("taskbar").classList.toggle("small-icons",byId("smallTaskbarIcons").checked);toast("Taskbar settings applied.");return}
    if(action==="save-wallpaper"){const items=[...byId("controlContent").querySelectorAll(".wallpaper-thumb.selected")].map(button=>({category:button.dataset.wallpaperCategory,index:Number(button.dataset.wallpaperIndex)}));saveWallpaperPlaylist(items,byId("wallpaperPosition").value,byId("wallpaperInterval").value,byId("wallpaperShuffle").checked);render("personalization",true);return}
    if(action==="browse-wallpaper"){toast("Browse uses pictures saved in the EKA Pictures library.");return}
    if(action==="window-color-apply"){const settings={color:byId("desktop").style.getPropertyValue("--aero-accent")||"#4f96c5",intensity:byId("windowColorIntensity").value,transparent:byId("windowTransparency").checked};byId("desktop").classList.toggle("opaque-aero",!settings.transparent);byId("desktop").style.setProperty("--aero-intensity",`${settings.intensity}%`);applyAccent(settings.color);localStorage.setItem("eka.windows7.windowColor",JSON.stringify(settings));toast("Window color, Start menu, taskbar, and site accent saved.");return}
    if(action==="screen-preview"){const preview=byId("screenSaverPreview");preview.textContent=byId("screenSaver").value;preview.classList.add("playing");setTimeout(()=>preview?.classList.remove("playing"),1800);return}
    if(action==="gadget-clock"||action==="gadget-cpu"||action==="gadget-calendar"){window.dispatchEvent(new CustomEvent("win7:add-gadget",{detail:action.replace("gadget-","")}));return}
    if(action==="access-apply"||action==="high-contrast"){byId("desktop").classList.toggle("high-contrast",byId("highContrastSetting")?.checked??true);return}
    toast(`${event.target.textContent.trim()} · completed in the EKA simulation.`)
  })
  byId("controlContent").addEventListener("input",event=>{if(event.target.id==="controlVolume"){byId("controlVolumeValue").textContent=`${event.target.value}%`;if(byId("volumeSlider")){byId("volumeSlider").value=event.target.value;byId("volumeSlider").dispatchEvent(new Event("input"))}}if(event.target.id==="windowColorIntensity")byId("desktop").style.setProperty("--aero-intensity",`${event.target.value}%`)})
  byId("controlSearch").addEventListener("input",()=>{if(route!=="home")render("home",true);else render()})
  byId("controlView").addEventListener("change",()=>render("home",route!=="home"))
  byId("controlHome").addEventListener("click",()=>render("home",true))
  byId("controlBack").addEventListener("click",()=>{if(historyIndex>0){historyIndex-=1;render(history[historyIndex])}})
  byId("controlForward").addEventListener("click",()=>{if(historyIndex<history.length-1){historyIndex+=1;render(history[historyIndex])}})
  window.addEventListener("win7:control-page",event=>render(event.detail,true))
  restorePersonalization();try{const settings=JSON.parse(localStorage.getItem("eka.windows7.windowColor"));if(settings){applyAccent(settings.color);byId("desktop").style.setProperty("--aero-intensity",`${settings.intensity}%`);byId("desktop").classList.toggle("opaque-aero",!settings.transparent)}}catch{}render()
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
  const presets={beginner:{width:9,height:9,count:10},intermediate:{width:16,height:16,count:40},advanced:{width:30,height:16,count:99}}
  let settings=presets.beginner,mines=new Set(),revealed=new Set(),marks=new Map(),started=0,timer=null,armed=false,ended=false
  const total=()=>settings.width*settings.height
  const neighbors=index=>{const x=index%settings.width,y=Math.floor(index/settings.width),out=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if(nx>=0&&nx<settings.width&&ny>=0&&ny<settings.height&&(dx||dy))out.push(ny*settings.width+nx)}return out}
  const plant=safe=>{const excluded=new Set([safe,...neighbors(safe)]);mines=new Set();while(mines.size<settings.count){const value=Math.floor(Math.random()*total());if(!excluded.has(value))mines.add(value)}armed=true;started=Date.now();clearInterval(timer);timer=setInterval(()=>byId("mineTime").textContent=String(Math.min(999,Math.floor((Date.now()-started)/1000))).padStart(3,"0"),1000)}
  const reset=(next=settings)=>{settings=next;mines=new Set();revealed=new Set();marks=new Map();armed=false;ended=false;started=0;clearInterval(timer);byId("mineTime").textContent="000";byId("mineReset").textContent="🙂";const grid=byId("mineGrid");grid.style.gridTemplateColumns=`repeat(${settings.width},27px)`;const win=byId("minesweeperWindow");win.style.width=`${Math.min(840,Math.max(292,settings.width*28+30))}px`;win.style.height=`${Math.min(560,settings.height*28+116)}px`;render()}
  const win=()=>{ended=true;clearInterval(timer);marks=new Map([...mines].map(index=>[index,"flag"]));byId("mineReset").textContent="😎";render();toast("Mines cleared. You win!")}
  const reveal=index=>{if(ended||marks.get(index)==="flag"||revealed.has(index))return;if(!armed)plant(index);if(mines.has(index)){ended=true;clearInterval(timer);revealed.add(index);byId("mineReset").textContent="😵";render();toast("Game over. Click the smiley to try again.");return}const queue=[index];while(queue.length){const value=queue.pop();if(revealed.has(value)||marks.get(value)==="flag"||mines.has(value))continue;revealed.add(value);if(!neighbors(value).some(cell=>mines.has(cell)))queue.push(...neighbors(value))}render();if(revealed.size===total()-settings.count)win()}
  const chord=index=>{if(!revealed.has(index))return;const around=neighbors(index),count=around.filter(value=>mines.has(value)).length,flags=around.filter(value=>marks.get(value)==="flag").length;if(count===flags)around.forEach(reveal)}
  const render=()=>{byId("mineCount").textContent=String(Math.max(0,settings.count-[...marks.values()].filter(value=>value==="flag").length)).padStart(3,"0");byId("mineGrid").innerHTML=Array.from({length:total()},(_,index)=>{const open=revealed.has(index),mine=mines.has(index),count=neighbors(index).filter(value=>mines.has(value)).length,mark=marks.get(index);const content=open?(mine?"💣":count||""):ended&&mine?"💣":mark==="flag"?"⚑":mark==="question"?"?":"";return `<button data-mine="${index}" class="${open?"open":""} ${open&&mine?"exploded":""} n${count}">${content}</button>`}).join("")}
  byId("mineGrid").addEventListener("click",event=>{const index=Number(event.target.closest("[data-mine]")?.dataset.mine);if(Number.isInteger(index))reveal(index)})
  byId("mineGrid").addEventListener("dblclick",event=>{const index=Number(event.target.closest("[data-mine]")?.dataset.mine);if(Number.isInteger(index))chord(index)})
  byId("mineGrid").addEventListener("contextmenu",event=>{const button=event.target.closest("[data-mine]");if(!button||ended)return;event.preventDefault();const index=Number(button.dataset.mine);if(revealed.has(index))return;const current=marks.get(index);if(!current)marks.set(index,"flag");else if(current==="flag")marks.set(index,"question");else marks.delete(index);render()})
  byId("mineReset").addEventListener("click",()=>reset())
  byId("mineGameMenu").addEventListener("click",event=>{event.stopPropagation();byId("mineGameDropdown").classList.toggle("hidden")})
  byId("mineGameDropdown").addEventListener("click",event=>{const level=event.target.closest("[data-mine-level]")?.dataset.mineLevel;if(level){reset(presets[level]);byId("mineGameDropdown").classList.add("hidden")}})
  byId("mineHelp").addEventListener("click",()=>toast("Reveal every safe square. Numbers show adjacent mines. Right-click cycles flag and question mark; double-click a number to chord."))
  reset()
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
  window.addEventListener("win7:open-generic",event=>openAccessory(event.detail))
  byId("profilePrinter").addEventListener("click",()=>toast("EKA Profile Printer · Ready. Double-click to print."))
}

export function mountSystemApps(){mountWindows();addStartPrograms()}
