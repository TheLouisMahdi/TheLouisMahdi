const byId=id=>document.getElementById(id)

const buttons=[
  ["MC","memory-clear"],["MR","memory-read"],["M+","memory-add"],["M-","memory-sub"],["←","back"],
  ["CE","clear-entry"],["C","clear"],["±","sign"],["√","sqrt"],["÷","op"],
  ["7","digit"],["8","digit"],["9","digit"],["%","percent"],["×","op"],
  ["4","digit"],["5","digit"],["6","digit"],["1/x","inverse"],["−","op"],
  ["1","digit"],["2","digit"],["3","digit"],["=","equals"],["+","op"],
  ["0","digit"],[".","decimal"]
]

const calculatorModes={
  Standard:buttons,
  Scientific:[...["sin","cos","tan","log","ln","x²","x³","π","n!","10ˣ"].map(label=>[label,"scientific"]),...buttons],
  Programmer:[...["A","B","C","D","E","F"].map(label=>[label,"hex"]),["AND","bit-op"],["OR","bit-op"],["XOR","bit-op"],["MOD","bit-op"],...buttons],
  Statistics:[["Add","stat-add"],["Average","stat-average"],["Sum","stat-sum"],["Count","stat-count"],["Clear data","stat-clear"],...buttons]
}

let value="0"
let stored=null
let operation=null
let fresh=true
let memory=0
let statistics=[]

function display(){byId("calcDisplay").value=value}
function number(){return Number(value)||0}

function calculate(){
  if(stored===null||!operation)return number()
  const right=number()
  if(operation==="+")return stored+right
  if(operation==="−")return stored-right
  if(operation==="×")return stored*right
  if(operation==="÷")return right===0?0:stored/right
  if(operation==="AND")return stored&right
  if(operation==="OR")return stored|right
  if(operation==="XOR")return stored^right
  if(operation==="MOD")return right===0?0:stored%right
  return right
}

function calcAction(label,type){
  if(type==="digit"){value=fresh?label:(value==="0"?label:value+label);fresh=false}
  if(type==="decimal"){if(fresh){value="0.";fresh=false}else if(!value.includes("."))value+="."}
  if(type==="op"){if(stored!==null&&!fresh)value=String(calculate());stored=number();operation=label;fresh=true}
  if(type==="equals"){value=String(calculate());stored=null;operation=null;fresh=true}
  if(type==="clear"||type==="clear-entry"){value="0";if(type==="clear"){stored=null;operation=null}fresh=true}
  if(type==="back"&&!fresh)value=value.length>1?value.slice(0,-1):"0"
  if(type==="sign")value=String(-number())
  if(type==="sqrt")value=String(Math.sqrt(Math.max(0,number())))
  if(type==="percent")value=String(number()/100)
  if(type==="inverse")value=String(number()===0?0:1/number())
  if(type==="memory-clear")memory=0
  if(type==="memory-read"){value=String(memory);fresh=true}
  if(type==="memory-add")memory+=number()
  if(type==="memory-sub")memory-=number()
  if(type==="scientific"){
    const n=number(),actions={sin:Math.sin(n),cos:Math.cos(n),tan:Math.tan(n),log:Math.log10(Math.max(n,Number.EPSILON)),ln:Math.log(Math.max(n,Number.EPSILON)),"x²":n*n,"x³":n*n*n,π:Math.PI,"n!":n<0?0:Array.from({length:Math.min(170,Math.floor(n))},(_,i)=>i+1).reduce((a,b)=>a*b,1),"10ˣ":10**n}
    value=String(actions[label]);fresh=true
  }
  if(type==="hex"){const digit=String(parseInt(label,16));value=fresh?digit:String(number()*16+Number(digit));fresh=false}
  if(type==="bit-op"){stored=Math.trunc(number());operation=label;fresh=true}
  if(type==="stat-add")statistics.push(number())
  if(type==="stat-average"){value=String(statistics.length?statistics.reduce((a,b)=>a+b,0)/statistics.length:0);fresh=true}
  if(type==="stat-sum"){value=String(statistics.reduce((a,b)=>a+b,0));fresh=true}
  if(type==="stat-count"){value=String(statistics.length);fresh=true}
  if(type==="stat-clear")statistics=[]
  display()
}

export function initCalculator(){
  const grid=byId("calcGrid")
  const render=()=>{
    const mode=byId("calcMode").value
    grid.innerHTML=calculatorModes[mode].map(([label,type])=>`<button data-calc-type="${type}" data-calc-label="${label}">${label}</button>`).join("")
    grid.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>calcAction(button.dataset.calcLabel,button.dataset.calcType)))
    byId("calculatorWindow").classList.toggle("calc-wide",mode!=="Standard")
  }
  byId("calcMode").addEventListener("change",render)
  render()
}
