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
  assert.equal(await page.locator("#bootScreen").evaluate(node=>!node.classList.contains("hidden")&&getComputedStyle(node).display!=="none"),true,"boot screen must cover the first painted desktop")
  assert.equal(await page.locator("#bootScreen").evaluate(node=>getComputedStyle(node).backgroundColor),"rgb(2, 2, 2)","boot screen must be black at startup")
  await page.waitForTimeout(2100)
  assert.equal(await page.locator("#windowsBoot").evaluate(node=>!node.classList.contains("hidden")),true,"Windows boot stage did not follow BIOS")
  assert.equal(await page.locator("#welcomeScreen").evaluate(node=>node.classList.contains("hidden")),true,"Welcome appeared too early")
  await page.waitForTimeout(4500)
  assert.equal(await page.locator("#welcomeScreen").evaluate(node=>!node.classList.contains("hidden")),true,"Welcome stage did not appear")
  await page.waitForTimeout(1800)
  assert.equal(await page.locator("#welcomeScreen").evaluate(node=>node.classList.contains("hidden")),true,"desktop was not revealed after the natural boot sequence")
  const injected='<img id="owned" src=x onerror="window.__owned=1">.txt'
  await page.evaluate(name=>{
    const path=`C:\\Users\\Eka\\Desktop\\${name}`
    localStorage.setItem("eka.windows7.vfs.v2",JSON.stringify({[path.toLowerCase()]:{path,kind:"text",content:"safe",created:1,updated:1}}))
  },injected)
  await page.reload({waitUntil:"domcontentloaded"})
  await page.waitForSelector("#browserWindow",{state:"attached"})
  await page.addStyleTag({content:".system-screen{display:none!important}"})

  // Taskbar: clicking a visible background window must activate it, not minimize it.
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent("win7:open-app",{detail:"notepad"})))
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent("win7:open-app",{detail:"calculator"})))
  await page.locator('[data-task="notepad"]').click({force:true})
  assert.equal(await page.locator("#notepadWindow").evaluate(node=>node.classList.contains("hidden")),false,"taskbar incorrectly minimized a background window")
  const z=await page.evaluate(()=>({note:Number(getComputedStyle(document.getElementById("notepadWindow")).zIndex),calc:Number(getComputedStyle(document.getElementById("calculatorWindow")).zIndex)}))
  assert.ok(z.note>z.calc,"taskbar did not bring the background window to front")
  await page.locator('[data-task="notepad"]').click({force:true})
  assert.equal(await page.locator("#notepadWindow").evaluate(node=>node.classList.contains("hidden")),true,"active taskbar window should minimize on second click")

  // Network flyout must truly toggle connection state.
  await page.locator("#networkBtn").click({force:true})
  await page.locator("#networkConnect").click()
  assert.equal((await page.locator("#networkStatus").textContent())?.trim(),"Not connected")
  assert.equal((await page.locator("#networkConnect").textContent())?.trim(),"Connect")
  await page.locator("#networkBtn").click({force:true})
  await page.locator("#networkConnect").click()
  assert.match((await page.locator("#networkStatus").textContent())||"",/Connected/)

  // Legacy VFS data containing unsafe markup must still render as text, never executable markup.
  await page.waitForFunction(name=>[...document.querySelectorAll("#desktopIcons .desktop-label")].some(node=>node.textContent===name),injected)
  assert.equal(await page.locator("#desktopIcons #owned").count(),0,"desktop filename produced DOM injection")
  assert.equal(await page.evaluate(()=>window.__owned||0),0,"legacy filename executed injected script")

  // Explorer context-menu New must create in the current folder, not Desktop.
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent("win7:navigate",{detail:"documents"})))
  await page.locator("#fileArea").click({button:"right",position:{x:35,y:35},force:true})
  await page.getByRole("button",{name:"New folder",exact:true}).click({force:true})
  await page.locator("#winPromptInput").fill("Explorer Regression Folder")
  await page.locator("#winPromptOk").click()
  await page.waitForFunction(()=>[...document.querySelectorAll("#fileArea .file-name")].some(node=>node.textContent==="Explorer Regression Folder"))
  assert.equal(await page.locator("#desktopIcons .desktop-label",{hasText:"Explorer Regression Folder"}).count(),0,"Explorer New leaked into Desktop")

  assert.equal((await page.locator("#addressBar").textContent())?.trim(),"C:\\Users\\Eka\\Documents","Explorer address bar must expose a canonical Windows path")
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent("win7:navigate",{detail:"recycle"})))
  await page.locator("#newFolderBtn").click({force:true})
  assert.equal(await page.locator("#winPrompt:not(.hidden)").count(),0,"Recycle Bin must not allow New Folder")
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent("win7:navigate",{detail:"documents"})))

  // Common Open dialog must navigate into folders.
  await page.evaluate(async()=>{
    const vfs=await import("./js/vfs.js")
    const folder=vfs.resolvePath(vfs.roots().desktop,"DialogFolder")
    vfs.makeFolder(folder)
    vfs.writeFile(vfs.resolvePath(folder,"inside.txt"),"inside")
    window.dispatchEvent(new CustomEvent("win7:open-app",{detail:"notepad"}))
    document.getElementById("noteOpen").click()
  })
  await page.waitForSelector("#fileDialog:not(.hidden)")
  assert.equal(await page.locator('#fileDialogList [data-file-kind="python"]').count(),0,"Text file filter leaked Python files")
  const folderButton=page.locator('#fileDialogList [data-file-kind="folder"]',{hasText:"DialogFolder"})
  await folderButton.dblclick({force:true})
  assert.match((await page.locator("#fileDialogAddress").textContent())||"",/DialogFolder$/,"Open dialog did not enter folder")
  await page.locator("#fileDialogCancel").click()

  // Dirty Notepad must guard close and preserve the document on Cancel.
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

  // Browser Back must return to the previous simulated page, not always Home.
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent("win7:open-app",{detail:"browser"})))
  await page.locator("#browserAddress").fill("first regression query")
  await page.locator("#browserForm").evaluate(form=>form.requestSubmit())
  await page.locator("#browserAddress").fill("second regression query")
  await page.locator("#browserForm").evaluate(form=>form.requestSubmit())
  await page.locator("#browserBack").click()
  assert.equal(await page.locator("#browserAddress").inputValue(),"first regression query")

  // Aero Snap must preserve normal geometry across snap -> maximize -> restore.
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent("win7:open-app",{detail:"calculator"})))
  const originalCalc=await page.locator("#calculatorWindow").evaluate(node=>({width:node.getBoundingClientRect().width,height:node.getBoundingClientRect().height}))
  await page.evaluate(async()=>{const wm=await import("./js/window-manager.js");const win=document.getElementById("calculatorWindow");wm.snapWindow(win,"left");wm.maximizeWindow(win);wm.maximizeWindow(win)})
  const restoredCalc=await page.locator("#calculatorWindow").evaluate(node=>({width:node.getBoundingClientRect().width,height:node.getBoundingClientRect().height}))
  assert.ok(Math.abs(restoredCalc.width-originalCalc.width)<3&&Math.abs(restoredCalc.height-originalCalc.height)<3,"Aero Snap lost the normal window geometry")

  // file:/// navigation must open VFS-backed local files instead of silently doing nothing.
  await page.evaluate(async()=>{const vfs=await import("./js/vfs.js");vfs.writeFile(vfs.resolvePath(vfs.roots().desktop,"browser-local.html"),"<!doctype html><html><body><h1 id='local-proof'>Local VFS page</h1></body></html>")})
  await page.locator("#browserAddress").fill("file:///C:/Users/Eka/Desktop/browser-local.html")
  await page.locator("#browserForm").evaluate(form=>form.requestSubmit())
  assert.match((await page.locator("#browserTitle").textContent())||"",/browser-local\.html/i)
  assert.match((await page.locator("#browserFrame").getAttribute("srcdoc"))||"",/Local VFS page/)

  assert.deepEqual(errors,[],"browser regression errors: "+errors.join(" | "))
  await context.close()
}finally{
  await browser.close()
}

console.log("Windows 7 simulator browser regression checks passed")
