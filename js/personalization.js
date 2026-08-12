const byId=id=>document.getElementById(id)

const AERO=["Windows 7","Architecture","Characters","Landscapes","Nature","Scenes","United States"]
const BASIC=["Windows 7 Basic","Windows Classic","High Contrast #1","High Contrast #2","High Contrast Black","High Contrast White"]
const COUNTS={"Windows 7":1,Architecture:6,Characters:6,Landscapes:6,Nature:6,Scenes:6,"United States":6}
let wallpaperTimer=null

const palettes={
  "Windows 7":["#071c54","#0879b5","#5bcf55","#a9ed58"],
  Architecture:["#232c35","#637384","#c7a86e","#e8d8b1"],
  Characters:["#49386c","#ee6a82","#ffc85d","#68c7d4"],
  Landscapes:["#163b70","#5ba6db","#5e8b45","#d5c86a"],
  Nature:["#173f24","#4d8e35","#b6d85f","#f3dc78"],
  Scenes:["#34243f","#885c85","#e6a070","#f2d7a5"],
  "United States":["#162e58","#a33737","#eee5d1","#4c7548"]
}

function wallpaperCss(category,index=0){
  const p=palettes[category]||palettes["Windows 7"],shift=index*7
  if(category==="Architecture")return `linear-gradient(${35+shift}deg,transparent 0 44%,${p[2]} 45% 54%,transparent 55%),linear-gradient(${145-shift}deg,${p[0]} 0 46%,${p[1]} 47% 65%,${p[3]} 66%)`
  if(category==="Characters")return `radial-gradient(circle at ${25+index*9}% ${30+index*5}%,${p[2]} 0 8%,transparent 9%),radial-gradient(circle at ${60-index*4}% 65%,${p[3]} 0 15%,transparent 16%),linear-gradient(${120+shift}deg,${p[0]},${p[1]})`
  if(category==="Landscapes")return `linear-gradient(168deg,transparent 0 55%,${p[2]} 56% 70%,${p[3]} 71%),radial-gradient(circle at ${72-index*7}% 22%,#fff9b0 0 5%,transparent 6%),linear-gradient(${p[1]} 0 55%,${p[0]} 56%)`
  if(category==="Nature")return `radial-gradient(ellipse at ${30+index*8}% 62%,${p[2]} 0 8%,transparent 9%),radial-gradient(ellipse at 65% 42%,${p[3]} 0 5%,transparent 6%),linear-gradient(145deg,${p[0]},${p[1]} 58%,${p[2]})`
  if(category==="Scenes")return `radial-gradient(circle at ${25+index*10}% 28%,${p[3]} 0 9%,transparent 10%),linear-gradient(${155-shift}deg,transparent 0 55%,${p[1]} 56% 72%,${p[0]} 73%),linear-gradient(${p[2]},${p[0]})`
  if(category==="United States")return `linear-gradient(170deg,transparent 0 58%,${p[3]} 59%),radial-gradient(circle at ${20+index*11}% 25%,${p[2]} 0 7%,transparent 8%),linear-gradient(120deg,${p[0]},${p[1]})`
  return `radial-gradient(circle at 25% 72%,${p[3]} 0 5%,${p[2]} 18%,transparent 42%),linear-gradient(145deg,transparent 36%,rgba(40,215,255,.5) 37% 46%,transparent 47%),linear-gradient(135deg,${p[1]},${p[0]} 72%)`
}

function wallpaperId(category,index){return `${category.toLowerCase().replaceAll(" ","-")}-${index+1}`}

function savedWallpaper(){
  const fallback={category:"Windows 7",index:0,position:"Fill",interval:"30 minutes",shuffle:false,items:[{category:"Windows 7",index:0}]}
  try{const saved={...fallback,...JSON.parse(localStorage.getItem("eka.windows7.wallpaper"))};if(!Array.isArray(saved.items)||!saved.items.length)saved.items=[{category:saved.category,index:saved.index}];return saved}catch{return fallback}
}

export function personalizationHtml(){
  const active=localStorage.getItem("eka.windows7.theme")||"Windows 7"
  const aero=AERO.map(name=>`<button class="theme-tile ${name===active?"selected":""}" data-theme-name="${name}"><i style="background:${wallpaperCss(name,0)}"></i><span>${name}</span></button>`).join("")
  const basic=BASIC.map(name=>`<button class="theme-tile basic-theme ${name===active?"selected":""}" data-basic-theme="${name}"><i class="${name.toLowerCase().replaceAll(" ","-").replaceAll("#","")}"></i><span>${name}</span></button>`).join("")
  return `<div class="personalization-page"><aside><button data-control-action="desktop-icons">Change desktop icons</button><button data-control-action="mouse-pointers">Change mouse pointers</button><button data-control-action="account-picture">Change your account picture</button></aside><main><h3>Change the visuals and sounds on your computer</h3><p>Click a theme to change the desktop background, window color, sounds, and screen saver all at once.</p><h4>Aero Themes</h4><div class="theme-grid">${aero}</div><h4>Basic and High Contrast Themes</h4><div class="theme-grid">${basic}</div><div class="personalization-links"><button data-control-link="desktop-background"><b>Desktop Background</b><small id="personalizationBackgroundName">Windows 7</small></button><button data-control-link="window-color"><b>Window Color</b><small>Sky</small></button><button data-control-link="sounds"><b>Sounds</b><small>Windows Default</small></button><button data-control-link="screen-saver"><b>Screen Saver</b><small>None</small></button></div></main></div>`
}

export function desktopBackgroundHtml(){
  const saved=savedWallpaper(),selected=new Set(saved.items.map(item=>wallpaperId(item.category,item.index)))
  const groups=AERO.map(category=>`<section class="wallpaper-group"><h4>${category}</h4><div class="wallpaper-grid">${Array.from({length:COUNTS[category]},(_,index)=>`<button class="wallpaper-thumb ${selected.has(wallpaperId(category,index))?"selected":""}" data-wallpaper-category="${category}" data-wallpaper-index="${index}" title="${category} ${index+1}"><i style="background:${wallpaperCss(category,index)}"></i><span>✓</span></button>`).join("")}</div></section>`).join("")
  const option=(value,current)=>`<option${value===current?" selected":""}>${value}</option>`
  return `<div class="desktop-background-page"><h3>Choose your desktop background</h3><div class="wallpaper-toolbar"><label>Picture location: <select id="wallpaperLocation"><option>Windows Desktop Backgrounds</option><option>Pictures Library</option><option>Top Rated Photos</option><option>Solid Colors</option></select></label><button data-control-action="browse-wallpaper">Browse...</button><button data-wallpaper-select="all">Select all</button><button data-wallpaper-select="none">Clear all</button></div><div class="wallpaper-scroll">${groups}</div><div class="wallpaper-options"><label>Picture position: <select id="wallpaperPosition">${["Fill","Fit","Stretch","Tile","Center"].map(value=>option(value,saved.position)).join("")}</select></label><label>Change picture every: <select id="wallpaperInterval">${["10 seconds","30 seconds","1 minute","10 minutes","30 minutes","1 hour","1 day"].map(value=>option(value,saved.interval)).join("")}</select></label><label><input id="wallpaperShuffle" type="checkbox"${saved.shuffle?" checked":""}> Shuffle</label><button data-control-action="save-wallpaper">Save changes</button><button data-control-route="personalization">Cancel</button></div></div>`
}

export function applyTheme(name,notify=true){
  const desktop=byId("desktop")
  const basic=BASIC.includes(name)
  clearInterval(wallpaperTimer);wallpaperTimer=null
  desktop.dataset.theme=name.toLowerCase().replaceAll(" ","-").replaceAll("#","")
  desktop.classList.toggle("high-contrast",name.startsWith("High Contrast"))
  if(!basic){const settings={category:name,index:0,position:"Fill",interval:"30 minutes",shuffle:false,items:[{category:name,index:0}]};localStorage.setItem("eka.windows7.wallpaper",JSON.stringify(settings));applyWallpaper(name,0,false,"Fill")}
  if(name==="Windows 7 Basic"){const settings={category:"Windows 7",index:0,position:"Fill",interval:"30 minutes",shuffle:false,items:[{category:"Windows 7",index:0}]};localStorage.setItem("eka.windows7.wallpaper",JSON.stringify(settings));applyWallpaper("Windows 7",0,false,"Fill")}
  if(name==="Windows Classic")desktop.style.background="#3a6ea5"
  if(name==="High Contrast #1")desktop.style.background="#000080"
  if(name==="High Contrast #2")desktop.style.background="#000"
  if(name==="High Contrast Black")desktop.style.background="#000"
  if(name==="High Contrast White")desktop.style.background="#fff"
  localStorage.setItem("eka.windows7.theme",name)
  if(notify)window.dispatchEvent(new CustomEvent("win7:toast",{detail:`${name} theme applied.`}))
}

export function applyWallpaper(category,index=0,notify=true,position=null){
  const desktop=byId("desktop"),resolvedPosition=position||byId("wallpaperPosition")?.value||savedWallpaper().position||"Fill"
  desktop.style.background=wallpaperCss(category,index)
  desktop.style.backgroundRepeat=resolvedPosition==="Tile"?"repeat":"no-repeat"
  desktop.style.backgroundPosition="center"
  desktop.style.backgroundSize=resolvedPosition==="Fit"?"contain":resolvedPosition==="Stretch"?"100% 100%":resolvedPosition==="Center"?"auto":"cover"
  desktop.dataset.wallpaper=wallpaperId(category,index)
  const saved=savedWallpaper();localStorage.setItem("eka.windows7.wallpaper",JSON.stringify({...saved,category,index,position:resolvedPosition}))
  if(notify)window.dispatchEvent(new CustomEvent("win7:toast",{detail:`${category} desktop background applied.`}))
}

function slideshowDelay(value){return{"10 seconds":10000,"30 seconds":30000,"1 minute":60000,"10 minutes":600000,"30 minutes":1800000,"1 hour":3600000,"1 day":86400000}[value]||1800000}

function startSlideshow(settings){
  clearInterval(wallpaperTimer);wallpaperTimer=null
  if(settings.items.length<2)return
  let cursor=Math.max(0,settings.items.findIndex(item=>item.category===settings.category&&item.index===settings.index))
  wallpaperTimer=setInterval(()=>{cursor=settings.shuffle?Math.floor(Math.random()*settings.items.length):(cursor+1)%settings.items.length;const item=settings.items[cursor];applyWallpaper(item.category,item.index,false,settings.position)},slideshowDelay(settings.interval))
}

export function saveWallpaperPlaylist(items,position="Fill",interval="30 minutes",shuffle=false){
  const chosen=items.length?items:[{category:"Windows 7",index:0}],first=chosen[0],settings={...first,items:chosen,position,interval,shuffle}
  localStorage.setItem("eka.windows7.wallpaper",JSON.stringify(settings));applyWallpaper(first.category,first.index,false,position);startSlideshow(settings)
  window.dispatchEvent(new CustomEvent("win7:toast",{detail:`Desktop background saved${chosen.length>1?` · ${chosen.length} picture slideshow`:""}.`}))
}

export function restorePersonalization(){
  const theme=localStorage.getItem("eka.windows7.theme")||"Windows 7"
  const wallpaper=savedWallpaper()
  applyTheme(theme,false)
  localStorage.setItem("eka.windows7.wallpaper",JSON.stringify(wallpaper))
  applyWallpaper(wallpaper.category,wallpaper.index,false,wallpaper.position);startSlideshow(wallpaper)
}
