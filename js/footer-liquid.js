const canvas=document.getElementById("footerLiquid")
const footer=canvas?.closest(".site-footer")

if(canvas&&footer){
  const ctx=canvas.getContext("2d",{alpha:false})
  const motion=matchMedia("(prefers-reduced-motion: reduce)")
  const pointer={active:false,x:0,y:0,lastX:0,lastY:0}
  let width=0,height=0,dpr=1,restY=0,points=[],raf=0,lastTime=0

  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value))

  function buildPoints(){
    const count=Math.max(54,Math.ceil(width/13)+1)
    points=Array.from({length:count},(_,index)=>({
      x:index/(count-1)*width,
      y:restY,
      velocity:0
    }))
  }

  function resize(){
    const rect=footer.getBoundingClientRect()
    width=Math.max(1,rect.width)
    height=Math.max(1,rect.height)
    dpr=Math.min(window.devicePixelRatio||1,2)
    canvas.width=Math.round(width*dpr)
    canvas.height=Math.round(height*dpr)
    canvas.style.width=`${width}px`
    canvas.style.height=`${height}px`
    ctx.setTransform(dpr,0,0,dpr,0,0)
    restY=height*.5
    buildPoints()
    draw(0)
  }

  function localPointer(event){
    const rect=footer.getBoundingClientRect()
    return{x:event.clientX-rect.left,y:event.clientY-rect.top}
  }

  function impulse(x,strength,radius=115){
    for(const point of points){
      const distance=Math.abs(point.x-x)
      if(distance>=radius)continue
      const weight=.5+.5*Math.cos(Math.PI*distance/radius)
      point.velocity+=strength*weight
    }
  }

  function onPointerMove(event){
    const next=localPointer(event)
    pointer.lastX=pointer.x
    pointer.lastY=pointer.y
    pointer.x=next.x
    pointer.y=next.y
    pointer.active=true
    const vertical=pointer.y-pointer.lastY
    const horizontal=Math.abs(pointer.x-pointer.lastX)
    if(horizontal+Math.abs(vertical)>2){
      impulse(pointer.x,clamp(vertical*.12+(horizontal>8?(pointer.y<restY?-1.6:1.6):0),-8,8),90)
    }
  }

  function onPointerDown(event){
    const next=localPointer(event)
    pointer.x=next.x
    pointer.y=next.y
    pointer.lastX=next.x
    pointer.lastY=next.y
    pointer.active=true
    const direction=pointer.y<restY?1:-1
    impulse(pointer.x,direction*18,150)
  }

  function smoothSurface(){
    ctx.beginPath()
    ctx.moveTo(0,points[0].y)
    for(let index=1;index<points.length-1;index++){
      const current=points[index]
      const next=points[index+1]
      const midX=(current.x+next.x)*.5
      const midY=(current.y+next.y)*.5
      ctx.quadraticCurveTo(current.x,current.y,midX,midY)
    }
    const last=points.at(-1)
    ctx.lineTo(last.x,last.y)
  }

  function draw(time){
    ctx.clearRect(0,0,width,height)
    ctx.fillStyle="#ffffff"
    ctx.fillRect(0,0,width,height)

    smoothSurface()
    ctx.lineTo(width,height)
    ctx.lineTo(0,height)
    ctx.closePath()
    const water=ctx.createLinearGradient(0,restY-26,0,height)
    water.addColorStop(0,"#1598ff")
    water.addColorStop(.48,"#0878ef")
    water.addColorStop(1,"#0453c7")
    ctx.fillStyle=water
    ctx.fill()

    smoothSurface()
    ctx.strokeStyle="rgba(255,255,255,.9)"
    ctx.lineWidth=1.4
    ctx.stroke()

    smoothSurface()
    ctx.strokeStyle="rgba(74,194,255,.34)"
    ctx.lineWidth=7
    ctx.stroke()

    if(!motion.matches){
      const glowX=pointer.active?pointer.x:width*.72
      const glow=ctx.createRadialGradient(glowX,restY+38,0,glowX,restY+38,Math.max(80,width*.2))
      glow.addColorStop(0,"rgba(255,255,255,.12)")
      glow.addColorStop(1,"rgba(255,255,255,0)")
      ctx.fillStyle=glow
      ctx.fillRect(0,restY,width,height-restY)
    }
  }

  function step(time){
    const dt=clamp((time-lastTime)/16.667,.55,1.8)
    lastTime=time
    const radius=Math.min(180,Math.max(100,width*.13))
    const targetY=clamp(pointer.y,restY-78,restY+78)

    for(let index=0;index<points.length;index++){
      const point=points[index]
      const left=points[index-1]||point
      const right=points[index+1]||point
      const idle=Math.sin(time*.00125+index*.31)*1.45
      let force=((restY+idle)-point.y)*.024
      force+=(((left.y+right.y)*.5)-point.y)*.17

      if(pointer.active){
        const distance=Math.abs(point.x-pointer.x)
        if(distance<radius){
          const weight=.5+.5*Math.cos(Math.PI*distance/radius)
          force+=(targetY-point.y)*.012*weight
        }
      }

      point.velocity=(point.velocity+force*dt)*Math.pow(.925,dt)
    }

    for(const point of points){
      point.y+=point.velocity*dt
      point.y=clamp(point.y,restY-92,restY+92)
    }

    draw(time)
    raf=requestAnimationFrame(step)
  }

  footer.addEventListener("pointermove",onPointerMove,{passive:true})
  footer.addEventListener("pointerdown",onPointerDown,{passive:true})
  footer.addEventListener("pointerleave",()=>{pointer.active=false})
  footer.addEventListener("pointercancel",()=>{pointer.active=false})

  const observer=new ResizeObserver(resize)
  observer.observe(footer)
  resize()

  if(motion.matches)draw(0)
  else raf=requestAnimationFrame(step)

  motion.addEventListener?.("change",event=>{
    cancelAnimationFrame(raf)
    if(event.matches){
      pointer.active=false
      buildPoints()
      draw(0)
    }else{
      lastTime=performance.now()
      raf=requestAnimationFrame(step)
    }
  })
}
