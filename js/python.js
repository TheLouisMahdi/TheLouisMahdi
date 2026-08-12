import{allVirtualFiles,readFile,resolvePath,roots}from"./vfs.js"

let worker=null
let sequence=0
const pending=new Map()

function createWorker(){
  const instance=new Worker(new URL("./python-worker.js",import.meta.url),{type:"module"})
  instance.onmessage=event=>{
    const message=event.data||{}
    const task=pending.get(message.id)
    if(!task)return
    clearTimeout(task.timer)
    pending.delete(message.id)
    if(message.ok)task.resolve(message)
    else task.reject(new Error(message.error||"Python execution failed"))
  }
  instance.onerror=event=>{
    for(const task of pending.values()){clearTimeout(task.timer);task.reject(new Error(event.message||"Python worker failed"))}
    pending.clear()
    worker?.terminate()
    worker=null
  }
  return instance
}

function request(payload,timeout=30000){
  if(!worker)worker=createWorker()
  const id=++sequence
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{
      pending.delete(id)
      worker?.terminate()
      worker=null
      reject(new Error("Python execution stopped after 30 seconds."))
    },timeout)
    pending.set(id,{resolve,reject,timer})
    worker.postMessage({id,...payload})
  })
}

export async function runPythonFile(path,cwd=roots().desktop){
  const full=resolvePath(cwd,path)
  const code=readFile(full)
  if(code===null)throw new Error(`python: can't open file '${path}': No such file`)
  return request({type:"run",path:full,code,files:allVirtualFiles()},30000)
}

export async function getPythonVersion(){
  const result=await request({type:"version"},30000)
  return result.version
}
