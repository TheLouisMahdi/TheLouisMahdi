export const PROFILE={
  name:"Mahdi Ghahremani",
  user:"TheLouisMahdi",
  role:"Electrical Engineering Student",
  university:"University of Zanjan",
  telegram:"@thelouis_mahdi",
  telegramUrl:"https://t.me/thelouis_mahdi",
  github:"https://github.com/TheLouisMahdi"
}

export const REPOSITORIES=[
  {name:"fpga-cnn-fatigue-monitoring",tag:"Python + Verilog",description:"ARM + FPGA fatigue monitoring prototype"},
  {name:"npvt-terminal-converter",tag:"Local-first",description:"NPVT and Xray/V2Ray profile converter"},
  {name:"VideoX_Compressor",tag:"Windows",description:"FFmpeg video compression tool"},
  {name:"lights-out-gf2-solver",tag:"GF(2)",description:"Offline Lights Out solver"},
  {name:"btc-hourly-forecast",tag:"Forecast",description:"BTC hourly forecasting project"},
  {name:"bwbuilder",tag:"STM32",description:"STM32 BeachWolf build helper"}
]

const gh=name=>`${PROFILE.github}/${name}`
const zip=name=>`${gh(name)}/archive/refs/heads/main.zip`

export const FILE_SYSTEM={
  desktop:{title:"Desktop",path:"C:\\Users\\Eka\\Desktop",type:"folder",items:[
    {name:"Computer",type:"computer",target:"computer"},
    {name:"GitHub Projects",type:"folder",target:"projects"},
    {name:"Pictures",type:"photo",target:"pictures"},
    {name:"Recycle Bin",type:"recycle",target:"recycle"},
    {name:"Telegram",type:"telegram",external:PROFILE.telegramUrl}
  ]},
  computer:{title:"Computer",path:"Computer",type:"drives",items:[
    {name:"Local Disk (C:)",type:"drive",target:"cdrive",used:44,total:118},
    {name:"Data (D:)",type:"drive",target:"ddrive",used:311,total:931},
    {name:"GitHub (G:)",type:"drive",target:"github",used:7,total:20}
  ]},
  cdrive:{title:"Local Disk (C:)",path:"Computer > Local Disk (C:)",type:"folder",items:[
    {name:"Users",type:"folder",target:"users"},
    {name:"Program Files",type:"folder",target:"programfiles"},
    {name:"Windows",type:"folder",target:"windows"}
  ]},
  ddrive:{title:"Data (D:)",path:"Computer > Data (D:)",type:"folder",items:[
    {name:"Projects",type:"folder",target:"projects"},
    {name:"Archives",type:"folder",target:"archives"},
    {name:"Pictures",type:"photo",target:"pictures"}
  ]},
  github:{title:"GitHub (G:)",path:"Computer > GitHub (G:)",type:"folder",items:[
    {name:"TheLouisMahdi.url",type:"github",external:PROFILE.github},
    {name:"Repositories",type:"folder",target:"projects"},
    {name:"Archives",type:"zip",target:"archives"},
    {name:"profile.txt",type:"text",text:"profile"}
  ]},
  projects:{title:"Repositories",path:"Computer > GitHub (G:) > Repositories",type:"folder",items:REPOSITORIES.map(repo=>({name:repo.name,type:"folder",target:`repo:${repo.name}`}))},
  archives:{title:"Archives",path:"Computer > Data (D:) > Archives",type:"folder",items:REPOSITORIES.map(repo=>({name:`${repo.name}.zip`,type:"zip",external:zip(repo.name)}))},
  pictures:{title:"Pictures",path:"Libraries > Pictures",type:"folder",items:[
    {name:"github-avatar.png",type:"photo",image:"https://avatars.githubusercontent.com/u/284312505?v=4"},
    {name:"about-terminal.svg",type:"photo",image:"about-terminal.svg"}
  ]},
  documents:{title:"Documents",path:"Libraries > Documents",type:"folder",items:[
    {name:"profile.txt",type:"text",text:"profile"},
    {name:"github.url",type:"github",external:PROFILE.github}
  ]},
  downloads:{title:"Downloads",path:"C:\\Users\\Eka\\Downloads",type:"folder",items:REPOSITORIES.slice(0,3).map(repo=>({name:`${repo.name}.zip`,type:"zip",external:zip(repo.name)}))},
  users:{title:"Users",path:"C:\\Users",type:"folder",items:[{name:"Eka",type:"folder",target:"desktop"}]},
  programfiles:{title:"Program Files",path:"C:\\Program Files",type:"folder",items:[
    {name:"Windows PowerShell",type:"folder",target:"powershellFolder"},
    {name:"Internet Explorer",type:"folder",target:"ieFolder"}
  ]},
  powershellFolder:{title:"Windows PowerShell",path:"C:\\Program Files\\WindowsPowerShell",type:"folder",items:[{name:"v1.0",type:"folder",target:"psV1"}]},
  psV1:{title:"v1.0",path:"C:\\Program Files\\WindowsPowerShell\\v1.0",type:"folder",items:[{name:"powershell.exe",type:"powershell",app:"powershell"}]},
  ieFolder:{title:"Internet Explorer",path:"C:\\Program Files\\Internet Explorer",type:"folder",items:[{name:"iexplore.exe",type:"link",external:PROFILE.github}]},
  windows:{title:"Windows",path:"C:\\Windows",type:"folder",items:[
    {name:"System32",type:"folder",target:"system32"},
    {name:"explorer.exe",type:"computer",app:"explorer"},
    {name:"notepad.exe",type:"notepad",app:"notepad"}
  ]},
  system32:{title:"System32",path:"C:\\Windows\\System32",type:"folder",items:[
    {name:"cmd.exe",type:"cmd",app:"cmd"},
    {name:"calc.exe",type:"calculator",app:"calculator"},
    {name:"notepad.exe",type:"notepad",app:"notepad"}
  ]},
  recycle:{title:"Recycle Bin",path:"Recycle Bin",type:"folder",items:[]}
}

for(const repo of REPOSITORIES){
  FILE_SYSTEM[`repo:${repo.name}`]={
    title:repo.name,
    path:`Computer > GitHub (G:) > Repositories > ${repo.name}`,
    type:"folder",
    items:[
      {name:"Open on GitHub.url",type:"github",external:gh(repo.name)},
      {name:"Source code.zip",type:"zip",external:zip(repo.name)},
      {name:"README.txt",type:"text",text:`repo:${repo.name}`}
    ]
  }
}

export function profileText(){
  return [
    "GITHUB PROFILE RECEIPT",
    "",
    `NAME: ${PROFILE.name}`,
    `USER: @${PROFILE.user}`,
    `ROLE: ${PROFILE.role}`,
    `UNIVERSITY: ${PROFILE.university}`,
    `TELEGRAM: ${PROFILE.telegram}`,
    "",
    "SELECTED REPOSITORIES",
    ...REPOSITORIES.map(repo=>`+ ${repo.name}`),
    "",
    "STACK: Python / C / Verilog",
    "HARDWARE: STM32 / FPGA / Zynq",
    `GITHUB: ${PROFILE.github}`
  ].join("\n")
}

export function repoText(name){
  const repo=REPOSITORIES.find(item=>item.name===name)
  if(!repo)return ""
  return `${repo.name}\n\n${repo.description}\nCategory: ${repo.tag}\nGitHub: ${PROFILE.github}/${repo.name}`
}
