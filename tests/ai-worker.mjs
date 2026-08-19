import assert from"node:assert/strict"
import worker from"../ai-worker/src/index.js"

const request=message=>new Request("https://worker.test/api/chat",{
  method:"POST",
  headers:{"content-type":"application/json","origin":"https://thelouismahdi.github.io"},
  body:JSON.stringify({message})
})

let call
const env={
  FRONTEND_ORIGIN:"https://thelouismahdi.github.io",
  MODEL:"@cf/meta/llama-3.1-8b-instruct-fast",
  AI:{run:async(model,input)=>{
    call={model,input}
    return{response:"Cloudflare AI response OK"}
  }}
}

const response=await worker.fetch(request("Tell me about Mahdi's FPGA work"),env)
assert.equal(response.status,200)
const body=await response.json()
assert.equal(body.answer,"Cloudflare AI response OK")
assert.equal(body.model,env.MODEL)
assert.equal(body.build,"profile-ai-v3")
assert.equal(call.model,env.MODEL)
assert.equal(call.input.max_tokens,280)
assert.equal(call.input.max_completion_tokens,undefined)
assert.equal(call.input.temperature,.45)
assert.match(call.input.messages[0].content,/allowed to chat naturally/)
assert.match(call.input.messages[0].content,/FPGA work: Verilog RTL/)
assert.match(call.input.messages[0].content,/poimu/)
assert.match(call.input.messages[0].content,/never silently promote it to verified profile data/)

const health=await worker.fetch(new Request("https://worker.test/health"),env)
assert.equal(health.status,200)
const healthBody=await health.json()
assert.equal(healthBody.model,env.MODEL)
assert.equal(healthBody.build,"profile-ai-v3")

console.log("Workers AI conversational profile contract: PASS")
