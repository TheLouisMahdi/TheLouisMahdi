import{initBrowser,mountBrowserWindow}from"./browser.js"
import{initCalculator}from"./calculator.js"
import{initNotepad}from"./notepad.js"
import{initRun}from"./run.js"
import{initLiquidBiography}from"./portfolio-liquid.js"

export function mountRuntimeWindows(){mountBrowserWindow()}

export function initApps(){
  initCalculator()
  initNotepad()
  initRun()
  initBrowser()
  initLiquidBiography()
}
