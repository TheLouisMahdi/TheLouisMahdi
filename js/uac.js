const byId=id=>document.getElementById(id)
let pending=null

export function mountUac(){
  const layer=document.createElement("section")
  layer.id="uacPrompt";layer.className="uac-secure hidden";layer.setAttribute("role","dialog");layer.setAttribute("aria-modal","true")
  layer.innerHTML=`<div class="uac-card"><header>User Account Control</header><main><h2>Do you want to allow the following program to make changes to this computer?</h2><div class="uac-program"><span>▣</span><dl><dt>Program name:</dt><dd id="uacProgram">Windows component</dd><dt>Verified publisher:</dt><dd>Microsoft Windows</dd><dt>File origin:</dt><dd>Hard drive on this computer</dd></dl></div><details><summary>Show details</summary><p>Program location: C:\Windows\System32</p></details><footer><button id="uacYes">Yes</button><button id="uacNo">No</button></footer></main></div>`
  byId("desktop").appendChild(layer)
}

export function requestElevation(program,callback){
  pending=callback;byId("uacProgram").textContent=program;byId("uacPrompt").classList.remove("hidden");setTimeout(()=>byId("uacNo").focus(),0)
}

export function initUac(){
  const finish=allow=>{byId("uacPrompt").classList.add("hidden");const action=pending;pending=null;if(allow&&action)action()}
  byId("uacYes").addEventListener("click",()=>finish(true));byId("uacNo").addEventListener("click",()=>finish(false))
}
