const PROFILE={
  name:"Mahdi Ghahremani",
  user:"TheLouisMahdi",
  telegram:"@thelouis_mahdi",
  telegramUrl:"https://t.me/thelouis_mahdi",
  github:"https://github.com/TheLouisMahdi",
  university:"University of Zanjan",
  role:"Electrical Engineering Student"
}

const REPOS=[
  ["fpga-cnn-fatigue-monitoring","Python + RTL"],
  ["npvt-terminal-converter","Local-first"],
  ["VideoX_Compressor","Windows"],
  ["lights-out-gf2-solver","GF(2)"],
  ["btc-hourly-forecast","Forecast"],
  ["bwbuilder","Builder"]
]

const svg={
windows:()=>`<svg viewBox="0 0 64 64"><path fill="#f35325" d="M6 12l23-3v22H6z"/><path fill="#81bc06" d="M32 8l26-4v27H32z"/><path fill="#05a6f0" d="M6 34h23v22L6 53z"/><path fill="#ffba08" d="M32 34h26v26l-26-4z"/></svg>`,
computer:()=>`<svg viewBox="0 0 64 64"><defs><linearGradient id="m" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#edf7ff"/><stop offset="1" stop-color="#8db8db"/></linearGradient></defs><rect x="7" y="8" width="45" height="33" rx="3" fill="url(#m)" stroke="#547793"/><rect x="11" y="12" width="37" height="25" rx="1" fill="#4f99d2"/><path d="M23 43h15l3 7H20z" fill="#8298aa"/><rect x="17" y="50" width="27" height="4" rx="2" fill="#607588"/><rect x="49" y="24" width="9" height="26" rx="2" fill="#d9e4ed" stroke="#6e879b"/></svg>`,
folder:()=>`<svg viewBox="0 0 64 64"><defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff19a"/><stop offset="1" stop-color="#e0a312"/></linearGradient></defs><path d="M7 17h19l5 6h27v28H7z" fill="url(#f)" stroke="#a97708"/><path d="M7 14h18l5 6H7z" fill="#f6d05e"/></svg>`,
github:()=>`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#24292f"/><path fill="#fff" d="M32 14c-10 0-18 8-18 18 0 8 5 15 12 17 1 .2 1.4-.4 1.4-1v-4c-5 1-6-2-6-2-.8-2-2-3-2-3-2-1 0-1 0-1 2 0 3 2 4 3 1 2 3 1 4 .8-1.3-3-2-5-4-5-8 0-6 3-6 7 0 2 .8 4 2 5-.2.5-.9 2 .2 5 0 0 2-.7 5 2a17 17 0 019 0c3-2.7 5-2 5-2 1 3 .4 4 .2 5 1.3 1.4 2 3 2 5 0 5-3 7-6 7 .7.6 1.5 1.8 1.5 3.5V48c0 .6.4 1.2 1.5 1 7-2 12-9 12-17 0-10-8-18-18-18z"/></svg>`,
telegram:()=>`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#2aabee"/><path fill="#fff" d="M16 31l32-12-6 29-10-8-6 6-1-10zm12 5l3 2 9-11-12 9z"/></svg>`,
photo:()=>`<svg viewBox="0 0 64 64"><rect x="7" y="9" width="50" height="45" rx="4" fill="#dff4ff" stroke="#5683a3"/><circle cx="21" cy="23" r="6" fill="#ffd561"/><path d="M10 47l13-14 9 9 7-7 15 12z" fill="#63ad5a"/></svg>`,
zip:()=>`<svg viewBox="0 0 64 64"><path d="M12 8h30l10 10v38H12z" fill="#f1c14e" stroke="#9d6d09"/><path d="M42 8v12h10" fill="#ffe59a"/><path d="M28 8h7v5h-7zm0 7h7v5h-7zm0 7h7v5h-7zm0 7h7v5h-7zm0 7h7v5h-7z" fill="#6a7075"/></svg>`,
drive:()=>`<svg viewBox="0 0 64 64"><defs><linearGradient id="d" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f8fafb"/><stop offset="1" stop-color="#98a7b2"/></linearGradient></defs><path d="M10 21h44l-5 25H15z" fill="url(#d)" stroke="#65727c"/><rect x="13" y="37" width="38" height="9" rx="2" fill="#dfe5e8"/><circle cx="45" cy="41" r="2" fill="#4bb866"/></svg>`,
link:()=>`<svg viewBox="0 0 64 64"><rect x="9" y="9" width="46" height="46" rx="6" fill="#dceeff" stroke="#5790bc"/><path d="M26 38l12-12m-7 0h7v7" fill="none" stroke="#1977bd" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
text:()=>`<svg viewBox="0 0 64 64"><path d="M13 7h29l9 9v41H13z" fill="#fff" stroke="#8aa2b6"/><path d="M42 7v11h10" fill="#dcebf5"/><path d="M20 26h24M20 33h24M20 40h20M20 47h16" stroke="#6b8498" stroke-width="3"/></svg>`,
printer:()=>`<svg viewBox="0 0 64 64"><rect x="16" y="7" width="32" height="17" rx="2" fill="#eef3f6" stroke="#677d8c"/><rect x="8" y="21" width="48" height="25" rx="5" fill="#aebbc5" stroke="#5d6c76"/><rect x="14" y="34" width="36" height="23" fill="#fff" stroke="#718693"/><circle cx="48" cy="28" r="3" fill="#52ba65"/><path d="M20 42h24M20 48h20" stroke="#6c7d88" stroke-width="2"/></svg>`,
cmd:()=>`<svg viewBox="0 0 64 64"><rect x="6" y="10" width="52" height="42" rx="4" fill="#101010" stroke="#8b8b8b"/><path d="M14 23l8 7-8 7M27 39h14" fill="none" stroke="#fff" stroke-width="4"/></svg>`,
powershell:()=>`<svg viewBox="0 0 64 64"><path d="M7 12h50l-7 40H10z" fill="#1267a5" stroke="#d3ecff"/><path d="M17 23l11 8-12 9M31 41h13" fill="none" stroke="#fff" stroke-width="4"/></svg>`,
notepad:()=>`<svg viewBox="0 0 64 64"><rect x="12" y="8" width="40" height="48" rx="3" fill="#fff" stroke="#6f8aa0"/><path d="M18 19h28M18 27h28M18 35h25M18 43h22" stroke="#6b8aa1" stroke-width="2"/><path d="M17 7v7M25 7v7M33 7v7M41 7v7M49 7v7" stroke="#4e6475" stroke-width="3"/></svg>`,
calculator:()=>`<svg viewBox="0 0 64 64"><rect x="12" y="6" width="40" height="52" rx="5" fill="#dce8f0" stroke="#61798a"/><rect x="18" y="12" width="28" height="11" fill="#edf9db" stroke="#7f9384"/><g fill="#6d8495"><rect x="18" y="29" width="7" height="7"/><rect x="29" y="29" width="7" height="7"/><rect x="40" y="29" width="7" height="7"/><rect x="18" y="40" width="7" height="7"/><rect x="29" y="40" width="7" height="7"/><rect x="40" y="40" width="7" height="7"/></g></svg>`,
control:()=>`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="21" fill="#79a7cb"/><circle cx="32" cy="32" r="10" fill="#e7f4ff"/><path d="M30 5h5l2 9-7 1zm0 44l7 1-2 9h-5zm29-19v5l-9 2-1-7zM14 30l1 7-9-2v-5z" fill="#597e9b"/></svg>`,
recycle:()=>`<svg viewBox="0 0 64 64"><path d="M18 17h28l-3 39H21z" fill="#d9eef2" stroke="#6d939b"/><path d="M15 14h34M25 9h14" stroke="#6d939b" stroke-width="4"/><path d="M27 25l10 6-8 4 7 5M38 25l-7 10-4-7" fill="none" stroke="#48a56c" stroke-width="3"/></svg>`,
run:()=>`<svg viewBox="0 0 64 64"><rect x="8" y="12" width="48" height="38" rx="5" fill="#eaf3fb" stroke="#6586a0"/><path d="M17 24h30M17 32h22" stroke="#6b8295" stroke-width="3"/><path d="M39 39l8 0-4 7z" fill="#2d82bd"/></svg>`,
cursor:()=>`<svg viewBox="0 0 28 36"><path d="M3 2v26l7-7 5 12 5-2-5-12h10z" fill="#fff" stroke="#111" stroke-width="2" stroke-linejoin="round"/></svg>`
}

const DATA={
  desktop:[
    ["Computer","thispc","computer"],
    ["GitHub","github","github"],
    ["Projects","projects","folder"],
    ["Pictures","photos","photo"],
    ["Recycle Bin","recycle","recycle"],
    ["Telegram","telegram","telegram"]
  ],
  folders:{
    desktop:{title:"Desktop",path:"Desktop",kind:"files",items:[]},
    thispc:{title:"Computer",path:"Computer",kind:"drives"},
    github:{
      title:"GitHub (G:)",
      path:"Computer > GitHub (G:)",
      kind:"files",
      items:[
        ["TheLouisMahdi.url","external:"+PROFILE.github,"github"],
        ["Repositories","projects","folder"],
        ["Pictures","photos","photo"],
        ["Archives","archives","zip"]
      ]
    },
    projects:{
      title:"Repositories",
      path:"Computer > GitHub (G:) > Repositories",
      kind:"files",
      items:REPOS.map(r=>[r[0],"repo:"+r[0],"folder"])
    },
    photos:{
      title:"Pictures",
      path:"Libraries > Pictures",
      kind:"files",
      items:[
        ["avatar.jpg","external:"+PROFILE.github,"photo"],
        ["about-terminal.svg","external:"+PROFILE.github+"/TheLouisMahdi","photo"],
        ["profile-preview.png","external:"+PROFILE.github,"photo"]
      ]
    },
    archives:{
      title:"Archives",
      path:"Computer > Data (D:) > Archives",
      kind:"files",
      items:[
        ["profile.zip","external:"+PROFILE.github+"/TheLouisMahdi","zip"],
        ["projects.zip","external:"+PROFILE.github,"zip"],
        ["github-links.txt","external:"+PROFILE.github,"text"]
      ]
    },
    documents:{title:"Documents",path:"Libraries > Documents",kind:"files",items:[["profile.txt","external:"+PROFILE.github+"/TheLouisMahdi","text"]]},
    downloads:{title:"Downloads",path:"Favorites > Downloads",kind:"files",items:[["projects.zip","external:"+PROFILE.github,"zip"]]},
    music:{title:"Music",path:"Libraries > Music",kind:"files",items:[]},
    recycle:{title:"Recycle Bin",path:"Recycle Bin",kind:"files",items:[]}
  }
}

const $=s=>document.querySelector(s)
const UI={
  screen:$("#screen"),
  desktop:$("#desktop"),
  desktopIcons:$("#desktopIcons"),
  explorer:$("#explorerWindow"),
  titlebar:$("#titlebar"),
  titleIcon:$("#titleIcon"),
  title:$("#windowTitle"),
  address:$("#addressBar"),
  files:$("#fileArea"),
  start:$("#startMenu"),
  startBtn:$("#startBtn"),
  taskExplorer:$("#taskExplorer"),
  taskGithub:$("#taskGithub"),
  taskPrinter:$("#taskPrinter"),
  clock:$("#clock"),
  cursor:$("#fakeCursor"),
  print:$("#printBtn"),
  status:$("#statusText"),
  zone:$("#printerZone"),
  printerState:$("#printerState"),
  date:$("#receiptDate"),
  toast:$("#toast")
}

let history=["thispc"]
let historyIndex=0
let z=4

function repoUrl(name){return `${PROFILE.github}/${name}`}

function renderStaticIcons(){
  UI.desktopIcons.innerHTML=DATA.desktop.map(([label,target,type])=>`
    <button class="desktop-icon" data-open="${target}">
      <span class="desktop-svg">${svg[type]()}</span>
      <span class="desktop-label">${label}</span>
    </button>`).join("")

  $("#startBtn").innerHTML=svg.windows()
  $("#taskExplorer").innerHTML=svg.folder()
  $("#taskCmd").innerHTML=svg.cmd()
  $("#taskPowerShell").innerHTML=svg.powershell()
  $("#taskGithub").innerHTML=svg.github()
  $("#taskPrinter").innerHTML=svg.printer()
  UI.cursor.innerHTML=svg.cursor()

  $("#startComputer").innerHTML=`${svg.computer()}<span>Computer</span>`
  $("#startGithub").innerHTML=`${svg.github()}<span>GitHub Profile</span>`
  $("#startProjects").innerHTML=`${svg.folder()}<span>Projects</span>`
  $("#startTelegram").innerHTML=`${svg.telegram()}<span>Telegram</span>`
  $("#startCmd").innerHTML=`${svg.cmd()}<span>Command Prompt</span>`
  $("#startPowerShell").innerHTML=`${svg.powershell()}<span>Windows PowerShell</span>`
  $("#startNotepad").innerHTML=`${svg.notepad()}<span>Notepad</span>`
  $("#startCalculator").innerHTML=`${svg.calculator()}<span>Calculator</span>`
  $("#startPrint").innerHTML=`${svg.printer()}<span>Print GitHub Profile</span>`
  document.querySelectorAll("[data-icon]").forEach(el=>{const f=svg[el.dataset.icon];if(f)el.innerHTML=f()})
}

function toast(message){
  UI.toast.textContent=message
  UI.toast.classList.add("show")
  clearTimeout(toast.t)
  toast.t=setTimeout(()=>UI.toast.classList.remove("show"),1500)
}
