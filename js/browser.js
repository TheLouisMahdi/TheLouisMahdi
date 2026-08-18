import{icon}from"./icons.js"
import{escapeHtml}from"./html.js"
import{parentPath,readFile,resolvePath}from"./vfs.js"
import{openWindow}from"./window-manager.js"

const byId=id=>document.getElementById(id)
let history=[]
let historyIndex=-1

function applyPage(page){
  byId("browserTitle").textContent=page.title
  byId("browserAddress").value=page.address
  byId("browserFrame").srcdoc=page.html
  byId("browserStatus").textContent=page.status||"Internet · Protected Mode: On"
}

function showPage(page,push=true){
  if(push){
    history=history.slice(0,historyIndex+1)
    history.push(page)
    historyIndex=history.length-1
  }
  applyPage(page)
}

function homePage(){
  const html=`<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;font:14px Segoe UI,Arial;color:#123;background:linear-gradient(#eaf6ff,#fff);padding:34px}main{max-width:720px;margin:auto}h1{color:#1267a5}form{display:flex}input{flex:1;padding:10px;border:1px solid #7f9db9}button{padding:0 18px}a{color:#075a9c}</style></head><body><main><h1>Eka Internet Explorer</h1><p>Search the web or visit Mahdi's work.</p><form action="https://www.google.com/search" target="_blank"><input name="q" placeholder="Search Google"><button>Search</button></form><h2>Favorites</h2><p><a href="https://github.com/TheLouisMahdi" target="_blank">GitHub · TheLouisMahdi</a></p><p><a href="https://t.me/thelouis_mahdi" target="_blank">Telegram · @thelouis_mahdi</a></p><p><small>External websites open in a new tab because modern sites commonly block legacy iframe navigation.</small></p></main></body></html>`
  return{title:"Eka Home - Windows Internet Explorer",address:"about:home",html,status:"Internet · Protected Mode: On"}
}

function browserHome(push=true){showPage(homePage(),push)}

function localAssetUrl(dir,reference){
  if(/^(?:https?:|data:|blob:|#|\/\/)/i.test(reference))return reference
  const full=resolvePath(dir,reference),content=readFile(full)
  if(content===null)return null
  if(/^data:/i.test(content))return content
  const lower=full.toLowerCase()
  if(lower.endsWith(".svg"))return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(content)}`
  return null
}

function inlineCssAssets(css,dir){
  return String(css||"").replace(/url\(\s*(["']?)([^"')]+)\1\s*\)/gi,(tag,quote,reference)=>{
    const asset=localAssetUrl(dir,reference.trim())
    return asset?`url("${asset}")`:tag
  })
}

function buildHtmlPreview(path,content){
  const dir=parentPath(path)
  let html=String(content||"")
  html=html.replace(/<link\b([^>]*?)href=["']([^"']+)["']([^>]*)>/gi,(tag,before,href)=>{
    if(/^(?:https?:|data:|blob:|#|\/\/)/i.test(href))return tag
    const full=resolvePath(dir,href),css=readFile(full)
    return css===null?tag:`<style data-eka-source="${escapeHtml(href)}">${inlineCssAssets(css,parentPath(full))}</style>`
  })
  html=html.replace(/<script\b([^>]*?)src=["']([^"']+)["']([^>]*)><\/script>/gi,(tag,before,src)=>{
    if(/^(?:https?:|data:|blob:|\/\/)/i.test(src))return tag
    const js=readFile(resolvePath(dir,src))
    return js===null?tag:`<script data-eka-source="${escapeHtml(src)}">${js.replace(/<\/script/gi,"<\\/script")}</script>`
  })
  html=html.replace(/<(img|source)\b([^>]*?)src=["']([^"']+)["']([^>]*)>/gi,(tag,name,before,src,after)=>{
    const asset=localAssetUrl(dir,src)
    return asset?`<${name}${before}src="${escapeHtml(asset)}"${after}>`:tag
  })
  const base=`file:///${parentPath(path).replaceAll("\\","/")}/`
  const bridge=`<base href="${escapeHtml(base)}"><script>document.addEventListener("click",function(event){var a=event.target.closest&&event.target.closest("a[href]");if(!a)return;var href=a.href||"";if(/^file:\/\//i.test(href)){event.preventDefault();parent.postMessage({type:"eka-browser-local-link",href:href},"*")}})</script>`
  return html.replace(/<head([^>]*)>/i,`<head$1>${bridge}`).replace(/<\/script/gi,"<\/script")
}

function fileUrlToPath(url){
  try{
    const parsed=new URL(url)
    let path=decodeURIComponent(parsed.pathname||"")
    path=path.replace(/^\/([A-Za-z]:)/,"$1").replaceAll("/","\\")
    return path
  }catch{return null}
}

function openHtml(path,content){
  showPage({
    title:`${path.split("\\").pop()} - Windows Internet Explorer`,
    address:`file:///${path.replaceAll("\\","/")}`,
    html:buildHtmlPreview(path,content),
    status:"Local file · Protected Mode: On"
  })
  openWindow("browserWindow")
}

function browse(value){
  const query=String(value||"").trim()
  if(!query||query==="about:home"){browserHome();return}
  if(/^file:\/\//i.test(query)){
    const path=fileUrlToPath(query),content=path?readFile(path):null
    if(content===null){
      showPage({title:"Cannot find page - Windows Internet Explorer",address:query,html:`<!doctype html><html><body style="font:14px Segoe UI;padding:36px"><h2>Internet Explorer cannot display this local file</h2><p>${escapeHtml(path||query)}</p></body></html>`,status:"Local file not found"})
      return
    }
    if(/\.html?$/i.test(path)){openHtml(path,content);return}
    showPage({title:`${path.split("\\").pop()} - Windows Internet Explorer`,address:query,html:`<!doctype html><html><body><pre style="white-space:pre-wrap;font:13px Consolas;padding:24px">${escapeHtml(content)}</pre></body></html>`,status:"Local file · Protected Mode: On"})
    return
  }
  if(/^https?:\/\//i.test(query)){
    const url=escapeHtml(query)
    showPage({
      title:`${query} - Windows Internet Explorer`,
      address:query,
      html:`<!doctype html><html><head><meta charset="utf-8"><style>body{font:14px Segoe UI,Arial;padding:40px;color:#233}a{display:inline-block;padding:9px 14px;background:#1676ad;color:#fff;text-decoration:none;border-radius:3px}</style></head><body><h2>Leaving the simulated Windows desktop</h2><p>Modern sites may refuse to load inside an embedded legacy browser frame.</p><p><a href="${url}" target="_blank" rel="noreferrer">Open ${url}</a></p></body></html>`,
      status:"Done · External site opens in a new tab"
    })
    return
  }
  const encoded=encodeURIComponent(query),safe=escapeHtml(query)
  showPage({
    title:`${query} - Search - Windows Internet Explorer`,
    address:query,
    html:`<!doctype html><html><head><meta charset="utf-8"><style>body{font:14px Segoe UI,Arial;padding:28px;color:#222}h1{font-size:22px;color:#145b8c}.result{padding:13px 0;border-bottom:1px solid #ddd}.result a{color:#0645ad;font-size:16px}.url{color:#168223;font-size:12px}</style></head><body><h1>Search results for “${safe}”</h1><div class="result"><a href="https://www.google.com/search?q=${encoded}" target="_blank">Search Google for ${safe}</a><div class="url">google.com/search</div><p>Open current web results in a new tab.</p></div><div class="result"><a href="https://github.com/search?q=${encoded}" target="_blank">Search GitHub for ${safe}</a><div class="url">github.com/search</div><p>Find repositories, code, issues, and users.</p></div><div class="result"><a href="https://duckduckgo.com/?q=${encoded}" target="_blank">Search DuckDuckGo for ${safe}</a><div class="url">duckduckgo.com</div></div></body></html>`,
    status:"Done · External results open in a new tab"
  })
}

function goBack(){
  if(historyIndex<=0)return
  historyIndex-=1
  applyPage(history[historyIndex])
}

export function mountBrowserWindow(){
  if(byId("browserWindow"))return
  const browser=document.createElement("section")
  browser.className="window browser-window hidden"
  browser.id="browserWindow"
  browser.dataset.app="browser"
  browser.innerHTML=`<div class="titlebar" data-drag-handle><div class="title-left"><span class="title-mini">${icon("ie")}</span><span class="window-title" id="browserTitle">Windows Internet Explorer</span></div><div class="win-controls"><button class="win-control" data-window-action="min">_</button><button class="win-control" data-window-action="max">□</button><button class="win-control close" data-window-action="close">×</button></div></div><form class="ie-toolbar" id="browserForm"><button type="button" id="browserBack" aria-label="Back">←</button><button type="button" id="browserHome" aria-label="Home">⌂</button><input id="browserAddress" aria-label="Address" placeholder="Search the web or enter an address"><button class="browser-go" type="submit">Go</button></form><iframe id="browserFrame" sandbox="allow-scripts allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox"></iframe><div class="ie-status" id="browserStatus">Internet · Protected Mode: On</div>`
  byId("desktop").appendChild(browser)
  const task=document.createElement("button")
  task.className="task-button"
  task.dataset.task="browser"
  task.setAttribute("aria-label","Windows Internet Explorer")
  task.innerHTML=`<span>${icon("ie")}</span>`
  byId("taskApps").appendChild(task)
}

export function initBrowser(){
  browserHome()
  byId("browserForm").addEventListener("submit",event=>{event.preventDefault();browse(byId("browserAddress").value)})
  byId("browserHome").addEventListener("click",()=>browserHome())
  byId("browserBack").addEventListener("click",goBack)
  window.addEventListener("win7:browse",event=>{browse(event.detail);openWindow("browserWindow")})
  window.addEventListener("win7:open-html",event=>openHtml(event.detail.path,event.detail.content))
  window.addEventListener("message",event=>{if(event.data?.type==="eka-browser-local-link"&&typeof event.data.href==="string")browse(event.data.href)})
}
