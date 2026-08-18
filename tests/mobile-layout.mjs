import assert from"node:assert/strict"
import{chromium}from"playwright"

const siteUrl=process.env.SITE_URL||"http://127.0.0.1:4173/"
const browser=await chromium.launch({headless:true})

try{
  for(const viewport of[{width:390,height:844},{width:844,height:390}]){
    const context=await browser.newContext({viewport,hasTouch:true,isMobile:true})
    const page=await context.newPage()
    await page.goto(siteUrl,{waitUntil:"domcontentloaded"})
    await page.waitForSelector('link[data-mobile-fit]',{state:"attached"})
    await page.waitForSelector("#about .ps-window")

    const geometry=await page.evaluate(()=>{
      const screen=document.getElementById("screen").getBoundingClientRect()
      const consoleBox=document.getElementById("psConsole").getBoundingClientRect()
      return{
        innerWidth,
        scrollWidth:document.documentElement.scrollWidth,
        screenWidth:screen.width,
        screenHeight:screen.height,
        consoleHeight:consoleBox.height
      }
    })

    assert.ok(geometry.scrollWidth<=geometry.innerWidth+1,"mobile layout has horizontal page overflow")
    const ratio=geometry.screenWidth/geometry.screenHeight
    assert.ok(ratio>1.72&&ratio<1.83,`simulator screen is distorted: ${ratio}`)
    assert.ok(geometry.screenHeight<viewport.height*.8,"simulator screen is vertically stretched")
    assert.ok(geometry.consoleHeight<=viewport.height*.65,"profile console is too tall for the mobile viewport")
    await context.close()
  }
}finally{
  await browser.close()
}

console.log("Compact mobile layout checks passed")
