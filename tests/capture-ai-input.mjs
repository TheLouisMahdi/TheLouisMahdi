import{writeFile}from"node:fs/promises"
import worker from"../ai-worker/src/index.js"

let captured=null
const env={
  FRONTEND_ORIGIN:"https://thelouismahdi.github.io",
  MODEL:"@cf/zai-org/glm-4.7-flash",
  AI:{run:async(model,input)=>{
    captured={model,input}
    return{choices:[{message:{role:"assistant",content:"capture-ok"}}]}
  }}
}

const request=new Request("https://worker.test/api/chat",{
  method:"POST",
  headers:{"content-type":"application/json","origin":"https://thelouismahdi.github.io"},
  body:JSON.stringify({message:"Reply briefly: what does Mahdi work on?",history:[]})
})

const response=await worker.fetch(request,env)
if(response.status!==200||!captured)throw new Error("failed_to_capture_worker_ai_input")
await writeFile("/tmp/current-ai-input.json",JSON.stringify(captured.input))
console.log(`Captured ${captured.model} payload with max_completion_tokens=${captured.input.max_completion_tokens}`)
