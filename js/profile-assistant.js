import{initLiquidBiography}from"./portfolio-liquid.js"

const mount=()=>initLiquidBiography()
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true})
else mount()
