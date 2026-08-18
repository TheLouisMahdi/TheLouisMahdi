export function initMobileLayout(){
  if(document.querySelector('link[data-mobile-fit]'))return
  const link=document.createElement("link")
  link.rel="stylesheet"
  link.href="css/mobile-fit.css"
  link.dataset.mobileFit=""
  document.head.appendChild(link)
}
