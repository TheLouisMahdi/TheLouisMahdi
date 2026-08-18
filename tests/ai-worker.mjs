import assert from"node:assert/strict"
import worker from"../ai-worker/src/index.js"

const request=message=>new Request("https://worker.test/api/chat",{
  method:"POST",
  headers:{"content-type":"application/json","origin":"https://thelouismahdi.github.io"},
  body:JSON.stringify({message})
})

const env={
  FRONTEND_ORIGIN:"https://thelouismahdi.github.io",
  MODEL:"@cf/zai-org/glm-4.7-flash",
  AI:{run:async()=>({choices:[{message:{role:"assistant",content:"Cloudflare AI response OK"}}]})}
}

const response=await worker.fetch(request("Tell me about Mahdi"),env)
assert.equal(response.status,200)
const body=await response.json()
assert.equal(body.answer,"Cloudflare AI response OK")
assert.equal(body.model,env.MODEL)
console.log("Workers AI response parsing: PASS")
