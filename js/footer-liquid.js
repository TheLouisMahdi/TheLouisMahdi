const canvas=document.getElementById("footerLiquid")
const footer=canvas?.closest(".site-footer")

if(canvas&&footer){
  const ctx=canvas.getContext("2d",{alpha:false})
  const motion=matchMedia("(prefers-reduced-motion: reduce)")
  const pointer={active:false,id:null,x:0,y:0,lastX:0,lastY:0}
  const boatImage=new Image()
  const boat={
    ready:false,
    x:0,y:0,vx:0,vy:0,
    angle:0,angularVelocity:0,
    grabbed:false,grabOffsetX:0,
    userForceX:0,flowX:0
  }
  const BOAT_PARTS=["assets/tugboat/part0.txt","assets/tugboat/part1.txt","assets/tugboat/part2.txt"]
  const BOAT_BASE64_LENGTH=21948
  const BOAT_NATURAL_WIDTH=220
  const BOAT_NATURAL_HEIGHT=210
  let width=0,height=0,dpr=1,restY=0,points=[],raf=0,lastTime=0

  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value))

  footer.style.touchAction="pan-y"
  boatImage.decoding="async"
  boatImage.dataset.footerTugboat="true"
  boatImage.addEventListener("load",()=>{
    if(boatImage.naturalWidth!==BOAT_NATURAL_WIDTH||boatImage.naturalHeight!==BOAT_NATURAL_HEIGHT){
      console.error("Footer tugboat dimensions are invalid",boatImage.naturalWidth,boatImage.naturalHeight)
      return
    }
    boat.ready=true
    resetBoat()
    draw(performance.now())
  })
  boatImage.addEventListener("error",()=>console.error("Footer tugboat image failed to decode"))

  async function loadBoatImage(){
    const parts=await Promise.all(BOAT_PARTS.map(async path=>{
      const response=await fetch(path,{cache:"force-cache"})
      if(!response.ok)throw new Error(`tugboat_part_${response.status}`)
      return(await response.text()).trim()
    }))
    const encoded=parts.join("")
    if(encoded.length!==BOAT_BASE64_LENGTH)throw new Error(`tugboat_asset_incomplete_${encoded.length}`)
    boatImage.src=`data:image/webp;base64,${encoded}`
  }

  loadBoatImage().catch(error=>console.error("Footer tugboat asset failed",error))

  function buildPoints(){
    const count=Math.max(54,Math.ceil(width/13)+1)
    points=Array.from({length:count},(_,index)=>({
      x:index/(count-1)*width,
      y:restY,
      velocity:0
    }))
  }

  function boatSize(){
    const responsive=width<600?width*.32:width*.2
    const boatWidth=clamp(responsive,width<600?96:118,width<600?150:232)
    const ratio=boatImage.naturalWidth?boatImage.naturalHeight/boatImage.naturalWidth:BOAT_NATURAL_HEIGHT/BOAT_NATURAL_WIDTH
    return{width:boatWidth,height:boatWidth*ratio}
  }

  function boatHomeX(){
    return width*(width<600?.3:.24)
  }

  function boatXBounds(){
    const size=boatSize()
    const margin=Math.max(size.width*.52,width*.055)
    return{min:margin,max:Math.max(margin,width-margin)}
  }

  function resetBoat(){
    boat.x=boatHomeX()
    boat.y=restY
    boat.vx=0
    boat.vy=0
    boat.angle=0
    boat.angularVelocity=0
    boat.grabbed=false
    boat.grabOffsetX=0
    boat.userForceX=0
    boat.flowX=0
  }

  function resize(){
    const previousWidth=width
    const previousX=boat.x
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
    if(previousWidth>0&&boat.ready){
      const bounds=boatXBounds()
      boat.x=clamp(previousX/previousWidth*width,bounds.min,bounds.max)
      boat.y=restY
      boat.vy=0
    }else resetBoat()
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

  function boatHit(x,y){
    if(!boat.ready)return false
    const size=boatSize()
    const dx=Math.abs(x-boat.x)
    const dy=y-boat.y
    return dx<=size.width*.58&&dy>=-size.height*.88&&dy<=size.height*.18
  }

  function transferHorizontalFlow(x,y,dx){
    if(!boat.ready||!dx)return
    const size=boatSize()
    const radius=Math.max(135,size.width*1.05)
    const distance=Math.hypot(x-boat.x,(y-boat.y)*.72)
    if(distance>=radius)return
    const weight=1-distance/radius
    boat.flowX+=clamp(dx*.018*weight,-1.25,1.25)
  }

  function processPointerSample(event){
    const next=localPointer(event)
    if(!pointer.active&&!boat.grabbed){
      pointer.x=next.x
      pointer.y=next.y
      pointer.lastX=next.x
      pointer.lastY=next.y
      pointer.active=true
      return
    }

    const dx=next.x-pointer.x
    const dy=next.y-pointer.y
    pointer.lastX=pointer.x
    pointer.lastY=pointer.y
    pointer.x=next.x
    pointer.y=next.y
    pointer.active=true

    const movement=Math.abs(dx)+Math.abs(dy)
    if(movement>1){
      const sidewaysRipple=Math.sign(dx||1)*Math.min(Math.abs(dx)*.035,2.2)
      impulse(pointer.x,clamp(dy*.13+sidewaysRipple,-8.5,8.5),92)
      transferHorizontalFlow(pointer.x,pointer.y,dx)
    }

    if(boat.grabbed&&pointer.id===event.pointerId){
      const bounds=boatXBounds()
      const targetX=clamp(pointer.x+boat.grabOffsetX,bounds.min,bounds.max)
      const error=targetX-boat.x
      boat.userForceX+=clamp(error*.026+dx*.055,-2.4,2.4)
      boat.flowX+=clamp(dx*.012,-.7,.7)
    }
  }

  function onPointerMove(event){
    const samples=typeof event.getCoalescedEvents==="function"?event.getCoalescedEvents():[]
    if(samples.length){
      for(const sample of samples)processPointerSample(sample)
    }else processPointerSample(event)
  }

  function onPointerDown(event){
    const next=localPointer(event)
    pointer.id=event.pointerId
    pointer.x=next.x
    pointer.y=next.y
    pointer.lastX=next.x
    pointer.lastY=next.y
    pointer.active=true

    if(boatHit(next.x,next.y)){
      boat.grabbed=true
      boat.grabOffsetX=boat.x-next.x
      boat.vx*=.45
    }

    const direction=pointer.y<surfaceYAt(pointer.x)?1:-1
    impulse(pointer.x,direction*(boat.grabbed?10:18),boat.grabbed?118:150)
  }

  function releasePointer(event){
    if(pointer.id!==null&&event.pointerId!==undefined&&event.pointerId!==pointer.id)return
    boat.grabbed=false
    pointer.id=null
    pointer.active=false
  }

  function surfaceYAt(x){
    if(points.length<2)return restY
    const sample=clamp(x,0,width)
    const position=sample/Math.max(1,width)*(points.length-1)
    const leftIndex=Math.floor(position)
    const rightIndex=Math.min(points.length-1,leftIndex+1)
    const mix=position-leftIndex
    const left=points[leftIndex]
    const right=points[rightIndex]
    return left.y+(right.y-left.y)*mix
  }

  function updateBoat(dt){
    if(!boat.ready||motion.matches)return
    const size=boatSize()
    const probe=Math.max(22,size.width*.24)
    const leftY=surfaceYAt(boat.x-probe)
    const centerY=surfaceYAt(boat.x)
    const rightY=surfaceYAt(boat.x+probe)
    const targetY=(leftY+centerY*2+rightY)*.25
    const targetAngle=clamp(Math.atan2(rightY-leftY,probe*2)*1.05,-.23,.23)

    const heaveForce=(targetY-boat.y)*.055
    boat.vy=(boat.vy+heaveForce*dt)*Math.pow(.835,dt)
    boat.y+=boat.vy*dt

    const pitchForce=(targetAngle-boat.angle)*.048
    boat.angularVelocity=(boat.angularVelocity+pitchForce*dt)*Math.pow(.79,dt)
    boat.angle+=boat.angularVelocity*dt

    const homeForce=(boatHomeX()-boat.x)*(boat.grabbed?0:.00065)
    const slopeForce=clamp(-targetAngle*.075,-.018,.018)
    const surgeForce=homeForce+slopeForce+boat.flowX+boat.userForceX
    boat.vx=(boat.vx+surgeForce*dt)*Math.pow(boat.grabbed?.88:.94,dt)
    boat.x+=boat.vx*dt

    boat.userForceX*=Math.pow(.68,dt)
    boat.flowX*=Math.pow(.82,dt)

    const bounds=boatXBounds()
    if(boat.x<bounds.min){
      boat.x=bounds.min
      if(boat.vx<0)boat.vx*=-.32
    }else if(boat.x>bounds.max){
      boat.x=bounds.max
      if(boat.vx>0)boat.vx*=-.32
    }

    const maxWaterOffset=Math.max(16,size.height*.14)
    boat.y=clamp(boat.y,restY-92-maxWaterOffset,restY+92+maxWaterOffset)
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

  function fillWaterPath(){
    smoothSurface()
    ctx.lineTo(width,height)
    ctx.lineTo(0,height)
    ctx.closePath()
  }

  function drawBoatShadow(){
    if(!boat.ready)return
    const size=boatSize()
    ctx.save()
    ctx.translate(boat.x,boat.y+Math.max(4,size.width*.025))
    ctx.rotate(boat.angle*.65)
    ctx.fillStyle="rgba(0,43,104,.16)"
    ctx.beginPath()
    ctx.ellipse(0,0,size.width*.34,Math.max(4,size.width*.027),0,0,Math.PI*2)
    ctx.fill()
    ctx.restore()
  }

  function drawBoat(){
    if(!boat.ready)return
    const size=boatSize()
    const anchor=.78
    const imageX=-size.width*.5
    const imageY=-size.height*anchor

    ctx.save()
    ctx.translate(boat.x,boat.y)
    ctx.rotate(boat.angle)
    ctx.drawImage(boatImage,imageX,imageY,size.width,size.height)
    ctx.restore()

    canvas.dataset.boatX=boat.x.toFixed(2)
    canvas.dataset.boatY=boat.y.toFixed(2)
    canvas.dataset.boatAngle=boat.angle.toFixed(4)
    canvas.dataset.boatGrabbed=boat.grabbed?"1":"0"
  }

  function drawFrontWater(){
    ctx.save()
    fillWaterPath()
    const water=ctx.createLinearGradient(0,restY-24,0,height)
    water.addColorStop(0,"rgba(21,152,255,.87)")
    water.addColorStop(.1,"rgba(15,139,247,.95)")
    water.addColorStop(.48,"#0878ef")
    water.addColorStop(1,"#0453c7")
    ctx.fillStyle=water
    ctx.fill()
    ctx.restore()
  }

  function drawWaterGlow(){
    if(motion.matches)return
    const glowX=pointer.active?pointer.x:width*.72
    const glow=ctx.createRadialGradient(glowX,restY+38,0,glowX,restY+38,Math.max(80,width*.2))
    glow.addColorStop(0,"rgba(255,255,255,.12)")
    glow.addColorStop(1,"rgba(255,255,255,0)")
    ctx.save()
    fillWaterPath()
    ctx.clip()
    ctx.fillStyle=glow
    ctx.fillRect(0,restY-100,width,height-restY+100)
    ctx.restore()
  }

  function drawWake(){
    if(!boat.ready)return
    const size=boatSize()
    const speed=clamp(Math.abs(boat.vx)*.13,0,1)
    const direction=boat.vx>=0?-1:1
    const tailX=boat.x+direction*size.width*.36
    const tailY=surfaceYAt(tailX)+2
    const length=size.width*(.22+.26*speed)

    ctx.save()
    ctx.strokeStyle=`rgba(255,255,255,${.3+.38*speed})`
    ctx.lineWidth=1.4+speed*1.2
    ctx.lineCap="round"
    for(let lane=-1;lane<=1;lane+=2){
      ctx.beginPath()
      ctx.moveTo(tailX,tailY+lane*2)
      ctx.quadraticCurveTo(tailX+direction*length*.48,tailY+lane*(5+speed*3),tailX+direction*length,tailY+lane*(8+speed*5))
      ctx.stroke()
    }
    ctx.restore()
  }

  function drawSurfaceHighlights(){
    smoothSurface()
    ctx.strokeStyle="rgba(255,255,255,.92)"
    ctx.lineWidth=1.5
    ctx.stroke()

    smoothSurface()
    ctx.strokeStyle="rgba(74,194,255,.34)"
    ctx.lineWidth=7
    ctx.stroke()

    if(boat.ready){
      const size=boatSize()
      ctx.save()
      ctx.translate(boat.x,boat.y+1)
      ctx.rotate(boat.angle)
      ctx.strokeStyle="rgba(255,255,255,.86)"
      ctx.lineWidth=1.25
      ctx.beginPath()
      ctx.ellipse(-size.width*.29,0,size.width*.1,Math.max(2,size.width*.013),0,0,Math.PI*2)
      ctx.ellipse(size.width*.28,1,size.width*.12,Math.max(2,size.width*.013),0,0,Math.PI*2)
      ctx.stroke()
      ctx.restore()
    }
  }

  function draw(time){
    ctx.clearRect(0,0,width,height)

    ctx.fillStyle="#ffffff"
    ctx.fillRect(0,0,width,height)

    smoothSurface()
    ctx.strokeStyle="rgba(112,204,255,.18)"
    ctx.lineWidth=10
    ctx.stroke()

    drawBoatShadow()
    drawBoat()

    drawFrontWater()
    drawWaterGlow()
    drawWake()
    drawSurfaceHighlights()
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

    updateBoat(dt)
    draw(time)
    raf=requestAnimationFrame(step)
  }

  footer.addEventListener("pointermove",onPointerMove,{passive:true})
  footer.addEventListener("pointerdown",onPointerDown,{passive:true})
  footer.addEventListener("pointerup",releasePointer,{passive:true})
  footer.addEventListener("pointercancel",releasePointer,{passive:true})
  footer.addEventListener("pointerleave",()=>{pointer.active=false})
  window.addEventListener("pointerup",releasePointer,{passive:true})
  window.addEventListener("pointercancel",releasePointer,{passive:true})

  const observer=new ResizeObserver(resize)
  observer.observe(footer)
  resize()

  if(motion.matches)draw(0)
  else raf=requestAnimationFrame(step)

  motion.addEventListener?.("change",event=>{
    cancelAnimationFrame(raf)
    if(event.matches){
      pointer.active=false
      pointer.id=null
      buildPoints()
      resetBoat()
      draw(0)
    }else{
      lastTime=performance.now()
      raf=requestAnimationFrame(step)
    }
  })
}
