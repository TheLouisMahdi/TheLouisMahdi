import{WINDOWS7_WALLPAPERS,wallpaperAsset,wallpaperThumbnail}from"./wallpapers.js"

const byId=id=>document.getElementById(id)

const AERO=WINDOWS7_WALLPAPERS.map(group=>group.name)
const BASIC=["Windows 7 Basic","Windows Classic","High Contrast #1","High Contrast #2","High Contrast Black","High Contrast White"]
const COUNTS=Object.fromEntries(WINDOWS7_WALLPAPERS.map(group=>[group.name,group.files.length]))
const THEME_COLORS={"Windows 7":"#4f96c5",Architecture:"#647786",Characters:"#b85d82",Landscapes:"#4384b3",Nature:"#4f8b45",Scenes:"#826086","United States":"#9b4d4d","Windows 7 Basic":"#5794b8","Windows Classic":"#3a6ea5","High Contrast #1":"#000080","High Contrast #2":"#008080","High Contrast Black":"#000000","High Contrast White":"#f5f5f5"}
let wallpaperTimer=null

function wallpaperCss(category,index=0){
  return `url(${wallpaperAsset(category,index)})`
}

function wallpaperPreviewCss(category,index=0){
  return `url(${wallpaperThumbnail(category,index)})`
}

function wallpaperId(category,index){return `${category.toLowerCase().replaceAll(" ","-")}-${index+1}`}
function themeSlug(name){return name.toLowerCase().replaceAll(" ","-").replaceAll("#","")}
function themeTile(name,active,basic=false,label=name){
  const attr=basic?`data-basic-theme="${name}"`:`data-theme-name="${name}"`,preview=basic?`<i class="${themeSlug(name)}"><em style="--theme-swatch:${THEME_COLORS[name]}"></em></i>`:`<i style="background-image:${wallpaperPreviewCss(name,0)};--theme-preview-2:${wallpaperPreviewCss(name,1)};--theme-preview-3:${wallpaperPreviewCss(name,2)}"><em style="--theme-swatch:${THEME_COLORS[name]}"></em></i>`
  return `<button class="theme-tile ${basic?"basic-theme":""} ${name===active?"selected":""}" ${attr}>${preview}<span>${label}</span></button>`
}

function savedWallpaper(){
  const fallback={category:"Windows 7",index:0,position:"Fill",interval:"30 minutes",shuffle:false,items:[{category:"Windows 7",index:0}]}
  try{const saved={...fallback,...JSON.parse(localStorage.getItem("eka.windows7.wallpaper"))};if(!Array.isArray(saved.items)||!saved.items.length)saved.items=[{category:saved.category,index:saved.index}];return saved}catch{return fallback}
}

export function personalizationHtml(){
  const active=localStorage.getItem("eka.windows7.theme")||"Windows 7"
  const wallpaper=savedWallpaper(),aero=AERO.map(name=>themeTile(name,active)).join(""),basic=BASIC.map(name=>themeTile(name,active,true)).join("")
  const myTheme=themeTile(active,active,BASIC.includes(active),"Unsaved Theme")
  return `<div class="personalization-page"><aside><strong>Control Panel Home</strong><button data-control-route="home">Control Panel Home</button><button data-control-action="desktop-icons">Change desktop icons</button><button data-control-action="mouse-pointers">Change mouse pointers</button><button data-control-action="account-picture">Change your account picture</button><div class="personalization-see-also"><small>See also</small><button data-control-link="display">Display</button><button data-control-link="taskbar">Taskbar and Start Menu</button><button data-control-link="ease-center">Ease of Access Center</button></div></aside><main><h3>Change the visuals and sounds on your computer</h3><p>Click a theme to change the desktop background, window color, sounds, and screen saver all at once.</p><div class="theme-browser"><section class="theme-section"><h4>My Themes (1)</h4><div class="theme-grid my-themes">${myTheme}</div><div class="theme-actions"><button data-control-action="save-theme">Save theme</button><button data-control-action="themes-online">Get more themes online</button></div></section><section class="theme-section"><h4>Aero Themes (7)</h4><div class="theme-grid">${aero}</div></section><section class="theme-section"><h4>Basic and High Contrast Themes (6)</h4><div class="theme-grid">${basic}</div></section></div><div class="personalization-links"><button data-control-link="desktop-background"><i class="personalization-link-icon background-link" style="background:${wallpaperPreviewCss(wallpaper.category,wallpaper.index)}"></i><b>Desktop Background</b><small id="personalizationBackgroundName">${wallpaper.items.length>1?"Slide Show":wallpaper.category}</small></button><button data-control-link="window-color"><i class="personalization-link-icon color-link" style="--theme-swatch:${THEME_COLORS[active]}"></i><b>Window Color</b><small>${active}</small></button><button data-control-link="sounds"><i class="personalization-link-icon sounds-link">♫</i><b>Sounds</b><small>Windows Default</small></button><button data-control-link="screen-saver"><i class="personalization-link-icon saver-link"></i><b>Screen Saver</b><small>None</small></button></div></main></div>`
}

export function desktopBackgroundHtml(){
  const saved=savedWallpaper(),selected=new Set(saved.items.map(item=>wallpaperId(item.category,item.index)))
  const groups=AERO.map(category=>`<section class="wallpaper-group"><h4>${category}</h4><div class="wallpaper-grid">${Array.from({length:COUNTS[category]},(_,index)=>`<button class="wallpaper-thumb ${selected.has(wallpaperId(category,index))?"selected":""}" data-wallpaper-category="${category}" data-wallpaper-index="${index}" title="${category} ${index+1}"><i style="background:${wallpaperPreviewCss(category,index)}"></i><span>✓</span></button>`).join("")}</div></section>`).join("")
  const option=(value,current)=>`<option${value===current?" selected":""}>${value}</option>`
  return `<div class="desktop-background-page"><h3>Choose your desktop background</h3><div class="wallpaper-toolbar"><label>Picture location: <select id="wallpaperLocation"><option>Windows Desktop Backgrounds</option><option>Pictures Library</option><option>Top Rated Photos</option><option>Solid Colors</option></select></label><button data-control-action="browse-wallpaper">Browse...</button><button data-wallpaper-select="all">Select all</button><button data-wallpaper-select="none">Clear all</button></div><div class="wallpaper-scroll">${groups}</div><div class="wallpaper-options"><label>Picture position: <select id="wallpaperPosition">${["Fill","Fit","Stretch","Tile","Center"].map(value=>option(value,saved.position)).join("")}</select></label><label>Change picture every: <select id="wallpaperInterval">${["10 seconds","30 seconds","1 minute","10 minutes","30 minutes","1 hour","1 day"].map(value=>option(value,saved.interval)).join("")}</select></label><label><input id="wallpaperShuffle" type="checkbox"${saved.shuffle?" checked":""}> Shuffle</label><button data-control-action="save-wallpaper">Save changes</button><button data-control-route="personalization">Cancel</button></div></div>`
}

export function applyAccent(accent){
  const desktop=byId("desktop")
  desktop.style.setProperty("--aero-accent",accent)
  document.documentElement.style.setProperty("--site-accent",accent)
  document.documentElement.style.setProperty("--site-accent-soft",`color-mix(in srgb, ${accent} 18%, white)`)
  document.documentElement.style.setProperty("--site-accent-dark",`color-mix(in srgb, ${accent} 72%, #152b39)`)
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content",accent)
}

export function applyTheme(name,notify=true){
  const desktop=byId("desktop")
  const basic=BASIC.includes(name)
  clearInterval(wallpaperTimer);wallpaperTimer=null
  const accent=THEME_COLORS[name]||THEME_COLORS["Windows 7"]
  desktop.dataset.theme=themeSlug(name)
  desktop.classList.toggle("high-contrast",name.startsWith("High Contrast"))
  applyAccent(accent)
  document.body.dataset.win7Theme=themeSlug(name)
  if(!basic){const settings={category:name,index:0,position:"Fill",interval:"30 minutes",shuffle:false,items:[{category:name,index:0}]};localStorage.setItem("eka.windows7.wallpaper",JSON.stringify(settings));applyWallpaper(name,0,false,"Fill")}
  if(name==="Windows 7 Basic"){const settings={category:"Windows 7",index:0,position:"Fill",interval:"30 minutes",shuffle:false,items:[{category:"Windows 7",index:0}]};localStorage.setItem("eka.windows7.wallpaper",JSON.stringify(settings));applyWallpaper("Windows 7",0,false,"Fill")}
  if(name==="Windows Classic")desktop.style.background="#3a6ea5"
  if(name==="High Contrast #1")desktop.style.background="#000080"
  if(name==="High Contrast #2")desktop.style.background="#000"
  if(name==="High Contrast Black")desktop.style.background="#000"
  if(name==="High Contrast White")desktop.style.background="#fff"
  localStorage.setItem("eka.windows7.theme",name)
  if(notify){desktop.classList.remove("opaque-aero");desktop.style.setProperty("--aero-intensity","65%");localStorage.setItem("eka.windows7.windowColor",JSON.stringify({color:accent,intensity:65,transparent:true}))}
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
