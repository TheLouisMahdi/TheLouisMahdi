import{AI_ENDPOINT}from"./ai-config.js"

const PROMPT="PS C:\\>"
const PROFILE_HTML=`
  <div class="ps-stage">
    <a class="ps-github" href="https://github.com/TheLouisMahdi" target="_blank" rel="noreferrer" aria-label="GitHub profile"><img src="https://avatars.githubusercontent.com/u/284312505?v=4" alt="GitHub profile"></a>
    <section class="ps-window" aria-label="Interactive Windows PowerShell biography">
      <header class="ps-titlebar"><span class="ps-icon">›_</span><span>Windows PowerShell</span><div class="ps-controls" aria-hidden="true"><i>—</i><i>□</i><i class="ps-close">×</i></div></header>
      <div class="ps-console" id="psConsole" tabindex="0">
        <p class="ps-banner">Windows PowerShell<br>Copyright (C) Microsoft Corporation. All rights reserved.</p>
        <div id="psHistory">
          <div class="ps-turn"><p class="ps-command"><b>${PROMPT}</b> Get-Story</p><div class="ps-answer">I like problems that cross layers. A project may begin as an image, a signal, or a hardware constraint and end as code, RTL, a test workflow, or a complete tool. The interesting part is connecting those layers until the system behaves as one thing.</div></div>
          <div class="ps-turn"><p class="ps-command"><b>${PROMPT}</b> Get-Focus</p><div class="ps-answer">Computer Vision  ·  Applied AI  ·  Embedded Systems  ·  FPGA / Verilog  ·  Engineering Automation</div></div>
          <div class="ps-turn ps-system"><div class="ps-answer">Eka online. Ask about Mahdi, engineering, AI, hardware, or just talk normally. If the remote model is unavailable, profile commands still work locally. Type <span class="ps-key">help</span> for commands.</div></div>
        </div>
        <form class="ps-input-line" id="psForm" autocomplete="off"><b>${PROMPT}</b><input id="psInput" type="text" aria-label="PowerShell question" autocomplete="off" spellcheck="false" placeholder="ask anything or type a command"></form>
      </div>
    </section>
  </div>`

const answers={
  identity:"Electrical Engineering student at the University of Zanjan, working where software, AI, embedded systems and digital hardware meet.",
  story:"The work is usually cross-layer: understand the physical or technical constraint, build the smallest testable version, measure what fails, then connect software and hardware until the system behaves reliably.",
  focus:"Computer Vision  ·  Applied AI  ·  Embedded C/C++  ·  Linux  ·  STM32  ·  FPGA  ·  Verilog RTL  ·  simulation, verification and engineering automation.",
  method:"Understand the real constraint. Build the smallest version that can be tested. Measure failures instead of guessing. Refine until the solution is simpler, repeatable and easier to continue developing.",
  reason:"He learns by building. The enjoyable part is the distance between ‘this should work’ and ‘this works repeatedly’ — usually crossed with simulation, logs, edge cases and iteration.",
  education:"Electrical Engineering at the University of Zanjan, with a practical focus on electronics, embedded systems, digital hardware, computer vision and applied AI.",
  ai:"AI work is mostly practical and engineering-oriented: computer vision, image processing, classification, model evaluation and lightweight inference that can connect to real hardware.",
  embedded:"Embedded work centers on C/C++, Linux and microcontroller-facing systems such as STM32, including interfaces, test logic, data acquisition and hardware/software integration.",
  fpga:"Digital hardware work includes Verilog RTL, FPGA architecture, testbenches, simulation and accelerator-oriented hardware/software co-design.",
  contact:"GitHub: TheLouisMahdi\nTelegram: @thelouis_mahdi",
  whoami:"Mahdi Ghahremani\nTheLouisMahdi / Eka / poimu / Eka Francium\nEngineering × Software × AI × Hardware",
  greeting:"Eka online. You can ask about Mahdi or just have a normal conversation.",
  thanks:"You’re welcome.",
  help:"Commands: Get-Identity, Get-Story, Get-Focus, Get-Method, Get-Reason, Get-Contact, whoami, clear\nFree-form questions use the remote AI when available. Use ↑ / ↓ for history and Ctrl+L to clear."
}

const intents=[
  ["contact",["contact","telegram","github","reach","تماس","تلگرام","گیتهاب","گیت هاب"]],
  ["education",["university","study","education","student","دانشگاه","تحصیل","رشته"]],
  ["fpga",["fpga","verilog","rtl","digital hardware","hardware","سخت افزار","سخت‌افزار"]],
  ["embedded",["embedded","stm32","microcontroller","c++","linux","امبدد","میکروکنترلر"]],
  ["ai",["computer vision","vision","opencv","ai","artificial intelligence","هوش مصنوعی","بینایی ماشین"]],
  ["focus",["skills","skill","focus","what does he do","what do you do","work on","مهارت","مهارت ها","مهارت‌ها","چه کار","کارش چیه"]],
  ["method",["method","approach","how does he work","workflow","روش کار","چطور کار"]],
  ["reason",["learn","learning","why","motivation","یادگیری","چرا"]],
  ["story",["story","about","tell me about","biography","داستان","درباره"]],
  ["whoami",["name","what is his name","what's his name","اسم","اسمش","نام"]],
  ["identity",["identity","who is","who are","engineer","کیه","کی هست","هویت"]],
  ["greeting",["hello","hi","hey","سلام","درود"]],
  ["thanks",["thanks","thank you","thx","مرسی","ممنون"]]
]

const commands={"get-identity":"identity","get-story":"story","get-focus":"focus","get-method":"method","get-reason":"reason","get-contact":"contact","whoami":"whoami","get-help":"help","help":"help"}
const normalize=value=>value.toLocaleLowerCase().trim().replace(/[؟?!.,;:]+/g," ").replace(/\s+/g," ")

function fallbackAnswer(raw){
  const query=normalize(raw)
  let best=null,score=0
  for(const [intent,keys]of intents){const hits=keys.reduce((sum,key)=>sum+(query.includes(key)?key.length:0),0);if(hits>score){score=hits;best=intent}}
  return best?answers[best]:"Remote AI is unavailable right now. Local mode can still answer profile questions and PowerShell commands."
}

async function askAI(message,history){
  if(!AI_ENDPOINT)return null
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000)
  try{
    const response=await fetch(AI_ENDPOINT,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({message,history:history.slice(-10)}),signal:controller.signal})
    if(!response.ok)return null
    const data=await response.json()
    return typeof data.answer==="string"&&data.answer.trim()?data.answer.trim():null
  }catch{return null}finally{clearTimeout(timer)}
}

function addTurn(history,command,answer){
  const turn=document.createElement("div"),line=document.createElement("p"),out=document.createElement("div"),prompt=document.createElement("b"),text=document.createElement("span")
  turn.className="ps-turn";line.className="ps-command";out.className="ps-answer";prompt.textContent=PROMPT;text.textContent=command
  prompt.dir="ltr";text.dir="auto";out.dir="auto"
  line.append(prompt," ",text);out.textContent=answer;turn.append(line,out);history.append(turn);return out
}

function initConsole(root){
  const consoleEl=root.querySelector("#psConsole"),historyEl=root.querySelector("#psHistory"),form=root.querySelector("#psForm"),input=root.querySelector("#psInput"),commandHistory=[],chat=[]
  let cursor=0
  const bottom=behavior=>requestAnimationFrame(()=>consoleEl.scrollTo({top:consoleEl.scrollHeight,behavior}))
  form.addEventListener("submit",async event=>{
    event.preventDefault();const command=input.value.trim();if(!command)return
    input.value="";commandHistory.push(command);cursor=commandHistory.length
    const normalized=normalize(command)
    if(["clear","cls"].includes(normalized)){historyEl.replaceChildren();chat.length=0;bottom("auto");return}
    const local=commands[normalized]?answers[commands[normalized]]:null
    const out=addTurn(historyEl,command,local||"Thinking...");bottom("smooth")
    if(local)return
    input.disabled=true
    const answer=await askAI(command,chat)||fallbackAnswer(command)
    out.textContent=answer;chat.push({role:"user",content:command},{role:"assistant",content:answer});if(chat.length>14)chat.splice(0,chat.length-14)
    input.disabled=false;input.focus();bottom("smooth")
  })
  input.addEventListener("keydown",event=>{
    if(event.ctrlKey&&event.key.toLowerCase()==="l"){event.preventDefault();historyEl.replaceChildren();chat.length=0;bottom("auto");return}
    if(event.key!=="ArrowUp"&&event.key!=="ArrowDown")return
    event.preventDefault();if(!commandHistory.length)return
    cursor=event.key==="ArrowUp"?Math.max(0,cursor-1):Math.min(commandHistory.length,cursor+1)
    input.value=cursor===commandHistory.length?"":commandHistory[cursor];requestAnimationFrame(()=>input.setSelectionRange(input.value.length,input.value.length))
  })
  consoleEl.addEventListener("pointerdown",event=>{if(!event.target.closest("a")&&getSelection()?.isCollapsed)setTimeout(()=>input.focus(),0)})
}

function loadStyles(){
  if(document.querySelector('link[data-liquid-portfolio]'))return
  const link=document.createElement("link");link.rel="stylesheet";link.href="css/portfolio-liquid.css";link.dataset.liquidPortfolio="";document.head.appendChild(link)
}

function followPointer(root){
  if(matchMedia("(pointer: coarse)").matches)return
  root.addEventListener("pointermove",event=>{const box=root.getBoundingClientRect();root.style.setProperty("--mx",`${event.clientX-box.left}px`);root.style.setProperty("--my",`${event.clientY-box.top}px`)},{passive:true})
}

export function initLiquidBiography(){
  loadStyles();const root=document.getElementById("about")
  if(!root||root.dataset.liquidMounted)return
  root.dataset.liquidMounted="true";root.className="readme portfolio-liquid";root.innerHTML=PROFILE_HTML
  followPointer(root);initConsole(root)
}
