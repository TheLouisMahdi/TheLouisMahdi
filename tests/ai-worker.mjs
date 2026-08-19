import assert from"node:assert/strict"
import worker from"../ai-worker/src/index.js"
import{profileContext}from"../ai-worker/src/profile-data.js"

const request=(message,history=[])=>new Request("https://worker.test/api/chat",{
  method:"POST",
  headers:{"content-type":"application/json","origin":"https://thelouismahdi.github.io"},
  body:JSON.stringify({message,history})
})

let call
const env={
  FRONTEND_ORIGIN:"https://thelouismahdi.github.io",
  MODEL:"@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  AI:{run:async(model,input)=>{
    call={model,input}
    return{response:"Cloudflare AI response OK"}
  }}
}

const response=await worker.fetch(request("Tell me about Mahdi's FPGA work",[
  {role:"user",content:"hello"},
  {role:"assistant",content:"Hey — what are you working on?"}
]),env)
assert.equal(response.status,200)
const body=await response.json()
assert.equal(body.answer,"Cloudflare AI response OK")
assert.equal(body.model,env.MODEL)
assert.equal(body.build,"profile-ai-v4")
assert.equal(call.model,env.MODEL)
assert.equal(call.input.max_tokens,360)
assert.equal(call.input.max_completion_tokens,undefined)
assert.equal(call.input.temperature,.62)
assert.equal(call.input.top_p,.92)
assert.match(call.input.messages[0].content,/not like a customer-support bot/)
assert.match(call.input.messages[0].content,/Do not begin with disclaimers/)
assert.match(call.input.messages[0].content,/مهدی قهرمانی/)
assert.match(call.input.messages[0].content,/FPGA CNN Fatigue Monitoring/)
assert.match(call.input.messages[0].content,/VideoX Compressor/)
assert.match(call.input.messages[0].content,/Lights Out GF\(2\) Solver/)
assert.match(call.input.messages[0].content,/BTC Adaptive Directional Breakout Trader/)
assert.match(call.input.messages[0].content,/NPVT Terminal Converter/)
assert.equal(call.input.messages.at(-1).content,"Tell me about Mahdi's FPGA work")
assert.ok(call.input.messages.some(item=>item.content==="Hey — what are you working on?"),"conversation history must reach the model")

const context=profileContext()
assert.match(context,/Exact Persian name spelling: مهدی قهرمانی/)
assert.match(context,/TheLouisMahdi, Eka, poimu, Eka Francium/)
assert.match(context,/Zynq-7000 XC7Z020-class SoC/)
assert.match(context,/ARM Cortex-A9 processing system/)
assert.match(context,/hardware-free end-to-end simulation/)
assert.match(context,/STM32F1-class and STM32H7-class/)
assert.match(context,/Debian\/WSL/)
assert.match(context,/ARM 32-bit embedded-Linux test platform/)
assert.match(context,/firmware build\/release automation/)
assert.match(context,/Vivado\/Vitis/)
assert.match(context,/paper trading and research only/)
assert.doesNotMatch(context,/therapy|password|API token|birth year|GPA/i)

const health=await worker.fetch(new Request("https://worker.test/health"),env)
assert.equal(health.status,200)
const healthBody=await health.json()
assert.equal(healthBody.model,env.MODEL)
assert.equal(healthBody.build,"profile-ai-v4")

console.log("Workers AI Eka v4 conversation/profile contract: PASS")
