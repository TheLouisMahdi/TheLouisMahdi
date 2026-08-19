import assert from"node:assert/strict"
import{chromium}from"playwright"

const siteUrl=process.env.SITE_URL||"http://127.0.0.1:4173/"
const profiles=[
  {name:"desktop",viewport:{width:1440,height:1000},hasTouch:false},
  {name:"mobile",viewport:{width:390,height:844},hasTouch:true}
]

const browser=await chromium.launch({headless:true})
try{
  for(const profile of profiles){
    const context=await browser.newContext({viewport:profile.viewport,hasTouch:profile.hasTouch,isMobile:profile.hasTouch})
    const page=await context.newPage()
    const errors=[]
    page.on("pageerror",error=>errors.push(error.message))
    await page.addInitScript(()=>{
      const original=CanvasRenderingContext2D.prototype.drawImage
      CanvasRenderingContext2D.prototype.drawImage=function(image,...args){
        if(image instanceof HTMLImageElement&&image.dataset.footerTugboat==="true"){
          window.__footerTugboatDrawn=(window.__footerTugboatDrawn||0)+1
          window.__footerTugboatDims=[image.naturalWidth,image.naturalHeight]
        }
        return original.call(this,image,...args)
      }
    })
    await page.goto(siteUrl,{waitUntil:"domcontentloaded"})

    await page.waitForFunction(()=>window.__footerTugboatDrawn>0,{timeout:10000})
    const boatDims=await page.evaluate(()=>window.__footerTugboatDims)
    assert.deepEqual(boatDims,[220,210],profile.name+" reconstructed tugboat dimensions are invalid")
    const chunkSizes=await page.evaluate(async()=>Promise.all([
      "assets/tugboat/part0.txt",
      "assets/tugboat/part1.txt",
      "assets/tugboat/part2.txt"
    ].map(async path=>{
      const response=await fetch(path,{cache:"no-store"})
      if(!response.ok)return-1
      return(await response.text()).trim().length
    })))
    assert.deepEqual(chunkSizes,[7500,7500,6948],profile.name+" tugboat source chunks are incomplete")

    await page.locator(".site-footer").scrollIntoViewIfNeeded()
    const footerBox=await page.locator(".site-footer").boundingBox()
    assert.ok(footerBox,profile.name+" footer is missing")
    const drawsBefore=await page.evaluate(()=>window.__footerTugboatDrawn||0)
    if(profile.hasTouch){
      await page.touchscreen.tap(footerBox.x+footerBox.width*.28,footerBox.y+footerBox.height*.48)
    }else{
      await page.mouse.move(footerBox.x+footerBox.width*.12,footerBox.y+footerBox.height*.42)
      await page.mouse.move(footerBox.x+footerBox.width*.34,footerBox.y+footerBox.height*.57,{steps:5})
      await page.mouse.down()
      await page.mouse.up()
    }
    await page.waitForTimeout(300)
    const drawsAfter=await page.evaluate(()=>window.__footerTugboatDrawn||0)
    assert.ok(drawsAfter>drawsBefore,profile.name+" tugboat stopped rendering after liquid interaction")

    await page.waitForSelector("#comfyWindow",{state:"attached"})
    await page.locator("#laptopPower").click({force:true})
    await page.addStyleTag({content:".system-screen{display:none!important}"})
    await page.evaluate(()=>window.dispatchEvent(new CustomEvent("win7:open-app",{detail:"comfy"})))
    await page.waitForFunction(()=>!document.getElementById("comfyWindow").classList.contains("hidden"))
    assert.equal(await page.locator("#comfyFrame").getAttribute("sandbox"),"allow-scripts")

    await page.locator("#purbleCakesButton").click({force:true})
    await page.locator('[data-purble-action="play"]').click({force:true})
    await page.waitForFunction(()=>document.getElementById("comfyFrame").getAttribute("src")?.includes("level=1"))

    const frameElement=await page.locator("#comfyFrame").elementHandle()
    const frame=await frameElement?.contentFrame()
    assert.ok(frame,profile.name+" game frame did not load")
    await frame.waitForSelector("canvas",{timeout:45000})

    await frame.evaluate(()=>window.dispatchEvent(new KeyboardEvent("keydown",{key:"F4"})))
    await page.waitForFunction(()=>!document.getElementById("purbleStats").classList.contains("hidden"))
    await page.locator('#purbleStats [data-purble-action="cancel-dialog"]').click({force:true})

    await frame.evaluate(()=>{
      window.parent.postMessage({Result:"win",FailCount:0},"*")
      window.parent.postMessage({Result:"win",FailCount:0},"*")
    })
    await page.waitForFunction(()=>!document.getElementById("purbleResult").classList.contains("hidden"))
    const stats=await page.evaluate(()=>JSON.parse(localStorage.getItem("eka.purble-place.comfy-cakes.stats")))
    assert.deepEqual(stats,{played:1,wins:1,losses:0},profile.name+" counted a result more than once")

    if(!profile.hasTouch){
      const iframeBox=await page.locator("#comfyFrame").boundingBox()
      const menuBox=await page.locator(".purble-menubar").boundingBox()
      assert.ok(iframeBox&&menuBox,"cursor test surfaces are missing")
      await page.mouse.move(iframeBox.x+iframeBox.width/2,iframeBox.y+iframeBox.height/2)
      await page.mouse.move(menuBox.x+menuBox.width/2,menuBox.y+menuBox.height/2)
      await page.waitForFunction(()=>document.getElementById("screen").classList.contains("pointer-active"))
    }

    await page.locator('#comfyWindow [data-window-action="close"]').click({force:true})
    await page.waitForFunction(()=>{
      const root=document.getElementById("comfyWindow")
      const frame=document.getElementById("comfyFrame")
      return root.classList.contains("hidden")&&!frame.hasAttribute("src")
    })
    assert.deepEqual(errors,[],profile.name+" browser errors: "+errors.join(" | "))
    await context.close()
  }
}finally{
  await browser.close()
}

console.log("Verified tugboat + Comfy Cakes browser checks passed")
