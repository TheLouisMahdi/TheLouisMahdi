import{icon}from"./icons.js"

const byId=id=>document.getElementById(id)
const toast=text=>window.dispatchEvent(new CustomEvent("win7:toast",{detail:text}))
const suits=["♠","♥","♦","♣"]
const ranks=["","A","2","3","4","5","6","7","8","9","10","J","Q","K"]
const red=suit=>suit==="♥"||suit==="♦"
const clone=value=>JSON.parse(JSON.stringify(value))

function deck(){return suits.flatMap(suit=>Array.from({length:13},(_,i)=>({suit,rank:i+1,up:true,id:`${suit}${i+1}`})))}
function shuffle(cards){for(let i=cards.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]]}return cards}
function cardMarkup(card,attrs="",selected=false){return `<button class="game-card ${red(card.suit)?"red":"black"} ${card.up?"":"face-down"} ${selected?"selected":""}" ${attrs} aria-label="${card.up?`${ranks[card.rank]} of ${card.suit}`:"Face-down card"}">${card.up?`<b>${ranks[card.rank]}</b><i>${card.suit}</i>`:""}</button>`}
function controls(){return `<div class="win-controls"><button class="win-control" data-window-action="min">_</button><button class="win-control" data-window-action="max">□</button><button class="win-control close" data-window-action="close">×</button></div>`}
function gameWindow(app,title,iconName,body,className){const section=document.createElement("section");section.className=`window game-window ${className} hidden`;section.id=`${app}Window`;section.dataset.app=app;section.innerHTML=`<div class="titlebar" data-drag-handle><div class="title-left"><span class="title-mini">${icon(iconName)}</span><span class="window-title">${title}</span></div>${controls()}</div>${body}`;byId("desktop").appendChild(section)}

export function mountGames(){
  gameWindow("solitaire","Solitaire","solitaire",`<div class="game-menubar"><button data-sol="new">Game</button><button data-sol="hint">Help</button><span></span><button data-sol="undo">Undo</button></div><div class="solitaire-felt"><div class="sol-top"><div class="card-slot" data-sol-zone="stock"></div><div class="card-slot" data-sol-zone="waste"></div><div class="sol-gap"></div>${Array.from({length:4},(_,i)=>`<div class="card-slot foundation" data-sol-foundation="${i}"><small>${suits[i]}</small></div>`).join("")}</div><div class="sol-tableau" id="solTableau"></div></div><div class="game-status" id="solStatus">Time: 0 · Score: 0</div>`,`solitaire-window`)
  gameWindow("freecell","FreeCell","freecell",`<div class="game-menubar"><button data-fc="new">Game</button><button data-fc="hint">Help</button><span></span><button data-fc="undo">Undo</button></div><div class="freecell-felt"><div class="fc-top"><div id="fcCells" class="fc-slots"></div><div class="fc-logo">FREECELL</div><div id="fcFoundations" class="fc-slots"></div></div><div class="fc-tableau" id="fcTableau"></div></div><div class="game-status" id="fcStatus">Game in progress · Cards left: 52</div>`,`freecell-window`)
  gameWindow("chess","Chess Titans","chess",`<div class="game-menubar"><button data-chess="new">Game</button><button data-chess="undo">Undo</button><button data-chess="rotate">Rotate Board</button><span></span><label>Difficulty <select id="chessDifficulty">${Array.from({length:10},(_,index)=>`<option value="${index+1}"${index===4?" selected":""}>${index+1}${index===0?" · Beginner":index===4?" · Intermediate":index===9?" · Advanced":""}</option>`).join("")}</select></label></div><div class="chess-stage"><div class="chess-board" id="chessBoard"></div><aside><h3>Chess Titans</h3><p id="chessStatus">White to move</p><div id="chessCaptured"></div><p>Click a piece to show legal moves, then click a highlighted square.</p></aside></div>`,`chess-window`)
  byId("programList").insertAdjacentHTML("beforeend",`<button class="start-program" data-app-open="solitaire"><span>${icon("solitaire")}</span><b>Solitaire</b></button><button class="start-program" data-app-open="freecell"><span>${icon("freecell")}</span><b>FreeCell</b></button><button class="start-program" data-app-open="chess"><span>${icon("chess")}</span><b>Chess Titans</b></button>`)
  byId("allProgramsPanel")?.insertAdjacentHTML("afterbegin",`<button data-app-open="solitaire">Games · Solitaire</button><button data-app-open="freecell">Games · FreeCell</button><button data-app-open="minesweeper">Games · Minesweeper</button><button data-app-open="chess">Games · Chess Titans</button>`)
}

function initSolitaire(){
  const root=byId("solitaireWindow"),tableauNode=byId("solTableau")
  let stock=[],waste=[],foundations=[],tableau=[],selected=null,history=[],score=0,started=0,timer
  const state=()=>clone({stock,waste,foundations,tableau,score})
  const save=()=>{history.push(state());if(history.length>60)history.shift()}
  const restore=s=>{({stock,waste,foundations,tableau,score}=clone(s));selected=null;render()}
  const removeSelected=()=>{let cards=[];if(selected.zone==="waste")cards=[waste.pop()];else if(selected.zone==="foundation")cards=[foundations[selected.foundation].pop()];else{cards=tableau[selected.pile].splice(selected.index);const top=tableau[selected.pile].at(-1);if(top&&!top.up){top.up=true;score+=5}}return cards}
  const selectedCards=()=>selected?.zone==="waste"?[waste.at(-1)]:selected?.zone==="foundation"?[foundations[selected.foundation].at(-1)]:selected?.zone==="tableau"?tableau[selected.pile].slice(selected.index):[]
  const sequenceValid=cards=>cards.every((card,i)=>!i||(cards[i-1].rank===card.rank+1&&red(cards[i-1].suit)!==red(card.suit)))
  const canTableau=(cards,pile)=>cards.length&&sequenceValid(cards)&&(!pile.length?cards[0].rank===13:(pile.at(-1).up&&pile.at(-1).rank===cards[0].rank+1&&red(pile.at(-1).suit)!==red(cards[0].suit)))
  const moveToTableau=index=>{const cards=selectedCards();if(!canTableau(cards,tableau[index]))return false;const fromFoundation=selected.zone==="foundation";save();tableau[index].push(...removeSelected());score=Math.max(0,score+(fromFoundation?-10:5));selected=null;render();return true}
  const moveToFoundation=index=>{const cards=selectedCards(),card=cards[0],pile=foundations[index];if(cards.length!==1||!card||card.suit!==suits[index]||card.rank!==(pile.at(-1)?.rank||0)+1)return false;save();pile.push(removeSelected()[0]);score+=10;selected=null;render();return true}
  const autoFoundation=()=>{const card=selectedCards()[0];if(card)moveToFoundation(suits.indexOf(card.suit))}
  const newGame=()=>{clearInterval(timer);const cards=shuffle(deck()).map(card=>({...card,up:false}));stock=[];waste=[];foundations=Array.from({length:4},()=>[]);tableau=Array.from({length:7},()=>[]);for(let column=0;column<7;column++)for(let row=column;row<7;row++)tableau[row].push(cards.pop());tableau.forEach(pile=>pile.at(-1).up=true);stock=cards;history=[];selected=null;score=0;started=Date.now();timer=setInterval(renderStatus,1000);render()}
  const renderStatus=()=>{byId("solStatus").textContent=`Time: ${Math.floor((Date.now()-started)/1000)} · Score: ${score}`}
  const render=()=>{
    const stockNode=root.querySelector('[data-sol-zone="stock"]'),wasteNode=root.querySelector('[data-sol-zone="waste"]')
    stockNode.innerHTML=stock.length?cardMarkup(stock.at(-1),'data-sol-card="stock"'):"↻"
    wasteNode.innerHTML=waste.length?cardMarkup(waste.at(-1),'data-sol-card="waste"',selected?.zone==="waste"):""
    foundations.forEach((pile,i)=>{const node=root.querySelector(`[data-sol-foundation="${i}"]`);node.innerHTML=pile.length?cardMarkup(pile.at(-1),`data-sol-foundation-card="${i}"`,selected?.zone==="foundation"&&selected.foundation===i):`<small>${suits[i]}</small>`})
    tableauNode.innerHTML=tableau.map((pile,pileIndex)=>`<div class="sol-pile" data-sol-pile="${pileIndex}">${pile.map((card,index)=>cardMarkup(card,`data-sol-tableau="${pileIndex}" data-sol-index="${index}" style="--card-row:${index}"`,selected?.zone==="tableau"&&selected.pile===pileIndex&&index>=selected.index)).join("")}</div>`).join("")
    renderStatus();if(foundations.every(pile=>pile.length===13))toast("You won Solitaire!")
  }
  root.addEventListener("click",event=>{
    const action=event.target.closest("[data-sol]")?.dataset.sol;if(action==="new"){newGame();return}if(action==="undo"&&history.length){restore(history.pop());return}if(action==="hint"){toast("Build down in alternating colors. Double-click an exposed card to send it home.");return}
    if(event.target.closest('[data-sol-card="stock"]')||event.target.closest('[data-sol-zone="stock"]')){save();selected=null;if(stock.length){const card=stock.pop();card.up=true;waste.push(card)}else{stock=waste.reverse().map(card=>({...card,up:false}));waste=[];score=Math.max(0,score-100)}render();return}
    if(event.target.closest('[data-sol-card="waste"]')){selected={zone:"waste"};render();return}
    const card=event.target.closest("[data-sol-tableau]");if(card){const pile=Number(card.dataset.solTableau),index=Number(card.dataset.solIndex),value=tableau[pile][index];if(selected&&moveToTableau(pile))return;if(!value.up){if(index===tableau[pile].length-1){save();value.up=true;score+=5;render()}return}if(sequenceValid(tableau[pile].slice(index))){selected={zone:"tableau",pile,index};render()}return}
    const pile=event.target.closest("[data-sol-pile]");if(pile&&selected){moveToTableau(Number(pile.dataset.solPile));return}
    const foundation=event.target.closest("[data-sol-foundation]");if(foundation){const index=Number(foundation.dataset.solFoundation);if(selected&&moveToFoundation(index))return;if(foundations[index].length){selected={zone:"foundation",foundation:index};render()}}
  })
  root.addEventListener("dblclick",event=>{const card=event.target.closest("[data-sol-tableau],[data-sol-card=\"waste\"]");if(!card)return;if(card.dataset.solCard)selected={zone:"waste"};else selected={zone:"tableau",pile:Number(card.dataset.solTableau),index:Number(card.dataset.solIndex)};autoFoundation()})
  newGame()
}

function initFreeCell(){
  const root=byId("freecellWindow")
  let columns=[],cells=[],foundations=[],selected=null,history=[],game=1
  const save=()=>{history.push(clone({columns,cells,foundations}));if(history.length>80)history.shift()}
  const sequenceValid=cards=>cards.every((card,i)=>!i||(cards[i-1].rank===card.rank+1&&red(cards[i-1].suit)!==red(card.suit)))
  const selectedCards=()=>selected?.zone==="column"?columns[selected.column].slice(selected.index):selected?.zone==="cell"?[cells[selected.cell]]:selected?.zone==="foundation"?[foundations[selected.foundation].at(-1)]:[]
  const removeSelected=()=>selected.zone==="cell"?[cells.splice(selected.cell,1,null)[0]]:selected.zone==="foundation"?[foundations[selected.foundation].pop()]:columns[selected.column].splice(selected.index)
  const capacity=target=>{const free=cells.filter(card=>!card).length,empty=columns.filter((pile,i)=>!pile.length&&i!==target).length;return(free+1)*2**empty}
  const moveColumn=target=>{const cards=selectedCards(),pile=columns[target];if(!cards.length||!sequenceValid(cards)||cards.length>capacity(target)||(!pile.length?false:!(pile.at(-1).rank===cards[0].rank+1&&red(pile.at(-1).suit)!==red(cards[0].suit))))return false;save();pile.push(...removeSelected());selected=null;render();return true}
  const moveCell=index=>{const cards=selectedCards();if(cards.length!==1||cells[index])return false;save();cells[index]=removeSelected()[0];selected=null;render();return true}
  const moveFoundation=index=>{const cards=selectedCards(),card=cards[0],pile=foundations[index];if(cards.length!==1||!card||card.suit!==suits[index]||card.rank!==(pile.at(-1)?.rank||0)+1)return false;save();pile.push(removeSelected()[0]);selected=null;render();return true}
  const newGame=()=>{const cards=shuffle(deck());columns=Array.from({length:8},()=>[]);cards.forEach((card,i)=>columns[i%8].push(card));cells=[null,null,null,null];foundations=Array.from({length:4},()=>[]);selected=null;history=[];game=Math.floor(Math.random()*1000000)+1;render()}
  const render=()=>{
    byId("fcCells").innerHTML=cells.map((card,i)=>`<div class="card-slot" data-fc-cell="${i}">${card?cardMarkup(card,`data-fc-cell-card="${i}"`,selected?.zone==="cell"&&selected.cell===i):""}</div>`).join("")
    byId("fcFoundations").innerHTML=foundations.map((pile,i)=>`<div class="card-slot foundation" data-fc-foundation="${i}">${pile.length?cardMarkup(pile.at(-1),`data-fc-foundation-card="${i}"`,selected?.zone==="foundation"&&selected.foundation===i):`<small>${suits[i]}</small>`}</div>`).join("")
    byId("fcTableau").innerHTML=columns.map((pile,column)=>`<div class="fc-column" data-fc-column="${column}">${pile.map((card,index)=>cardMarkup(card,`data-fc-card="${column}" data-fc-index="${index}" style="--card-row:${index}"`,selected?.zone==="column"&&selected.column===column&&index>=selected.index)).join("")}</div>`).join("")
    const left=52-foundations.reduce((n,pile)=>n+pile.length,0);byId("fcStatus").textContent=`Game #${game} · Cards left: ${left}`;if(!left)toast("You won FreeCell!")
  }
  root.addEventListener("click",event=>{
    const action=event.target.closest("[data-fc]")?.dataset.fc;if(action==="new"){newGame();return}if(action==="undo"&&history.length){({columns,cells,foundations}=clone(history.pop()));selected=null;render();return}if(action==="hint"){toast("Build down by alternating colors. Use four free cells, and build foundations by suit from Ace.");return}
    const card=event.target.closest("[data-fc-card]");if(card){const column=Number(card.dataset.fcCard),index=Number(card.dataset.fcIndex);if(selected&&moveColumn(column))return;const cards=columns[column].slice(index);if(sequenceValid(cards)){selected={zone:"column",column,index};render()}return}
    const column=event.target.closest("[data-fc-column]");if(column&&selected){const target=Number(column.dataset.fcColumn);const cards=selectedCards();if(!columns[target].length&&cards.length<=capacity(target)){save();columns[target].push(...removeSelected());selected=null;render()}return}
    const cellCard=event.target.closest("[data-fc-cell-card]");if(cellCard){selected={zone:"cell",cell:Number(cellCard.dataset.fcCellCard)};render();return}
    const cell=event.target.closest("[data-fc-cell]");if(cell&&selected){moveCell(Number(cell.dataset.fcCell));return}
    const foundation=event.target.closest("[data-fc-foundation]");if(foundation){const index=Number(foundation.dataset.fcFoundation);if(selected&&moveFoundation(index))return;if(foundations[index].length){selected={zone:"foundation",foundation:index};render()}}
  })
  root.addEventListener("dblclick",event=>{const card=event.target.closest("[data-fc-card],[data-fc-cell-card]");if(!card)return;selected=card.dataset.fcCard!==undefined?{zone:"column",column:Number(card.dataset.fcCard),index:Number(card.dataset.fcIndex)}:{zone:"cell",cell:Number(card.dataset.fcCellCard)};const value=selectedCards()[0];if(value)moveFoundation(suits.indexOf(value.suit))})
  newGame()
}

function initChess(){
  const pieces={wr:"♖",wn:"♘",wb:"♗",wq:"♕",wk:"♔",wp:"♙",br:"♜",bn:"♞",bb:"♝",bq:"♛",bk:"♚",bp:"♟"}
  let board,turn="w",selected=null,moves=[],history=[],rotated=false,busy=false,captured=[]
  const inside=(r,c)=>r>=0&&r<8&&c>=0&&c<8
  const color=piece=>piece?.[0]
  const rawMoves=(grid,r,c,attacks=false)=>{
    const piece=grid[r][c];if(!piece)return[];const side=color(piece),type=piece[1],out=[]
    const push=(nr,nc)=>{if(inside(nr,nc)&&color(grid[nr][nc])!==side){out.push([nr,nc]);return!grid[nr][nc]}return false}
    if(type==="p"){const dir=side==="w"?-1:1,start=side==="w"?6:1;if(attacks){for(const dc of[-1,1])if(inside(r+dir,c+dc))out.push([r+dir,c+dc])}else{if(inside(r+dir,c)&&!grid[r+dir][c]){out.push([r+dir,c]);if(r===start&&!grid[r+2*dir][c])out.push([r+2*dir,c])}for(const dc of[-1,1])if(inside(r+dir,c+dc)&&grid[r+dir][c+dc]&&color(grid[r+dir][c+dc])!==side)out.push([r+dir,c+dc])}}
    if(type==="n")for(const[dR,dC]of[[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]])push(r+dR,c+dC)
    if(type==="k")for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if(dr||dc)push(r+dr,c+dc)
    const directions=type==="r"?[[1,0],[-1,0],[0,1],[0,-1]]:type==="b"?[[1,1],[1,-1],[-1,1],[-1,-1]]:[...[[1,0],[-1,0],[0,1],[0,-1]],...[[1,1],[1,-1],[-1,1],[-1,-1]]]
    if("rbq".includes(type))for(const[dr,dc]of directions)for(let step=1;step<8;step++)if(!push(r+dr*step,c+dc*step))break
    return out
  }
  const attacked=(grid,r,c,by)=>grid.some((row,rr)=>row.some((piece,cc)=>color(piece)===by&&rawMoves(grid,rr,cc,true).some(([mr,mc])=>mr===r&&mc===c)))
  const inCheck=(grid,side)=>{let king;grid.forEach((row,r)=>row.forEach((piece,c)=>{if(piece===`${side}k`)king=[r,c]}));return king?attacked(grid,king[0],king[1],side==="w"?"b":"w"):true}
  const legal=(r,c)=>rawMoves(board,r,c).filter(([nr,nc])=>{const test=clone(board);test[nr][nc]=test[r][c];test[r][c]=null;return!inCheck(test,color(test[nr][nc]))})
  const allMoves=side=>{const out=[];board.forEach((row,r)=>row.forEach((piece,c)=>{if(color(piece)===side)for(const to of legal(r,c))out.push({from:[r,c],to})}));return out}
  const move=(from,to,computer=false)=>{history.push(clone({board,turn,captured}));const piece=board[from[0]][from[1]],taken=board[to[0]][to[1]];if(taken)captured.push(taken);board[to[0]][to[1]]=piece;board[from[0]][from[1]]=null;if(piece[1]==="p"&&(to[0]===0||to[0]===7))board[to[0]][to[1]]=`${piece[0]}q`;turn=turn==="w"?"b":"w";selected=null;moves=[];render();const available=allMoves(turn);if(!available.length){toast(inCheck(board,turn)?`${turn==="w"?"Black":"White"} wins by checkmate.`:"Draw by stalemate.");busy=false;return}if(!computer&&turn==="b")computerMove()}
  const computerMove=()=>{busy=true;const level=Number(byId("chessDifficulty").value),available=allMoves("b");available.sort((a,b)=>(board[b.to[0]][b.to[1]]?10:0)-(board[a.to[0]][a.to[1]]?10:0)+Math.random()-.5);const choice=available[Math.min(available.length-1,Math.floor(Math.random()*Math.max(1,10-level)))];setTimeout(()=>{if(choice)move(choice.from,choice.to,true);busy=false},Math.max(180,700-level*55))}
  const newGame=()=>{board=[["br","bn","bb","bq","bk","bb","bn","br"],["bp","bp","bp","bp","bp","bp","bp","bp"],...Array.from({length:4},()=>Array(8).fill(null)),["wp","wp","wp","wp","wp","wp","wp","wp"],["wr","wn","wb","wq","wk","wb","wn","wr"]];turn="w";selected=null;moves=[];history=[];captured=[];busy=false;render()}
  const render=()=>{
    const order=rotated?[7,6,5,4,3,2,1,0]:[0,1,2,3,4,5,6,7]
    byId("chessBoard").innerHTML=order.flatMap(r=>order.map(c=>{const piece=board[r][c],valid=moves.some(([mr,mc])=>mr===r&&mc===c);return `<button class="chess-square ${(r+c)%2?"dark":"light"} ${selected?.[0]===r&&selected?.[1]===c?"selected":""} ${valid?"legal":""}" data-chess-square="${r},${c}">${piece?pieces[piece]:""}<small>${valid?(piece?"●":"·"):""}</small></button>`})).join("")
    const check=inCheck(board,turn);byId("chessStatus").textContent=`${turn==="w"?"White":"Black"} to move${check?" · Check!":""}`;byId("chessCaptured").textContent=captured.map(piece=>pieces[piece]).join(" ")||"No captured pieces"
  }
  byId("chessWindow").addEventListener("click",event=>{
    const action=event.target.closest("[data-chess]")?.dataset.chess;if(action==="new"){newGame();return}if(action==="rotate"){rotated=!rotated;render();return}if(action==="undo"&&history.length){let previous=history.pop();if(turn==="w"&&history.length)previous=history.pop();({board,turn,captured}=clone(previous));selected=null;moves=[];busy=false;render();return}
    const square=event.target.closest("[data-chess-square]");if(!square||busy||turn!=="w")return;const[r,c]=square.dataset.chessSquare.split(",").map(Number),piece=board[r][c]
    if(selected&&moves.some(([mr,mc])=>mr===r&&mc===c)){move(selected,[r,c]);return}
    if(color(piece)===turn){selected=[r,c];moves=legal(r,c);render()}else{selected=null;moves=[];render()}
  })
  newGame()
}

export function initGames(){initSolitaire();initFreeCell();initChess()}
