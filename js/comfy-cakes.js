import{icon}from"./icons.js"

const byId=id=>document.getElementById(id)
const GAME_URL="games/comfy-cakes/index.html"
const STATS_KEY="eka.purble-place.comfy-cakes.stats"

function controls(){return`<div class="win-controls"><button class="win-control" data-window-action="min" aria-label="Minimize">_</button><button class="win-control" data-window-action="max" aria-label="Maximize">□</button><button class="win-control close" data-window-action="close" aria-label="Close">×</button></div>`}
function count(value){const number=Number(value);return Number.isFinite(number)&&number>0?Math.floor(number):0}
function readStats(){try{const saved=JSON.parse(localStorage.getItem(STATS_KEY)||"{}")||{};return{played:count(saved.played),wins:count(saved.wins),losses:count(saved.losses)}}catch{return{played:0,wins:0,losses:0}}}
function writeStats(stats){try{localStorage.setItem(STATS_KEY,JSON.stringify(stats))}catch{}}
function playMenuSound(){const audio=new Audio("games/comfy-cakes/assets/sounds/PURBLES_CAKEBUTTONS.ogg");audio.play().catch(()=>undefined)}

export function mountComfyCakes(){
  const section=document.createElement("section")
  section.className="window game-window comfy-window hidden"
  section.id="comfyWindow"
  section.dataset.app="comfy"
  section.innerHTML=`
    <div class="titlebar" data-drag-handle>
      <div class="title-left"><span class="title-mini">${icon("purble")}</span><span class="window-title">Purble Place</span></div>${controls()}
    </div>
    <div class="purble-menubar" role="menubar">
      <button id="purbleGameMenu" aria-haspopup="true">Game</button><button id="purbleHelp">Help</button>
      <div class="purble-game-menu hidden" id="purbleGameDropdown">
        <button data-purble-action="new">New Game <kbd>F2</kbd></button>
        <button data-purble-action="stats">Statistics <kbd>F4</kbd></button>
        <button data-purble-action="options">Options <kbd>F5</kbd></button>
        <span></span><button data-purble-action="main">Return to Main Menu</button>
        <button data-purble-action="exit">Exit</button>
      </div>
    </div>
    <div class="purble-viewport">
      <div class="purble-stage" id="purbleStage">
        <section class="purble-home" id="purbleHome" aria-label="Purble Place main menu">
          <img class="purble-home-background" src="assets/windows7/games/purble-place/main-background.jpg" alt="">
          <img class="purble-home-foreground" src="assets/windows7/games/purble-place/main-foreground.png" alt="">
          <h2>PURBLE PLACE</h2>
          <button class="purble-building purble-pairs" data-purble-unavailable="Purble Pairs" aria-label="Purble Pairs"></button>
          <button class="purble-building purble-cakes" id="purbleCakesButton" aria-label="Play Comfy Cakes">
            <img class="purble-cakes-hover" src="assets/windows7/games/purble-place/comfy-hover.png" alt="">
            <img class="purble-cakes-down" src="assets/windows7/games/purble-place/comfy-down.png" alt="">
          </button>
          <button class="purble-building purble-shop" data-purble-unavailable="Purble Shop" aria-label="Purble Shop"></button>
          <button class="purble-exit-sign" data-purble-action="exit" aria-label="Exit Purble Place"></button>
        </section>
        <section class="purble-play hidden" id="purblePlay">
          <div class="purble-loading" id="purbleLoading">LOADING...</div>
          <iframe id="comfyFrame" title="Comfy Cakes" sandbox="allow-scripts" allow="autoplay" tabindex="0"></iframe>
        </section>
        <section class="purble-dialog hidden" id="purbleDifficulty" role="dialog" aria-modal="true" aria-labelledby="purbleDifficultyTitle">
          <div class="purble-dialog-title" id="purbleDifficultyTitle">Select Difficulty</div>
          <div class="purble-dialog-body">
            <strong>What level of difficulty do you want to play?</strong>
            <p>Note: You can change the difficulty level later by clicking Options on the Game menu.</p>
            <label><input type="radio" name="purbleDifficulty" value="1" checked><span><b>Beginner</b><small>Easy recipes, one cake at a time</small></span></label>
            <label><input type="radio" name="purbleDifficulty" value="2"><span><b>Intermediate</b><small>Harder recipes, multiple cakes at a time</small></span></label>
            <label><input type="radio" name="purbleDifficulty" value="3"><span><b>Advanced</b><small>Hardest recipes, multiple cakes at a time</small></span></label>
            <div class="purble-dialog-actions"><button data-purble-action="play">Play</button><button data-purble-action="cancel-dialog">Cancel</button></div>
          </div>
        </section>
        <section class="purble-dialog hidden" id="purbleOptions" role="dialog" aria-modal="true" aria-labelledby="purbleOptionsTitle">
          <div class="purble-dialog-title" id="purbleOptionsTitle">Options</div>
          <div class="purble-dialog-body">
            <strong>Set Comfy Cakes Difficulty</strong>
            <label><input type="radio" name="purbleOptionLevel" value="1"><span><b>Beginner</b></span></label>
            <label><input type="radio" name="purbleOptionLevel" value="2"><span><b>Intermediate</b></span></label>
            <label><input type="radio" name="purbleOptionLevel" value="3"><span><b>Advanced</b></span></label>
            <label><input id="purbleSingleCake" type="checkbox"><span><b>One cake at a time in Intermediate, Advanced</b></span></label>
            <div class="purble-dialog-actions"><button data-purble-action="save-options">OK</button><button data-purble-action="cancel-dialog">Cancel</button></div>
          </div>
        </section>
        <section class="purble-dialog hidden" id="purbleStats" role="dialog" aria-modal="true" aria-labelledby="purbleStatsTitle">
          <div class="purble-dialog-title" id="purbleStatsTitle">Purble Place Statistics</div>
          <div class="purble-dialog-body purble-statistics" id="purbleStatsBody"></div>
        </section>
        <section class="purble-dialog hidden" id="purbleResult" role="dialog" aria-modal="true" aria-labelledby="purbleResultTitle">
          <div class="purble-dialog-title" id="purbleResultTitle">Comfy Cakes</div>
          <div class="purble-dialog-body purble-result-body">
            <strong id="purbleResultText"></strong><p id="purbleResultDetail"></p>
            <div class="purble-dialog-actions"><button data-purble-action="replay">Play Again</button><button data-purble-action="main">Main Menu</button></div>
          </div>
        </section>
      </div>
    </div>`
  byId("desktop").appendChild(section)
  byId("programList").insertAdjacentHTML("beforeend",`<button class="start-program" data-app-open="comfy"><span>${icon("purble")}</span><b>Purble Place</b></button>`)
  byId("allProgramsPanel")?.insertAdjacentHTML("afterbegin",`<button data-app-open="comfy">Games · Purble Place</button>`)
}

export function initComfyCakes(){
  const root=byId("comfyWindow"),home=byId("purbleHome"),play=byId("purblePlay"),frame=byId("comfyFrame"),loading=byId("purbleLoading")
  const dialogs=[byId("purbleDifficulty"),byId("purbleOptions"),byId("purbleStats"),byId("purbleResult")]
  let level=1,singleCake=false,resultRecorded=false
  const closeDialogs=()=>dialogs.forEach(dialog=>dialog.classList.add("hidden"))
  const hasOpenDialog=()=>dialogs.some(dialog=>!dialog.classList.contains("hidden"))
  const isPlaying=()=>!play.classList.contains("hidden")&&Boolean(frame.getAttribute("src"))
  const sendToGame=message=>{if(isPlaying())frame.contentWindow?.postMessage(message,"*")}
  const pauseGame=()=>sendToGame({Type:"visibility",State:"paused"})
  const resumeGame=()=>sendToGame({Type:"visibility",State:"running"})
  const showHome=()=>{closeDialogs();play.classList.add("hidden");home.classList.remove("hidden");resultRecorded=false;frame.removeAttribute("src");loading.classList.add("hidden")}
  const showDialog=dialog=>{closeDialogs();pauseGame();dialog.classList.remove("hidden");setTimeout(()=>dialog.querySelector("button,input")?.focus(),0)}
  const showDifficulty=()=>showDialog(byId("purbleDifficulty"))
  const startGame=()=>{
    closeDialogs();resultRecorded=false;home.classList.add("hidden");play.classList.remove("hidden");loading.classList.remove("hidden")
    const nonce=Date.now(),single=singleCake&&level>1?"&single=1":""
    frame.src=`${GAME_URL}?level=${level}${single}&run=${nonce}`
  }
  const showStats=()=>{
    const stats=readStats(),percentage=stats.played?Math.round(stats.wins/stats.played*100):0
    byId("purbleStatsBody").innerHTML=`<strong>Comfy Cakes</strong><dl><div><dt>Games played</dt><dd>${stats.played}</dd></div><div><dt>Games won</dt><dd>${stats.wins}</dd></div><div><dt>Games lost</dt><dd>${stats.losses}</dd></div><div><dt>Win percentage</dt><dd>${percentage}%</dd></div></dl><div class="purble-dialog-actions"><button data-purble-action="reset-stats">Reset Statistics</button><button data-purble-action="cancel-dialog">Close</button></div>`
    showDialog(byId("purbleStats"))
  }
  const showOptions=()=>{
    root.querySelector(`input[name="purbleOptionLevel"][value="${level}"]`).checked=true;byId("purbleSingleCake").checked=singleCake;showDialog(byId("purbleOptions"))
  }
  const showResult=data=>{
    if(resultRecorded)return
    resultRecorded=true
    const won=data.Result==="win",stats=readStats();stats.played++;if(won)stats.wins++;else stats.losses++;writeStats(stats)
    byId("purbleResultText").textContent=won?"You won!":"Game over"
    byId("purbleResultDetail").textContent=won?"Every order was completed.":`${Number(data.FailCount)||0} cakes did not match their orders.`
    showDialog(byId("purbleResult"))
  }
  const handleShortcut=key=>{if(key==="F2")showDifficulty();else if(key==="F4")showStats();else if(key==="F5")showOptions()}
  root.addEventListener("click",event=>{
    const menuButton=event.target.closest("#purbleGameMenu")
    if(menuButton){event.stopPropagation();byId("purbleGameDropdown").classList.toggle("hidden");return}
    const unavailable=event.target.closest("[data-purble-unavailable]")
    if(unavailable){window.dispatchEvent(new CustomEvent("win7:toast",{detail:`${unavailable.dataset.purbleUnavailable} is outside the Comfy Cakes reconstruction.`}));return}
    if(event.target.closest("#purbleCakesButton")){playMenuSound();showDifficulty();return}
    const action=event.target.closest("[data-purble-action]")?.dataset.purbleAction
    if(!action)return
    playMenuSound();byId("purbleGameDropdown").classList.add("hidden")
    if(action==="play"){level=Number(root.querySelector('input[name="purbleDifficulty"]:checked')?.value||1);singleCake=false;startGame()}
    else if(action==="new")showDifficulty()
    else if(action==="stats")showStats()
    else if(action==="options")showOptions()
    else if(action==="main")showHome()
    else if(action==="replay")startGame()
    else if(action==="cancel-dialog"){closeDialogs();resumeGame()}
    else if(action==="save-options"){level=Number(root.querySelector('input[name="purbleOptionLevel"]:checked')?.value||level);singleCake=byId("purbleSingleCake").checked;closeDialogs();resumeGame()}
    else if(action==="reset-stats"){writeStats({played:0,wins:0,losses:0});showStats()}
    else if(action==="exit")root.querySelector('[data-window-action="close"]').click()
  })
  byId("purbleHelp").addEventListener("click",()=>window.dispatchEvent(new CustomEvent("win7:toast",{detail:"Match the order on the TV: pan, batter, filling, icing, decoration, then final touch."})))
  frame.addEventListener("load",()=>{if(!frame.getAttribute("src"))return;loading.classList.add("hidden");frame.contentWindow?.postMessage(level,"*");frame.focus()})
  window.addEventListener("message",event=>{
    if(event.source!==frame.contentWindow||!event.data||typeof event.data!=="object")return
    if(event.data.Type==="shortcut"){handleShortcut(event.data.Key);return}
    if(["win","lose"].includes(event.data.Result))showResult(event.data)
  })
  window.addEventListener("win7:window-state",event=>{
    if(event.detail?.id!==root.id)return
    if(event.detail.state==="closed")showHome()
    else if(event.detail.state==="minimized")pauseGame()
    else if(event.detail.state==="open"&&!hasOpenDialog())resumeGame()
  })
  document.addEventListener("visibilitychange",()=>{if(document.hidden)pauseGame();else if(!root.classList.contains("hidden")&&!hasOpenDialog())resumeGame()})
  document.addEventListener("click",event=>{if(!event.target.closest("#purbleGameMenu,#purbleGameDropdown"))byId("purbleGameDropdown")?.classList.add("hidden")})
  root.addEventListener("keydown",event=>{if(["F2","F4","F5"].includes(event.key)){event.preventDefault();handleShortcut(event.key)}})
}
