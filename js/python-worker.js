import{loadPyodide}from"https://cdn.jsdelivr.net/pyodide/v314.0.4/full/pyodide.mjs"

const PYODIDE_VERSION="314.0.4"
const INDEX_URL=`https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`
let runtimePromise=null

function runtime(){
  if(runtimePromise)return runtimePromise
  runtimePromise=loadPyodide({indexURL:INDEX_URL})
  return runtimePromise
}

function posix(winPath){
  const clean=String(winPath||"").replaceAll("\\","/")
  const drive=(clean.match(/^([A-Za-z]):/)||[])[1]||"C"
  const rest=clean.replace(/^[A-Za-z]:/,"")
  return `/win/${drive.toUpperCase()}${rest.startsWith("/")?rest:`/${rest}`}`.replace(/\/+/g,"/")
}

function dirname(path){const i=path.lastIndexOf("/");return i>0?path.slice(0,i):"/"}

async function syncFiles(pyodide,files){
  for(const file of files||[]){
    const path=posix(file.path)
    pyodide.FS.mkdirTree(dirname(path))
    pyodide.FS.writeFile(path,String(file.content??""),{encoding:"utf8"})
  }
}

async function execute(message){
  const pyodide=await runtime()
  await syncFiles(pyodide,message.files)
  const file=posix(message.path)
  const code=String(message.code??"")
  const cwd=dirname(file)
  try{await pyodide.loadPackagesFromImports(code)}catch{}
  try{pyodide.FS.chdir(cwd)}catch{}
  pyodide.globals.set("__eka_code",code)
  pyodide.globals.set("__eka_file",file)
  const result=pyodide.runPython(`
import io, contextlib, traceback, sys, os
_stdout = io.StringIO()
_stderr = io.StringIO()
try:
    if os.getcwd() not in sys.path:
        sys.path.insert(0, os.getcwd())
    with contextlib.redirect_stdout(_stdout), contextlib.redirect_stderr(_stderr):
        _g = {"__name__": "__main__", "__file__": __eka_file}
        exec(compile(__eka_code, __eka_file, "exec"), _g, _g)
except SystemExit as _e:
    if _e.code not in (None, 0):
        print(f"SystemExit: {_e.code}", file=_stderr)
except BaseException:
    traceback.print_exc(file=_stderr)
(_stdout.getvalue(), _stderr.getvalue(), sys.version.split()[0])
`)
  const values=result.toJs()
  result.destroy?.()
  return {stdout:String(values[0]||""),stderr:String(values[1]||""),version:String(values[2]||"")}
}

self.onmessage=async event=>{
  const message=event.data||{}
  try{
    if(message.type==="version"){
      const pyodide=await runtime()
      const version=String(pyodide.runPython("import sys; sys.version.split()[0]"))
      self.postMessage({id:message.id,ok:true,version})
      return
    }
    if(message.type==="run"){
      const output=await execute(message)
      self.postMessage({id:message.id,ok:true,...output})
    }
  }catch(error){self.postMessage({id:message.id,ok:false,error:String(error?.stack||error)})}
}
