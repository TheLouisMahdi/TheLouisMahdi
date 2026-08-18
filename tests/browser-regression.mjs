import assert from"node:assert/strict"
import{chromium}from"playwright"

const siteUrl=process.env.SITE_URL||"http://127.0.0.1:4173/"
const browser=await chromium.launch({headless:true})

try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}})
  const page=await context.newPage()
  const errors=[]
  page.on("pageerror",error=>errors.push(error.message))
  await page.goto(siteUrl,{waitUntil:"domcontentloaded"})
  const injected='<img id="owned" src=x onerror="window.__owned=1">.txt'
  await page.evaluate(name=>{
    const path=`C:\\Users\\Eka\\Desktop\\${name}`
    localStorage.setItem("eka.windows7.vfs.v2",JSON.stringify({[path.toLowerCase()]:{path,kind:"text",content:"safe",created:1,updated:1}}))
  },injected)
  await page.reload({waitUntil:"domcontentloaded"})
  await page.waitForSelector("#browserWindow",{state:"attached"})
  await page.addStyleTag({content:".system-screen{display:none!important}"})

  await page.evaluate(()=>window.dispatchEvent(new CustomEvent("win7:open-app",{detail:"notepad"})))
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent("win7:open-app",{detail:"calculator"})))
  await page.locator('[data-task="notepad"]').click({force:true})
  assert.equal(await page.locator("#notepadWindow").evaluate(node=>node.classList.contains("hidden")),false,"taskbar incorrectly minimized a background window")
  const z=await page.evaluate(()=>({note:Number(getComputedStyle(document.getElementById("notepadWindow")).zIndex),calc:Number(getComputedStyle(document.getElementById("calculatorWindow")).zIndex)}))
  assert.ok(z.note>z.calc,"taskbar did not bring the background window to front")
  await page.locator('[data-task="notepad"]').click({force:true})
  assert.equal(await page.locator("#notepadWindow").evaluate(node=>node.classList.contains("hidden")),true,"active taskbar window should minimize on second click")

  await page.locator("#networkBtn").click({force:true})
  await page.locator("#networkConnect").click()
  assert.equal((await page.locator("#networkStatus").textContent())?.trim(),"Not connected")
  assert.equal((await page.locator("#networkConnect").textContent())?.trim(),"Connect")
  await page.locator("#networkConnect").click()
  assert.match((await page.locator("#networkStatus").textContent())||"",/Connected/)

  await page.waitForFunction(name=>[...document.querySelectorAll("#desktopIcons .desktop-label")].some(node=>node.textContent===name),injected)
  assert.equal(await page.locator("#desktopIcons #owned").count(),0,"desktop filename produced DOM injection")
  assert.equal(await page.evaluate(()=>window.__owned||0),0,"legacy filename executed injected script")

  await page.evaluate(()=>window.dispatchEvent(new CustomEvent("win7:navigate",{detail:"documents"})))
  await page.locator("#fileArea").click({button:"right",position:{x:35,y:35},force:true})
  await page.getByRole("button",{name:"New folder",exact:true}).click({force:true})
  await page.locator("#winPromptInput").fill("Explorer Regression Folder")
  await page.locator("#winPromptOk").click()
  await page.waitForFunction(()=>[...document.querySelectorAll("#fileArea .file-name")].some(node=>node.textContent==="Explorer Regression Folder"))
  assert.equal(await page.locator("#desktopIcons .desktop-label",{hasText:"Explorer Regression Folder"}).count(),0,"Explorer New leaked into Desktop")

  await page.evaluate(async()=>{
    const vfs=await import("./js/vfs.js")
    const folder=vfs.resolvePath(vfs.roots().desktop,"DialogFolder")
    vfs.makeFolder(folder)
    vfs.writeFile(vfs.resolvePath(folder,"inside.txt"),"inside")
    window.dispatchEvent(new CustomEvent("win7:open-app",{detail:"notepad"}))
    document.getElementById("noteOpen").click()
  })
  await page.waitForSelector("#fileDialog:not(.hidden)")
  const folderButton=page.locator('#fileDialogList [data-file-kind="folder"]',{hasText:"DialogFolder"})
  await folderButton.dblclick({force:true})
  assert.match((await page.locator("#fileDialogAddress").textContent())||"",/DialogFolder$/,"Open dialog did not enter folder")
  await page.locator("#fileDialogCancel").click()

  await page.locator("#noteText").fill("unsaved regression text")
  await page.locator('#notepadWindow [data-window-action="close"]').click({force:true})
  await page.waitForSelector("#winPrompt:not(.hidden)")
  await page.locator("#winPromptCancel").click()
  assert.equal(await page.locator("#notepadWindow").evaluate(node=>node.classList.contains("hidden")),false,"Cancel discarded dirty Notepad")
  assert.equal(await page.locator("#noteText").inputValue(),"unsaved regression text")
  await page.locator('#notepadWindow [data-window-action="close"]').click({force:true})
  await page.waitForSelector("#winPrompt:not(.hidden)")
  await page.locator("#winPromptOk").click()
  await page.waitForFunction(()=>document.getElementById("notepadWindow").classList.contains("hidden"))

  await page.evaluate(()=>window.dispatchEvent(new CustomEvent("win7:open-app",{detail:"browser"})))
  await page.locator("#browserAddress").fill("first regression query")
  await page.locator("#browserForm").evaluate(form=>form.requestSubmit())
  await page.locator("#browserAddress").fill("second regression query")
  await page.locator("#browserForm").evaluate(form=>form.requestSubmit())
  await page.locator("#browserBack").click()
  assert.equal(await page.locator("#browserAddress").inputValue(),"first regression query")

  assert.deepEqual(errors,[],"browser regression errors: "+errors.join(" | "))
  await context.close()
}finally{
  await browser.close()
}

console.log("Windows 7 simulator browser regression checks passed")
